import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Assets.css";
import { usePrices } from "../context/PriceContext";
import logoGlyph from "../assets/images/logo-glyph.png";

/* ---------- Inline icons (dependency-free, matches Invite.js/Deposit.js style) ---------- */
const IconArrowLeft = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconEye = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconWallet = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);
const IconLock = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconLayers = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);
const IconArrowUpRight = (p) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
);
const IconArrowDownRight = (p) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="7" y1="7" x2="17" y2="17" /><polyline points="17 7 17 17 7 17" />
  </svg>
);
const IconCoins = (p) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

function fmtUsd(n) {
  const v = Number(n) || 0;
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Assets() {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [hideDust, setHideDust] = useState(false);
  const [portfolio, setPortfolio] = useState({
    balance_usd: 0,
    in_use_usd: 0,
    total_asset_usd: 0,
    todays_pnl_usd: 0,
    todays_pnl_percent: 0,
    tokens: [],
  });

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const res = await axios.get(`${API_BASE_URL}/portfolio/`, config);
      if (res.data) {
        setPortfolio({
          balance_usd: res.data.balance_usd || 0,
          in_use_usd: res.data.in_use_usd || 0,
          total_asset_usd: res.data.total_asset_usd || 0,
          todays_pnl_usd: res.data.todays_pnl_usd || 0,
          todays_pnl_percent: res.data.todays_pnl_percent || 0,
          tokens: res.data.tokens || [],
        });
      }
    } catch (error) {
      console.error("Failed to load portfolio", error);
    } finally {
      setLoading(false);
    }
  };

  const { prices: livePrices } = usePrices();

  // Patch each holding's price/value/pnl from the live WebSocket feed.
  // avg_buy_price comes from the portfolio endpoint, so pnl_percent can be
  // recomputed client-side the same way the server does it.
  const liveTokens = useMemo(() => {
    return portfolio.tokens.map((t) => {
      const live = livePrices[t.symbol];
      if (!live) return t;
      const dollar_value = (parseFloat(t.balance) || 0) * live.price_usd;
      const pnl_percent = t.avg_buy_price > 0
        ? Math.round(((live.price_usd - t.avg_buy_price) / t.avg_buy_price) * 10000) / 100
        : t.pnl_percent;
      return {
        ...t,
        price_usd: live.price_usd,
        dollar_value,
        pnl_percent,
      };
    });
  }, [portfolio.tokens, livePrices]);

  const visibleTokens = useMemo(() => {
    if (!hideDust) return liveTokens;
    return liveTokens.filter((t) => (t.dollar_value || 0) >= 1);
  }, [liveTokens, hideDust]);

  const pnlIsUp = portfolio.todays_pnl_usd >= 0;

  return (
    <div className="ast-root">
      <div className="ast-orb ast-orb-1" />
      <div className="ast-orb ast-orb-2" />
      <div className="ast-orb ast-orb-3" />

      {/* Header */}
      <header className="ast-header">
        <button className="ast-icon-btn" aria-label="Back" onClick={() => navigate("/dashboard")}>
          <IconArrowLeft />
        </button>
        <div className="ast-header-title">
          <IconLayers className="ast-header-icon" /> ASSETS
        </div>
        <button
          className="ast-icon-btn"
          aria-label={hideDust ? "Show all balances" : "Hide balances under $1"}
          onClick={() => setHideDust((v) => !v)}
        >
          {hideDust ? <IconEyeOff /> : <IconEye />}
        </button>
      </header>

      <main className="ast-main">
        {/* Hero summary */}
        <section className="ast-hero">
          <div className="ast-hero-shine" />
          <div className="ast-hero-inner">
            <p className="ast-hero-label">Total Asset</p>
            <h1 className="ast-hero-total">
              ${loading ? "—" : fmtUsd(portfolio.total_asset_usd)}
            </h1>

            <div className={`ast-pnl-pill ${pnlIsUp ? "is-up" : "is-down"}`}>
              {pnlIsUp ? <IconArrowUpRight /> : <IconArrowDownRight />}
              <span>
                {loading
                  ? "Today's P&L —"
                  : `Today's P&L ${pnlIsUp ? "+" : "-"}${fmtUsd(Math.abs(portfolio.todays_pnl_usd))} USD (${pnlIsUp ? "+" : "-"}${Math.abs(portfolio.todays_pnl_percent).toFixed(4)}%)`}
              </span>
            </div>

            {/* Available / In use */}
            <div className="ast-balance-row">
              <div className="ast-balance-card">
                <div className="ast-balance-top">
                  <IconWallet className="ast-balance-icon" />
                  <span className="ast-balance-label">Available</span>
                </div>
                <div className="ast-balance-value">
                  ${loading ? "—" : fmtUsd(portfolio.balance_usd)}
                </div>
              </div>
              <div className="ast-balance-card">
                <div className="ast-balance-top">
                  <IconLock className="ast-balance-icon" />
                  <span className="ast-balance-label">In Use</span>
                </div>
                <div className="ast-balance-value">
                  ${loading ? "—" : fmtUsd(portfolio.in_use_usd)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="ast-actions">
              <button className="ast-action-btn is-primary" onClick={() => navigate("/trade")}>
                Buy
              </button>
              <button className="ast-action-btn" onClick={() => navigate("/swap")}>
                Swap
              </button>
            </div>
          </div>
        </section>

        {/* Holdings */}
        <section className="ast-holdings">
          <div className="ast-holdings-header">
            <p className="ast-section-label">Your Holdings</p>
            <button className="ast-dust-toggle" onClick={() => setHideDust((v) => !v)}>
              {hideDust ? <IconEyeOff /> : <IconEye />}
              <span>Hide balances under $1</span>
            </button>
          </div>

          {loading ? (
            <div className="ast-empty">
              <img src={logoGlyph} alt="" className="ast-loading-glyph" />
            </div>
          ) : visibleTokens.length === 0 ? (
            <div className="ast-empty">
              <IconCoins className="ast-empty-icon" />
              <p>No holdings to show yet.</p>
              <span>Buy or swap into an asset to see it here.</span>
            </div>
          ) : (
            <div className="ast-token-list">
              {visibleTokens.map((t) => {
                const up = (t.pnl_percent || 0) >= 0;
                return (
                  <button
                    key={t.symbol}
                    className="ast-token-row"
                    onClick={() => navigate(`/trade?token=${t.symbol}`)}
                  >
                    <div className="ast-token-left">
                      {t.image_url ? (
                        <img className="ast-token-logo" src={t.image_url} alt={t.symbol} />
                      ) : (
                        <div className="ast-token-logo ast-token-logo-fallback">{t.symbol?.[0]}</div>
                      )}
                      <div className="ast-token-info">
                        <span className="ast-token-symbol">{t.symbol}</span>
                        <span className="ast-token-price">${fmtUsd(t.price_usd)}</span>
                      </div>
                    </div>
                    <div className="ast-token-right">
                      <span className="ast-token-value">${fmtUsd(t.dollar_value)}</span>
                      <span className={`ast-token-pnl ${up ? "is-up" : "is-down"}`}>
                        {up ? <IconArrowUpRight /> : <IconArrowDownRight />}
                        {up ? "+" : ""}
                        {t.pnl_percent}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Assets;