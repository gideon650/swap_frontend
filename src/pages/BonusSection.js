import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BonusSection.css";
import BonusModal from "./BonusModal";

/**
 * Renders a single clickable card under the sliding messages.
 * Returns null when:
 *   - bonus state hasn't loaded yet
 *   - user already claimed this month (state === 'claimed')
 *   - TradeFi feature is disabled (state === 'disabled')
 *
 * Behavior by state:
 *   - not_eligible / eligible → opens the claim modal
 *   - active                  → navigates to /bonus status page
 */
const BonusSection = ({ state, tiers, claim, balance, onRefresh }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Hide entirely when there's nothing to show. 'disabled' comes from the
  // backend when the TradeFi master toggle is OFF and the user has no
  // active claim.
  if (!state || state === "claimed" || state === "disabled") return null;

  // Text varies by state
  let icon, headline;
  if (state === "not_eligible") {
    icon = "💰";
    headline = (
      <>
        Unlock up to <span className="bonus-card-highlight">$5,000</span> in bonus funds —{" "}
        Deposit <span className="bonus-card-highlight">$100</span> or more to start
      </>
    );
  } else if (state === "eligible") {
    icon = "🎁";
    headline = (
      <>
        Claim your <span className="bonus-card-highlight">monthly trading bonus</span> —{" "}
        Lock capital, get up to <span className="bonus-card-highlight">$5,000</span>
      </>
    );
  } else if (state === "active") {
    icon = "📈";
    const locked = parseFloat(claim?.locked_capital || 0);
    const bonus = parseFloat(claim?.bonus_amount || 0);
    headline = (
      <>
        Bonus active — <span className="bonus-card-highlight">${locked.toFixed(0)}</span> locked
        {" "}+ <span className="bonus-card-highlight">${bonus.toFixed(0)}</span> bonus.
        Tap to view status
      </>
    );
  } else {
    return null;
  }

  const handleClick = () => {
    if (state === "active") {
      navigate("/bonus");
    } else {
      setShowModal(true);
    }
  };

  const handleClose = () => setShowModal(false);
  const handleDeposit = () => {
    setShowModal(false);
    if (onRefresh) onRefresh("navigate_deposit");
  };
  const handleClaimed = () => {
    if (onRefresh) onRefresh("refresh");
  };

  return (
    <>
      <section className="bonus-section">
        <div className="bonus-card" onClick={handleClick}>
          <div className="bonus-card-icon">{icon}</div>
          <div className="bonus-card-text">{headline}</div>
          <div className="bonus-card-arrow">›</div>
        </div>
      </section>

      {/* Modal is only rendered for claim-related states */}
      {showModal && state !== "active" && (
        <BonusModal
          state={state}
          tiers={tiers}
          claim={claim}
          balance={balance}
          onClose={handleClose}
          onDeposit={handleDeposit}
          onClaimed={handleClaimed}
        />
      )}
    </>
  );
};

export default BonusSection;