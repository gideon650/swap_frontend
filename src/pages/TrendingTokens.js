import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { usePrices } from "../context/PriceContext";
import "./TrendingTokens.css";

// Shows the top 20 tokens by 24h % change — gainers (best first) or
// losers (worst first) depending on the :type route param. Reuses the same
// data source and 24h-change math as Dashboard.js's Trending section, just
// without the 4-token cap. Visual language ported from History.js: floating
// orbs, glass header, a spotlight card for the #1 mover, and glass rows for
// the rest (instead of the old boxed 2-column grid).

/* ---------- Inline icons (dependency-free, matches History.js style) ---------- */
const IconArrowLeft = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconTrendingUp = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconTrendingDown = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);
const IconSearch = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Deterministic accent color per symbol, so each token gets a stable avatar tint.
const AVATAR_HUES = [265, 200, 150, 25, 330, 45, 190, 300];
const hashHue = (symbol) => {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = symbol.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_HUES[Math.abs(h) % AVATAR_HUES.length];
};

const formatPrice = (price) => {
  const n = Number(price);
  if (!isFinite(n)) return "—";
  if (n === 0) return "$0.00";
  if (n < 1) return `$${n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const TrendingTokens = () => {
  const { type } = useParams(); // 'gainers' | 'losers'
  const isGainers = type !== "losers";

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { prices: livePriceMap } = usePrices();

  const filterOutUSDT = (tokens) => tokens.filter((t) => t.symbol !== "USDT");

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Token ${token}` } };
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/crypto-prices/`,
          config
        );
        setPrices(filterOutUSDT(res.data.cryptocurrencies || []));
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Same live overlay + true 24h % calc as Dashboard.js
  const livePrices = useMemo(() => {
    return prices.map((p) => {
      const live = livePriceMap[p.symbol];
      if (!live) return p;
      const percentChange24h = p.price_24h_ago
        ? Math.round(((live.price_usd - p.price_24h_ago) / p.price_24h_ago) * 10000) / 100
        : p.percent_change_24h;
      return {
        ...p,
        price_usd: live.price_usd,
        prev_price_usd: live.prev_price_usd,
        percent_change_24h: percentChange24h,
      };
    });
  }, [prices, livePriceMap]);

  // Top 20 — best gainers first, or worst losers first.
  const rankedTokens = useMemo(() => {
    const sorted = [...livePrices].sort((a, b) =>
      isGainers
        ? b.percent_change_24h - a.percent_change_24h
        : a.percent_change_24h - b.percent_change_24h
    );
    const signFiltered = sorted.filter((t) =>
      isGainers ? t.percent_change_24h > 0 : t.percent_change_24h < 0
    );
    return signFiltered.slice(0, 20);
  }, [livePrices, isGainers]);

  const top = rankedTokens[0];
  const rest = rankedTokens.slice(1);

  const handleTokenClick = (symbol) => {
    navigate(`/trade?token=${symbol}`);
  };

  return (
    <div className={`tt-root ${isGainers ? "is-gainers" : "is-losers"}`}>
      <div className="tt-orb tt-orb-1" />
      <div className="tt-orb tt-orb-2" />

      <header className="tt-header">
        <div className="tt-header-inner">
          <button className="tt-icon-btn" aria-label="Back" onClick={() => navigate(-1)}>
            <IconArrowLeft />
          </button>
          <div className="tt-header-title">{isGainers ? "TOP GAINERS" : "TOP LOSERS"}</div>
        </div>
      </header>

      <main className="tt-main">
        {/* Gainers / Losers toggle */}
        <div className="tt-toggle">
          <button
            className={`tt-toggle-chip is-gain ${isGainers ? "is-active" : ""}`}
            onClick={() => navigate("/tokens/gainers")}
          >
            <IconTrendingUp /> Gainers
          </button>
          <button
            className={`tt-toggle-chip is-loss ${!isGainers ? "is-active" : ""}`}
            onClick={() => navigate("/tokens/losers")}
          >
            <IconTrendingDown /> Losers
          </button>
        </div>

        {loading && (
          <div className="tt-empty">
            <div className="tt-empty-title">Loading…</div>
          </div>
        )}

        {!loading && rankedTokens.length === 0 && (
          <div className="tt-empty">
            <div className="tt-empty-icon">
              <IconSearch width="22" height="22" />
            </div>
            <div className="tt-empty-title">{isGainers ? "No gainers right now" : "No losers right now"}</div>
            <div className="tt-empty-sub">Check back once the market moves.</div>
          </div>
        )}

        {!loading && top && (
          <>
            {/* Spotlight — the single biggest mover */}
            <div className="tt-spotlight" onClick={() => handleTokenClick(top.symbol)} role="button" tabIndex={0}>
              <div className="tt-spotlight-label">
                {isGainers ? <IconTrendingUp /> : <IconTrendingDown />}
                {isGainers ? "Biggest gainer" : "Biggest loser"}
              </div>
              <div className="tt-spotlight-body">
                <div
                  className="tt-spotlight-avatar"
                  style={{
                    background: `hsla(${hashHue(top.symbol)}, 70%, 55%, 0.18)`,
                    color: `hsl(${hashHue(top.symbol)}, 70%, 70%)`,
                    boxShadow: `inset 0 0 0 1px hsla(${hashHue(top.symbol)}, 70%, 60%, 0.3)`,
                  }}
                >
                  {top.symbol.slice(0, 1)}
                </div>
                <div className="tt-spotlight-info">
                  <div className="tt-spotlight-symbol">{top.symbol}</div>
                  <div className="tt-spotlight-price">{formatPrice(top.price_usd)}</div>
                </div>
                <div className="tt-spotlight-change">
                  {isGainers ? <IconTrendingUp width="20" height="20" /> : <IconTrendingDown width="20" height="20" />}
                  {top.percent_change_24h > 0 ? "+" : ""}
                  {top.percent_change_24h}%
                </div>
              </div>
            </div>

            {rest.length > 0 && (
              <>
                <div className="tt-list-head">
                  <div className="tt-list-label">{isGainers ? "Also rising" : "Also falling"}</div>
                  <div className="tt-list-rule" />
                  <div className="tt-list-count">{rest.length} more</div>
                </div>

                <div className="tt-rows">
                  {rest.map((token, i) => {
                    const hue = hashHue(token.symbol);
                    const gain = token.percent_change_24h > 0;
                    return (
                      <button
                        key={token.symbol}
                        className="tt-row"
                        onClick={() => handleTokenClick(token.symbol)}
                      >
                        <div className="tt-row-rank">{i + 2}</div>
                        <div
                          className="tt-row-avatar"
                          style={{
                            background: `hsla(${hue}, 70%, 55%, 0.16)`,
                            color: `hsl(${hue}, 70%, 72%)`,
                          }}
                        >
                          {token.symbol.slice(0, 1)}
                        </div>
                        <div className="tt-row-body">
                          <div className="tt-row-symbol">{token.symbol}</div>
                          <div className="tt-row-price">{formatPrice(token.price_usd)}</div>
                        </div>
                        <div className={`tt-row-change ${gain ? "is-gain" : "is-loss"}`}>
                          {gain ? <IconTrendingUp /> : <IconTrendingDown />}
                          {gain ? "+" : ""}
                          {token.percent_change_24h}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TrendingTokens;