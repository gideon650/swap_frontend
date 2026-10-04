import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BonusSection.css";
import BonusModal from "./BonusModal";

/**
 * The TradeFi bonus card, sitting side-by-side with the info carousel
 * on the dashboard.
 *
 * Behavior:
 *   - not_eligible / eligible:
 *       Shows the 2-face carousel (Claim <-> Deposit), rotating every 10s.
 *   - active + can still claim more this month:
 *       Same 2-face carousel, still rotating. The user can claim again.
 *   - active + capped this month:
 *       Card is hidden entirely. The diamond widget (in the Navbar) is the
 *       only way to reach the bonus status page.
 *   - cap_reached / disabled / claimed / null:
 *       Card is hidden entirely.
 *
 * Note: there is no longer any "Bonus Active" card face on the dashboard.
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

  // Compute whether the user can still claim more under both constraints.
  // Smallest tier is $100, so a user must have at least $100 of headroom
  // under the cap AND at least $100 of deposit budget remaining.
  const remainingCap = Math.max(0, (cap ?? 1000) - (cumulativeLocked ?? 0));
  const remainingDepositBudget = Math.max(
    0,
    (cumulativeDeposits ?? 0) - (cumulativeLocked ?? 0)
  );
  const canStillClaim = remainingCap >= 100 && remainingDepositBudget >= 100;

  const shouldShowCarousel =
    state === "not_eligible" ||
    state === "eligible" ||
    (state === "active" && canStillClaim);

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
          state={state === "active" ? "eligible" : state}
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