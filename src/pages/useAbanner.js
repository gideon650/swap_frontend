import { useState, useEffect } from "react";
import axios from "axios";

const DISMISS_KEY = "ad_banner_dismissed";

/**
 * Fetches the admin-managed dashboard ad banner. Shows it once per login
 * session: if the user dismisses it, that's recorded in sessionStorage so
 * refreshing the page or navigating away from and back to the dashboard
 * will NOT bring it back. It only reappears after a fresh login (or a new
 * browser session), when the login/logout flow clears DISMISS_KEY.
 */
const useAdBanner = () => {
  const [banner, setBanner] = useState(null);
  const [showAdBanner, setShowAdBanner] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Already dismissed earlier in this login session — don't show again.
    if (sessionStorage.getItem(DISMISS_KEY) === "true") {
      return;
    }

    const fetchBanner = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const config = { headers: { Authorization: `Token ${token}` } };
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/banner/`,
          config
        );

        if (cancelled) return;

        if (res.data?.enabled && res.data?.banner) {
          setBanner(res.data.banner);
          setShowAdBanner(true);
        } else {
          setBanner(null);
          setShowAdBanner(false);
        }
      } catch (err) {
        if (!cancelled) {
          setBanner(null);
          setShowAdBanner(false);
        }
      }
    };

    fetchBanner();

    return () => {
      cancelled = true;
    };
  }, []);

  const dismissAdBanner = () => {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setShowAdBanner(false);
  };

  return { banner, showAdBanner, dismissAdBanner };
};

export default useAdBanner;