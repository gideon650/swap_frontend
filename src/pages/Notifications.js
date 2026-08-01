import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "./Notifications.css";

const PAGE_SIZE = 3;

/* ---------- Inline icons (dependency-free, matches History.js style) ---------- */
const IconArrowDownLeft = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="17" y1="7" x2="7" y2="17" /><polyline points="17 17 7 17 7 7" />
  </svg>
);
const IconArrowUpRight = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
);
const IconTrendingUp = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconGift = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const IconBell = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconCheck = (p) => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconClock = (p) => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
  </svg>
);
const IconXCircle = (p) => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

/* Category — what the notification is about. Colors mirror History.css's TYPE_META. */
const CATEGORY_META = {
  deposit: { icon: IconArrowDownLeft, color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  withdraw: { icon: IconArrowUpRight, color: "#fb7185", bg: "rgba(251,113,133,0.12)" },
  trade: { icon: IconTrendingUp, color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  promo: { icon: IconGift, color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  system: { icon: IconBell, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

/* Status — the outcome/state of the notification. Colors mirror History.css's STATUS_META. */
const STATUS_META = {
  success: { icon: IconCheck, color: "#34d399", label: "Approved" },
  pending: { icon: IconClock, color: "#fbbf24", label: "Pending" },
  failed: { icon: IconXCircle, color: "#fb7185", label: "Declined" },
  info: { icon: IconBell, color: "#8b5cf6", label: "Update" },
};

const getCategory = (notification) => {
  const msg = (notification.message || "").toLowerCase();
  const hasDepositId = notification.deposit_id || (notification.deposit && notification.deposit.id);
  const hasWithdrawalId = notification.withdrawal_id || (notification.withdrawal && notification.withdrawal.id);

  if (hasDepositId || msg.includes("deposit")) return "deposit";
  if (hasWithdrawalId || msg.includes("withdraw")) return "withdraw";
  if (msg.includes("trade") || msg.includes("copied") || msg.includes("copy")) return "trade";
  if (msg.includes("cashback") || msg.includes("bonus") || msg.includes("promo")) return "promo";
  return "system";
};

const getStatus = (notification, showActionButtons) => {
  if (showActionButtons) return "pending";
  const msg = (notification.message || "").toLowerCase();
  if (msg.includes("approved") || msg.includes("confirmed") || msg.includes("successful") || msg.includes("completed")) {
    return "success";
  }
  if (msg.includes("declined") || msg.includes("failed") || msg.includes("rejected") || msg.includes("cancel")) {
    return "failed";
  }
  return "info";
};

/*
 * NotificationItem lives OUTSIDE the Notifications component (module scope).
 * Previously this was defined inside Notifications' render body, which meant
 * a brand-new component type was created on every re-render. Typing into the
 * decline-reason textarea called setDeclineReason -> re-render -> a "new"
 * NotificationItem type -> React unmounted/remounted the textarea -> focus
 * was lost after every single keystroke.
 *
 * Defining it once here, and passing everything it needs as props, means the
 * component identity stays stable across re-renders, so React just updates
 * the existing DOM node and the textarea keeps focus while you type.
 */
const NotificationItem = React.memo(({
  notification,
  onMarkAsRead,
  onMerchantAction,
  onWithdrawalAction,
  isDeclining,
  declineReason,
  onStartDeclining,
  onCancelDeclining,
  onDeclineReasonChange
}) => {
  const catMeta = CATEGORY_META[notification.category];
  const statusMeta = STATUS_META[notification.status];
  const CatIcon = catMeta.icon;
  const StatusIcon = statusMeta.icon;

  return (
    <div
      className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
      style={{ '--accent': statusMeta.color }}
    >
      <div className="notification-content">
        <div className="notification-icon" style={{ background: catMeta.bg, color: catMeta.color }}>
          <CatIcon />
        </div>
        <div className="notification-body">
          <div className="notification-top-line">
            <span
              className="notification-status"
              style={{ background: `${statusMeta.color}1f`, color: statusMeta.color }}
            >
              <StatusIcon /> {statusMeta.label}
            </span>
          </div>
          <p>{notification.message}</p>
        </div>
      </div>

      {notification.showActionButtons && notification.isWithdrawalConfirmation && (
        <div className="notification-actions">
          <button
            className="approve-button"
            onClick={() => onWithdrawalAction(notification, 'confirm')}
          >
            Confirm
          </button>
          <button
            className="decline-button"
            onClick={() => onWithdrawalAction(notification, 'decline')}
          >
            Decline
          </button>
        </div>
      )}

      {notification.showActionButtons && !notification.isWithdrawalConfirmation && !isDeclining && (
        <div className="notification-actions">
          <button
            className="approve-button"
            onClick={() => onMerchantAction(notification, 'approve')}
          >
            Approve
          </button>
          <button
            className="decline-button"
            onClick={() => onStartDeclining(notification.id)}
          >
            Decline
          </button>
        </div>
      )}

      {notification.showActionButtons && !notification.isWithdrawalConfirmation && isDeclining && (
        <div className="notification-decline-form">
          <textarea
            className="decline-reason-input"
            placeholder="Reason for declining (optional)"
            rows={2}
            value={declineReason}
            onChange={(e) => onDeclineReasonChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              marginTop: '2px',
              boxSizing: 'border-box',
              background: 'rgba(255, 255, 255, 0.03)',
              color: '#e5e5e5',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px 10px',
              fontSize: '12px',
              resize: 'vertical'
            }}
          />
          <div className="notification-actions" style={{ paddingLeft: 0, marginTop: '8px' }}>
            <button
              className="decline-button"
              onClick={() => onMerchantAction(notification, 'decline', declineReason)}
            >
              Confirm Decline
            </button>
            <button
              className="see-less-button"
              onClick={onCancelDeclining}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="notification-footer">
        <span className="notification-timestamp">
          {new Date(notification.timestamp).toLocaleString()}
        </span>
        {!notification.is_read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="mark-read-button"
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Tracks which notification currently has its "decline reason" box open,
  // and the text typed into it.
  const [decliningId, setDecliningId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  // Same "quiet background refresh" pattern as AllTokens.js's sparkline poll:
  // only the very first fetch shows the loading screen / can surface the
  // error screen. The 30s poll after that just swaps in new data in the
  // background — it never flips `loading` back to true, so the list stays
  // on screen instead of flashing back to "Loading notifications...".
  const isInitialLoad = React.useRef(true);

  const fetchNotifications = useCallback(async () => {
    try {
      if (isInitialLoad.current) {
        setLoading(true);
        setError(null);
      }
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/notifications/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);

    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Only surface the full error screen on the initial load. A failed
      // background poll just logs and keeps showing the last good list —
      // it shouldn't yank the UI out from under the user every 30s.
      if (isInitialLoad.current) {
        setError("Failed to load notifications. Please try again later.");
      }
    } finally {
      if (isInitialLoad.current) {
        setLoading(false);
        isInitialLoad.current = false;
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const pollInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/notifications/${id}/`,
        { is_read: true },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);

    } catch (error) {
      console.error("Error marking notification as read:", error);
      alert("Failed to mark notification as read");
    }
  }, []);

  const handleMerchantAction = useCallback(async (notification, action, reason) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const depositId = notification.deposit_id || (notification.deposit && notification.deposit.id);

      if (!depositId) {
        alert("Could not process this deposit - no deposit ID found");
        return;
      }

      const endpoint = action === 'approve'
        ? 'merchant/approve-deposit'
        : 'merchant/decline-deposit';

      const payload = action === 'decline' ? { reason: reason || '' } : {};

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/${endpoint}/${depositId}/`,
        payload,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(response.data.message || `Deposit ${action}d successfully`);
      setDecliningId(null);
      setDeclineReason("");
      await fetchNotifications();

    } catch (error) {
      console.error(`Error ${action}ing deposit:`, error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to ${action} deposit`;
      alert(errorMessage);
    }
  }, [fetchNotifications]);

  const handleWithdrawalAction = useCallback(async (notification, action) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const withdrawalId = notification.withdrawal_id || (notification.withdrawal && notification.withdrawal.id);

      if (!withdrawalId) {
        alert("Could not process this withdrawal - no withdrawal ID found");
        return;
      }

      const endpoint = action === 'confirm'
        ? 'user/confirm-withdrawal'
        : 'user/decline-withdrawal';

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/${endpoint}/${withdrawalId}/`,
        {},
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(response.data.message || `Withdrawal ${action === 'confirm' ? 'confirmed' : 'declined'} successfully`);
      await fetchNotifications();

    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to ${action} withdrawal`;
      alert(errorMessage);
    }
  }, [fetchNotifications]);

  // Open the inline "reason" box for a merchant deposit decline
  const startDeclining = useCallback((notificationId) => {
    setDecliningId(notificationId);
    setDeclineReason("");
  }, []);

  const cancelDeclining = useCallback(() => {
    setDecliningId(null);
    setDeclineReason("");
  }, []);

  const shouldShowActionButtons = useCallback((notification) => {
    if (!notification.action_buttons) {
      return false;
    }
    const hasDepositId = notification.deposit_id || (notification.deposit && notification.deposit.id);
    const hasWithdrawalId = notification.withdrawal_id || (notification.withdrawal && notification.withdrawal.id);
    const isWithdrawalConfirmation = notification.message.includes('Confirm once you receive payment');
    return hasDepositId || (hasWithdrawalId && isWithdrawalConfirmation);
  }, []);

  const isWithdrawalConfirmation = useCallback((notification) => {
    const hasWithdrawalId = notification.withdrawal_id || (notification.withdrawal && notification.withdrawal.id);
    return hasWithdrawalId && notification.message.includes('Confirm once you receive payment');
  }, []);

  const processedNotifications = useMemo(() => {
    return notifications.map(notification => {
      const showActionButtons = shouldShowActionButtons(notification);
      return {
        ...notification,
        showActionButtons,
        isWithdrawalConfirmation: isWithdrawalConfirmation(notification),
        category: getCategory(notification),
        status: getStatus(notification, showActionButtons),
      };
    });
  }, [notifications, shouldShowActionButtons, isWithdrawalConfirmation]);

  const visibleNotifications = useMemo(() => {
    return processedNotifications.slice(0, visibleCount);
  }, [processedNotifications, visibleCount]);

  const hasMore = visibleCount < processedNotifications.length;
  const hasLess = visibleCount > PAGE_SIZE;

  const handleSeeMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  const handleSeeLess = () => {
    setVisibleCount(PAGE_SIZE);
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-spinner">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchNotifications} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>
          Notifications
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </h2>
      </div>

      {processedNotifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications yet</p>
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {visibleNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onMerchantAction={handleMerchantAction}
                onWithdrawalAction={handleWithdrawalAction}
                isDeclining={decliningId === notification.id}
                declineReason={decliningId === notification.id ? declineReason : ""}
                onStartDeclining={startDeclining}
                onCancelDeclining={cancelDeclining}
                onDeclineReasonChange={setDeclineReason}
              />
            ))}
          </div>

          <div className="see-more-wrapper">
            {hasMore && (
              <button className="see-more-button" onClick={handleSeeMore}>
                See more ({processedNotifications.length - visibleCount} remaining)
              </button>
            )}
            {!hasMore && hasLess && (
              <button className="see-less-button" onClick={handleSeeLess}>
                See less
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;