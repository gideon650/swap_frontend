import { useEffect, useState, useCallback } from "react";
import axios from "axios";

/**
 * Fetches /api/bonus/status/ and exposes:
 *   state               — 'not_eligible' | 'eligible' | 'active' | 'cap_reached' | 'disabled'
 *   tiers               — [{ capital, bonus }, ...]
 *   claim               — active claim object (present for 'active')
 *   cumulativeDeposits  — approved deposits this calendar month
 *   cumulativeLocked    — locked capital this calendar month
 *   cap                 — monthly lock cap ($1,000)
 *   loading             — boolean
 *   refresh             — function to re-fetch
 */
const useBonusStatus = () => {
  const [state, setState] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [claim, setClaim] = useState(null);
  const [cumulativeDeposits, setCumulativeDeposits] = useState(0);
  const [cumulativeLocked, setCumulativeLocked] = useState(0);
  const [cap, setCap] = useState(1000);
  const [loading, setLoading] = useState(true);

  const fetchBonusStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/bonus/status/`,
        config
      );
      setState(res.data.state);
      setTiers(res.data.tiers || []);
      setClaim(res.data.claim || null);
      setCumulativeDeposits(res.data.cumulative_deposits ?? 0);
      setCumulativeLocked(res.data.cumulative_locked ?? 0);
      setCap(res.data.cap ?? 1000);
    } catch (err) {
      console.error("Failed to fetch bonus status:", err);
      setState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBonusStatus();
  }, [fetchBonusStatus]);

  return {
    state,
    tiers,
    claim,
    cumulativeDeposits,
    cumulativeLocked,
    cap,
    loading,
    refresh: fetchBonusStatus,
  };
};

export default useBonusStatus;