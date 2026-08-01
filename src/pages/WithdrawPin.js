import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import SuccessModal from "./SuccessModal";

const IconArrowLeft = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconLock = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PIN_LENGTH = 4;

/**
 * Renders PIN_LENGTH individual boxes, one digit each.
 * value: string of digits (may be shorter than PIN_LENGTH)
 * onChange: (newValue: string) => void
 */
const PinBoxes = ({ value, onChange, disabled, autoFocus, id }) => {
  const inputsRef = useRef([]);
  const digits = value.split("");

  const focusBox = (index) => {
    const el = inputsRef.current[index];
    if (el) el.focus();
  };

  const handleChange = (index, rawVal) => {
    const digit = rawVal.replace(/\D/g, "").slice(-1); // keep only the last digit typed
    const next = value.split("");
    next[index] = digit || "";
    const joined = next.join("").slice(0, PIN_LENGTH);
    onChange(joined);

    if (digit && index < PIN_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        // Clear current box, stay put
        const next = value.split("");
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        // Move back and clear previous box
        const next = value.split("");
        next[index - 1] = "";
        onChange(next.join(""));
        focusBox(index - 1);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (pasted) {
      onChange(pasted);
      const lastIndex = Math.min(pasted.length, PIN_LENGTH) - 1;
      focusBox(lastIndex >= 0 ? lastIndex : 0);
    }
    e.preventDefault();
  };

  return (
    <div className="wdp-pinboxes" onPaste={handlePaste}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <input
          key={i}
          id={`${id}-${i}`}
          ref={(el) => (inputsRef.current[i] = el)}
          className="wdp-pinbox"
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
        />
      ))}
    </div>
  );
};

const WithdrawPin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestData = location.state?.requestData;

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasPin, setHasPin] = useState(null);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null); // { title, message, details }

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Token ${token}` } };

  useEffect(() => {
    // Guard: this page only makes sense if it was reached from the withdraw form
    if (!requestData) {
      navigate("/withdraw");
      return;
    }
    checkPinStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPinStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/withdraw/pin-status/`, config);
      setHasPin(!!res.data.has_pin);
    } catch (err) {
      setError("Could not verify PIN status. Please try again.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const createPin = async () => {
    if (pin.length !== PIN_LENGTH) {
      setError(`PIN must be ${PIN_LENGTH} digits.`);
      return;
    }
    if (confirmPin.length !== PIN_LENGTH) {
      setError(`Please confirm your ${PIN_LENGTH}-digit PIN.`);
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/withdraw/pin/create/`, { pin, confirm_pin: confirmPin }, config);
      // PIN created — immediately submit the pending withdrawal with it
      await submitWithdrawal(pin);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create PIN. Please try again.");
      setLoading(false);
    }
  };

  const verifyAndSubmit = async () => {
    if (pin.length !== PIN_LENGTH) {
      setError(`Enter your ${PIN_LENGTH}-digit PIN.`);
      return;
    }
    setLoading(true);
    setError("");
    await submitWithdrawal(pin);
  };

  const submitWithdrawal = async (enteredPin) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/withdraw/`,
        { ...requestData, pin: enteredPin },
        config
      );
      if (response.data.status === "success") {
        setSuccessInfo({
          title: "Withdrawal Submitted",
          message: response.data.message || "Your withdrawal request has been received.",
          details: {
            Amount: `$${Number(requestData.amount).toFixed(2)}`,
            Method: requestData.method,
            ...(response.data.withdrawal_id ? { Reference: `#${response.data.withdrawal_id}` } : {}),
            ...(response.data.user_receives ? { "You'll receive": `$${Number(response.data.user_receives).toFixed(2)}` } : {}),
          },
        });
      } else {
        setError(response.data.message || "Something went wrong.");
        setPin("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect PIN or withdrawal failed.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="wdp-root">
        <style>{WDP_CSS}</style>
        <div className="wdp-loading">Checking your account…</div>
      </div>
    );
  }

  return (
    <div className="wdp-root">
      <style>{WDP_CSS}</style>
      <header className="wdp-header">
        <button className="wdp-back" aria-label="Back" onClick={() => navigate("/withdraw")}>
          <IconArrowLeft />
        </button>
        <h1>{hasPin ? "Enter PIN" : "Create Withdrawal PIN"}</h1>
      </header>

      <main className="wdp-main">
        <div className="wdp-icon"><IconLock /></div>

        {hasPin ? (
          <>
            <p className="wdp-sub">Enter your {PIN_LENGTH}-digit withdrawal PIN to confirm this transaction.</p>
            <PinBoxes id="pin" value={pin} onChange={setPin} disabled={loading} autoFocus />
            {error && <div className="wdp-error">{error}</div>}
            <button className="wdp-submit" onClick={verifyAndSubmit} disabled={loading}>
              {loading ? "Verifying…" : "Confirm Withdrawal"}
            </button>
          </>
        ) : (
          <>
            <p className="wdp-sub">Set up a {PIN_LENGTH}-digit PIN to protect your withdrawals. You'll need it for every future withdrawal.</p>

            <label className="wdp-label">New PIN</label>
            <PinBoxes id="new-pin" value={pin} onChange={setPin} disabled={loading} autoFocus />

            <label className="wdp-label">Confirm PIN</label>
            <PinBoxes id="confirm-pin" value={confirmPin} onChange={setConfirmPin} disabled={loading} />

            {error && <div className="wdp-error">{error}</div>}
            <button className="wdp-submit" onClick={createPin} disabled={loading}>
              {loading ? "Setting up…" : "Create PIN & Submit"}
            </button>
          </>
        )}
      </main>

      <SuccessModal
        isOpen={!!successInfo}
        title={successInfo?.title}
        message={successInfo?.message}
        details={successInfo?.details}
        onClose={() => navigate("/dashboard")}
        onContinue={() => navigate("/dashboard")}
        onSecondary={() => navigate("/withdraw")}
        secondaryLabel="Make Another Withdrawal"
      />
    </div>
  );
};

const WDP_CSS = `
.wdp-root{min-height:100vh;background:#0c0714;color:#f3eefb;display:flex;flex-direction:column}
.wdp-loading{margin:auto;color:#8a7a9e;font-size:14px}
.wdp-header{display:flex;align-items:center;gap:14px;padding:18px 20px}
.wdp-header h1{font-size:18px;margin:0}
.wdp-back{width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#f3eefb;display:grid;place-items:center;cursor:pointer}
.wdp-main{flex:1;display:flex;flex-direction:column;align-items:center;padding:40px 24px;text-align:center;gap:14px}
.wdp-icon{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,rgba(128,0,128,.28),rgba(192,96,192,.14));color:#c060c0;border:1px solid rgba(255,255,255,.1);margin-bottom:6px}
.wdp-sub{color:#a998bd;font-size:13px;max-width:320px;line-height:1.6}
.wdp-label{align-self:center;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#8a7a9e;margin-top:10px}

.wdp-pinboxes{display:flex;gap:12px;justify-content:center}
.wdp-pinbox{
  width:52px;height:60px;text-align:center;
  font-size:24px;font-weight:700;
  border-radius:14px;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.12);
  color:#f3eefb;outline:0;
  transition:.15s;
}
.wdp-pinbox:focus{border-color:#800080;box-shadow:0 0 0 3px rgba(128,0,128,.18);background:rgba(128,0,128,.06)}
.wdp-pinbox::-webkit-outer-spin-button,.wdp-pinbox::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}

.wdp-error{color:#ff8fa3;font-size:12px}
.wdp-submit{margin-top:8px;width:220px;padding:14px;border-radius:14px;border:0;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(135deg,#800080 0%,#9b1f9b 50%,#c060c0 100%);box-shadow:0 12px 40px -8px rgba(128,0,128,.6)}
.wdp-submit:disabled{opacity:.5;cursor:not-allowed}
`;

export default WithdrawPin;