import { useEffect, useState, useCallback } from "react";
import axios from "axios";

/**
 * Fetches /api/bonus/status/ and exposes:
 *   state              — 'not_eligible' | 'eligible' | 'active' | 'claimed' | 'disabled'
 *   tiers              — [{ capital, bonus }, ...]
 *   claim              — active claim object (present for 'active')
 *   thisMonthDeposits  — number, only present for 'not_eligible' / 'eligible'
 *   loading            — boolean
 *   refresh            — function to re-fetch
 */
const useBonusStatus = () => {
  const [state, setState] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [claim, setClaim] = useState(null);
  const [thisMonthDeposits, setThisMonthDeposits] = useState(0);
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
      setThisMonthDeposits(res.data.this_month_deposits ?? 0);
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
    thisMonthDeposits,
    loading,
    refresh: fetchBonusStatus,
  };
};

export default useBonusStatus;