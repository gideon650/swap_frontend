import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BonusSection.css";
import BonusModal from "./BonusModal";

/**
 * The TradeFi bonus card, sitting side-by-side with the info carousel
 * on the dashboard.
 *
 * Behavior by state:
 *   - 'not_eligible' / 'eligible':
 *       The card becomes a 2-face carousel that rotates every 10s between
 *       "Claim Bonus" and "Deposit this month". Which face is displayed
 *       determines the click action:
 *         - Claim face  -> opens the claim modal
 *         - Deposit face -> navigates to /deposit
 *   - 'active':
 *       Fixed on a single "Bonus Active" face (no rotation).
 *       Click -> navigates to /bonus status page.
 *   - 'claimed' / 'disabled' / null:
 *       Returns null — the card is hidden entirely.
 */
const BonusSection = ({ state, tiers, claim, balance, thisMonthDeposits, onRefresh }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [faceIndex, setFaceIndex] = useState(0);

  // Rotate the two faces every 10s, but only when the card is in the
  // pre-claim carousel states.
  useEffect(() => {
    const shouldRotate = state === "not_eligible" || state === "eligible";
    if (!shouldRotate) {
      setFaceIndex(0);
      return;
    }
    const id = setInterval(() => {
      setFaceIndex((prev) => (prev + 1) % 2);
    }, 10000);
    return () => clearInterval(id);
  }, [state]);

  // Hide entirely when there's nothing to show
  if (!state || state === "claimed" || state === "disabled") return null;

  // ------------------ Active state: fixed Bonus Active face ------------------
  if (state === "active") {
    const locked = parseFloat(claim?.locked_capital || 0);
    const bonus = parseFloat(claim?.bonus_amount || 0);
    return (
      <section className="bonus-section">
        <div
          className="bonus-card"
          onClick={() => navigate("/bonus")}
        >
          <div className="bonus-card-icon">📈</div>
          <div className="bonus-card-text">
            Bonus active —{" "}
            <span className="bonus-card-highlight">${locked.toFixed(0)}</span> locked
            {" "}+{" "}
            <span className="bonus-card-highlight">${bonus.toFixed(0)}</span> bonus.
            Tap to view status
          </div>
          <div className="bonus-card-arrow">›</div>
        </div>
      </section>
    );
  }

  // ------------------ Pre-claim state: 2-face carousel ------------------
  // Face 0 = Claim, Face 1 = Deposit
  const isClaimFace = faceIndex === 0;

  const claimFace = (
    <>
      Claim your{" "}
      <span className="bonus-card-highlight">monthly trading bonus</span> —{" "}
      Lock capital, get up to{" "}
      <span className="bonus-card-highlight">$5,000</span>
    </>
  );

  const depositFace = (
    <>
      Deposit this month to unlock your{" "}
      <span className="bonus-card-highlight">TradeFi bonus</span> —{" "}
      Deposit now →
    </>
  );

  const handleCardClick = () => {
    if (isClaimFace) {
      setShowModal(true);
    } else {
      navigate("/deposit");
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
        <div className="bonus-card" onClick={handleCardClick}>
          <div className="bonus-card-icon">{isClaimFace ? "🎁" : "💰"}</div>
          <div className="bonus-card-text">
            {isClaimFace ? claimFace : depositFace}
          </div>
          <div className="bonus-card-arrow">›</div>
        </div>
      </section>

      {showModal && state !== "active" && (
        <BonusModal
          state={state}
          tiers={tiers}
          claim={claim}
          balance={balance}
          thisMonthDeposits={thisMonthDeposits}
          onClose={handleClose}
          onDeposit={handleDeposit}
          onClaimed={handleClaimed}
        />
      )}
    </>
  );
};

export default BonusSection;