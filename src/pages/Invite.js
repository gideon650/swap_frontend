import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Invite.css";

/* ---------- Inline icons (dependency-free, matches Deposit.js/History.js style) ---------- */
const IconArrowLeft = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconCopy = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconUsers = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconGift = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const IconGiftLg = (p) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const IconSparkles = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);
const IconMessageCircle = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
const IconSend = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconTwitter = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.6-7.3L4.2 22H1l8.1-9.3L1 2h7.3l5 6.7L18.9 2zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20z" />
  </svg>
);
const IconMail = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22 6 12 13 2 6" />
  </svg>
);
const IconQrCode = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><line x1="14" y1="14" x2="14" y2="14.01" />
    <line x1="21" y1="14" x2="21" y2="14.01" /><line x1="14" y1="21" x2="14" y2="21.01" />
    <line x1="21" y1="21" x2="21" y2="21.01" /><line x1="17.5" y1="14" x2="17.5" y2="17.5" />
    <line x1="14" y1="17.5" x2="17.5" y2="17.5" /><line x1="17.5" y1="17.5" x2="21" y2="17.5" />
    <line x1="17.5" y1="17.5" x2="17.5" y2="21" />
  </svg>
);

const COMMISSION_RATE = "15%";
const SITE_URL = "https://swapviewapplications.com";

function Invite() {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({ total: 0, funded: 0, total_bonus_earned: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchReferralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const res = await axios.get(`${API_BASE_URL}/referral-code/`, config);
      if (res.data) {
        setReferralCode(res.data.referral_code || "");
        setStats(res.data.stats || { total: 0, funded: 0, total_bonus_earned: 0 });
      }
    } catch (error) {
      console.error("Failed to load referral data", error);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareMessage = `Join me on SwapView! Use my referral code ${referralCode} when you sign up and I'll earn a reward on your first deposit.`;

  const shareVia = (platform) => {
    if (!referralCode) return;
    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${SITE_URL}`)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(shareMessage)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(SITE_URL)}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent("Join me on SwapView")}&body=${encodeURIComponent(`${shareMessage}\n\n${SITE_URL}`)}`;
        break;
      default:
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="inv-root">
      <div className="inv-orb inv-orb-1" />
      <div className="inv-orb inv-orb-2" />
      <div className="inv-orb inv-orb-3" />

      {/* Header */}
      <header className="inv-header">
        <button className="inv-icon-btn" aria-label="Back" onClick={() => navigate("/dashboard")}>
          <IconArrowLeft />
        </button>
        <div className="inv-header-title">
          <IconSparkles className="inv-sparkle" /> INVITE &amp; EARN
        </div>
        <button className="inv-icon-btn" aria-label="QR Code">
          <IconQrCode />
        </button>
      </header>

      <main className="inv-main">
        {/* Hero */}
        <section className="inv-hero">
          <div className="inv-hero-shine" />
          <div className="inv-hero-inner">
            <div className="inv-gift">
              <IconGiftLg />
            </div>
            <h1 className="inv-hero-title">
              Invite friends.<br />
              <span className="inv-grad-text">Earn rewards.</span>
            </h1>
            <p className="inv-hero-sub">
              Get a flat <span className="inv-hero-highlight">{COMMISSION_RATE} commission</span> on every friend's first deposit.
            </p>

            {/* Stats */}
            <div className="inv-stats">
              <StatCard icon={IconUsers} label="Referrals" value={loading ? "…" : String(stats.total || 0)} />
              <StatCard icon={IconGift} label="Earned" value={loading ? "…" : `$${(stats.total_bonus_earned || 0).toFixed(2)}`} highlight />
              <StatCard icon={IconCheck} label="Funded" value={loading ? "…" : String(stats.funded || 0)} />
            </div>
          </div>
        </section>

        {/* Referral code */}
        <section className="inv-card">
          <p className="inv-card-label">Your referral code</p>
          <div className="inv-code-box">
            <div className="inv-code-body">
              <div className="inv-code-text">{loading ? "Loading…" : referralCode || "—"}</div>
              <div className="inv-code-hint">Share this code — friends sign up at swapviewapplications.com</div>
            </div>
            <button
              onClick={copy}
              className={`inv-copy-btn ${copied ? "is-copied" : ""}`}
              aria-label="Copy"
              disabled={!referralCode}
            >
              {copied ? <IconCheck /> : <IconCopy />}
            </button>
          </div>

          <div className="inv-share-grid">
            <ShareBtn icon={IconMessageCircle} label="Chat" color="#25D366" onClick={() => shareVia("whatsapp")} />
            <ShareBtn icon={IconSend} label="Telegram" color="#3aa9ec" onClick={() => shareVia("telegram")} />
            <ShareBtn icon={IconTwitter} label="X" color="#e0e0e0" onClick={() => shareVia("twitter")} />
            <ShareBtn icon={IconMail} label="Email" color="#f5c451" onClick={() => shareVia("email")} />
          </div>
        </section>
      </main>

      {toast && <div className="inv-toast">{toast}</div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`inv-stat-card ${highlight ? "is-highlight" : ""}`}>
      <Icon className="inv-stat-icon" />
      <div className="inv-stat-value">{value}</div>
      <div className="inv-stat-label">{label}</div>
    </div>
  );
}

function ShareBtn({ icon: Icon, label, color, onClick }) {
  return (
    <button className="inv-share-btn" onClick={onClick}>
      <span className="inv-share-icon" style={{ background: `${color}22`, color, boxShadow: `0 0 20px ${color}22` }}>
        <Icon />
      </span>
      <span className="inv-share-label">{label}</span>
    </button>
  );
}

export default Invite;