import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment-timezone";
import "./Swap.css";

/* ---------- Inline icons (kept dependency-free, no lucide-react in this project) ---------- */
const IconChevronDown = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconSearch = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconClock = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconArrowLeftRight = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 8 16 13" />
    <line x1="21" y1="8" x2="4" y2="8" />
    <polyline points="8 21 3 16 8 11" />
    <line x1="3" y1="16" x2="20" y2="16" />
  </svg>
);

/* ---------- Gold Coin (animated) — ported as-is from the reference ---------- */
function GoldCoin({ size = 56, className = "", style, symbol = "$" }) {
  return (
    <div
      className={`sw-coin-wrap ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden
    >
      <div className="sw-coin">
        <div className="sw-coin-face sw-coin-front">
          <span style={{ fontSize: size * 0.42 }}>{symbol}</span>
        </div>
        <div className="sw-coin-face sw-coin-edge" />
        <div className="sw-coin-face sw-coin-back">
          <span style={{ fontSize: size * 0.42 }}>★</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Field wrapper ---------- */
function Field({ label, hint, error, children }) {
  return (
    <div className="sw-field">
      <div className="sw-field-head">
        <label className="sw-field-label">{label}</label>
        {hint && <span className="sw-field-hint">{hint}</span>}
      </div>
      {children}
      {error && <p className="sw-field-error">{error}</p>}
    </div>
  );
}

/* ---------- Token badge ---------- */
function TokenBadge({ symbol }) {
  const initial = (symbol || "?").slice(0, 1);
  return <div className="sw-token-badge">{initial}</div>;
}

const Swap = () => {
  const [assets, setAssets] = useState([]);
  const [swapAmount, setSwapAmount] = useState("");
  const [swapFromAsset, setSwapFromAsset] = useState("USDT");
  const [swapToAsset, setSwapToAsset] = useState("");
  const [swapBackAsset, setSwapBackAsset] = useState("USDT");
  const [swapBackTime, setSwapBackTime] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasPendingSwap, setHasPendingSwap] = useState(false);
  const [amountError, setAmountError] = useState(false);

  const dropdownRef = useRef(null);
  const MINIMUM_SWAP_AMOUNT = 3;

  useEffect(() => {
    fetchAssets();
    checkPendingSwap();

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/crypto-prices/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setAssets(response.data.cryptocurrencies);
      const usdt = response.data.cryptocurrencies.find((asset) => asset.symbol === "USDT");
      if (usdt) {
        setSwapFromAsset("USDT");
        setSwapBackAsset("USDT");
      }
    } catch (error) {
      console.error("Failed to fetch assets", error);
      setMessage("Failed to load assets. Please try again later.");
    }
  };

  const checkPendingSwap = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/check-pending-swap/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setHasPendingSwap(response.data.has_pending_swap);
    } catch (error) {
      console.error("Error checking pending swap:", error);
    }
  };

  const handleSwapBackTimeChange = (e) => {
    const selectedTime = e.target.value;
    setSwapBackTime(selectedTime);

    if (!selectedTime) {
      setTimeError("");
      return;
    }

    const localMoment = moment(selectedTime);
    const now = moment().tz("Africa/Lagos");
    const diffMinutes = localMoment.diff(now, "minutes");

    let error = "";
    if (diffMinutes <= 0) {
      error = "Swap back time must be in the future.";
    } else if (diffMinutes < 5) {
      error = "Swap duration must be at least 5 minutes.";
    } else if (diffMinutes > 43200) {
      error = "Swap duration cannot exceed 30 days.";
    }

    setTimeError(error);
  };

  const handleSwapAmountChange = (e) => {
    const value = e.target.value;
    setSwapAmount(value);

    if (!value || value === "") {
      setAmountError(false);
      return;
    }

    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      setAmountError(true);
    } else if (amount < MINIMUM_SWAP_AMOUNT) {
      setAmountError(true);
    } else {
      setAmountError(false);
    }
  };

  const getAmountErrorMessage = () => {
    if (!swapAmount || !amountError) return "";

    const amount = parseFloat(swapAmount);
    if (isNaN(amount) || amount <= 0) {
      return "Swap amount must be greater than zero.";
    } else if (amount < MINIMUM_SWAP_AMOUNT) {
      return `Minimum swap amount is ${MINIMUM_SWAP_AMOUNT}`;
    }
    return "";
  };

  const getAssetId = (symbol) => {
    const asset = assets.find((a) => a.symbol === symbol);
    return asset ? asset.id : null;
  };

  const handleSwap = async () => {
    const missingFields = [];
    if (!swapAmount) missingFields.push("Swap Amount");
    if (!swapToAsset) missingFields.push("Swap To Asset");
    if (!swapBackTime) missingFields.push("Swap Back Time");

    if (missingFields.length > 0) {
      setMessage(`Please fill in all fields: ${missingFields.join(", ")}`);
      return;
    }

    if (amountError) {
      setMessage(getAmountErrorMessage());
      return;
    }

    if (timeError) {
      setMessage(timeError);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const swapBackTimeISO = moment(swapBackTime).format("YYYY-MM-DDTHH:mm:ss");

      const payload = {
        from_asset: getAssetId(swapFromAsset),
        to_asset: getAssetId(swapToAsset),
        swap_amount: swapAmount,
        swap_back_asset: getAssetId(swapBackAsset),
        swap_back_time: swapBackTimeISO,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/swap-tokens/`,
        payload,
        { headers: { Authorization: `Token ${token}` } }
      );

      setMessage(response.data.message);
      checkPendingSwap();
      setSwapAmount("");
      setSwapToAsset("");
      setSearchQuery("");
      setSwapBackTime("");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Swap failed. Please try again.";
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toAssetOptions = assets.filter((asset) => asset.symbol !== "USDT");
  const filteredAssets = toAssetOptions.filter((asset) => {
    const query = searchQuery.toLowerCase();
    return asset.name.toLowerCase().includes(query) || asset.symbol.toLowerCase().includes(query);
  });

  const handleAssetSelect = (symbol) => {
    setSwapToAsset(symbol);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const getMinDateTime = () => {
    return moment().format("YYYY-MM-DDTHH:mm");
  };

  const getMaxDateTime = () => {
    return moment().add(30, "days").format("YYYY-MM-DDTHH:mm");
  };

  const selectedToAssetObj = assets.find((a) => a.symbol === swapToAsset);

  const submitDisabled =
    isSubmitting ||
    !!timeError ||
    !swapToAsset ||
    (amountError && !!swapAmount) ||
    !swapAmount;

  const isSuccessMessage = message && message.toLowerCase().includes("successfully");

  return (
    <div className="sw-root">
      {/* Ambient background — kept solid black per current interface, orbs/grid stay off */}
      <div aria-hidden className="sw-bg-orb sw-bg-orb-1" />
      <div aria-hidden className="sw-bg-orb sw-bg-orb-2" />
      <div aria-hidden className="sw-grid" />

      {/* Floating gold coins ambience */}
      <GoldCoin size={40} symbol="$" className="sw-float-a" style={{ position: "absolute", top: "10%", left: "6%" }} />
      <GoldCoin size={28} symbol="₿" className="sw-float-b" style={{ position: "absolute", top: "22%", right: "8%" }} />
      <GoldCoin size={52} symbol="Ξ" className="sw-float-a" style={{ position: "absolute", top: "62%", left: "4%" }} />
      <GoldCoin size={32} symbol="$" className="sw-float-b" style={{ position: "absolute", top: "78%", right: "6%" }} />
      <GoldCoin size={24} symbol="◎" className="sw-float-a" style={{ position: "absolute", top: "45%", right: "3%" }} />
      <GoldCoin size={22} symbol="$" className="sw-float-b" style={{ position: "absolute", top: "88%", left: "40%" }} />

      <div className="sw-page">
        {/* Header */}
        <header className="sw-header">
          <h1 className="sw-title">
            <span className="sw-gold-shimmer">SWAP</span> <span className="sw-title-dim">TOKENS</span>
          </h1>
          <p className="sw-subtitle">
            Trade USDT for any supported asset. Set your swap-back window and lock the rate.
          </p>
        </header>

        {/* Card */}
        <div className="sw-card">
          {/* Amount */}
          <Field label="Quantity" hint="USDT" error={amountError && swapAmount ? getAmountErrorMessage() : ""}>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={swapAmount}
              onChange={handleSwapAmountChange}
              className="sw-input sw-input-amount"
              min={MINIMUM_SWAP_AMOUNT}
              step="0.01"
              disabled={isSubmitting}
            />
          </Field>

          {/* From (locked) */}
          <Field label="Swap From">
            <div className="sw-input sw-locked-row">
              <div className="sw-token-info">
                <TokenBadge symbol="USDT" />
                <div>
                  <div className="sw-token-name">USDT</div>
                  <div className="sw-token-sub">Tether</div>
                </div>
              </div>
              <span className="sw-locked-pill">Locked</span>
            </div>
          </Field>

          {/* Swap divider with animated icon */}
          <div className="sw-divider">
            <div className="sw-divider-line" />
            <div className="sw-swap-btn">
              <IconArrowLeftRight />
            </div>
            <div className="sw-divider-line" />
          </div>

          {/* To */}
          <div ref={dropdownRef} className="sw-dropdown-anchor">
            <Field label="Swap To">
              <button
                type="button"
                onClick={() => setShowDropdown((v) => !v)}
                className="sw-input sw-dropdown-toggle"
                disabled={isSubmitting}
              >
                <div className="sw-token-info">
                  {swapToAsset ? (
                    <>
                      <TokenBadge symbol={swapToAsset} />
                      <div>
                        <div className="sw-token-name">{swapToAsset}</div>
                        <div className="sw-token-sub">{selectedToAssetObj?.name}</div>
                      </div>
                    </>
                  ) : (
                    <span className="sw-placeholder">Choose a token</span>
                  )}
                </div>
                <IconChevronDown className={`sw-chevron ${showDropdown ? "sw-chevron-open" : ""}`} />
              </button>
            </Field>

            {showDropdown && (
              <div className="sw-dropdown">
                <div className="sw-dropdown-search">
                  <IconSearch />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    placeholder="Search token..."
                    className="sw-dropdown-search-input"
                  />
                </div>
                <div className="sw-dropdown-list">
                  {filteredAssets.length ? (
                    filteredAssets.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => handleAssetSelect(asset.symbol)}
                        className="sw-dropdown-item"
                      >
                        <div className="sw-token-info">
                          <TokenBadge symbol={asset.symbol} />
                          <div>
                            <div className="sw-token-name">{asset.name}</div>
                            <div className="sw-token-sub">{asset.symbol}</div>
                          </div>
                        </div>
                        <span className="sw-select-label">Select</span>
                      </button>
                    ))
                  ) : (
                    <div className="sw-no-results">No tokens found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Swap Back (locked) */}
          <Field label="Swap Back To">
            <div className="sw-input sw-locked-row">
              <div className="sw-token-info">
                <TokenBadge symbol="USDT" />
                <div>
                  <div className="sw-token-name">USDT</div>
                  <div className="sw-token-sub">Auto-return</div>
                </div>
              </div>
              <span className="sw-locked-pill">Locked</span>
            </div>
          </Field>

          {/* Duration */}
          <Field label="Swap Back Time" error={timeError}>
            <div className="sw-duration-wrap">
              <IconClock className="sw-duration-icon" />
              <input
                type="datetime-local"
                value={swapBackTime}
                onChange={handleSwapBackTimeChange}
                min={getMinDateTime()}
                max={getMaxDateTime()}
                className="sw-input sw-duration-input"
                disabled={isSubmitting}
              />
            </div>
          </Field>

          {/* Submit — kept exactly as the original swap-logo button */}
          <div className="swap-button-container">
            <img
              src="/images/swap-logo.png"
              alt="Swap Logo"
              className="swap-logo-image"
              onClick={handleSwap}
              style={{
                opacity: submitDisabled ? 0.5 : 1,
                cursor: submitDisabled ? "not-allowed" : "pointer",
              }}
            />
            {isSubmitting && <span className="loading-text">...</span>}
          </div>

          {message && (
            <div className={`sw-message ${isSuccessMessage ? "sw-message--ok" : "sw-message--error"}`}>
              {message}
            </div>
          )}

          {hasPendingSwap && (
            <div className="sw-status-pill">
              You have pending swap requests. New requests will be processed as long as you have sufficient balance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Swap;