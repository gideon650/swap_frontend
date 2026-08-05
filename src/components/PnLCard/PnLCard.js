// PnLCard.js
import React, { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import "./PnLCard.css";

// Bracket background images now live in /public/images (plain static
// files served as-is by CRA) instead of being imported as JS modules.
// Importing them pulled them through webpack's asset pipeline, which was
// inlining these large JPEGs as base64 data: URIs — those were failing to
// load/re-fetch during PNG export (see ERR_INVALID_URL in html-to-image's
// embed-images step). Referencing them by plain URL avoids that entirely.
// If the app is deployed under a subpath (i.e. "homepage" is set in
// package.json), swap these for `${process.env.PUBLIC_URL}/images/...`.
const BRACKET_MAP = {
  destruction: { image: "/images/1-destruction.jpg", title: "DESTRUCTION" },
  stormy: { image: "/images/2-stormy-statue.jpg", title: "STORMS" },
  tense: { image: "/images/3-tense-red.jpg", title: "TENSE" },
  neutral: { image: "/images/4-neutral-calm.jpg", title: "NEUTRAL" },
  bright: { image: "/images/5-bright-gold.jpg", title: "BRIGHT" },
  victory: { image: "/images/6-victory-sunrise.jpg", title: "VICTORY" },
};

const SWAPVIEW_LOGO = "/images/symbol.png";

const IconDownload = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PnLCard = ({ data, onClose }) => {
  const { 
    symbol, 
    asset_name, 
    percent_change, 
    pnl_dollar, 
    invested, 
    duration, 
    bracket,
    is_profit 
  } = data;

  const bracketData = BRACKET_MAP[bracket] || BRACKET_MAP.neutral;
  const isPositive = pnl_dollar >= 0;
  const pnlLabel = isPositive ? "Current Profit" : "Current Loss";
  const pnlColor = isPositive ? "#22C55E" : "#EF4444";
  const sign = isPositive ? "+" : "";

  const cardRef = useRef(null);
  const downloadBtnRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);

      // Fail fast with a clear message if any image in the card didn't
      // actually finish loading, instead of letting html-to-image choke
      // on it later with an opaque internal error.
      const imgs = cardRef.current.querySelectorAll("img");
      for (const img of imgs) {
        if (!img.complete || img.naturalWidth === 0) {
          throw new Error(`Image failed to load: ${img.src}`);
        }
      }

      // .pnl-card is sized via aspect-ratio + flex layout rather than fixed
      // width/height — html-to-image needs concrete pixel dimensions for
      // the clone it builds, so measure the actual rendered size and pass
      // it explicitly rather than letting it infer from computed style.
      const rect = cardRef.current.getBoundingClientRect();
      const dataUrl = await toPng(cardRef.current, {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        pixelRatio: 2,
        // cacheBust forces html-to-image to re-fetch every image with a
        // cache-busting query string during capture — a second, separate
        // request from the one that already loaded fine on screen. That
        // re-fetch is what's failing (see img.pnl-background error events).
        // Not needed for local /public assets, so it's off.
        cacheBust: false,
        // Skip embedding external stylesheets/fonts (e.g. Google Fonts) —
        // fetching those cross-origin without CORS headers is what silently
        // rejects the snapshot. The card still renders with whatever font
        // is already applied on screen; this only skips re-embedding it.
        skipFonts: true,
        // Leave the download button itself out of the captured image.
        filter: (node) => node !== downloadBtnRef.current,
      });
      const link = document.createElement("a");
      link.download = `swapview-${(symbol || "asset").toLowerCase()}-pnl.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Log the full error object (not just a message) — this is what we
      // actually need to see in the console to diagnose a real failure.
      console.error("Failed to download PnL card:", error);
      alert("Couldn't generate the image for download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="pnl-overlay" onClick={onClose}>
      <div className="pnl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pnl-card" ref={cardRef}>
          <img 
            src={bracketData.image} 
            alt={bracketData.title}
            className="pnl-background"
          />
          
          {/* Overlay content */}
          <div className="pnl-content">
            {/* Brand - stays top-left */}
            <div className="pnl-brand">
              <img src={SWAPVIEW_LOGO} alt="SwapView" className="pnl-brand-logo" />
              <span className="pnl-brand-text">SWAPVIEW</span>
            </div>

            {/* Main stats - floats to vertical middle, left-aligned */}
            <div className="pnl-main">
              <div className="pnl-symbol">{symbol}</div>
              <div className="pnl-percent" style={{ color: pnlColor }}>
                {sign}{percent_change}%
              </div>
              <div className="pnl-duration">
                <svg
                  className="pnl-duration-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 7v5l3 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{duration}</span>
              </div>
            </div>
            
            {/* Bottom - Investment info (unchanged position) */}
            <div className="pnl-footer">
              <div className="pnl-row">
                <span className="pnl-row-inner">
                  <span className="pnl-label">Invested</span>
                  <span className="pnl-value-wrap">
                    <svg className="pnl-value-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8.5 12.5h7M8.5 9.5h4.5a2 2 0 1 1 0 4H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="pnl-value">${invested.toFixed(2)}</span>
                  </span>
                </span>
              </div>
              <div className="pnl-row">
                <span className="pnl-row-inner">
                  <span className="pnl-label">{pnlLabel}</span>
                  <span className="pnl-value-wrap">
                    <svg className="pnl-value-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: pnlColor }}>
                      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8.5 12.5h7M8.5 9.5h4.5a2 2 0 1 1 0 4H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="pnl-value" style={{ color: pnlColor }}>
                      {sign}${Math.abs(pnl_dollar).toFixed(2)}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            ref={downloadBtnRef}
            type="button"
            className="pnl-download-icon-btn"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label={isDownloading ? "Preparing download" : "Download card"}
            title={isDownloading ? "Preparing..." : "Download"}
          >
            <IconDownload />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PnLCard;