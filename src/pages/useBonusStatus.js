import { useEffect, useState, useCallback } from "react";
import axios from "axios";

/**
 * Fetches /api/bonus/status/ and exposes:
 *   state   — 'not_eligible' | 'eligible' | 'active' | 'claimed'
 *   tiers   — [{ capital, bonus }, ...] (present for not_eligible / eligible)
 *   claim   — active claim object (present for 'active')
 *   loading — boolean
 *   refresh — function to re-fetch
 */
const useBonusStatus = () => {
  const [state, setState] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [claim, setClaim] = useState(null);
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
    } catch (err) {
      console.error("Failed to fetch bonus status:", err);
      // Fail quiet — the section simply won't render
      setState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBonusStatus();
  }, [fetchBonusStatus]);

  return { state, tiers, claim, loading, refresh: fetchBonusStatus };
};

export default useBonusStatus;