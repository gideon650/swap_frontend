import React, { createContext, useContext, useEffect, useState } from "react";

// e.g. "wss://api.yourdomain.com" — set this in your Netlify env vars,
// separate from REACT_APP_API_BASE_URL since it's a different scheme (ws vs http).
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;

function computePercentChange(price, prevPrice) {
  if (!prevPrice) return 0;
  const percent = ((price - prevPrice) / prevPrice) * 100;
  return Math.round(percent * 100) / 100; // 2 decimal places, matches the REST serializer
}

const PriceContext = createContext({ prices: {}, connected: false });

export function PriceProvider({ children }) {
  const [prices, setPrices] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!WS_BASE_URL) {
      console.error("REACT_APP_WS_BASE_URL is not set — live prices disabled.");
      return;
    }

    let isUnmounted = false;
    let socket = null;
    let reconnectTimer = null;
    let attempts = 0;

    const connect = () => {
      const token = localStorage.getItem("token");
      const url = `${WS_BASE_URL}/ws/prices/${token ? `?token=${token}` : ""}`;
      socket = new WebSocket(url);

      socket.onopen = () => {
        if (isUnmounted) return;
        setConnected(true);
        attempts = 0;
      };

      socket.onmessage = (event) => {
        if (isUnmounted) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "snapshot") {
            const map = {};
            (msg.assets || []).forEach((a) => {
              map[a.symbol] = {
                price_usd: a.price_usd,
                prev_price_usd: a.prev_price_usd,
                percent_change: computePercentChange(a.price_usd, a.prev_price_usd),
              };
            });
            setPrices(map);
          } else if (msg.type === "price_update") {
            const { symbol, price_usd, prev_price_usd } = msg.data;
            setPrices((prev) => ({
              ...prev,
              [symbol]: {
                price_usd,
                prev_price_usd,
                percent_change: computePercentChange(price_usd, prev_price_usd),
              },
            }));
          } else if (msg.type === "prices_update") {
            // Batched: one message per jitter tick, carrying every updated
            // asset. Merge them all into state in a single update instead
            // of one setState per asset.
            const updates = msg.data || [];
            if (updates.length === 0) return;
            setPrices((prev) => {
              const next = { ...prev };
              updates.forEach(({ symbol, price_usd, prev_price_usd }) => {
                next[symbol] = {
                  price_usd,
                  prev_price_usd,
                  percent_change: computePercentChange(price_usd, prev_price_usd),
                };
              });
              return next;
            });
          }
        } catch (e) {
          console.error("Bad price message from server:", e);
        }
      };

      socket.onclose = () => {
        if (isUnmounted) return;
        setConnected(false);
        attempts += 1;
        const delay = Math.min(1000 * 2 ** attempts, 30000); // capped exponential backoff
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimer);
      if (socket) socket.close();
    };
  }, []);

  return (
    <PriceContext.Provider value={{ prices, connected }}>
      {children}
    </PriceContext.Provider>
  );
}

// Returns { prices: { [symbol]: { price_usd, prev_price_usd, percent_change } }, connected }
export function usePrices() {
  return useContext(PriceContext);
}