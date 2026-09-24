import React from "react";
import "./AdBanner.css";

/**
 * Admin-managed advertising banner shown as a modal in front of the
 * dashboard. Content (title, message, image, optional CTA button) is
 * entirely controlled by the admin via the AdBanner singleton in the
 * Django admin. Dismissing it is handled entirely by the parent
 * (Dashboard.js via useAdBanner) — this component just renders.
 */
const AdBanner = ({ banner, onClose }) => {
  if (!banner) return null;

  const { title, message, image, button_text, button_link } = banner;
  const hasBodyContent = Boolean(title || message || (button_text && button_link));

  const handleCtaClick = () => {
    if (button_link) {
      window.open(button_link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="ad-banner-overlay" onClick={onClose}>
      <div className="ad-banner-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="ad-banner-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {image && (
          <div className="ad-banner-image-wrap">
            <img src={image} alt="" className="ad-banner-image" />
          </div>
        )}

        {hasBodyContent && (
          <div className="ad-banner-body">
            {title && <h2 className="ad-banner-title">{title}</h2>}
            {message && <p className="ad-banner-message">{message}</p>}

            {button_text && button_link && (
              <button className="ad-banner-cta-btn" onClick={handleCtaClick}>
                {button_text}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;