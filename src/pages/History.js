import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./History.css";
import logoGlyph from "../assets/images/logo-glyph.png";

/* ---------- Inline icons (dependency-free, matches Deposit.js/Withdraw.js style) ---------- */
const IconArrowLeft = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconSearch = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconFilter = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconArrowUpRight = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
);
const IconArrowDownLeft = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="17" y1="7" x2="7" y2="17" /><polyline points="17 17 7 17 7 7" />
  </svg>
);
const IconShoppingCart = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconCheck = (p) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconClock = (p) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
  </svg>
);
const IconXCircle = (p) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconDownload = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconChevronDown = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FILTERS = [
  { key: "all", label: "All" },
  { key: "deposit", label: "Deposits" },
  { key: "withdraw", label: "Withdrawals" },
  { key: "buy", label: "Buy" },
  { key: "sell", label: "Sell" },
];

const TYPE_META = {
  deposit: { icon: IconArrowDownLeft, color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Deposit" },
  withdraw: { icon: IconArrowUpRight, color: "#fb7185", bg: "rgba(251,113,133,0.12)", label: "Withdraw" },
  buy: { icon: IconShoppingCart, color: "#60a5fa", bg: "rgba(96,165,250,0.12)", label: "Buy" },
  sell: { icon: IconShoppingCart, color: "#fbbf24", bg: "rgba(251,191,36,0.12)", label: "Sell" },
};

const STATUS_META = {
  success: { icon: IconCheck, color: "#34d399", label: "Success" },
  pending: { icon: IconClock, color: "#fbbf24", label: "Pending" },
  failed: { icon: IconXCircle, color: "#fb7185", label: "Failed" },
};

const normalizeStatus = (raw) => {
  const s = (raw || "").toString().toLowerCase();
  if (s.includes("fail") || s.includes("reject") || s.includes("declin")) return "failed";
  if (s.includes("pend") || s.includes("process") || s.includes("review")) return "pending";
  return "success";
};

const formatDay = (day) => {
  const d = new Date(day);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const History = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const res = await axios.get(`${API_BASE_URL}/transactions/`, config);

      const deposits = (res.data.deposits || []).map((tx) => ({
        id: `DEP-${tx.id}`,
        type: "deposit",
        title: "Deposit",
        sub: tx.method || "Deposit",
        amount: parseFloat(tx.amount || 0),
        currency: "USD",
        hasUsdAmount: true,
        status: normalizeStatus(tx.status),
        date: tx.created_at || tx.timestamp,
      }));

      const withdrawals = (res.data.withdrawals || []).map((tx) => {
        const displayMethod = tx.display_method || tx.method || "Withdraw";
        const recipient = tx.recipient_details || tx.to_address || "";
        return {
          id: `WTH-${tx.id}`,
          type: "withdraw",
          title: "Withdraw",
          sub: recipient ? `${displayMethod} · ${recipient}` : displayMethod,
          amount: -Math.abs(parseFloat(tx.amount || 0)),
          currency: "USD",
          hasUsdAmount: true,
          status: normalizeStatus(tx.status),
          date: tx.created_at || tx.timestamp,
        };
      });

      const trades = (res.data.trades || []).map((tx) => {
        const isBuy = (tx.trade_type || "").toUpperCase() === "BUY";
        return {
          id: `TRD-${tx.id}`,
          type: isBuy ? "buy" : "sell",
          title: `${isBuy ? "Bought" : "Sold"} ${tx.asset__symbol || ""}`.trim(),
          sub: `${tx.quantity} ${tx.asset__symbol || ""}`.trim(),
          amount: parseFloat(tx.quantity || 0),
          currency: tx.asset__symbol || "",
          hasUsdAmount: false,
          status: normalizeStatus(tx.status || "COMPLETED"),
          date: tx.timestamp,
        };
      });

      const all = [...deposits, ...withdrawals, ...trades]
        .filter((t) => t.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTxs(all);
    } catch (error) {
      console.error("Failed to load transaction history", error);
      setToast({ type: "err", msg: "Failed to load transaction history" });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return txs.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (q && !`${t.title} ${t.sub} ${t.id}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [txs, q, filter]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const tx of filtered) {
      const key = new Date(tx.date).toDateString();
      const arr = map.get(key) || [];
      arr.push(tx);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Only deposit/withdraw carry a real USD amount, so totals are computed from those only.
  const totalIn = filtered
    .filter((t) => t.hasUsdAmount && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered
    .filter((t) => t.hasUsdAmount && t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ type: "ok", msg: "Copied to clipboard!" });
    setTimeout(() => setToast(null), 2000);
  };

  const handleExport = () => {
    if (filtered.length === 0) return;
    const rows = [
      ["Transaction ID", "Type", "Title", "Detail", "Amount", "Currency", "Status", "Date"],
      ...filtered.map((t) => [
        t.id,
        TYPE_META[t.type]?.label || t.type,
        t.title,
        t.sub,
        t.amount,
        t.currency,
        STATUS_META[t.status]?.label || t.status,
        new Date(t.date).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swapview-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="hist-root">
      <div className="hist-orb hist-orb-1" />
      <div className="hist-orb hist-orb-2" />

      {/* Header */}
      <header className="hist-header">
        <div className="hist-header-inner">
          <button className="hist-icon-btn" aria-label="Back" onClick={() => navigate("/dashboard")}>
            <IconArrowLeft />
          </button>
          <div className="hist-header-title">HISTORY</div>
          <button className="hist-icon-btn" aria-label="Export" onClick={handleExport}>
            <IconDownload />
          </button>
        </div>
      </header>

      <main className="hist-main">
        {/* Summary */}
        <section className="hist-summary">
          <div className="hist-summary-card hist-in">
            <div className="hist-summary-label hist-label-in">
              <IconArrowDownLeft width="12" height="12" /> Money in
            </div>
            <div className="hist-summary-amount hist-amount-in">+${totalIn.toFixed(2)}</div>
          </div>
          <div className="hist-summary-card hist-out">
            <div className="hist-summary-label hist-label-out">
              <IconArrowUpRight width="12" height="12" /> Money out
            </div>
            <div className="hist-summary-amount hist-amount-out">−${totalOut.toFixed(2)}</div>
          </div>
        </section>

        {/* Search */}
        <div className="hist-search">
          <IconSearch className="hist-search-icon" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, note or ID…"
          />
          <button className="hist-filter-btn" aria-label="Filter">
            <IconFilter />
          </button>
        </div>

        {/* Filter chips */}
        <div className="hist-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`hist-chip ${filter === f.key ? "is-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <section className="hist-timeline">
          {loading && (
            <div className="hist-empty">
              <img src={logoGlyph} alt="" className="hist-loading-glyph" />
            </div>
          )}

          {!loading && grouped.length === 0 && (
            <div className="hist-empty">
              <div className="hist-empty-icon">
                <IconSearch width="22" height="22" />
              </div>
              <div className="hist-empty-title">No transactions</div>
              <div className="hist-empty-sub">Try adjusting your filters.</div>
            </div>
          )}

          {!loading &&
            grouped.map(([day, list]) => (
              <div key={day} className="hist-day-group">
                <div className="hist-day-head">
                  <div className="hist-day-label">{formatDay(day)}</div>
                  <div className="hist-day-rule" />
                  <div className="hist-day-count">{list.length} tx</div>
                </div>
                <div className="hist-rows">
                  {list.map((tx) => (
                    <TxRow
                      key={tx.id}
                      tx={tx}
                      open={openId === tx.id}
                      onToggle={() => setOpenId(openId === tx.id ? null : tx.id)}
                      onCopy={copyToClipboard}
                      onReceipt={() =>
                        setToast({ type: "ok", msg: "Receipts are coming soon" }) ||
                        setTimeout(() => setToast(null), 2500)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
        </section>
      </main>

      {toast && (
        <div className={`hist-toast ${toast.type === "ok" ? "ok" : "err"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

const TxRow = ({ tx, open, onToggle, onCopy, onReceipt }) => {
  const meta = TYPE_META[tx.type];
  const st = STATUS_META[tx.status];
  const Icon = meta.icon;
  const StIcon = st.icon;
  const up = tx.amount > 0;
  const time = new Date(tx.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`hist-row ${open ? "is-open" : ""}`}>
      <button onClick={onToggle} className="hist-row-main">
        <div className="hist-row-icon" style={{ background: meta.bg, color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}33` }}>
          <Icon />
        </div>
        <div className="hist-row-body">
          <div className="hist-row-title-line">
            <span className="hist-row-title">{tx.title}</span>
            <span className="hist-row-status" style={{ background: `${st.color}1a`, color: st.color }}>
              <StIcon /> {st.label}
            </span>
          </div>
          <div className="hist-row-sub">
            {tx.sub} · {time}
          </div>
        </div>
        <div className="hist-row-amount">
          <div className={`hist-row-amount-value ${up ? "is-up" : ""}`}>
            {tx.hasUsdAmount
              ? `${up ? "+" : "−"}$${Math.abs(tx.amount).toFixed(2)}`
              : `${up ? "+" : "−"}${Math.abs(tx.amount)}`}
          </div>
          <div className="hist-row-currency">{tx.currency}</div>
        </div>
        <IconChevronDown className={`hist-row-chev ${open ? "is-open" : ""}`} />
      </button>

      {open && (
        <div className="hist-row-expand">
          <div className="hist-detail-grid">
            <Detail label="Transaction ID" value={tx.id} mono />
            <Detail label="Type" value={meta.label} />
            <Detail label="Date" value={new Date(tx.date).toLocaleString()} />
            <Detail label="Status" value={st.label} color={st.color} />
          </div>
          <div className="hist-row-actions">
            <button className="hist-btn-ghost" onClick={() => onCopy(tx.id)}>Copy ID</button>
            <button className="hist-btn-primary" onClick={onReceipt}>View receipt</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value, mono, color }) => (
  <div className="hist-detail">
    <div className="hist-detail-label">{label}</div>
    <div className={`hist-detail-value ${mono ? "mono" : ""}`} style={color ? { color } : undefined}>
      {value}
    </div>
  </div>
);

export default History;