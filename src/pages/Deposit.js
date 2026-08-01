import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { staticMerchants } from "./Wallet";
import SuccessModal from "./SuccessModal";
import BEP20QR from '../assets/images/BEP20.png';
import TRC20QR from '../assets/images/TRC20.png';
import SOLQR from '../assets/images/SOL.png';
import ERC20QR from '../assets/images/ERC20.png';

/* ---------- Inline icons (kept dependency-free, matches Withdraw.js) ---------- */
const IconArrowLeft = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconWallet = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
const IconBuilding2 = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6 22V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v18Z" /><path d="M9 22v-4h4v4" /><path d="M9 6h1M9 10h1M9 14h1M14 6h1M14 10h1M14 14h1" />
    <path d="M17 8h3a1 1 0 0 1 1 1v13" /><path d="M2 22h20" />
  </svg>
);
const IconLink2 = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const IconSearch = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconCheck = (p) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconShieldCheck = (p) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const IconInfo = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const IconLoader2 = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const IconChevronRight = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconCopy = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const MIN_AMOUNT = 3;

const NETWORK_ADDRESSES = {
  BSC: "0xbe6b7a0d21c070655883cedca7fef4d4222080b9",
  TRC20: "TEHbwbvUK7MXk1bHQxRAYGNdwsmNUUeYt8",
  SOL: "CcijrCfZBuqDzBWp3qSrBEZCqBUfQVz4CWGHWF91iaEw",
  ERC20: "0xbe6b7a0d21c070655883cedca7fef4d4222080b9",
};

const NETWORK_QR_CODES = {
  BSC: BEP20QR,
  TRC20: TRC20QR,
  SOL: SOLQR,
  ERC20: ERC20QR,
};

const NETWORK_OPTIONS = [
  { key: "TRC20", label: "TRC20" },
  { key: "ERC20", label: "ERC20" },
  { key: "BSC", label: "BEP20" },
  { key: "SOL", label: "SOL" },
];

const Deposit = () => {
  const navigate = useNavigate();

  const [method, setMethod] = useState(""); // "naira" | "crypto"
  const [network, setNetwork] = useState("");
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const [merchants, setMerchants] = useState([]);
  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [merchantError, setMerchantError] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showMerchants, setShowMerchants] = useState(false);
  const [search, setSearch] = useState("");

  const [usdToNgn, setUsdToNgn] = useState(1500);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  const merchantRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchUserBalance();
    fetchAllMerchantData();
    fetchRate();

    const handleClickOutside = (e) => {
      if (merchantRef.current && !merchantRef.current.contains(e.target)) {
        setShowMerchants(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/portfolio/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setUserBalance(response.data.balance_usd);
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  };

  const fetchRate = async () => {
    try {
      const res = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn");
      if (res.data && res.data.tether && res.data.tether.ngn) {
        setUsdToNgn(res.data.tether.ngn);
      }
    } catch (err) {
      console.error("Exchange rate fetch error:", err);
    }
  };

  const fetchMerchantBalances = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/merchant-balances/`, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      });

      setMerchants((prevMerchants) =>
        prevMerchants.map((merchant) => {
          if (merchant.isStatic) return merchant;
          const balanceInfo = response.data.find((m) => m.id === merchant.id);
          return { ...merchant, currentBalance: balanceInfo ? balanceInfo.balance : 0 };
        })
      );
    } catch (error) {
      console.error("Error fetching merchant balances:", error);
    }
  };

  const fetchAllMerchantData = async () => {
    try {
      setMerchantsLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/approved-merchants/`, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      });

      const approvedMerchants = response.data.map((merchant) => ({
        id: merchant.id,
        username: merchant.name,
        bankName: merchant.bank_name,
        accountNumber: merchant.account_number,
        starRating: merchant.star_rating || 5,
        verified: true,
        isStatic: false,
      }));

      const combinedMerchants = [...approvedMerchants, ...staticMerchants];
      setMerchants(combinedMerchants);

      if (approvedMerchants.length > 0) {
        await fetchMerchantBalances();
      }
    } catch (error) {
      console.error("Error fetching merchants:", error);
      setMerchants(staticMerchants);
      setMerchantError(
        error.response?.data?.error || "Failed to load merchants from server. Showing sample merchants."
      );
    } finally {
      setMerchantsLoading(false);
    }
  };

  const isMerchantEligible = (merchant, amt) => {
    if (merchant.isStatic) return false;
    if (!merchant.currentBalance) return true;
    if (merchant.starRating < 4) return false;
    const requiredBalance = parseFloat(amt) * 1.1;
    return merchant.currentBalance >= requiredBalance;
  };

  const mapMethodToApiFormat = (m) => {
    const methodMapping = {
      naira: "BANK_TRANSFER",
      crypto: "ON_CHAIN",
    };
    return methodMapping[m] || m;
  };

  const amt = parseFloat(amount || "0");

  const nairaValue =
    amount && usdToNgn
      ? (parseFloat(amount) * usdToNgn).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  // Naira/P2P deposits carry a 3.5% fee, added on top of the amount entered
  const totalWithFee = amt > 0 ? (amt + amt * 0.035) : 0;
  const nairaTotalToPay =
    totalWithFee && usdToNgn
      ? (totalWithFee * usdToNgn).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setAmountError(!!value && parseFloat(value) < MIN_AMOUNT);
  };

  const handleMethodChange = (m) => {
    setMethod(m);
    setNetwork("");
    setShowNetworkPicker(false);
    setShowQRCode(false);
    setSelectedMerchant(null);
    setTransactionId("");
    setMerchantError("");
  };

  const handleNetworkSelect = (selectedNetwork) => {
    setNetwork(selectedNetwork);
    setShowNetworkPicker(false);
    setShowQRCode(true);
  };

  const handleBackToNetworks = () => {
    setShowQRCode(false);
    setNetwork("");
  };

  const filteredMerchants = merchants.filter((m) => {
    const q = search.toLowerCase();
    return m.username.toLowerCase().includes(q) || m.bankName.toLowerCase().includes(q);
  });

  const handleMerchantClick = (m) => {
    if (m.isStatic) {
      setMerchantError("This merchant is currently unavailable");
      return;
    }
    if (!amount) {
      setMerchantError("Please enter amount first");
      return;
    }
    if (!isMerchantEligible(m, amount) || m.starRating < 4) {
      setMerchantError("This merchant is currently unavailable");
      return;
    }
    setSelectedMerchant(m);
    setShowMerchants(false);
    setMerchantError("");
    setSearch("");
  };

  const canSubmit =
    !loading &&
    amt >= MIN_AMOUNT &&
    (method === "crypto" ? showQRCode && transactionId.trim() !== "" : true) &&
    (method === "naira" ? !!selectedMerchant && transactionId.trim() !== "" : true);

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };

      let requestData = {};
      const url = `${API_BASE_URL}/deposit/`;

      if (method === "crypto") {
        requestData = {
          method: mapMethodToApiFormat(method),
          crypto_type: "onchain",
          transaction_id: transactionId,
          amount: parseFloat(amount),
          network,
        };
      } else {
        requestData = {
          method: mapMethodToApiFormat(method),
          transaction_id: transactionId,
          amount: parseFloat(amount),
          merchant_id: selectedMerchant.id,
        };
      }

      const response = await axios.post(url, requestData, config);
      const ok = response.data.status === "success";

      if (ok) {
        const depositDetails = {
          Amount: `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          Method: method === "crypto" ? `Crypto (${network})` : "Bank Transfer",
          ...(method === "naira" && selectedMerchant ? { Merchant: selectedMerchant.username } : {}),
          "Transaction ID": transactionId,
        };
        setSuccessDetails(depositDetails);
        setShowSuccessModal(true);

        setAmount("");
        setAmountError(false);
        setTransactionId("");
        setSelectedMerchant(null);
        setShowQRCode(false);
        setNetwork("");
        fetchUserBalance();
      } else {
        setToast({ type: "err", msg: response.data.message || response.data.error || "Request submitted." });
      }
    } catch (error) {
      let errorMessage = "Something went wrong";
      if (error.response) {
        const errorData = error.response.data;
        if (typeof errorData === "string") errorMessage = errorData;
        else if (errorData?.message) errorMessage = errorData.message;
        else if (errorData?.error) errorMessage = errorData.error;
        else if (errorData?.status) errorMessage = errorData.status;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }
      setToast({ type: "err", msg: errorMessage });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 4500);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ type: "ok", msg: "Copied to clipboard!" });
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="dp-root">
      <style>{DP_CSS}</style>

      <div className="dp-bg">
        <div className="dp-orb dp-orb-a" />
        <div className="dp-orb dp-orb-b" />
        <div className="dp-grid" />
      </div>

      <header className="dp-header">
        <button className="dp-back" aria-label="Back" onClick={() => navigate("/dashboard")}>
          <IconArrowLeft />
        </button>
        <div className="dp-title">
          <span className="dp-eyebrow">SwapView</span>
          <h1>Deposit</h1>
        </div>
        <div className="dp-balance-pill">
          <IconWallet />
          <span>${parseFloat(userBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </header>

      <main className="dp-main">
        {/* hero balance card */}
        <section className="dp-hero">
          <div className="dp-hero-inner">
            <div>
              <div className="dp-hero-label">Available balance</div>
              <div className="dp-hero-amount">
                ${parseFloat(userBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span>USD</span>
              </div>
              <div className="dp-hero-sub">
                <IconShieldCheck /> Deposits credited after confirmation
              </div>
            </div>
            <div className="dp-coin" aria-hidden>
              <div className="dp-coin-face">+</div>
            </div>
          </div>
        </section>

        {/* method chooser */}
        <section className="dp-card">
          <div className="dp-section-h">
            <h2>Choose deposit method</h2>
            <p>Pick how you want to fund your account.</p>
          </div>
          <div className="dp-methods">
            {[
              { id: "naira", Icon: IconBuilding2, label: "P2P Bank", desc: "Naira via merchant", feeLabel: "3.5%" },
              { id: "crypto", Icon: IconLink2, label: "On-Chain", desc: "USDT from your wallet", feeLabel: "Free" },
            ].map((m) => {
              const Icon = m.Icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMethodChange(m.id)}
                  className={`dp-method ${active ? "is-active" : ""}`}
                >
                  <span className="dp-method-icon">
                    <Icon />
                  </span>
                  <span className="dp-method-body">
                    <span className="dp-method-label">{m.label}</span>
                    <span className="dp-method-desc">{m.desc}</span>
                  </span>
                  <span className="dp-method-fee">{m.feeLabel}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CRYPTO: amount + network, or QR confirm view */}
        {method === "crypto" && !showQRCode && (
          <section className="dp-card">
            <div className="dp-section-h">
              <h2>Amount</h2>
              <p>Minimum ${MIN_AMOUNT}. Enter how much USDT you're sending.</p>
            </div>
            <div className={`dp-amount ${amountError ? "has-error" : ""}`}>
              <span className="dp-amount-symbol">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                disabled={loading}
              />
            </div>
            {amountError && <div className="dp-error">Minimum deposit amount is ${MIN_AMOUNT}</div>}
            {amount && !amountError && <div className="dp-hint">≈ ₦{nairaValue} NGN</div>}

            <div className="dp-field" style={{ marginTop: 16 }}>
              <span>Network</span>
              <button
                className="dp-merchant-btn"
                onClick={() => setShowNetworkPicker((s) => !s)}
                disabled={loading || amt < MIN_AMOUNT}
              >
                <span className="dp-muted">{amt < MIN_AMOUNT ? "Enter an amount first" : "Select network"}</span>
                <IconChevronRight className={`dp-chev ${showNetworkPicker ? "is-open" : ""}`} />
              </button>
              {showNetworkPicker && amt >= MIN_AMOUNT && (
                <div className="dp-chains">
                  {NETWORK_OPTIONS.map((opt) => (
                    <button key={opt.key} className="dp-chain" onClick={() => handleNetworkSelect(opt.key)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {method === "crypto" && showQRCode && (
          <section className="dp-card">
            <div className="dp-section-h dp-section-h-row">
              <button className="dp-mini-back" onClick={handleBackToNetworks}>
                <IconArrowLeft /> Back
              </button>
              <span className="dp-network-tag">{network}</span>
            </div>

            <div className="dp-qr-wrap">
              <img src={NETWORK_QR_CODES[network]} alt={`${network} QR Code`} className="dp-qr-image" />
            </div>

            <div className="dp-field">
              <span>Wallet address</span>
              <div className="dp-copy-row">
                <span className="dp-address-text">{NETWORK_ADDRESSES[network]}</span>
                <button className="dp-copy-btn" onClick={() => copyToClipboard(NETWORK_ADDRESSES[network])}>
                  <IconCopy /> Copy
                </button>
              </div>
            </div>

            <label className="dp-field">
              <span>Transaction hash</span>
              <input
                placeholder="Enter transaction hash"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                disabled={loading}
              />
            </label>

            <div className="dp-notice">
              <IconInfo />
              <div>
                Make sure your transaction hash is correct — deposits with an incorrect hash cannot be credited or
                refunded. You must submit the hash above for verification after sending funds.
              </div>
            </div>

            {amt > 0 && (
              <div className="dp-summary">
                <div>
                  <span>Amount</span>
                  <strong>${amt.toFixed(2)}</strong>
                </div>
                <div className="dp-summary-total">
                  <span>≈ NGN</span>
                  <strong>₦{nairaValue}</strong>
                </div>
              </div>
            )}
          </section>
        )}

        {/* NAIRA / P2P: amount + merchant */}
        {method === "naira" && (
          <>
            <section className="dp-card">
              <div className="dp-section-h">
                <h2>Amount</h2>
                <p>Minimum ${MIN_AMOUNT}. A 3.5% fee applies to P2P deposits.</p>
              </div>
              <div className={`dp-amount ${amountError ? "has-error" : ""}`}>
                <span className="dp-amount-symbol">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={loading}
                />
              </div>
              {amountError && <div className="dp-error">Minimum deposit amount is ${MIN_AMOUNT}</div>}
              {amount && !amountError && <div className="dp-hint">Total to pay ≈ ₦{nairaTotalToPay} NGN</div>}
            </section>

            <section className="dp-card">
              <div className="dp-section-h">
                <h2>Merchant</h2>
                <p>Pick a verified merchant to send your Naira payment to.</p>
              </div>

              <div className="dp-field" ref={merchantRef}>
                <span>Select merchant</span>
                <button className="dp-merchant-btn" onClick={() => setShowMerchants((s) => !s)} disabled={loading}>
                  {selectedMerchant ? (
                    <span className="dp-merchant-sel">
                      <span className="dp-avatar">{selectedMerchant.username.slice(0, 1)}</span>
                      <span>
                        <strong>{selectedMerchant.username}</strong>
                        <em>{selectedMerchant.bankName}</em>
                      </span>
                    </span>
                  ) : (
                    <span className="dp-muted">Choose an available merchant</span>
                  )}
                  <IconChevronRight className={`dp-chev ${showMerchants ? "is-open" : ""}`} />
                </button>

                {merchantError && <div className="dp-error">{merchantError}</div>}

                {showMerchants && (
                  <div className="dp-merchants">
                    <div className="dp-search">
                      <IconSearch />
                      <input
                        placeholder="Search by name or bank"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <ul>
                      {merchantsLoading ? (
                        <li className="dp-muted" style={{ padding: "14px", cursor: "default" }}>
                          Loading merchants...
                        </li>
                      ) : (
                        filteredMerchants.map((m) => {
                          const ineligible = m.isStatic || !isMerchantEligible(m, amount || 0) || m.starRating < 4;
                          return (
                            <li
                              key={m.id}
                              className={`dp-merchant ${ineligible ? "is-off" : ""}`}
                              onClick={() => handleMerchantClick(m)}
                            >
                              <span className="dp-avatar">{m.username.slice(0, 1)}</span>
                              <div className="dp-merchant-info">
                                <strong>
                                  {m.username}
                                  {m.verified && <IconShieldCheck className="dp-verified" />}
                                </strong>
                                <em>{m.bankName}</em>
                              </div>
                              <div className="dp-merchant-meta">
                                <span className="dp-stars">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} style={{ color: i < m.starRating ? "#f5c451" : "#555" }}>★</span>
                                  ))}
                                </span>
                                <span className={`dp-dot ${!ineligible ? "on" : ""}`} />
                              </div>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {selectedMerchant && (
                <>
                  <div className="dp-merchant-details">
                    <div>
                      <span>Username</span>
                      <strong>{selectedMerchant.username}</strong>
                    </div>
                    <div>
                      <span>Bank name</span>
                      <strong>{selectedMerchant.bankName}</strong>
                    </div>
                    <div>
                      <span>Account number</span>
                      <strong>{selectedMerchant.accountNumber}</strong>
                    </div>
                    <button
                      className="dp-copy-btn"
                      style={{ marginTop: 10 }}
                      onClick={() => copyToClipboard(selectedMerchant.accountNumber)}
                    >
                      <IconCopy /> Copy account number
                    </button>
                  </div>

                  <label className="dp-field">
                    <span>Transaction ID</span>
                    <input
                      placeholder="Bank narration"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      disabled={loading}
                    />
                  </label>

                  <div className="dp-notice">
                    <IconInfo />
                    <div>
                      1. A 3.5% fee is added to your deposit amount.<br />
                      2. Send the total amount shown above to the merchant's account.<br />
                      3. Please ensure the transaction narration matches your <span style={{ color: "var(--dp-gold)" }}>SWAPVIEW</span> account.<br />
                      4. If funds aren't credited after 24 hours, contact our support immediately.
                    </div>
                  </div>
                </>
              )}
            </section>
          </>
        )}

        {/* submit */}
        {method && (
          <button className="dp-submit" disabled={!canSubmit} onClick={submit}>
            {loading ? (
              <>
                <IconLoader2 className="dp-spin" /> Processing…
              </>
            ) : (
              <>
                Confirm deposit
                <span className="dp-submit-amt">${amt ? amt.toFixed(2) : "0.00"}</span>
              </>
            )}
          </button>
        )}
      </main>

      {toast && (
        <div className={`dp-toast ${toast.type === "ok" ? "ok" : "err"}`}>
          <IconCheck /> {toast.msg}
        </div>
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Deposit Successful"
        message="Your deposit request has been received and is now being processed."
        details={successDetails}
        etaLabel="24 hours"
      />
    </div>
  );
};

const DP_CSS = `
.dp-root{
  --dp-bg:#050308;
  --dp-panel:rgba(20,10,30,.72);
  --dp-panel-2:rgba(28,14,42,.55);
  --dp-border:rgba(150,60,150,.14);
  --dp-border-strong:rgba(180,130,255,.32);
  --dp-purple:#800080;
  --dp-purple-2:#9b1f9b;
  --dp-purple-3:#c060c0;
  --dp-gold:#f5c451;
  --dp-text:#f5f0ff;
  --dp-muted:#a99cbf;
  --dp-err:#ff5470;
  min-height:100vh;
  background:var(--dp-bg);
  color:var(--dp-text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  position:relative;
  overflow-x:hidden;
  padding-bottom:3rem;
}
.dp-bg{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.dp-orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.35}
.dp-orb-a{width:520px;height:520px;background:radial-gradient(circle,#800080,transparent 65%);top:-160px;left:-140px;animation:dp-drift 14s ease-in-out infinite}
.dp-orb-b{width:420px;height:420px;background:radial-gradient(circle,#c060c0,transparent 70%);bottom:-140px;right:-120px;animation:dp-drift 18s ease-in-out infinite reverse}
.dp-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(150,60,150,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(150,60,150,.05) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(ellipse at center,black 40%,transparent 75%)}
@keyframes dp-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}

.dp-header{
  position:sticky;top:0;z-index:20;
  display:flex;align-items:center;gap:12px;
  padding:14px 18px;
  backdrop-filter: blur(18px);
  background:linear-gradient(180deg,rgba(5,3,8,.85),rgba(5,3,8,.55));
  border-bottom:1px solid var(--dp-border);
}
.dp-back{
  display:inline-flex;align-items:center;justify-content:center;
  width:38px;height:38px;border-radius:12px;
  background:var(--dp-panel);border:1px solid var(--dp-border);
  color:var(--dp-text);transition:.2s;cursor:pointer;
}
.dp-back:hover{border-color:var(--dp-border-strong);transform:translateX(-2px)}
.dp-title{flex:1}
.dp-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--dp-purple-3);font-weight:600}
.dp-title h1{margin:0;font-size:20px;font-weight:700;letter-spacing:-.02em}
.dp-balance-pill{
  display:inline-flex;align-items:center;gap:6px;
  padding:8px 14px;border-radius:999px;
  background:linear-gradient(135deg,rgba(128,0,128,.25),rgba(192,96,192,.15));
  border:1px solid var(--dp-border-strong);
  font-size:13px;font-weight:600;
}
.dp-balance-pill svg{color:var(--dp-purple-3)}

.dp-main{position:relative;z-index:1;max-width:640px;margin:0 auto;padding:20px 18px;display:flex;flex-direction:column;gap:18px}

.dp-hero{
  position:relative;overflow:hidden;
  border-radius:24px;
  background:linear-gradient(135deg,#1a0518 0%,#330233 55%,#4d004d 100%);
  border:1px solid var(--dp-border-strong);
  box-shadow:0 20px 60px -20px rgba(128,0,128,.5), inset 0 1px 0 rgba(255,255,255,.06);
}
.dp-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(600px 200px at 80% -20%,rgba(245,196,81,.25),transparent 60%);pointer-events:none}
.dp-hero-inner{position:relative;padding:26px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.dp-hero-label{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(245,240,255,.7);font-weight:600}
.dp-hero-amount{margin-top:6px;font-size:38px;font-weight:800;letter-spacing:-.03em;display:flex;align-items:baseline;gap:8px}
.dp-hero-amount span{font-size:13px;font-weight:600;color:rgba(245,240,255,.55);letter-spacing:.1em}
.dp-hero-sub{margin-top:10px;font-size:12px;color:rgba(245,240,255,.65);display:inline-flex;align-items:center;gap:6px}
.dp-hero-sub svg{color:var(--dp-gold)}
.dp-coin{
  width:74px;height:74px;border-radius:50%;
  background:radial-gradient(circle at 32% 28%, #ffe27a 0%, #f5c451 42%, #b8801c 100%);
  box-shadow: inset 0 -6px 12px rgba(74,40,4,.6), inset 0 4px 8px rgba(255,240,180,.6), 0 8px 24px rgba(245,196,81,.35);
  display:grid;place-items:center;
  animation: dp-coin-spin 6s linear infinite;
}
.dp-coin-face{font-size:32px;font-weight:900;color:#5a3a08;text-shadow:0 1px 0 rgba(255,255,255,.35)}
@keyframes dp-coin-spin{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}

.dp-card{
  background:var(--dp-panel);
  border:1px solid var(--dp-border);
  border-radius:20px;
  padding:20px;
  backdrop-filter: blur(14px);
  box-shadow:0 8px 30px -10px rgba(0,0,0,.5);
}
.dp-section-h{margin-bottom:14px}
.dp-section-h-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.dp-section-h h2{margin:0;font-size:15px;font-weight:700;letter-spacing:-.01em}
.dp-section-h p{margin:4px 0 0;font-size:12px;color:var(--dp-muted)}

.dp-mini-back{
  display:inline-flex;align-items:center;gap:6px;
  background:transparent;border:0;color:var(--dp-purple-3);
  font-size:13px;font-weight:600;cursor:pointer;padding:0;
}
.dp-network-tag{
  padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;
  background:linear-gradient(135deg,rgba(128,0,128,.25),rgba(192,96,192,.15));
  border:1px solid var(--dp-border-strong);color:var(--dp-purple-3);
}

.dp-methods{display:flex;flex-direction:column;gap:10px}
.dp-method{
  display:flex;align-items:center;gap:14px;
  padding:14px;border-radius:14px;
  background:var(--dp-panel-2);
  border:1px solid var(--dp-border);
  color:inherit;cursor:pointer;text-align:left;
  transition: .2s;
  font:inherit;
}
.dp-method:hover{border-color:var(--dp-border-strong);transform:translateY(-1px)}
.dp-method.is-active{
  border-color:var(--dp-purple-2);
  background:linear-gradient(135deg,rgba(128,0,128,.22),rgba(192,96,192,.08));
  box-shadow:0 0 0 3px rgba(128,0,128,.15);
}
.dp-method-icon{
  width:42px;height:42px;border-radius:12px;display:grid;place-items:center;
  background:linear-gradient(135deg,rgba(128,0,128,.28),rgba(192,96,192,.14));
  color:var(--dp-purple-3);
  border:1px solid var(--dp-border-strong);
  flex-shrink:0;
}
.dp-method-body{flex:1;display:flex;flex-direction:column;gap:2px}
.dp-method-label{font-weight:600;font-size:14px}
.dp-method-desc{font-size:11px;color:var(--dp-muted)}
.dp-method-fee{font-size:11px;font-weight:700;color:var(--dp-gold);padding:4px 10px;border-radius:999px;background:rgba(245,196,81,.1);border:1px solid rgba(245,196,81,.25)}

.dp-amount{
  display:flex;align-items:center;gap:10px;
  padding:16px 16px;border-radius:16px;
  background:linear-gradient(135deg,rgba(128,0,128,.10),rgba(20,10,30,.6));
  border:1px solid var(--dp-border-strong);
  transition:.2s;
}
.dp-amount.has-error{border-color:var(--dp-err);box-shadow:0 0 0 3px rgba(255,84,112,.12)}
.dp-amount-symbol{font-size:26px;font-weight:700;color:var(--dp-purple-3)}
.dp-amount input{flex:1;background:transparent;border:0;outline:0;font-size:28px;font-weight:700;color:var(--dp-text);letter-spacing:-.02em;min-width:0}
.dp-amount input::-webkit-outer-spin-button,.dp-amount input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}

.dp-error{margin-top:10px;font-size:12px;color:var(--dp-err);font-weight:500}
.dp-hint{margin-top:10px;font-size:12px;color:#7ee2a0;font-weight:500}

.dp-summary{
  margin-top:14px;padding:14px;border-radius:12px;
  background:rgba(0,0,0,.35);border:1px dashed var(--dp-border-strong);
  display:flex;flex-direction:column;gap:8px;
}
.dp-summary > div{display:flex;justify-content:space-between;font-size:13px;color:var(--dp-muted)}
.dp-summary > div strong{color:var(--dp-text);font-weight:600}
.dp-summary-total{padding-top:8px;border-top:1px solid var(--dp-border);}
.dp-summary-total span{color:var(--dp-text)!important;font-weight:600}
.dp-summary-total strong{color:var(--dp-gold)!important;font-size:15px!important}

.dp-field{display:flex;flex-direction:column;gap:8px;margin-top:12px;position:relative}
.dp-field:first-of-type{margin-top:0}
.dp-field > span{font-size:12px;font-weight:600;color:var(--dp-muted);letter-spacing:.03em}
.dp-field input{
  padding:13px 14px;border-radius:12px;
  background:var(--dp-panel-2);border:1px solid var(--dp-border);
  color:var(--dp-text);font-size:14px;outline:0;transition:.2s;
}
.dp-field input:focus{border-color:var(--dp-purple-2);box-shadow:0 0 0 3px rgba(128,0,128,.18)}
.dp-field input::placeholder{color:#6a5c81}

.dp-chains{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
@media (max-width:420px){.dp-chains{grid-template-columns:repeat(2,1fr)}}
.dp-chain{
  padding:11px;border-radius:10px;
  background:var(--dp-panel-2);border:1px solid var(--dp-border);
  color:var(--dp-text);font-size:13px;font-weight:600;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:.15s;
}
.dp-chain:hover{border-color:var(--dp-border-strong);background:linear-gradient(135deg,rgba(128,0,128,.3),rgba(192,96,192,.14));color:var(--dp-purple-3)}

.dp-qr-wrap{display:flex;justify-content:center;padding:10px 0 18px}
.dp-qr-image{width:190px;height:190px;border-radius:14px;border:2px solid var(--dp-purple-2);box-shadow:0 12px 30px -10px rgba(128,0,128,.5)}

.dp-copy-row{
  display:flex;align-items:center;gap:8px;
  padding:12px 14px;border-radius:12px;
  background:var(--dp-panel-2);border:1px solid var(--dp-border);
}
.dp-address-text{flex:1;font-size:12px;color:var(--dp-text);word-break:break-all}
.dp-copy-btn{
  display:inline-flex;align-items:center;gap:6px;flex-shrink:0;
  padding:8px 12px;border-radius:8px;
  background:rgba(245,196,81,.15);color:var(--dp-gold);border:1px solid rgba(245,196,81,.3);
  font-size:12px;font-weight:700;cursor:pointer;
}
.dp-copy-btn:hover{background:rgba(245,196,81,.25)}

.dp-merchant-btn{
  width:100%;display:flex;align-items:center;justify-content:space-between;
  padding:13px 14px;border-radius:12px;
  background:var(--dp-panel-2);border:1px solid var(--dp-border);
  color:var(--dp-text);cursor:pointer;text-align:left;
  font:inherit;
}
.dp-merchant-btn:hover{border-color:var(--dp-border-strong)}
.dp-merchant-btn:disabled{opacity:.5;cursor:not-allowed}
.dp-muted{color:#6a5c81;font-size:14px}
.dp-chev{transition:.2s;color:var(--dp-muted)}
.dp-chev.is-open{transform:rotate(90deg);color:var(--dp-purple-3)}
.dp-merchant-sel{display:flex;align-items:center;gap:10px}
.dp-merchant-sel > span{display:flex;flex-direction:column}
.dp-merchant-sel strong{font-size:14px}
.dp-merchant-sel em{font-style:normal;font-size:11px;color:var(--dp-muted)}
.dp-avatar{
  width:36px;height:36px;border-radius:50%;
  display:grid;place-items:center;font-weight:700;font-size:14px;
  background:linear-gradient(135deg,#800080,#c060c0);color:white;
  border:1px solid var(--dp-border-strong);
  flex-shrink:0;
}

.dp-merchants{
  margin-top:10px;border:1px solid var(--dp-border);
  border-radius:14px;background:rgba(8,4,14,.85);overflow:hidden;
  animation:dp-slide-in .18s ease-out;
}
@keyframes dp-slide-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.dp-search{
  display:flex;align-items:center;gap:8px;padding:10px 12px;
  border-bottom:1px solid var(--dp-border);color:var(--dp-muted);
}
.dp-search input{flex:1;background:transparent;border:0;outline:0;color:var(--dp-text);font-size:13px}
.dp-merchants ul{list-style:none;margin:0;padding:6px;max-height:280px;overflow-y:auto}
.dp-merchant{
  display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;cursor:pointer;transition:.12s;
}
.dp-merchant:hover{background:rgba(128,0,128,.12)}
.dp-merchant.is-off{opacity:.45}
.dp-merchant-info{flex:1;display:flex;flex-direction:column;min-width:0}
.dp-merchant-info strong{font-size:13px;display:inline-flex;align-items:center;gap:5px}
.dp-verified{color:#5eead4}
.dp-merchant-info em{font-style:normal;font-size:11px;color:var(--dp-muted)}
.dp-merchant-meta{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
.dp-stars{display:inline-flex;gap:1px;font-size:11px}
.dp-dot{width:7px;height:7px;border-radius:50%;background:#555}
.dp-dot.on{background:#22c55e;box-shadow:0 0 8px #22c55e}

.dp-merchant-details{
  margin-top:14px;padding:14px;border-radius:12px;
  background:rgba(128,0,128,.10);border:1px solid rgba(128,0,128,.3);
  display:flex;flex-direction:column;gap:8px;
}
.dp-merchant-details > div{display:flex;justify-content:space-between;font-size:13px;color:var(--dp-muted)}
.dp-merchant-details > div strong{color:var(--dp-text);font-weight:600}

.dp-notice{
  margin-top:14px;padding:12px 14px;border-radius:12px;
  background:rgba(245,196,81,.06);border:1px solid rgba(245,196,81,.2);
  display:flex;gap:10px;font-size:12px;color:#e3d5a8;line-height:1.85;
}
.dp-notice svg{color:var(--dp-gold);flex-shrink:0;margin-top:2px}

.dp-submit{
  position:sticky;bottom:14px;
  width:100%;
  display:inline-flex;align-items:center;justify-content:center;gap:10px;
  padding:16px 20px;border-radius:16px;
  background:linear-gradient(135deg,#800080 0%,#9b1f9b 50%,#c060c0 100%);
  color:white;font-weight:700;font-size:15px;letter-spacing:.01em;
  border:0;cursor:pointer;
  box-shadow:0 12px 40px -8px rgba(128,0,128,.6), inset 0 1px 0 rgba(255,255,255,.2);
  transition:.2s;
}
.dp-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 48px -8px rgba(128,0,128,.75)}
.dp-submit:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
.dp-submit-amt{padding:4px 10px;border-radius:999px;background:rgba(0,0,0,.28);font-size:13px;font-weight:700}
.dp-spin{animation:dp-spin 1s linear infinite}
@keyframes dp-spin{to{transform:rotate(360deg)}}

.dp-toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  padding:12px 18px;border-radius:12px;font-size:13px;font-weight:600;
  display:inline-flex;align-items:center;gap:8px;z-index:100;
  animation: dp-toast-in .3s ease-out;
  max-width:90vw;
}
.dp-toast.ok{background:rgba(34,197,94,.15);color:#7ee2a0;border:1px solid rgba(34,197,94,.35)}
.dp-toast.err{background:rgba(255,84,112,.15);color:#ff8fa3;border:1px solid rgba(255,84,112,.35)}
@keyframes dp-toast-in{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
`;

export default Deposit;