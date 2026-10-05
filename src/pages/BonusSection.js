import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BonusSection.css";
import BonusModal from "./BonusModal";

/**
 * The TradeFi bonus card, sitting side-by-side with the info carousel
 * on the dashboard.
 *
 * Behavior:
 *   - not_eligible / eligible / active / cap_reached:
 *       Shows the 2-face carousel (Claim <-> Deposit), rotating every 10s.
 *       Cap enforcement happens on the backend — the frontend does not hide
 *       the card based on remaining cap. If the user clicks Claim while
 *       capped, the modal opens and the backend rejects the claim with a
 *       clear error message.
 *   - disabled / null:
 *       Returns null — the card is hidden entirely.
 *
 * Note: there is no "Bonus Active" card face. When the user is mid-bonus,
 * the same rotating carousel is shown; the diamond widget in the Navbar
 * is the shortcut to the /bonus status page.
 */
const BonusSection = ({
  state,
  tiers,
  claim,
  balance,
  cumulativeDeposits,
  cumulativeLocked,
  cap,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [faceIndex, setFaceIndex] = useState(0);

  // Card shows for all states except disabled / null.
  const shouldShowCarousel =
    state === "not_eligible" ||
    state === "eligible" ||
    state === "active" ||
    state === "cap_reached";

  // Rotate the two faces every 10s while the carousel is visible.
  useEffect(() => {
    if (!shouldShowCarousel) {
      setFaceIndex(0);
      return;
    }
    const id = setInterval(() => {
      setFaceIndex((prev) => (prev + 1) % 2);
    }, 10000);
    return () => clearInterval(id);
  }, [shouldShowCarousel]);

  // Hide entirely when the carousel shouldn't show
  if (!shouldShowCarousel) return null;

  // Two-face carousel: Face 0 = Claim, Face 1 = Deposit
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

      {showModal && (
        <BonusModal
          state={state === "active" || state === "cap_reached" ? "eligible" : state}
          tiers={tiers}
          claim={claim}
          balance={balance}
          cumulativeDeposits={cumulativeDeposits}
          cumulativeLocked={cumulativeLocked}
          cap={cap}
          onClose={handleClose}
          onDeposit={handleDeposit}
          onClaimed={handleClaimed}
        />
      )}
    </>
  );
};

export default BonusSection;