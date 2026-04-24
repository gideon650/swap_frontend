import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "./Notifications.css";

const PAGE_SIZE = 3;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setLoading(false);
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

  const handleMerchantAction = useCallback(async (notification, action) => {
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

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/${endpoint}/${depositId}/`,
        {},
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(response.data.message || `Deposit ${action}d successfully`);
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

  const shouldShowActionButtons = useCallback((notification) => {
    if (notification.is_read || !notification.action_buttons) {
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
    return notifications.map(notification => ({
      ...notification,
      showActionButtons: shouldShowActionButtons(notification),
      isWithdrawalConfirmation: isWithdrawalConfirmation(notification)
    }));
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

  const NotificationItem = React.memo(({
    notification,
    onMarkAsRead,
    onMerchantAction,
    onWithdrawalAction
  }) => {
    return (
      <div className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}>
        <div className="notification-content">
          <div className={`notification-dot ${notification.is_read ? 'read' : ''}`}></div>
          <p>{notification.message}</p>
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

        {notification.showActionButtons && !notification.isWithdrawalConfirmation && (
          <div className="notification-actions">
            <button
              className="approve-button"
              onClick={() => onMerchantAction(notification, 'approve')}
            >
              Approve
            </button>
            <button
              className="decline-button"
              onClick={() => onMerchantAction(notification, 'decline')}
            >
              Decline
            </button>
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