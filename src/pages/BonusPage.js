import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./BonusPage.css";

const TRADES_PER_PAGE = 5;

const BonusPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [visibleTrades, setVisibleTrades] = useState(TRADES_PER_PAGE);

  const fetchPage = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/bonus/page/`,
        config
      );
      setData(res.data);
      setVisibleTrades(TRADES_PER_PAGE); // reset pagination on refresh
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setError("Failed to load bonus data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPage(false);
  }, [fetchPage]);

  if (loading) {
    return (
      <div className="bonus-page-loading">
        <span>Loading bonus…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bonus-page-loading">
        <span>{error || "Something went wrong."}</span>
        <button className="bonus-page-back" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const { claim, trades } = data;
  const fund = parseFloat(claim.bonus_amount || 0);
  const starting = parseFloat(claim.starting_bundle || 0);
  const bundle = parseFloat(claim.current_bundle || 0);
  const profit = parseFloat(claim.profit || 0);

  const daysElapsed = claim.days_elapsed ?? 0;
  const daysRemaining = claim.days_remaining ?? 0;
  const totalDays = claim.total_days_in_month ?? 30;
  const progressPercent = Math.min(
    100,
    Math.max(0, (daysElapsed / totalDays) * 100)
  );

  const visibleTradesList = trades.slice(0, visibleTrades);
  const hasMoreTrades = visibleTrades < trades.length;

  return (
    <div className="bonus-page-root">
      <div className="bonus-page-inner">

        {/* Header */}
        <div className="bonus-page-header">
          <button
            className="bonus-page-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <h1 className="bonus-page-title">TradeFi Bonus</h1>

          <button
            className="bonus-page-refresh"
            onClick={() => fetchPage(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>

        {/* Hero — current bundle + profit */}
        <section className="bonus-hero">
          <div className="bonus-hero-badge">📈 Bonus Active</div>
          <div className="bonus-hero-label">Current Bundle</div>
          <div className="bonus-hero-value">${bundle.toFixed(2)}</div>
          <div className="bonus-hero-sub">
            Started at ${starting.toFixed(2)}
          </div>
          <div className={`bonus-hero-profit ${profit >= 0 ? "positive" : "negative"}`}>
            {profit >= 0 ? "▲" : "▼"} ${Math.abs(profit).toFixed(2)}{" "}
            {profit >= 0 ? "profit" : "loss"} so far
          </div>
        </section>

        {/* Stats grid */}
        <section className="bonus-stats-grid">
          <div className="bonus-stat-card">
            <div className="bonus-stat-label">Bonus Received</div>
            <div className="bonus-stat-value gold">${fund.toFixed(2)}</div>
          </div>
          <div className="bonus-stat-card">
            <div className="bonus-stat-label">Current Bundle</div>
            <div className="bonus-stat-value">${bundle.toFixed(2)}</div>
          </div>
          <div className="bonus-stat-card">
            <div className="bonus-stat-label">Days Remaining</div>
            <div className="bonus-stat-value">{daysRemaining}</div>
          </div>
        </section>

        {/* Progress bar */}
        <div className="bonus-progress-wrap">
          <div className="bonus-progress-head">
            <span>Month progress</span>
            <span>{daysElapsed} / {totalDays} days</span>
          </div>
          <div className="bonus-progress-bar">
            <div
              className="bonus-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Trades made with the bundle */}
        <section className="bonus-trades-section">
          <h2 className="bonus-trades-title">
            Bundle Activity ({trades.length})
          </h2>

          {trades.length === 0 ? (
            <div className="bonus-trades-empty">
              No trades yet. Head to the Trade page to start using your bonus bundle.
            </div>
          ) : (
            <>
              <div className="bonus-trades-list">
                {visibleTradesList.map((t) => (
                  <div key={t.id} className="bonus-trade-card">
                    <div className="bonus-trade-img">
                      <img
                        src={t.image_url || "/default-token.png"}
                        alt={t.symbol}
                      />
                    </div>
                    <div className="bonus-trade-info">
                      <div className="bonus-trade-title">
                        <span>{t.symbol}</span>
                        <span className={`bonus-trade-side ${t.trade_type.toLowerCase()}`}>
                          {t.trade_type}
                        </span>
                      </div>
                      <div className="bonus-trade-meta">
                        {parseFloat(t.quantity).toFixed(6)} @ ${parseFloat(t.price_at_trade).toFixed(6)}
                      </div>
                    </div>
                    <div className="bonus-trade-value">
                      ${parseFloat(t.dollar_value).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {hasMoreTrades && (
                <button
                  className="bonus-trades-see-more"
                  onClick={() => setVisibleTrades((v) => v + TRADES_PER_PAGE)}
                >
                  See more ({trades.length - visibleTrades} remaining)
                </button>
              )}
            </>
          )}
        </section>

      </div>
    </div>
  );
};

export default BonusPage;