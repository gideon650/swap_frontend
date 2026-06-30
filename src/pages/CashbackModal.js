import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CashbackModal.css";

const COINS = [
  { size: 36, cls: "cb-float",      style: { top: "8%",  left: "6%"  } },
  { size: 28, cls: "cb-float-slow", style: { top: "18%", left: "88%" } },
  { size: 44, cls: "cb-float-slow", style: { top: "52%", left: "3%"  } },
  { size: 30, cls: "cb-float",      style: { top: "68%", left: "90%" } },
  { size: 22, cls: "cb-float",      style: { top: "12%", left: "46%" } },
];

const EXAMPLES = [
  ["$100 Deposit", "$10 Cashback"],
  ["$200 Deposit", "$44 Cashback"],
  ["$500 Deposit", "$110 Cashback"],
];

const CashbackModal = ({ promo, onClose, onDeposit }) => {
  const navigate = useNavigate();

  return (
    <div className="cb-modal-overlay" onClick={onClose}>
      <div className="cb-modal" onClick={(e) => e.stopPropagation()}>

        {/* Decorative layers */}
        <div className="cb-modal-grid" />
        <div className="cb-modal-glow" />

        {/* Floating spinning coins */}
        {COINS.map((c, i) => (
          <div
            key={i}
            className={`cb-coin ${c.cls}`}
            style={{ width: c.size, height: c.size, fontSize: c.size * 0.5, ...c.style }}
          >
            <div className="cb-coin-inner cb-spin-y">$</div>
          </div>
        ))}

        <button className="cb-close-btn" onClick={onClose}>✕</button>

        {/* Content */}
        <div style={{ position: "relative", textAlign: "center" }}>

          {/* Badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <span className="cb-badge">✦ Limited time · July 4 – July 7</span>
          </div>

          {/* Headline */}
          <h2 style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>
            <span className="cb-shimmer-text">JULY CASHBACK</span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.95)" }}>PROMOTION</span>
          </h2>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", margin: "0.5rem 0 1.5rem" }}>
            Deposit more, earn more. Get up to{" "}
            <strong style={{ color: "#d966d6" }}>22% back</strong>{" "}
            on every qualifying deposit this week.
          </p>

          {/* Tier cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div className="cb-tier-card">
              <div style={{ fontSize: "28px", marginBottom: "0.4rem" }}>💰</div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>Deposit</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.6rem" }}>$100 – $199</div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>Get</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#d966d6", lineHeight: 1 }}>10%</div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Cashback</div>
            </div>

            <div className="cb-tier-card highlight">
              <div style={{ fontSize: "28px", marginBottom: "0.4rem" }}>💰</div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>Deposit</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.6rem" }}>$200 & above</div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>Get</div>
              <div className="cb-shimmer-text" style={{ fontSize: "2.2rem", fontWeight: 900, lineHeight: 1 }}>22%</div>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Cashback</div>
            </div>
          </div>

          {/* Examples + Period */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <div className="cb-info-card">
              <div className="cb-section-badge">✓ Examples</div>
              {EXAMPLES.map(([dep, cash]) => (
                <div key={dep} className="cb-example-row">
                  <span className="cb-example-deposit">{dep}</span>
                  <span className="cb-example-cash">{cash}</span>
                </div>
              ))}
            </div>

            <div className="cb-info-card">
              <div className="cb-section-badge">📅 Period</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.15 }}>
                JULY 4
                <br />
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem" }}>–</span>{" "}
                <span className="cb-shimmer-text">JULY 7</span>
              </div>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", marginTop: "0.5rem", margin: "0.5rem 0 0" }}>
                All qualifying deposits in this window are eligible.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button className="cb-cta-btn cb-pulse-glow" onClick={onDeposit}>
            🚀 Deposit Now & Earn More
          </button>
          <p
            onClick={() => navigate("/cashback-terms")}
            style={{
              fontSize: "10px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginTop: "0.75rem",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "3px"
            }}
          >
            🛡 Terms & conditions apply
          </p>
        </div>
      </div>
    </div>
  );
};


export const useCashbackPromo = () => {
  const [cashbackPromo, setCashbackPromo] = useState(null);
  const [showCashbackModal, setShowCashbackModal] = useState(false);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Token ${token}` } };
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/cashback-promotion/`,
          config
        );
        if (res.data.active) {
          setCashbackPromo(res.data);
          if (!sessionStorage.getItem("cashback_modal_shown")) {
            setShowCashbackModal(true);
            sessionStorage.setItem("cashback_modal_shown", "true");
          }
        }
      } catch (err) {
        console.error("Failed to fetch cashback promo:", err);
      }
    };
    fetchPromo();
  }, []);

  return { cashbackPromo, showCashbackModal, setShowCashbackModal };
};

export default CashbackModal;