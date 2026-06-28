import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import CashbackModal, { useCashbackPromo } from "./CashbackModal";

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStarTiersModal, setShowStarTiersModal] = useState(false);
  const trendingRef = useRef(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Cashback promo hook
  const { cashbackPromo, showCashbackModal, setShowCashbackModal } = useCashbackPromo();

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

  const getPriceChangeColor = (token) => {
    if (token.change === "up") return "token-price-green";
    if (token.change === "down") return "token-price-red";
    return "";
  };

  const getPercentChangeColor = (token) => {
    if (token.percent_change > 0) return "token-price-green";
    if (token.percent_change < 0) return "token-price-red";
    return "";
  };

  const getPriceChangeArrow = (token) => {
    if (token.change === "up") return <span className="price-arrow">▲</span>;
    if (token.change === "down") return <span className="price-arrow">▼</span>;
    return null;
  };

  const scrollTrending = (direction) => {
    if (trendingRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      trendingRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleTokenClick = (symbol) => {
    navigate(`/trade?token=${symbol}`);
  };

  const handleMessageClick = (messageType) => {
    if (messageType === 'deposit') {
      setShowStarTiersModal(true);
    } else if (messageType === 'referral') {
      navigate('/wallet?tab=referral');
    }
  };

  const handleCloseModal = () => {
    setShowStarTiersModal(false);
    navigate('/wallet?tab=deposit');
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

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - trendingRef.current.offsetLeft);
    setScrollLeft(trendingRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - trendingRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    trendingRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const filteredTrendingTokens = prices.filter(
    (token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUserTokens = portfolio?.tokens
    ? filterOutUSDT([...portfolio.tokens]).sort((a, b) => {
        const priceA = prices.find((p) => p.symbol === a.symbol)?.price_usd || 0;
        const priceB = prices.find((p) => p.symbol === b.symbol)?.price_usd || 0;
        const valueA = parseFloat(a.balance) * priceA;
        const valueB = parseFloat(b.balance) * priceB;
        return valueB - valueA;
      })
    : [];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading your portfolio...</span>
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
            navigate('/wallet?tab=deposit');
          }}
        />
      )}

      <header className="dashboard-header">
        <h1>SWAPVIEW</h1>
      </header>

      <main className="dashboard-content">
        {/* User Info and Balance */}
        <section className="balance-card">
          {portfolio && (
            <>
              <div className="user-info">
                <span className="username">{portfolio.user?.username || "N/A"}</span>
                <div className="star-rating">
                  {getStarRating(Number(portfolio.balance_usd))}
                </div>
              </div>

              <div className="main-balance-amount">
                <span>
                  {parseFloat(portfolio.balance_usd || 0).toFixed(2)}
                  <span
                    style={{ fontSize: "0.4em", marginLeft: "4px" }}
                    lang="he"
                  >
                    USD
                  </span>
                </span>
                <div className="balance-label">Available Balance</div>
              </div>
            </>
          )}
        </section>

        {/* Trending Tokens */}
        <section className="trending-section">
          <div className="mobile-search-container">
            <input
              type="text"
              placeholder="Search tokens..."
              className="token-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="trending-header-container">
            <h2>TRENDING</h2>
            <div className="desktop-search-container">
              <input
                type="text"
                placeholder="Search tokens..."
                className="token-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="trending-grid-container">
            <button
              className="scroll-button left"
              onClick={() => scrollTrending("left")}
            >
              &lt;
            </button>
            <div
              className="trending-grid"
              ref={trendingRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {filteredTrendingTokens.map((token, index) => (
                <div
                  key={index}
                  className="trending-token-card"
                  onClick={() => handleTokenClick(token.symbol)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="token-card-header">
                    <div className="token-image-wrapper">
                      <img
                        src={token.image_url || "/default-token.png"}
                        alt={token.symbol}
                        className="token-image"
                      />
                    </div>
                    <div>
                      <h3 className="token-name">{token.name}</h3>
                      <span className="token-symbol">{token.symbol}</span>
                    </div>
                  </div>

                  <div className={`token-price ${getPriceChangeColor(token)}`}>
                    <span className="price-value">
                      ${token.price_usd.toFixed(5)}
                    </span>
                    {getPriceChangeArrow(token)}
                    <span
                      className={`percent-change ${getPercentChangeColor(token)}`}
                    >
                      {token.percent_change > 0 ? "+" : ""}
                      {token.percent_change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="scroll-button right"
              onClick={() => scrollTrending("right")}
            >
              &gt;
            </button>
          </div>
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
            <div className="user-tokens-list">
              {sortedUserTokens.map((token) => {
                const priceData = prices.find((p) => p.symbol === token.symbol);
                const tokenValue = priceData
                  ? parseFloat(token.balance) * priceData.price_usd
                  : 0;

                const percentChange = priceData?.percent_change || 0;
                const changeType = priceData?.change || "neutral";

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

                return (
                  <div
                    key={token.symbol}
                    className="user-token-card"
                    onClick={() => navigate(`/trade?token=${token.symbol}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="token-image-wrapper">
                      <img
                        src={token.image_url || "/default-token.png"}
                        alt={token.symbol}
                        className="token-image"
                      />
                    </div>
                    <div className="user-token-info">
                      <div className="user-token-name">
                        {token.name} <span className="token-symbol">{token.symbol}</span>
                      </div>
                      <div className="user-token-value">
                        $
                        {tokenValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 5,
                        })}
                      </div>
                    </div>
                    <div className={`user-token-change ${getPercentChangeColor(percentChange)}`}>
                      {getPriceChangeArrow(changeType)}
                      {percentChange > 0 ? "+" : ""}
                      {percentChange}%
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