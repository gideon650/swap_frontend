import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { usePrices } from "../context/PriceContext";
import { useNavigate } from "react-router-dom";
import {
  FaCog,
  FaWallet,
  FaArrowCircleDown,
  FaShoppingCart,
  FaUserPlus,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash,
  FaSearch,
} from "react-icons/fa";
import "./Dashboard.css";
import logoGlyph from "../assets/images/logo-glyph.png";
import CashbackModal, { useCashbackPromo } from "./CashbackModal";
// If Dashboard.js does not live in the same folder as NotificationBadge.js,
// adjust this path (Navbar.js currently imports it as "../pages/NotificationBadge")
import NotificationBadge from "./NotificationBadge";
import DepositNotificationBadge from "./DepositNotificationBadge";

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStarTiersModal, setShowStarTiersModal] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  // Drives which animated background scene shows behind the balance amount.
  // Cycles through 5 scenes based on the current hour, same idea as the
  // reference balance hero's rotating animation.
  const [sceneIndex, setSceneIndex] = useState(() => new Date().getHours() % 5);

  // Cashback promo hook
  const { cashbackPromo, showCashbackModal, setShowCashbackModal } = useCashbackPromo();

  // Live price overlay — `prices` below stays the once-fetched REST snapshot
  // (name, image, price_24h_ago, etc.); livePrices patches price_usd/percent_change
  // on top of it from the WebSocket feed.
  const { prices: livePriceMap } = usePrices();
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
        percent_change: live.percent_change, // tick-based — unchanged, still drives the Tokens list
        change: live.percent_change > 0 ? "up" : live.percent_change < 0 ? "down" : "same",
        percent_change_24h: percentChange24h, // true 24h — Trending only
      };
    });
  }, [prices, livePriceMap]);

  // Filter function to exclude USDT
  const filterOutUSDT = (tokens) => {
    return tokens.filter(token => token.symbol !== 'USDT');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Token ${token}` } };

        const portfolioRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/portfolio/`,
          config
        );
        const pricesRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/crypto-prices/`,
          config
        );

        setPortfolio(portfolioRes.data);
        setPrices(filterOutUSDT(pricesRes.data.cryptocurrencies || []));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Message sliding animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % 2);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Keep the balance-card background scene in sync with the current hour
  useEffect(() => {
    const tick = () => setSceneIndex(new Date().getHours() % 5);
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const getStarRating = (balance) => {
    let filledStars = 0;
    if (balance >= 5000) filledStars = 5;
    else if (balance >= 1001) filledStars = 4;
    else if (balance >= 501) filledStars = 3;
    else if (balance >= 201) filledStars = 2;
    else filledStars = 1;

    const emptyStars = 5 - filledStars;

    return "★".repeat(filledStars) + "☆".repeat(emptyStars);
  };

  const getAmountToThreeStars = (currentBalance) => {
    if (currentBalance >= 1001) return 0;
    return (1001 - currentBalance).toFixed(2);
  };

  const getPercentChangeColor = (percent) => {
    if (percent > 0) return "token-price-green";
    if (percent < 0) return "token-price-red";
    return "";
  };

  const getPriceChangeArrow = (change) => {
    if (change === "up") return <span className="price-arrow">▲</span>;
    if (change === "down") return <span className="price-arrow">▼</span>;
    return null;
  };

  const handleTokenClick = (symbol) => {
    navigate(`/trade?token=${symbol}`);
  };

  const handleMessageClick = (messageType) => {
    if (messageType === 'deposit') {
      setShowStarTiersModal(true);
    } else if (messageType === 'referral') {
      navigate('/invite');
    }
  };

  const handleCloseModal = () => {
    setShowStarTiersModal(false);
    navigate('/deposit');
  };

  const getMessages = () => {
    const messages = [
      {
        id: 'deposit',
        icon: '💰',
        text: portfolio && Number(portfolio.balance_usd) < 1001
          ? `Add $${getAmountToThreeStars(Number(portfolio.balance_usd))} to your wallet to get upgraded&nbsp;to <span class="gold-star">4&nbsp;star</span> to enjoy our premium features. Deposit&nbsp;now→`
          : 'Upgrade your account for premium features',
        type: 'deposit'
      },
      {
        id: 'referral',
        icon: '🎁',
        text: 'Refer a user and earn 15% of their initial deposit. Refer a friend now→',
        type: 'referral'
      }
    ];
    return messages;
  };

  // Trending = top 4 tokens by 24h % gain (price_24h_ago -> current live price).
  // Uses percent_change_24h, NOT percent_change — that one stays tick-based and
  // keeps driving the Tokens list / everywhere else in the app unchanged.
  const searchedTokens = livePrices.filter(
    (token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendingTokens = [...searchedTokens].sort(
    (a, b) => b.percent_change_24h - a.percent_change_24h
  );
  // Always exactly 4 (or fewer if there aren't 4 tokens yet) — drives the grid layout below.
  const visibleTrendingTokens = trendingTokens.slice(0, 4);

  const sortedUserTokens = portfolio?.tokens
    ? filterOutUSDT([...portfolio.tokens]).sort((a, b) => {
        const priceA = livePrices.find((p) => p.symbol === a.symbol)?.price_usd || 0;
        const priceB = livePrices.find((p) => p.symbol === b.symbol)?.price_usd || 0;
        const valueA = parseFloat(a.balance) * priceA;
        const valueB = parseFloat(b.balance) * priceB;
        return valueB - valueA;
      })
    : [];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="logo-loading-screen">
          <img src={logoGlyph} alt="" className="logo-loading-glyph" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* Star Tiers Modal */}
      {showStarTiersModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={handleCloseModal}>
              ✕
            </button>
            <img
              src="https://i.imgur.com/yfngZFj.png"
              alt="Star Tiers"
              className="modal-image"
            />
          </div>
        </div>
      )}

      {/* Cashback Promo Modal */}
      {showCashbackModal && cashbackPromo && (
        <CashbackModal
          promo={cashbackPromo}
          onClose={() => setShowCashbackModal(false)}
          onDeposit={() => {
            setShowCashbackModal(false);
            navigate('/deposit');
          }}
        />
      )}

      <header className="dashboard-header">
        <button
          className="header-settings-btn"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <FaCog />
          <NotificationBadge />
        </button>
        <div className="dashboard-header-title">
          <img src={logoGlyph} alt="" className="dashboard-header-icon" />
          SWAPVIEW
        </div>
      </header>

      <main className="dashboard-content">

        {/* Search bar — single row at the top of the page */}
        <div className="dashboard-search-row">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search tokens..."
              className="token-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* User Info and Balance */}
        <section className="balance-card">
          <BalanceScene index={sceneIndex} />
          {portfolio && (
            <>
              <div className="user-info">
                <span className="username">{portfolio.user?.username || "N/A"}</span>
                <div className="star-rating">
                  {getStarRating(Number(portfolio.balance_usd))}
                </div>
              </div>

              <div className="main-balance-amount">
                <span className="balance-value">
                  {showBalance ? (
                    <>
                      {parseFloat(portfolio.balance_usd || 0).toFixed(2)}
                      <span
                        style={{ fontSize: "0.4em", marginLeft: "4px" }}
                        lang="he"
                      >
                        USD
                      </span>
                    </>
                  ) : (
                    "••••••"
                  )}
                </span>
                <button
                  className="balance-eye-btn"
                  onClick={() => setShowBalance((v) => !v)}
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              <div className="balance-label">Available Balance</div>

              {/* Quick actions: Fund (②) / Withdraw (③) / Buy (Ⓐ) / Invite (Ⓑ) */}
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('/deposit')} style={{ position: 'relative' }}>
                  <span className="quick-action-icon"><FaWallet /></span>
                  <span>Fund</span>
                  <DepositNotificationBadge />
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/withdraw')}>
                  <span className="quick-action-icon"><FaArrowCircleDown /></span>
                  <span>Withdraw</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/trade')}>
                  <span className="quick-action-icon"><FaShoppingCart /></span>
                  <span>Buy</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/invite')}>
                  <span className="quick-action-icon"><FaUserPlus /></span>
                  <span>Invite</span>
                </button>
              </div>
            </>
          )}
        </section>

        {/* Trending Tokens */}
        <section className="trending-section">
          <div className="trending-header-container">
            <div className="trending-title-row">
              <button
                className="trend-filter-btn gainers"
                onClick={() => navigate('/tokens/gainers')}
                aria-label="Top gainers"
                title="Top gainers"
              >
                <FaArrowUp />
              </button>
              <button
                className="trend-filter-btn losers"
                onClick={() => navigate('/tokens/losers')}
                aria-label="Top losers"
                title="Top losers"
              >
                <FaArrowDown />
              </button>
              <h2>TRENDING</h2>
            </div>
          </div>

          {visibleTrendingTokens.length === 0 ? (
            <p className="trending-empty">No tokens available yet.</p>
          ) : (
            <div
              className={`trending-grid-layout trending-count-${visibleTrendingTokens.length}`}
            >
              {visibleTrendingTokens.map((token, index) => {
                // With 3 trending tokens: first two sit side by side, the third
                // spans the full width on the row below.
                const isSpanFull = visibleTrendingTokens.length === 3 && index === 2;
                return (
                  <div
                    key={token.symbol}
                    className={`trending-slim-card ${isSpanFull ? "trending-item-full" : ""}`}
                    onClick={() => handleTokenClick(token.symbol)}
                  >
                    <span className="trending-slim-symbol">{token.symbol}</span>
                    <span className="trending-slim-price">${token.price_usd.toFixed(3)}</span>
                    <span className={`trending-slim-change ${getPercentChangeColor(token.percent_change_24h)}`}>
                      {getPriceChangeArrow(token.percent_change_24h > 0 ? "up" : token.percent_change_24h < 0 ? "down" : "same")}
                      {token.percent_change_24h > 0 ? "+" : ""}
                      {token.percent_change_24h}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="trending-see-more-btn"
            onClick={() => navigate('/tokens')}
          >
            See more
          </button>
        </section>

        {/* Sliding Messages Section */}
        <section className="sliding-messages-section">
          <div className="sliding-messages-container">
            {getMessages().map((message, index) => (
              <div
                key={message.id}
                className={`sliding-message ${index === currentMessageIndex ? 'active' : ''}`}
                onClick={() => handleMessageClick(message.type)}
              >
                <div className="message-icon">{message.icon}</div>
                <div
                  className="message-text"
                  dangerouslySetInnerHTML={{ __html: message.text }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* User Tokens Section */}
        <section className="user-tokens-section">
          <div className="section-header">
            <h2>TOKENS</h2>
          </div>

          {sortedUserTokens.length > 0 ? (
            <div className="token-row-list">
              {sortedUserTokens.map((token) => {
                const priceData = livePrices.find((p) => p.symbol === token.symbol);
                const tokenValue = priceData
                  ? parseFloat(token.balance) * priceData.price_usd
                  : 0;

                const percentChange = priceData?.percent_change || 0;
                const changeType = priceData?.change || "neutral";

                return (
                  <div
                    key={token.symbol}
                    className="token-row-card"
                    onClick={() => navigate(`/trade?token=${token.symbol}`)}
                  >
                    <div className="token-image-wrapper">
                      <img
                        src={token.image_url || "/default-token.png"}
                        alt={token.symbol}
                        className="token-image"
                      />
                    </div>
                    <div className="token-row-info">
                      <div className="token-row-name">
                        {token.symbol} <span className="token-symbol">{token.name}</span>
                      </div>
                      {priceData && (
                        <div className="token-row-price">${priceData.price_usd.toFixed(3)}</div>
                      )}
                    </div>
                    <div className="token-row-right">
                      <div className="token-row-value">
                        ${tokenValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 5,
                        })}
                      </div>
                      <div className={`token-row-change ${getPercentChangeColor(percentChange)}`}>
                        {getPriceChangeArrow(changeType)}
                        {percentChange > 0 ? "+" : ""}
                        {percentChange}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-tokens">
              <p>No tokens in your portfolio</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

/* ---------------- Balance card background animation ---------------- */
/* Small coin badge used by every scene below. */
function BalanceCoin({ char, tone }) {
  return (
    <span className={`balance-coin ${tone === "gold" ? "balance-coin-gold" : "balance-coin-purple"}`}>
      {char}
    </span>
  );
}

/* Picks and renders one of the rotating background scenes. */
function BalanceScene({ index }) {
  const scenes = [Scene0, Scene1, Scene2, Scene3, Scene4];
  const Scene = scenes[index % scenes.length] || Scene0;
  return (
    <div className="balance-scene-layer" aria-hidden="true">
      <Scene />
    </div>
  );
}

/* Scene 0 — coins crossing the card horizontally, opposite directions */
function Scene0() {
  return (
    <>
      <div className="balance-scene-row balance-scene-row-top">
        <BalanceCoin char="$" tone="gold" />
      </div>
      <div className="balance-scene-row balance-scene-row-bottom">
        <BalanceCoin char="₿" tone="purple" />
      </div>
    </>
  );
}

/* Scene 1 — coins orbiting a ring, like the swap FAB */
function Scene1() {
  return (
    <div className="balance-scene-orbit-wrap">
      <div className="balance-scene-orbit-ring" />
      <div className="balance-scene-orbit-coin balance-scene-orbit-coin-top">
        <BalanceCoin char="$" tone="gold" />
      </div>
      <div className="balance-scene-orbit-coin balance-scene-orbit-coin-bottom">
        <BalanceCoin char="₿" tone="purple" />
      </div>
    </div>
  );
}

/* Scene 2 — swap arrows with floating coins at each end */
function Scene2() {
  return (
    <>
      <svg viewBox="0 0 100 100" className="balance-scene-arrows" preserveAspectRatio="none">
        <g stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
          <path d="M20 35 H75 L65 25" className="balance-scene-float" />
          <path d="M80 65 H25 L35 75" className="balance-scene-float" style={{ animationDelay: "1s" }} />
        </g>
      </svg>
      <div className="balance-scene-float-coin balance-scene-float-coin-left">
        <BalanceCoin char="$" tone="gold" />
      </div>
      <div className="balance-scene-float-coin balance-scene-float-coin-right" style={{ animationDelay: "1.4s" }}>
        <BalanceCoin char="₿" tone="purple" />
      </div>
    </>
  );
}

/* Scene 3 — coin rain drifting up and down across a center line */
function Scene3() {
  const coins = [
    { left: "10%", delay: "0s", tone: "gold", char: "$" },
    { left: "35%", delay: "0.6s", tone: "purple", char: "₿" },
    { left: "62%", delay: "1.2s", tone: "gold", char: "$" },
    { left: "85%", delay: "0.3s", tone: "purple", char: "₿" },
  ];
  return (
    <>
      {coins.map((c, i) => (
        <div key={i} className="balance-scene-rain-coin" style={{ left: c.left, animationDelay: c.delay }}>
          <BalanceCoin char={c.char} tone={c.tone} />
        </div>
      ))}
      <div className="balance-scene-rain-line" />
    </>
  );
}

/* Scene 4 — two people (circles) exchanging coins along arced paths */
function Scene4() {
  return (
    <>
      <div className="balance-scene-person balance-scene-person-left" />
      <div className="balance-scene-person balance-scene-person-right" />
      <div className="balance-scene-arc balance-scene-arc-top">
        <BalanceCoin char="$" tone="gold" />
      </div>
      <div className="balance-scene-arc balance-scene-arc-bottom">
        <BalanceCoin char="₿" tone="purple" />
      </div>
    </>
  );
}