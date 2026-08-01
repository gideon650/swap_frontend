import React, { useEffect } from "react";
import "./SuccessModal.css";

const IconX = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconClock = (p) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
  </svg>
);

/**
 * SuccessModal — SwapView purple/gold themed confirmation dialog.
 *
 * Props:
 *  isOpen      bool
 *  onClose     () => void
 *  title       string
 *  message     string
 *  details     { [label]: value } — rendered as a details grid, optional
 *  etaLabel    string — e.g. "24-48 hours" (defaults based on isWithdrawal)
 */
const SuccessModal = ({
  isOpen,
  onClose,
  title,
  message,
  details,
  etaLabel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("swm-modal-open");
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.classList.remove("swm-modal-open");
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const isWithdrawal = /withdraw/i.test(title || "");
  const eta = etaLabel || (isWithdrawal ? "24-48 hours" : "24 hours");

  return (
    <div className="swm-overlay" onClick={handleOverlayClick}>
      <div className="swm-container">
        <div className="swm-card">
          <button className="swm-close" aria-label="Close" onClick={onClose}>
            <IconX />
          </button>

          <div className="swm-badge-wrap">
            <div className="swm-badge-ring" />
            <div className="swm-badge-core">
              <svg className="swm-badge-check" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="21" style={{ stroke: "#c060c0" }} />
                <path d="M15 27l7.2 7.2L37.5 18.5" style={{ stroke: "#f5c451" }} />
              </svg>
            </div>
          </div>

          <h2 className="swm-title">{title || "Transaction Successful"}</h2>
          <p className="swm-message">
            {message || "Your request has been received and is now being processed."}
          </p>

          {details && Object.keys(details).length > 0 && (
            <div className="swm-details">
              <div className="swm-details-head">Summary</div>
              {Object.entries(details).map(([label, value]) => (
                <div className="swm-detail-row" key={label}>
                  <span className="swm-detail-label">{label}</span>
                  <span className="swm-detail-value">{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="swm-notice">
            <div className="swm-notice-icon">
              <IconClock />
            </div>
            <div className="swm-notice-body">
              <h4>Processing time</h4>
              <p>
                {isWithdrawal
                  ? "Your withdrawal will be reviewed and completed within 24-48 hours. We'll notify you the moment it's done."
                  : "Your request will be reviewed and completed within 24 hours. We'll notify you the moment it's done."}
              </p>
            </div>
          </div>

          <div className="swm-progress">
            <div className="swm-progress-track">
              <div className="swm-progress-fill" />
            </div>
            <div className="swm-progress-label">
              Estimated completion: <strong>{eta}</strong>
            </div>
          </div>

          <div className="swm-support">
            Need help?{" "}
            <a href="mailto:support@swapviewapplications.com" onClick={(e) => e.stopPropagation()}>
              Contact us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;