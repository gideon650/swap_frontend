// PnLCard.js
import React, { useEffect, useRef } from "react";
import "./PnLCard.css";

// Import the 6 images
import destructionImg from "./assets/images/1-destruction.jpg";
import stormyImg from "./assets/images/2-stormy-statue.jpg";
import tenseImg from "./assets/images/3-tense-red.jpg";
import neutralImg from "./assets/images/4-neutral-calm.jpg";
import brightImg from "./assets/images/5-bright-gold.jpg";
import victoryImg from "./assets/images/6-victory-sunrise.jpg";
import swapviewLogo from "./assets/images/symbol.png";

const BRACKET_MAP = {
  destruction: { image: destructionImg, title: "DESTRUCTION" },
  stormy: { image: stormyImg, title: "STORMS" },
  tense: { image: tenseImg, title: "TENSE" },
  neutral: { image: neutralImg, title: "NEUTRAL" },
  bright: { image: brightImg, title: "BRIGHT" },
  victory: { image: victoryImg, title: "VICTORY" },
};

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

  return (
    <div className="pnl-overlay" onClick={onClose}>
      <div className="pnl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pnl-card">
          <img 
            src={bracketData.image} 
            alt={bracketData.title}
            className="pnl-background"
          />
          
          {/* Overlay content */}
          <div className="pnl-content">
            {/* Brand - stays top-left */}
            <div className="pnl-brand">
              <img src={swapviewLogo} alt="SwapView" className="pnl-brand-logo" />
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
        </div>
      </div>
    </div>
  );
};

export default PnLCard;