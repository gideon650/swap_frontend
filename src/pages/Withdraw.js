import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { staticMerchants } from "./Wallet";

/* ---------- Inline icons (kept dependency-free, no lucide-react in this project) ---------- */
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
const IconRepeat = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
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

const CHAINS = ["TRC20", "ERC20", "BEP20", "SOL"];
const MIN_AMOUNT = 3;
const WITHDRAW_EXCLUDED_USERNAMES = ["darwin ↔️", "zoro tek"];

// Rounds DOWN to 2 decimals instead of the round-half-up behavior of
// toFixed(). Backend balances can carry more than 2 decimal places of
// precision, so rounding a percentage of the balance UP (e.g. via
// .toFixed(2)) can produce an amount a fraction of a cent higher than
// what's actually available — which then falsely trips "Insufficient
// balance" on the 100% (or 75%/50%) quick-select chips.
const floorTo2 = (n) => (Math.floor(n * 100) / 100).toFixed(2);

const Withdraw = () => {
  const navigate = useNavigate();

  const [method, setMethod] = useState("BANK");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState(false);

  const [internalWalletId, setInternalWalletId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [chain, setChain] = useState("");

  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");

  const [merchants, setMerchants] = useState([]);
  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [merchantError, setMerchantError] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showMerchants, setShowMerchants] = useState(false);
  const [search, setSearch] = useState("");

  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const merchantRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchUserBalance();
    fetchAllMerchantData();

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

  const isMerchantEligible = (merchant, amt) => {
    if (merchant.isStatic) return false;
    if (!merchant.currentBalance) return true;
    if (merchant.starRating < 4) return false;
    const requiredBalance = parseFloat(amt) * 1.1;
    return merchant.currentBalance >= requiredBalance;
  };

  const amt = parseFloat(amount || "0");
  const overBalance = amt > userBalance;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setAmountError(!!value && parseFloat(value) < MIN_AMOUNT);
  };

  const { fee, net } = useMemo(() => {
    if (!amt) return { fee: 0, net: 0 };
    if (method === "BANK") return { fee: amt * 0.05, net: amt * 0.95 };
    if (method === "ON_CHAIN") return { fee: 1, net: Math.max(0, amt - 1) };
    return { fee: 0, net: amt };
  }, [amt, method]);

  const filteredMerchants = merchants.filter((m) => {
    const q = search.toLowerCase();
    const matches = m.username.toLowerCase().includes(q) || m.bankName.toLowerCase().includes(q);
    const excluded = WITHDRAW_EXCLUDED_USERNAMES.includes(m.username.toLowerCase());
    return matches && !excluded;
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

  const handleMethodChange = (m) => {
    setMethod(m);
    setSelectedMerchant(null);
    setInternalWalletId("");
    setWalletAddress("");
    setChain("");
    setBankAccount("");
    setBankName("");
    setAccountName("");
    setMerchantError("");
  };

  const canSubmit =
    !loading &&
    amt >= MIN_AMOUNT &&
    !overBalance &&
    (method === "INTERNAL" ? internalWalletId.trim() !== "" : true) &&
    (method === "ON_CHAIN" ? walletAddress.trim() !== "" && !!chain : true) &&
    (method === "BANK" ? !!selectedMerchant && bankAccount !== "" && bankName !== "" && accountName !== "" : true);

  const submit = () => {
    if (!canSubmit) return;

    const requestData = { method, amount: parseFloat(amount) };

    if (method === "BANK") {
      requestData.account_name = accountName;
      requestData.account_number = bankAccount;
      requestData.bank_name = bankName;
      requestData.merchant_id = selectedMerchant.id;
    } else if (method === "INTERNAL") {
      requestData.account_number = internalWalletId;
    } else if (method === "ON_CHAIN") {
      requestData.wallet_address = walletAddress;
      requestData.chain = chain;
    }

    // Hand off to the PIN page — it performs the actual /withdraw/ POST
    // once the user has entered (or created) their withdrawal PIN.
    navigate("/withdraw/pin", { state: { requestData } });
  };

  const getAmountPlaceholder = () => {
    switch (method) {
      case "ON_CHAIN":
        return "Enter amount (Transaction fee = $1)";
      default:
        return "Enter amount";
    }
  };

  return (
    <div className="wd-root">
      <style>{WD_CSS}</style>

      <div className="wd-bg">
        <div className="wd-orb wd-orb-a" />
        <div className="wd-orb wd-orb-b" />
        <div className="wd-grid" />
      </div>

      <header className="wd-header">
        <button className="wd-back" aria-label="Back" onClick={() => navigate("/dashboard")}>
          <IconArrowLeft />
        </button>
        <div className="wd-title">
          <span className="wd-eyebrow">SwapView</span>
          <h1>Withdraw</h1>
        </div>
        <div className="wd-balance-pill">
          <IconWallet />
          <span>${parseFloat(userBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </header>

      <main className="wd-main">
        {/* hero balance card */}
        <section className="wd-hero">
          <div className="wd-hero-inner">
            <div>
              <div className="wd-hero-label">Available balance</div>
              <div className="wd-hero-amount">
                ${parseFloat(userBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span>USD</span>
              </div>
              <div className="wd-hero-sub">
                <IconShieldCheck /> Withdrawals processed 24/7
              </div>
            </div>
            <div className="wd-coin" aria-hidden>
              <div className="wd-coin-face">$</div>
            </div>
          </div>
        </section>

        {/* method chooser */}
        <section className="wd-card">
          <div className="wd-section-h">
            <h2>Choose withdrawal method</h2>
            <p>Pick where you want your funds delivered.</p>
          </div>
          <div className="wd-methods">
            {[
              { id: "BANK", Icon: IconBuilding2, label: "P2P Bank", desc: "Naira via merchant", feeLabel: "5%" },
              { id: "ON_CHAIN", Icon: IconLink2, label: "On-Chain", desc: "USDT to wallet", feeLabel: "$1" },
              { id: "INTERNAL", Icon: IconRepeat, label: "Internal", desc: "SwapView user", feeLabel: "Free" },
            ].map((m) => {
              const Icon = m.Icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMethodChange(m.id)}
                  className={`wd-method ${active ? "is-active" : ""}`}
                >
                  <span className="wd-method-icon">
                    <Icon />
                  </span>
                  <span className="wd-method-body">
                    <span className="wd-method-label">{m.label}</span>
                    <span className="wd-method-desc">{m.desc}</span>
                  </span>
                  <span className="wd-method-fee">{m.feeLabel}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* amount */}
        <section className="wd-card">
          <div className="wd-section-h">
            <h2>Amount</h2>
            <p>Minimum ${MIN_AMOUNT}. {getAmountPlaceholder()}</p>
          </div>
          <div className={`wd-amount ${amountError || overBalance ? "has-error" : ""}`}>
            <span className="wd-amount-symbol">$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              disabled={loading}
            />
            <button className="wd-max" onClick={() => setAmount(String(userBalance))} disabled={loading}>
              MAX
            </button>
          </div>
          <div className="wd-chips">
            {[25, 50, 75, 100].map((p) => (
              <button key={p} className="wd-chip" onClick={() => setAmount(floorTo2((userBalance * p) / 100))} disabled={loading}>
                {p}%
              </button>
            ))}
          </div>
          {amountError && <div className="wd-error">Minimum withdrawal amount is ${MIN_AMOUNT}</div>}
          {overBalance && <div className="wd-error">Insufficient balance</div>}

          {amt > 0 && !amountError && !overBalance && (
            <div className="wd-summary">
              <div>
                <span>Amount</span>
                <strong>${amt.toFixed(2)}</strong>
              </div>
              <div>
                <span>Fee</span>
                <strong>${fee.toFixed(2)}</strong>
              </div>
              <div className="wd-summary-total">
                <span>You receive</span>
                <strong>${net.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </section>

        {/* method-specific fields */}
        {method === "INTERNAL" && (
          <section className="wd-card">
            <div className="wd-section-h">
              <h2>Recipient</h2>
              <p>Send instantly to another SwapView user — no fees.</p>
            </div>
            <label className="wd-field">
              <span>Recipient address</span>
              <input
                placeholder="Recipient address"
                value={internalWalletId}
                onChange={(e) => setInternalWalletId(e.target.value)}
                disabled={loading}
              />
            </label>
          </section>
        )}

        {method === "ON_CHAIN" && (
          <section className="wd-card">
            <div className="wd-section-h">
              <h2>Wallet details</h2>
              <p>Double-check the network before confirming — on-chain transfers are irreversible.</p>
            </div>
            <label className="wd-field">
              <span>Wallet address</span>
              <input
                placeholder="Paste destination address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={loading}
              />
            </label>
            <div className="wd-field">
              <span>Network</span>
              <div className="wd-chains">
                {CHAINS.map((c) => (
                  <button
                    key={c}
                    className={`wd-chain ${chain === c ? "is-active" : ""}`}
                    onClick={() => setChain(c)}
                    disabled={loading}
                  >
                    {c}
                    {chain === c && <IconCheck />}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {method === "BANK" && (
          <section className="wd-card">
            <div className="wd-section-h">
              <h2>Merchant & bank details</h2>
              <p>Pick a verified merchant, then enter the bank account that matches your SwapView name.</p>
            </div>

            <div className="wd-field" ref={merchantRef}>
              <span>Select merchant</span>
              <button className="wd-merchant-btn" onClick={() => setShowMerchants((s) => !s)} disabled={loading}>
                {selectedMerchant ? (
                  <span className="wd-merchant-sel">
                    <span className="wd-avatar">{selectedMerchant.username.slice(0, 1)}</span>
                    <span>
                      <strong>{selectedMerchant.username}</strong>
                      <em>{selectedMerchant.bankName}</em>
                    </span>
                  </span>
                ) : (
                  <span className="wd-muted">Choose an available merchant</span>
                )}
                <IconChevronRight className={`wd-chev ${showMerchants ? "is-open" : ""}`} />
              </button>

              {merchantError && <div className="wd-error">{merchantError}</div>}

              {showMerchants && (
                <div className="wd-merchants">
                  <div className="wd-search">
                    <IconSearch />
                    <input
                      placeholder="Search by name or bank"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <ul>
                    {merchantsLoading ? (
                      <li className="wd-muted" style={{ padding: "14px", cursor: "default" }}>
                        Loading merchants...
                      </li>
                    ) : (
                      filteredMerchants.map((m) => {
                        const ineligible = m.isStatic || !isMerchantEligible(m, amount || 0) || m.starRating < 4;
                        return (
                          <li
                            key={m.id}
                            className={`wd-merchant ${ineligible ? "is-off" : ""}`}
                            onClick={() => handleMerchantClick(m)}
                          >
                            <span className="wd-avatar">{m.username.slice(0, 1)}</span>
                            <div className="wd-merchant-info">
                              <strong>
                                {m.username}
                                {m.verified && <IconShieldCheck className="wd-verified" />}
                              </strong>
                              <em>{m.bankName}</em>
                            </div>
                            <div className="wd-merchant-meta">
                              <span className="wd-stars">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} style={{ color: i < m.starRating ? "#f5c451" : "#555" }}>★</span>
                                ))}
                              </span>
                              <span className={`wd-dot ${!ineligible ? "on" : ""}`} />
                            </div>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="wd-grid-2">
              <label className="wd-field">
                <span>Account number</span>
                <input placeholder="e.g. 0123456789" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} disabled={loading} />
              </label>
              <label className="wd-field">
                <span>Bank name</span>
                <input placeholder="e.g. GTBank" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={loading} />
              </label>
            </div>
            <label className="wd-field">
              <span>Account name</span>
              <input placeholder="Must match your SwapView name" value={accountName} onChange={(e) => setAccountName(e.target.value)} disabled={loading} />
            </label>

            <div className="wd-notice">
              <IconInfo />
              <div>
                1. A 5% fee will be deducted from your withdrawal amount.<br />
                2. You'll receive the amount after fee deduction.<br />
                3. The merchant will receive the full amount (including fee).<br />
                4. Please ensure the payment account details you provide match your <span style={{ color: "var(--wd-gold)" }}>SWAPVIEW</span> account name.<br />
                5. You'll be matched with a merchant who will send funds to the provided details above.<br />
                6. In case of discrepancies or if funds aren't received after 24 hours, contact our support immediately.
              </div>
            </div>

            {amount && !amountError && (
              <div className="wd-summary" style={{ marginTop: 12 }}>
                <div>
                  <span>Amount entered</span>
                  <strong>${amt.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Fee (5%)</span>
                  <strong>${fee.toFixed(2)}</strong>
                </div>
                <div className="wd-summary-total">
                  <span>You will receive</span>
                  <strong>${net.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </section>
        )}

        {/* submit */}
        <button className="wd-submit" disabled={!canSubmit} onClick={submit}>
          {loading ? (
            <>
              <IconLoader2 className="wd-spin" /> Processing…
            </>
          ) : (
            <>
              Confirm withdrawal
              <span className="wd-submit-amt">${amt ? net.toFixed(2) : "0.00"}</span>
            </>
          )}
        </button>
      </main>

      {toast && (
        <div className={`wd-toast ${toast.type === "ok" ? "ok" : "err"}`}>
          <IconCheck /> {toast.msg}
        </div>
      )}
    </div>
  );
};

const WD_CSS = `
.wd-root{
  --wd-bg:#050308;
  --wd-panel:rgba(20,10,30,.72);
  --wd-panel-2:rgba(28,14,42,.55);
  --wd-border:rgba(150,60,150,.14);
  --wd-border-strong:rgba(180,130,255,.32);
  --wd-purple:#800080;
  --wd-purple-2:#9b1f9b;
  --wd-purple-3:#c060c0;
  --wd-gold:#f5c451;
  --wd-text:#f5f0ff;
  --wd-muted:#a99cbf;
  --wd-err:#ff5470;
  min-height:100vh;
  background:var(--wd-bg);
  color:var(--wd-text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  position:relative;
  overflow-x:hidden;
  padding-bottom:3rem;
}
.wd-bg{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.wd-orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.35}
.wd-orb-a{width:520px;height:520px;background:radial-gradient(circle,#800080,transparent 65%);top:-160px;left:-140px;animation:wd-drift 14s ease-in-out infinite}
.wd-orb-b{width:420px;height:420px;background:radial-gradient(circle,#c060c0,transparent 70%);bottom:-140px;right:-120px;animation:wd-drift 18s ease-in-out infinite reverse}
.wd-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(150,60,150,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(150,60,150,.05) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(ellipse at center,black 40%,transparent 75%)}
@keyframes wd-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}

.wd-header{
  position:sticky;top:0;z-index:20;
  display:flex;align-items:center;gap:12px;
  padding:14px 18px;
  backdrop-filter: blur(18px);
  background:linear-gradient(180deg,rgba(5,3,8,.85),rgba(5,3,8,.55));
  border-bottom:1px solid var(--wd-border);
}
.wd-back{
  display:inline-flex;align-items:center;justify-content:center;
  width:38px;height:38px;border-radius:12px;
  background:var(--wd-panel);border:1px solid var(--wd-border);
  color:var(--wd-text);transition:.2s;cursor:pointer;
}
.wd-back:hover{border-color:var(--wd-border-strong);transform:translateX(-2px)}
.wd-title{flex:1}
.wd-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--wd-purple-3);font-weight:600}
.wd-title h1{margin:0;font-size:20px;font-weight:700;letter-spacing:-.02em}
.wd-balance-pill{
  display:inline-flex;align-items:center;gap:6px;
  padding:8px 14px;border-radius:999px;
  background:linear-gradient(135deg,rgba(128,0,128,.25),rgba(192,96,192,.15));
  border:1px solid var(--wd-border-strong);
  font-size:13px;font-weight:600;
}
.wd-balance-pill svg{color:var(--wd-purple-3)}

.wd-main{position:relative;z-index:1;max-width:640px;margin:0 auto;padding:20px 18px;display:flex;flex-direction:column;gap:18px}

.wd-hero{
  position:relative;overflow:hidden;
  border-radius:24px;
  background:linear-gradient(135deg,#1a0518 0%,#330233 55%,#4d004d 100%);
  border:1px solid var(--wd-border-strong);
  box-shadow:0 20px 60px -20px rgba(128,0,128,.5), inset 0 1px 0 rgba(255,255,255,.06);
}
.wd-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(600px 200px at 80% -20%,rgba(245,196,81,.25),transparent 60%);pointer-events:none}
.wd-hero-inner{position:relative;padding:26px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.wd-hero-label{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(245,240,255,.7);font-weight:600}
.wd-hero-amount{margin-top:6px;font-size:38px;font-weight:800;letter-spacing:-.03em;display:flex;align-items:baseline;gap:8px}
.wd-hero-amount span{font-size:13px;font-weight:600;color:rgba(245,240,255,.55);letter-spacing:.1em}
.wd-hero-sub{margin-top:10px;font-size:12px;color:rgba(245,240,255,.65);display:inline-flex;align-items:center;gap:6px}
.wd-hero-sub svg{color:var(--wd-gold)}
.wd-coin{
  width:74px;height:74px;border-radius:50%;
  background:radial-gradient(circle at 32% 28%, #ffe27a 0%, #f5c451 42%, #b8801c 100%);
  box-shadow: inset 0 -6px 12px rgba(74,40,4,.6), inset 0 4px 8px rgba(255,240,180,.6), 0 8px 24px rgba(245,196,81,.35);
  display:grid;place-items:center;
  animation: wd-coin-spin 6s linear infinite;
}
.wd-coin-face{font-size:32px;font-weight:900;color:#5a3a08;text-shadow:0 1px 0 rgba(255,255,255,.35)}
@keyframes wd-coin-spin{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}

.wd-card{
  background:var(--wd-panel);
  border:1px solid var(--wd-border);
  border-radius:20px;
  padding:20px;
  backdrop-filter: blur(14px);
  box-shadow:0 8px 30px -10px rgba(0,0,0,.5);
}
.wd-section-h{margin-bottom:14px}
.wd-section-h h2{margin:0;font-size:15px;font-weight:700;letter-spacing:-.01em}
.wd-section-h p{margin:4px 0 0;font-size:12px;color:var(--wd-muted)}

.wd-methods{display:flex;flex-direction:column;gap:10px}
.wd-method{
  display:flex;align-items:center;gap:14px;
  padding:14px;border-radius:14px;
  background:var(--wd-panel-2);
  border:1px solid var(--wd-border);
  color:inherit;cursor:pointer;text-align:left;
  transition: .2s;
  font:inherit;
}
.wd-method:hover{border-color:var(--wd-border-strong);transform:translateY(-1px)}
.wd-method.is-active{
  border-color:var(--wd-purple-2);
  background:linear-gradient(135deg,rgba(128,0,128,.22),rgba(192,96,192,.08));
  box-shadow:0 0 0 3px rgba(128,0,128,.15);
}
.wd-method-icon{
  width:42px;height:42px;border-radius:12px;display:grid;place-items:center;
  background:linear-gradient(135deg,rgba(128,0,128,.28),rgba(192,96,192,.14));
  color:var(--wd-purple-3);
  border:1px solid var(--wd-border-strong);
  flex-shrink:0;
}
.wd-method-body{flex:1;display:flex;flex-direction:column;gap:2px}
.wd-method-label{font-weight:600;font-size:14px}
.wd-method-desc{font-size:11px;color:var(--wd-muted)}
.wd-method-fee{font-size:11px;font-weight:700;color:var(--wd-gold);padding:4px 10px;border-radius:999px;background:rgba(245,196,81,.1);border:1px solid rgba(245,196,81,.25)}

.wd-amount{
  display:flex;align-items:center;gap:10px;
  padding:16px 16px;border-radius:16px;
  background:linear-gradient(135deg,rgba(128,0,128,.10),rgba(20,10,30,.6));
  border:1px solid var(--wd-border-strong);
  transition:.2s;
}
.wd-amount.has-error{border-color:var(--wd-err);box-shadow:0 0 0 3px rgba(255,84,112,.12)}
.wd-amount-symbol{font-size:26px;font-weight:700;color:var(--wd-purple-3)}
.wd-amount input{flex:1;background:transparent;border:0;outline:0;font-size:28px;font-weight:700;color:var(--wd-text);letter-spacing:-.02em;min-width:0}
.wd-amount input::-webkit-outer-spin-button,.wd-amount input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.wd-max{padding:6px 12px;border-radius:8px;background:rgba(245,196,81,.15);color:var(--wd-gold);border:1px solid rgba(245,196,81,.3);font-size:11px;font-weight:700;letter-spacing:.05em;cursor:pointer}

.wd-chips{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.wd-chip{
  padding:6px 14px;border-radius:999px;
  background:var(--wd-panel-2);border:1px solid var(--wd-border);
  color:var(--wd-muted);font-size:12px;font-weight:600;cursor:pointer;transition:.15s;
}
.wd-chip:hover{color:var(--wd-purple-3);border-color:var(--wd-border-strong)}

.wd-error{margin-top:10px;font-size:12px;color:var(--wd-err);font-weight:500}

.wd-summary{
  margin-top:14px;padding:14px;border-radius:12px;
  background:rgba(0,0,0,.35);border:1px dashed var(--wd-border-strong);
  display:flex;flex-direction:column;gap:8px;
}
.wd-summary > div{display:flex;justify-content:space-between;font-size:13px;color:var(--wd-muted)}
.wd-summary > div strong{color:var(--wd-text);font-weight:600}
.wd-summary-total{padding-top:8px;border-top:1px solid var(--wd-border);}
.wd-summary-total span{color:var(--wd-text)!important;font-weight:600}
.wd-summary-total strong{color:var(--wd-gold)!important;font-size:15px!important}

.wd-field{display:flex;flex-direction:column;gap:8px;margin-top:12px;position:relative}
.wd-field:first-of-type{margin-top:0}
.wd-field > span{font-size:12px;font-weight:600;color:var(--wd-muted);letter-spacing:.03em}
.wd-field input{
  padding:13px 14px;border-radius:12px;
  background:var(--wd-panel-2);border:1px solid var(--wd-border);
  color:var(--wd-text);font-size:14px;outline:0;transition:.2s;
}
.wd-field input:focus{border-color:var(--wd-purple-2);box-shadow:0 0 0 3px rgba(128,0,128,.18)}
.wd-field input::placeholder{color:#6a5c81}

.wd-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
@media (max-width:520px){.wd-grid-2{grid-template-columns:1fr}}

.wd-chains{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
@media (max-width:420px){.wd-chains{grid-template-columns:repeat(2,1fr)}}
.wd-chain{
  padding:11px;border-radius:10px;
  background:var(--wd-panel-2);border:1px solid var(--wd-border);
  color:var(--wd-text);font-size:13px;font-weight:600;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:.15s;
}
.wd-chain:hover{border-color:var(--wd-border-strong)}
.wd-chain.is-active{background:linear-gradient(135deg,rgba(128,0,128,.3),rgba(192,96,192,.14));border-color:var(--wd-purple-2);color:var(--wd-purple-3)}

.wd-merchant-btn{
  width:100%;display:flex;align-items:center;justify-content:space-between;
  padding:13px 14px;border-radius:12px;
  background:var(--wd-panel-2);border:1px solid var(--wd-border);
  color:var(--wd-text);cursor:pointer;text-align:left;
  font:inherit;
}
.wd-merchant-btn:hover{border-color:var(--wd-border-strong)}
.wd-muted{color:#6a5c81;font-size:14px}
.wd-chev{transition:.2s;color:var(--wd-muted)}
.wd-chev.is-open{transform:rotate(90deg);color:var(--wd-purple-3)}
.wd-merchant-sel{display:flex;align-items:center;gap:10px}
.wd-merchant-sel > span{display:flex;flex-direction:column}
.wd-merchant-sel strong{font-size:14px}
.wd-merchant-sel em{font-style:normal;font-size:11px;color:var(--wd-muted)}
.wd-avatar{
  width:36px;height:36px;border-radius:50%;
  display:grid;place-items:center;font-weight:700;font-size:14px;
  background:linear-gradient(135deg,#800080,#c060c0);color:white;
  border:1px solid var(--wd-border-strong);
  flex-shrink:0;
}

.wd-merchants{
  margin-top:10px;border:1px solid var(--wd-border);
  border-radius:14px;background:rgba(8,4,14,.85);overflow:hidden;
  animation:wd-slide-in .18s ease-out;
}
@keyframes wd-slide-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.wd-search{
  display:flex;align-items:center;gap:8px;padding:10px 12px;
  border-bottom:1px solid var(--wd-border);color:var(--wd-muted);
}
.wd-search input{flex:1;background:transparent;border:0;outline:0;color:var(--wd-text);font-size:13px}
.wd-merchants ul{list-style:none;margin:0;padding:6px;max-height:280px;overflow-y:auto}
.wd-merchant{
  display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;cursor:pointer;transition:.12s;
}
.wd-merchant:hover{background:rgba(128,0,128,.12)}
.wd-merchant.is-off{opacity:.45}
.wd-merchant-info{flex:1;display:flex;flex-direction:column;min-width:0}
.wd-merchant-info strong{font-size:13px;display:inline-flex;align-items:center;gap:5px}
.wd-verified{color:#5eead4}
.wd-merchant-info em{font-style:normal;font-size:11px;color:var(--wd-muted)}
.wd-merchant-meta{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
.wd-stars{display:inline-flex;gap:1px;font-size:11px}
.wd-dot{width:7px;height:7px;border-radius:50%;background:#555}
.wd-dot.on{background:#22c55e;box-shadow:0 0 8px #22c55e}

.wd-notice{
  margin-top:14px;padding:12px 14px;border-radius:12px;
  background:rgba(245,196,81,.06);border:1px solid rgba(245,196,81,.2);
  display:flex;gap:10px;font-size:12px;color:#e3d5a8;line-height:1.85;
}
.wd-notice svg{color:var(--wd-gold);flex-shrink:0;margin-top:2px}

.wd-submit{
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
.wd-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 48px -8px rgba(128,0,128,.75)}
.wd-submit:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
.wd-submit-amt{padding:4px 10px;border-radius:999px;background:rgba(0,0,0,.28);font-size:13px;font-weight:700}
.wd-spin{animation:wd-spin 1s linear infinite}
@keyframes wd-spin{to{transform:rotate(360deg)}}

.wd-foot{text-align:center;font-size:12px;color:var(--wd-muted);margin:6px 0 0}
.wd-foot strong{color:var(--wd-text)}

.wd-toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  padding:12px 18px;border-radius:12px;font-size:13px;font-weight:600;
  display:inline-flex;align-items:center;gap:8px;z-index:100;
  animation: wd-toast-in .3s ease-out;
  max-width:90vw;
}
.wd-toast.ok{background:rgba(34,197,94,.15);color:#7ee2a0;border:1px solid rgba(34,197,94,.35)}
.wd-toast.err{background:rgba(255,84,112,.15);color:#ff8fa3;border:1px solid rgba(255,84,112,.35)}
@keyframes wd-toast-in{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
`;

export default Withdraw;