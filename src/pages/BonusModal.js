import React, { useState } from "react";
import axios from "axios";
import "./BonusModal.css";

const COINS = [
  { size: 36, cls: "bonus-float",      style: { top: "8%",  left: "6%"  } },
  { size: 28, cls: "bonus-float-slow", style: { top: "18%", left: "88%" } },
  { size: 44, cls: "bonus-float-slow", style: { top: "52%", left: "3%"  } },
  { size: 30, cls: "bonus-float",      style: { top: "68%", left: "90%" } },
  { size: 22, cls: "bonus-float",      style: { top: "12%", left: "46%" } },
];

const DEFAULT_TIERS = [
  { capital: "100",  bonus: "250"  },
  { capital: "300",  bonus: "1000" },
  { capital: "500",  bonus: "2000" },
  { capital: "1000", bonus: "5000" },
];

const BonusModal = ({ state, tiers, claim, balance, onClose, onDeposit, onClaimed }) => {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const tierList = (tiers && tiers.length ? tiers : DEFAULT_TIERS).map((t) => ({
    capital: parseFloat(t.capital),
    bonus: parseFloat(t.bonus),
  }));

  const balanceAvailable = parseFloat(balance ?? 0) || 0;

  const handleSelect = (tier) => {
    if (submitting) return;
    setSelected(tier);
    setMessage(null);
  };

  const handleClaim = async () => {
    if (!selected) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/bonus/claim/`,
        { locked_capital: String(selected.capital) },
        config
      );
      if (res.data?.status === "success") {
        setMessage({ type: "success", text: "Bonus claimed! Closing…" });
        setTimeout(() => {
          if (onClaimed) onClaimed();
          onClose();
        }, 900);
      } else {
        setMessage({ type: "error", text: res.data?.error || "Claim failed." });
        setSubmitting(false);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error;
      const text = typeof errMsg === "string"
        ? errMsg
        : errMsg
          ? Object.values(errMsg).flat().join(" ")
          : "Claim failed. Please try again.";
      setMessage({ type: "error", text });
      setSubmitting(false);
    }
  };

  return (
    <div className="bonus-modal-overlay" onClick={onClose}>
      <div className="bonus-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bonus-modal-grid" />
        <div className="bonus-modal-glow" />

        {COINS.map((c, i) => (
          <div
            key={i}
            className={`bonus-coin ${c.cls}`}
            style={{ width: c.size, height: c.size, fontSize: c.size * 0.5, ...c.style }}
          >
            <div className="bonus-coin-inner bonus-spin-y">$</div>
          </div>
        ))}

        <button className="bonus-close-btn" onClick={onClose}>✕</button>

        <div style={{ position: "relative", textAlign: "center" }}>
          {state === "not_eligible" && (
            <NotEligibleBody
              tierList={tierList}
              onDeposit={onDeposit}
            />
          )}

          {state === "eligible" && (
            <EligibleBody
              tierList={tierList}
              balanceAvailable={balanceAvailable}
              selected={selected}
              submitting={submitting}
              message={message}
              onSelect={handleSelect}
              onClaim={handleClaim}
            />
          )}

          {state === "active" && claim && (
            <ActiveBody claim={claim} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Body: Not Eligible (deposit prompt) ---------------- */
function NotEligibleBody({ tierList, onDeposit }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <span className="bonus-badge">✦ Monthly Trading Bonus</span>
      </div>

      <h2 style={{ fontSize: "1.9rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>
        <span className="bonus-shimmer-text">UNLOCK YOUR</span>
        <br />
        <span style={{ color: "rgba(255,255,255,0.95)" }}>TRADING BONUS</span>
      </h2>
      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", margin: "0.5rem 0 1.5rem" }}>
        Deposit <strong style={{ color: "#ffd700" }}>$100 or more</strong> and lock it
        to receive up to <strong style={{ color: "#ffd700" }}>$5,000</strong> in trading funds.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        {tierList.map((t) => (
          <div key={t.capital} className="bonus-tier-card">
            <div className="bonus-tier-label">Lock</div>
            <div className="bonus-tier-capital">${t.capital}</div>
            <div className="bonus-tier-label">Trading Fund</div>
            <div className="bonus-tier-bonus">${t.bonus.toLocaleString()}</div>
            <div className="bonus-tier-note">To trade with</div>
          </div>
        ))}
      </div>

      <div className="bonus-info-card" style={{ marginBottom: "1rem" }}>
        <div className="bonus-section-badge">ⓘ How It Works</div>
        <div className="bonus-rule-row">
          <span className="bonus-rule-label">Lock your capital</span>
          <span className="bonus-rule-value">1st – 30th</span>
        </div>
        <div className="bonus-rule-row">
          <span className="bonus-rule-label">Trade with the fund</span>
          <span className="bonus-rule-value">All month</span>
        </div>
        <div className="bonus-rule-row">
          <span className="bonus-rule-label">At month end</span>
          <span className="bonus-rule-value">Profit only</span>
        </div>
      </div>

      <button className="bonus-cta-btn bonus-pulse-glow" onClick={onDeposit}>
        🚀 Deposit to Get Bonus
      </button>
    </>
  );
}

/* ---------------- Body: Eligible (claim picker) ---------------- */
function EligibleBody({
  tierList,
  balanceAvailable,
  selected,
  submitting,
  message,
  onSelect,
  onClaim,
}) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <span className="bonus-badge">✦ Claim Your Bonus</span>
      </div>

      <h2 style={{ fontSize: "1.9rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>
        <span className="bonus-shimmer-text">CLAIM YOUR</span>
        <br />
        <span style={{ color: "rgba(255,255,255,0.95)" }}>BONUS</span>
      </h2>
      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", margin: "0.5rem 0 1.25rem" }}>
        Pick a tier below. Your locked capital is committed for the month and you
        receive the matching trading fund to trade with.
        <br />
        <span style={{ color: "rgba(255,255,255,0.5)" }}>
          Available balance: <strong style={{ color: "#ffd700" }}>${balanceAvailable.toFixed(2)}</strong>
        </span>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {tierList.map((t) => {
          const disabled = balanceAvailable < t.capital;
          const isSelected = selected && selected.capital === t.capital;
          const cls = [
            "bonus-tier-card",
            disabled ? "disabled" : "selectable",
            isSelected ? "selected" : "",
          ].filter(Boolean).join(" ");
          return (
            <div
              key={t.capital}
              className={cls}
              onClick={() => !disabled && onSelect(t)}
            >
              {isSelected && <span className="bonus-tier-check">✓</span>}
              <div className="bonus-tier-label">Lock</div>
              <div className="bonus-tier-capital">${t.capital}</div>
              <div className="bonus-tier-label">Trading Fund</div>
              <div className="bonus-tier-bonus">${t.bonus.toLocaleString()}</div>
              <div className="bonus-tier-note">
                {disabled ? "Insufficient" : "To trade with"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bonus-info-card" style={{ marginBottom: "1rem" }}>
        <div className="bonus-section-badge">ⓘ Terms</div>
        <div className="bonus-rule-row">
          <span className="bonus-rule-label">Once locked</span>
          <span className="bonus-rule-value">No cancel</span>
        </div>
        <div className="bonus-rule-row">
          <span className="bonus-rule-label">Frequency</span>
          <span className="bonus-rule-value">Once per month</span>
        </div>
        <div className="bonus-rule-row">
          <span className="bonus-rule-label">At month end</span>
          <span className="bonus-rule-value">Profit only</span>
        </div>
      </div>

      <button
        className="bonus-cta-btn bonus-pulse-glow"
        disabled={!selected || submitting}
        onClick={onClaim}
      >
        {submitting
          ? "Claiming…"
          : selected
            ? `Lock $${selected.capital} → Trade $${selected.bonus.toLocaleString()}`
            : "Select a Tier to Continue"}
      </button>

      {message && (
        <div className={`bonus-message ${message.type}`}>{message.text}</div>
      )}
    </>
  );
}

/* ---------------- Body: Active (status receipt) ---------------- */
function ActiveBody({ claim }) {
  const fund = parseFloat(claim.bonus_amount || 0);
  const starting = parseFloat(claim.starting_bundle || 0);
  const bundle = parseFloat(claim.current_bundle || 0);

  const claimedAt = claim.claimed_at ? new Date(claim.claimed_at) : null;
  const daysElapsed = claimedAt
    ? Math.floor((Date.now() - claimedAt.getTime()) / 86400000)
    : 0;
  const daysRemaining = Math.max(0, 30 - daysElapsed);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <span className="bonus-badge">📈 Bonus Active</span>
      </div>

      <h2 style={{ fontSize: "1.9rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>
        <span className="bonus-shimmer-text">TRADING</span>
        <br />
        <span style={{ color: "rgba(255,255,255,0.95)" }}>IN PROGRESS</span>
      </h2>
      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", margin: "0.5rem 0 1.25rem" }}>
        Your trading fund is active. Head to the bonus page to monitor it.
      </p>

      <div className="bonus-status-receipt">
        <div className="bonus-receipt-row">
          <span className="bonus-receipt-label">Bonus received</span>
          <span className="bonus-receipt-value gold">+${fund.toFixed(2)}</span>
        </div>
        <div className="bonus-receipt-row total">
          <span className="bonus-receipt-label">Current bundle</span>
          <span className="bonus-receipt-value gold">${bundle.toFixed(2)}</span>
        </div>
        <div className="bonus-receipt-row">
          <span className="bonus-receipt-label">Days remaining</span>
          <span className="bonus-receipt-value">{daysRemaining} days</span>
        </div>
      </div>

      <div className="bonus-info-card">
        <div className="bonus-section-badge">ⓘ Reminder</div>
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
          At month end, <strong style={{ color: "#ffd700" }}>only your profit</strong> is credited
          to your wallet.
        </p>
      </div>
    </>
  );
}

export default BonusModal;