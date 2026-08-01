import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaCoins } from "react-icons/fa";
import { usePrices } from "../context/PriceContext";
import "./AllTokens.css";

const PAGE_SIZE = 20; // 10 rows x 2 tokens per row

// Tiny inline trend chart for each token card. Takes a plain array of
// closing prices (from /crypto-sparklines/) and draws a normalized polyline —
// no chart library needed for something this small.
const Sparkline = ({ points, positive }) => {
  if (!points || points.length < 2) return null;

  const width = 56;
  const height = 20;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);

  const coords = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className="all-tokens-sparkline-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={coords}
        fill="none"
        stroke={positive ? "var(--spark-up)" : "var(--spark-down)"}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const AllTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sparklines, setSparklines] = useState({}); // { SYMBOL: [price, price, ...] }
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { prices: livePriceMap } = usePrices();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Token ${token}` } };
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/crypto-prices/`,
          config
        );
        const all = (res.data.cryptocurrencies || []).filter(
          (t) => t.symbol !== "USDT"
        );
        setTokens(all);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Overlay live WebSocket price updates on top of the fetched snapshot —
  // same pattern Dashboard.js uses for `livePrices`.
  const liveTokens = useMemo(() => {
    return tokens.map((t) => {
      const live = livePriceMap[t.symbol];
      if (!live) return t;
      return {
        ...t,
        price_usd: live.price_usd,
        prev_price_usd: live.prev_price_usd,
        percent_change: live.percent_change,
        change: live.percent_change > 0 ? "up" : live.percent_change < 0 ? "down" : "same",
      };
    });
  }, [tokens, livePriceMap]);

  const getPercentChangeColor = (percent) => {
    if (percent > 0) return "token-price-green";
    if (percent < 0) return "token-price-red";
    return "";
  };

  // Shows up to 6 decimal places without padding trailing zeros —
  // e.g. 63858.01 stays "63858.01", 0.000123 shows the full precision.
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) return "";
    return Number(Number(price).toFixed(6)).toString();
  };

  // Same destination as clicking a token anywhere else on the dashboard —
  // takes the user straight to that token's chart on the Trade page.
  const handleTokenClick = (symbol) => {
    navigate(`/trade?token=${symbol}`);
  };

  // Filters against symbol and full name — e.g. "btc" or "bitcoin" both match.
  const searchedTokens = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return liveTokens;
    return liveTokens.filter(
      (t) =>
        t.symbol?.toLowerCase().includes(q) ||
        t.name?.toLowerCase().includes(q)
    );
  }, [liveTokens, searchTerm]);

  // Start back at the first page whenever the search term changes, so
  // "See more" doesn't stay offset into a now-different filtered list.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm]);

  const visibleTokens = searchedTokens.slice(0, visibleCount);
  const hasMore = visibleCount < searchedTokens.length;

  // Stable string key so the sparkline fetch below only re-runs its initial
  // fetch when the actual set of visible symbols changes (e.g. "See more"),
  // not on every price tick.
  const visibleSymbolsKey = visibleTokens.map((t) => t.symbol).join(",");

  useEffect(() => {
    if (!visibleSymbolsKey) return;

    let cancelled = false;

    const fetchSparklines = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Token ${token}` } };
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/crypto-sparklines/?symbols=${visibleSymbolsKey}&points=20`,
          config
        );
        if (!cancelled) {
          setSparklines((prev) => ({ ...prev, ...(res.data.sparklines || {}) }));
        }
      } catch (error) {
        console.error("Error fetching sparkline data:", error);
      }
    };

    fetchSparklines();
    // Quiet background refresh — no loading state, just swaps the polyline
    // points on the next render. 15min candles underlie this data, so there's
    // no need to poll faster than that; 45s just keeps newly-closed candles
    // showing up without the user having to do anything.
    const intervalId = setInterval(fetchSparklines, 45000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [visibleSymbolsKey]);

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  if (loading) {
    return (
      <div className="all-tokens-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading tokens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="all-tokens-container">
      <header className="all-tokens-header">
        <button
          className="all-tokens-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <div className="all-tokens-header-title">
          <FaCoins className="all-tokens-header-icon" />
          ALL TOKENS
        </div>
      </header>

      <div className="all-tokens-search-wrapper">
        <FaSearch className="all-tokens-search-icon" />
        <input
          type="text"
          className="all-tokens-search-input"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <main className="all-tokens-content">
        {visibleTokens.length === 0 ? (
          <p className="all-tokens-empty">
            {searchTerm.trim() ? "No tokens match your search." : "No tokens available yet."}
          </p>
        ) : (
          <div className="all-tokens-grid">
            {visibleTokens.map((token) => (
              <div
                key={token.symbol}
                className="all-tokens-card"
                onClick={() => handleTokenClick(token.symbol)}
              >
                <div className="all-tokens-card-top">
                  <div className="all-tokens-title">
                    <span className="all-tokens-symbol">{token.symbol}</span>
                    <span className="all-tokens-name">{token.name}</span>
                  </div>
                  <Sparkline
                    points={sparklines[token.symbol]}
                    positive={token.percent_change >= 0}
                  />
                </div>
                <div className="all-tokens-bottom-row">
                  <div className="all-tokens-price-info">
                    <span className="all-tokens-price">${formatPrice(token.price_usd)}</span>
                    <span className={`all-tokens-change ${getPercentChangeColor(token.percent_change)}`}>
                      {token.percent_change > 0 ? "+" : ""}
                      {token.percent_change}%
                    </span>
                  </div>
                  <div className="all-tokens-image-wrapper">
                    <img
                      src={token.image_url || "/default-token.png"}
                      alt={token.symbol}
                      className="all-tokens-image"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button className="all-tokens-see-more-btn" onClick={handleSeeMore}>
            See more
          </button>
        )}
      </main>
    </div>
  );
};

export default AllTokens;