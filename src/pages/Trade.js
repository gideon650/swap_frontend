import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { createChart } from "lightweight-charts";
import { useSearchParams } from "react-router-dom";
import "./Trade.css";
import logoGlyph from "../assets/images/logo-glyph.png";
import PnLCard from "../components/PnLCard/PnLCard";
import { usePrices } from "../context/PriceContext";

const INTERVAL_OPTIONS = [
  { label: "1m", value: "1min" },
  { label: "5m", value: "5min" },
  { label: "15m", value: "15min" },
  { label: "1h", value: "1hr" },
];

const Trade = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [candlestickData, setCandlestickData] = useState([]);
  const [interval, setIntervalState] = useState("15min");
  const [amount, setAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const [tradeError, setTradeError] = useState(null);
  const [inputType, setInputType] = useState("amount");
  const [tradeSide, setTradeSide] = useState("buy");
  // Tracks which sell % button (25/50/75/100) is currently "live" — i.e. the
  // box should keep recalculating off the live price feed until the user
  // edits it manually, switches context, or completes the sell.
  const [activeSellPercent, setActiveSellPercent] = useState(null);
  const [showGridlines, setShowGridlines] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [pnlCardData, setPnlCardData] = useState(null);
  const chartContainerRef = useRef();
  const chartInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const trendLineSeriesRef = useRef(null);
  const lastCandleRef = useRef(null); // most recently known candle — WS ticks patch this in place
  const tickerTrackRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { prices: livePrices } = usePrices();

  const filterOutUSDT = useCallback((tokens) => {
    return tokens.filter(asset => asset.symbol !== 'USDT');
  }, []);

  const getStarRating = useCallback((balance) => {
    if (balance >= 5000) return 5;
    else if (balance >= 1001) return 4;
    else if (balance >= 501) return 3;
    else if (balance >= 201) return 2;
    else return 1;
  }, []);

  const canTrade = useCallback(() => {
    if (!portfolio) return false;
    const balance = Number(portfolio.balance_usd || 0);
    return getStarRating(balance) >= 2;
  }, [portfolio, getStarRating]);

  const getAmountForTwoStars = useCallback(() => {
    if (!portfolio) return 201;
    const balance = Number(portfolio.balance_usd || 0);
    return Math.max(0, 201 - balance);
  }, [portfolio]);

  const filteredAssets = assets.filter(asset => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      asset.symbol.toLowerCase().includes(searchLower) ||
      asset.name.toLowerCase().includes(searchLower)
    );
  });

  const fetchPortfolio = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/portfolio/`,
        config
      );
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  }, []);

  const fetchCandlestickData = useCallback(async (symbol, intervalParam = interval) => {
    if (!symbol) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/candlestick/${symbol}/?interval=${intervalParam}`,
        config
      );
  
      if (response.data.status === "success" && Array.isArray(response.data.chart)) {
        setCandlestickData(response.data.chart);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching candlestick data:", error);
      setError(`Failed to load chart data for ${symbol}.`);
      setLoading(false);
    }
  }, [interval]);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl && assets.length > 0) {
      const assetExists = assets.some(asset => asset.symbol === tokenFromUrl);
      if (assetExists && tokenFromUrl !== 'USDT') {
        setSelectedAsset(tokenFromUrl);
        fetchCandlestickData(tokenFromUrl, interval);
      }
    }
  }, [assets, searchParams, interval, fetchCandlestickData]);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/crypto-prices/`, config);
      const assetList = response.data.cryptocurrencies || [];
      
      const filteredAssetList = filterOutUSDT(assetList);
      setAssets(filteredAssetList);

      const tokenFromUrl = searchParams.get('token');

      setSelectedAsset(prevSelected => {
        // Already have a selection (from an earlier call, a user click, or the
        // URL) — don't stomp on it just because fetchAssets ran again (e.g.
        // because the interval changed and recreated this callback).
        if (prevSelected) return prevSelected;

        if (filteredAssetList.length === 0) return prevSelected;

        const initialSymbol =
          tokenFromUrl && filteredAssetList.some(a => a.symbol === tokenFromUrl)
            ? tokenFromUrl
            : filteredAssetList[0].symbol;

        fetchCandlestickData(initialSymbol, interval);
        return initialSymbol;
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setError("Failed to load assets. Please try again.");
      setLoading(false);
    }
  }, [filterOutUSDT, fetchCandlestickData, interval, searchParams]);

  const handleAssetChange = async (symbol) => {
    setSelectedAsset(symbol);
    setIsDropdownOpen(false);
    setSearchTerm("");
    setTradeError(null);
    if (symbol) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('token', symbol);
        return next;
      });
      await fetchCandlestickData(symbol, interval);
    } else {
      setCandlestickData([]);
    }
  };

  const handleIntervalChange = async (e) => {
    const newInterval = e.target.value;
    setIntervalState(newInterval);
    if (selectedAsset) {
      await fetchCandlestickData(selectedAsset, newInterval);
    }
  };

  const applyAmountValue = (value) => {
    setAmount(value);

    if (tradeError) {
      setTradeError(null);
    }

    if (tradeSide === "buy" && value && !isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      
      if (inputType === "amount" && numValue > 0 && numValue < 201) {
        setTradeError("Minimum amount is $201");
      } else if (inputType === "quantity" && numValue > 0) {
        const selectedAssetObj = assets.find(asset => asset.symbol === selectedAsset);
        if (selectedAssetObj) {
          const currentPrice = parseFloat(selectedAssetObj.price_usd);
          const totalCost = numValue * currentPrice;
          
          if (totalCost < 201) {
            setTradeError(`Minimum total cost is $201. Your quantity costs $${totalCost.toFixed(2)}`);
          }
        }
      }
    }
  };

  const handleSideToggle = (side) => {
    setTradeSide(side);
    setActiveSellPercent(null);
    if (tradeError) {
      setTradeError(null);
    }
  };

  useEffect(() => {
    setActiveSellPercent(null);
  }, [selectedAsset]);

  const handleAmountChange = (e) => {
    // Manual typing always wins over live-percent tracking.
    setActiveSellPercent(null);
    applyAmountValue(e.target.value);
  };

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setActiveSellPercent(null);
  };

  const handleSellPercent = (percent) => {
    if (!selectedAsset) return;
    const holding = portfolio?.tokens?.find((t) => t.symbol === selectedAsset);
    const holdingBalance = holding ? parseFloat(holding.balance) || 0 : 0;
    if (holdingBalance <= 0) return;

    if (inputType === "quantity") {
      // Quantity of tokens held doesn't change with price, so no live
      // tracking is needed here.
      setActiveSellPercent(null);
      let qty = holdingBalance * (percent / 100);
      // For 100%, reduce by tiny amount to avoid precision errors
      if (percent === 100) {
        qty = Math.floor(qty * 1000000) / 1000000; // Round down to 6 decimals
      }
      applyAmountValue(parseFloat(qty.toFixed(8)).toString());
    } else {
      const livePriceObj = livePrices[selectedAsset];
      const fallbackAssetObj = assets.find((asset) => asset.symbol === selectedAsset);
      const price = livePriceObj
        ? parseFloat(livePriceObj.price_usd) || 0
        : fallbackAssetObj
        ? parseFloat(fallbackAssetObj.price_usd) || 0
        : 0;
      let dollarAmt = holdingBalance * price * (percent / 100);
      // For 100%, round down to 2 decimals to avoid precision errors
      if (percent === 100) {
        dollarAmt = Math.floor(dollarAmt * 100) / 100; // Round down to 2 decimals
      }
      applyAmountValue(dollarAmt.toFixed(2));
      // Keep recalculating this box off the live price feed until the
      // user edits it, switches context, or completes the sell.
      setActiveSellPercent(percent);
    }
  };

  // While a sell percent is "active", keep the dollar amount in sync with
  // the live price feed so what's in the box never lags behind what the
  // user will actually get when they click Sell.
  useEffect(() => {
    if (!activeSellPercent || inputType !== "amount" || tradeSide !== "sell" || !selectedAsset) {
      return;
    }
    const holding = portfolio?.tokens?.find((t) => t.symbol === selectedAsset);
    const holdingBalance = holding ? parseFloat(holding.balance) || 0 : 0;
    if (holdingBalance <= 0) return;

    const livePriceObj = livePrices[selectedAsset];
    const fallbackAssetObj = assets.find((asset) => asset.symbol === selectedAsset);
    const price = livePriceObj
      ? parseFloat(livePriceObj.price_usd) || 0
      : fallbackAssetObj
      ? parseFloat(fallbackAssetObj.price_usd) || 0
      : 0;
    if (!price) return;

    let dollarAmt = holdingBalance * price * (activeSellPercent / 100);
    if (activeSellPercent === 100) {
      dollarAmt = Math.floor(dollarAmt * 100) / 100;
    }
    setAmount(dollarAmt.toFixed(2));
  }, [livePrices, activeSellPercent, inputType, tradeSide, selectedAsset, portfolio, assets]);

  const toggleGridlines = () => {
    setShowGridlines(!showGridlines);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.applyOptions({
        grid: {
          vertLines: { 
            color: showGridlines ? 'transparent' : 'rgba(160, 32, 240, 0.15)',
            style: 0,
            visible: !showGridlines
          },
          horzLines: { 
            color: showGridlines ? 'transparent' : 'rgba(160, 32, 240, 0.15)',
            style: 0,
            visible: !showGridlines
          }
        }
      });
    }
  };

  const handleTrade = async (type) => {
    setTradeError(null);
    setPnlCardData(null);

    if (type === "buy" && !canTrade()) {
      const amountNeeded = getAmountForTwoStars();
      setTradeError(`You need at least 2 stars to buy. Add $${amountNeeded.toFixed(2)} to your wallet to unlock buying.`);
      return;
    }

    if (type === "sell" && portfolio && portfolio.is_sell_blocked === true) {
      setSellLoading(true);
      return;
    }

    if (!selectedAsset || !amount) {
      alert("Please select an asset and enter an amount.");
      return;
    }

    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    if (type === "buy") {
      if (inputType === "amount") {
        if (amountValue < 201) {
          setTradeError("Minimum amount is $201");
          return;
        }
      } else if (inputType === "quantity") {
        const selectedAssetObj = assets.find(asset => asset.symbol === selectedAsset);
        if (selectedAssetObj) {
          const currentPrice = parseFloat(selectedAssetObj.price_usd);
          const totalCost = amountValue * currentPrice;
          
          if (totalCost < 201) {
            setTradeError(`Minimum total cost is $201. Your quantity costs $${totalCost.toFixed(2)}`);
            return;
          }
        } else {
          setTradeError("Unable to calculate asset price");
          return;
        }
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };
      
      const payload = {
        symbol: selectedAsset,
        trade_type: type.toUpperCase(),
        input_type: inputType
      };

      if (inputType === "amount") {
        payload.amount = amountValue;
      } else {
        payload.quantity = amountValue;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/trade/`,
        payload,
        config
      );

      if (response.data.status === "success") {
        setAmount("");
        setActiveSellPercent(null);
        fetchCandlestickData(selectedAsset, interval);
        fetchPortfolio();
        
        if (type === "sell" && response.data.trade_data?.pnl_card) {
          setPnlCardData(response.data.trade_data.pnl_card);
        } else {
          alert(`${type.toUpperCase()} order successful: ${response.data.message}`);
        }
      } else {
        alert(`${type.toUpperCase()} failed: ${response.data.message}`);
      }
      setLoading(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || `${type.toUpperCase()} failed. Please try again.`;
      console.error(`${type} failed:`, error);
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleClosePnLCard = () => {
    setPnlCardData(null);
  };

  const cleanupChart = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }
    candleSeriesRef.current = null;
    trendLineSeriesRef.current = null;
  };

  const buildTrendLineData = (formattedCandles, period = 3) => {
    return formattedCandles.map((item, index) => {
      const start = Math.max(0, index - period + 1);
      const windowSlice = formattedCandles.slice(start, index + 1);
      const avg =
        windowSlice.reduce((sum, c) => sum + c.close, 0) / windowSlice.length;
      return { time: item.time, value: avg };
    });
  };

  const formatPrice = (price) => {
    const value = parseFloat(price);
    if (!value || isNaN(value)) return '0.00';
    if (value === 0) return '0.00';
    if (value >= 1) {
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    // Sub-$1 prices: scale decimal places to the price's order of magnitude
    // so tiny-cap tokens (e.g. $0.0000126) keep their significant digits
    // instead of rounding down to "$0".
    const magnitude = Math.floor(Math.log10(value));
    const decimals = Math.min(10, -magnitude + 3);
    return value.toFixed(decimals);
  };

  const getPrecision = (price) => {
    if (!price || price <= 0) return 2;
    if (price >= 1) return 2;
    // Scale precision to the price's order of magnitude so low-cap tokens
    // (e.g. $0.0000126) keep enough significant digits instead of being
    // rounded into a single flat tick.
    const magnitude = Math.floor(Math.log10(price));
    return Math.min(10, -magnitude + 3);
  };

  const getTickSize = (price) => {
    if (!price || price <= 0) return 0.01;
    if (price >= 1) return price < 10 ? 0.01 : price < 100 ? 0.1 : 1;
    return Math.pow(10, -getPrecision(price));
  };

  useEffect(() => {
    cleanupChart();

    const container = chartContainerRef.current;
    if (!container || candlestickData.length === 0) {
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight || 
      (window.innerWidth <= 480 ? 250 : window.innerWidth <= 640 ? 300 : 400);

    const prices = candlestickData.flatMap(item => [
      parseFloat(item.open), 
      parseFloat(item.high), 
      parseFloat(item.low), 
      parseFloat(item.close)
    ]);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const priceRange = maxPrice - minPrice;
    const padding = Math.max(priceRange * 0.05, maxPrice * 0.001);

    const chart = createChart(container, {
      width: width,
      height: height,
      layout: {
        background: { color: "#130013" },
        textColor: "#D9C9EA",
        fontSize: 12
      },
      grid: {
        vertLines: { 
          color: showGridlines ? 'rgba(160, 32, 240, 0.15)' : 'transparent',
          style: 0,
          visible: showGridlines
        },
        horzLines: { 
          color: showGridlines ? 'rgba(160, 32, 240, 0.15)' : 'transparent',
          style: 0,
          visible: showGridlines
        }
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#E6C15C",
          width: 1,
          style: 1,
          labelBackgroundColor: "#1A001F"
        },
        horzLine: {
          color: "#E6C15C",
          width: 1,
          style: 1,
          labelBackgroundColor: "#1A001F"
        }
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(160, 32, 240, 0.3)",
        barSpacing: 12,
        minBarSpacing: 8,
        rightOffset: 12,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      },
      rightPriceScale: {
        borderColor: "rgba(160, 32, 240, 0.3)",
        scaleMargins: {
          top: 0.05,
          bottom: 0.05
        },
        autoScale: true,
        mode: 0,
        alignLabels: true,
        borderVisible: true,
        ticksVisible: true,
        entireTextOnly: false,
        visible: true,
        minimumWidth: 80,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true
      }
    });

    chartInstanceRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderUpColor: '#22C55E',
      borderDownColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
      priceFormat: {
        type: 'price',
        precision: getPrecision(maxPrice),
        minMove: getTickSize(maxPrice)
      },
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineWidth: 1,
      priceLineColor: '#E6C15C',
      priceLineStyle: 2
    });

    candleSeriesRef.current = candleSeries;

    const formattedData = candlestickData
      .map(item => ({
        time: typeof item.time === 'number' ? item.time : parseInt(item.time),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close)
      }))
      .filter(item => 
        !isNaN(item.time) && 
        !isNaN(item.open) && 
        !isNaN(item.high) && 
        !isNaN(item.low) && 
        !isNaN(item.close)
      )
      .sort((a, b) => a.time - b.time);

    candleSeries.setData(formattedData);
    lastCandleRef.current = formattedData.length > 0 ? formattedData[formattedData.length - 1] : null;

    const trendLineSeries = chart.addAreaSeries({
      lineColor: "#A855F7",
      lineWidth: 2,
      topColor: "rgba(168, 85, 247, 0.45)",
      bottomColor: "rgba(168, 85, 247, 0.0)",
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: "#A855F7",
      crosshairMarkerBackgroundColor: "#E9D5FF",
    });

    trendLineSeriesRef.current = trendLineSeries;

    const trendLineData = buildTrendLineData(formattedData);
    trendLineSeries.setData(trendLineData);

    if (trendLineData.length > 0) {
      trendLineSeries.setMarkers([
        {
          time: trendLineData[trendLineData.length - 1].time,
          position: "inBar",
          color: "#22C55E",
          shape: "circle",
          size: 1.5,
        },
      ]);
    }

    if (formattedData.length > 0) {
      const startIndex = Math.max(0, formattedData.length - 50);
      const timeRange = {
        from: formattedData[startIndex].time,
        to: formattedData[formattedData.length - 1].time
      };
      
      setTimeout(() => {
        chart.timeScale().setVisibleRange(timeRange);
        
        chart.priceScale('right').applyOptions({
          scaleMargins: {
            top: 0.1,
            bottom: 0.1
          }
        });
      }, 100);
    }

    candleSeries.applyOptions({
      autoscaleInfoProvider: () => {
        const timeScale = chart.timeScale();
        const visibleRange = timeScale.getVisibleRange();
        
        if (!visibleRange) {
          return {
            priceRange: {
              minValue: minPrice - padding,
              maxValue: maxPrice + padding
            },
            margins: {
              above: 10,
              below: 10
            }
          };
        }
        
        const visibleData = formattedData.filter(item => 
          item.time >= visibleRange.from && item.time <= visibleRange.to
        );
        
        if (visibleData.length === 0) {
          return {
            priceRange: {
              minValue: minPrice - padding,
              maxValue: maxPrice + padding
            }
          };
        }
        
        const visiblePrices = visibleData.flatMap(item => [item.high, item.low]);
        const visibleMin = Math.min(...visiblePrices);
        const visibleMax = Math.max(...visiblePrices);
        const visibleRange_price = visibleMax - visibleMin;
        const visiblePadding = Math.max(visibleRange_price * 0.05, visibleMax * 0.001);
        
        return {
          priceRange: {
            minValue: visibleMin - visiblePadding,
            maxValue: visibleMax + visiblePadding
          },
          margins: {
            above: 5,
            below: 5
          }
        };
      }
    });

    return () => {
      cleanupChart();
    };
  }, [candlestickData, showGridlines]);

  // Keep the chart's pixel width in sync with its container using a
  // ResizeObserver instead of a window 'resize' listener. On mobile,
  // scrolling collapses/expands the browser's address bar, which fires a
  // 'resize' event even though the chart container's *width* hasn't
  // changed — only the viewport height has. Reacting to that (as the old
  // window-resize handler did, plus a fitContent() call) re-laid out the
  // chart and reset the zoomed-in view on every scroll, making the
  // candles appear to jump away from the current-price display. Only
  // acting on genuine width changes avoids that.
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    let lastWidth = container.clientWidth;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !chartInstanceRef.current) return;
      const newWidth = Math.round(entry.contentRect.width);
      if (newWidth === lastWidth) return;
      lastWidth = newWidth;
      chartInstanceRef.current.applyOptions({ width: newWidth });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [candlestickData]);

  useEffect(() => {
    if (!selectedAsset) return;

    let isMounted = true;
    
    const getPollingInterval = () => {
      switch(interval) {
        case '1min': return 10000;
        case '5min': return 30000;
        case '15min': return 60000;
        case '1hr': return 300000;
        default: return 60000;
      }
    };
    
    const pollingInterval = getPollingInterval();
    
    const fetchLatestData = async () => {
      if (!candleSeriesRef.current || !isMounted) return;
      
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Token ${token}` } };
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/candlestick/${selectedAsset}/?interval=${interval}`,
          config
        );

        if (response.data.status === "success" && Array.isArray(response.data.chart) && isMounted) {
          const newData = response.data.chart[response.data.chart.length - 1];
          
          const formattedPoint = {
            time: typeof newData.time === 'number' ? newData.time : parseInt(newData.time),
            open: parseFloat(newData.open),
            high: parseFloat(newData.high),
            low: parseFloat(newData.low),
            close: parseFloat(newData.close)
          };
          
          if (!isNaN(formattedPoint.time) && 
              !isNaN(formattedPoint.open) && 
              !isNaN(formattedPoint.high) && 
              !isNaN(formattedPoint.low) && 
              !isNaN(formattedPoint.close)) {
            candleSeriesRef.current.update(formattedPoint);
            lastCandleRef.current = formattedPoint;

            if (trendLineSeriesRef.current) {
              trendLineSeriesRef.current.update({
                time: formattedPoint.time,
                value: formattedPoint.close,
              });
              trendLineSeriesRef.current.setMarkers([
                {
                  time: formattedPoint.time,
                  position: "inBar",
                  color: "#22C55E",
                  shape: "circle",
                  size: 1.5,
                },
              ]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching updated candlestick data:", error);
      }
    };

    fetchLatestData();
    const intervalId = setInterval(fetchLatestData, pollingInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedAsset, interval]);

  // Live tick from the 'prices' WebSocket — patches the currently-open candle
  // in place rather than waiting for the next REST poll. Doesn't touch the
  // candle's `time` bucket, so it never creates a new candle, just moves the
  // existing one, same as an admin edit landing mid-candle would.
  useEffect(() => {
    if (!selectedAsset) return;
    const live = livePrices[selectedAsset];
    if (!live || !candleSeriesRef.current || !lastCandleRef.current) return;

    const base = lastCandleRef.current;
    const patched = {
      time: base.time,
      open: base.open,
      close: live.price_usd,
      high: Math.max(base.high, live.price_usd),
      low: Math.min(base.low, live.price_usd),
    };

    candleSeriesRef.current.update(patched);
    lastCandleRef.current = patched;

    if (trendLineSeriesRef.current) {
      trendLineSeriesRef.current.update({ time: patched.time, value: patched.close });
    }
  }, [livePrices, selectedAsset]);

  useEffect(() => {
    fetchAssets();
    fetchPortfolio();
  }, [fetchAssets, fetchPortfolio]);

  // Display-only overlay: same asset objects, with price/change fields
  // patched from the live WebSocket feed where available. Buy/sell handlers
  // above intentionally keep reading from `assets` directly — the server is
  // the source of truth for trade price, this is just for what's on screen.
  const liveAssets = useMemo(() => {
    return assets.map((a) => {
      const live = livePrices[a.symbol];
      if (!live) return a;
      return {
        ...a,
        price_usd: live.price_usd,
        prev_price_usd: live.prev_price_usd,
        percent_change: live.percent_change,
        change: live.percent_change > 0 ? "up" : live.percent_change < 0 ? "down" : "same",
      };
    });
  }, [assets, livePrices]);

  const selectedAssetObj = liveAssets.find(asset => asset.symbol === selectedAsset);

  const tickerAssets = Array.from(
    new Map(liveAssets.map(a => [a.symbol, a])).values()
  );

  // The track renders two back-to-back copies of tickerAssets and the CSS
  // animation translates by -50% (i.e. the width of one copy) — so speed
  // (px/sec) only stays constant across different token-list sizes if the
  // duration scales with that measured width. A fixed duration (e.g. 40s)
  // made the ticker visibly faster in production, which has far more real
  // tokens than a local test list.
  useEffect(() => {
    const track = tickerTrackRef.current;
    if (!track || tickerAssets.length === 0) return;

    const PIXELS_PER_SECOND = 60;
    const oneCopyWidth = track.scrollWidth / 2;
    const duration = Math.max(oneCopyWidth / PIXELS_PER_SECOND, 8);
    track.style.setProperty('--ticker-duration', `${duration}s`);
  }, [tickerAssets.length]);

  return (
    <div className="trade-container">
      {pnlCardData && (
        <PnLCard data={pnlCardData} onClose={handleClosePnLCard} />
      )}

      <div className="trade-header">
        <h1>MARKET</h1>
        <p className="subtitle">Live market data and trading platform</p>
      </div>

      {assets.length > 0 && (
        <div className="trade-ticker-wrap">
          <div className="trade-ticker-track" ref={tickerTrackRef}>
            {[...tickerAssets, ...tickerAssets].map((a, i) => (
              <span key={`${a.id}-${i}`} className="trade-ticker-item">
                <span className="trade-ticker-symbol">{a.symbol}</span>
                <span className="trade-ticker-price">
                  ${formatPrice(a.price_usd)}
                </span>
                <span className={`trade-ticker-change trade-ticker-change--${a.change}`}>
                  {a.change === "up" && "▲"}
                  {a.change === "down" && "▼"}
                  {a.change === "same" && "•"}
                  {" "}
                  {Math.abs(parseFloat(a.percent_change || 0)).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="content-wrapper">
        <div className="main-content">
          <div className="chart-section">
            <div className="asset-selector-container">
              <div className="asset-select">
                <label htmlFor="asset-select">Select Token:</label>
                <div className={`custom-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                  <div 
                    className="dropdown-header"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedAssetObj ? (
                      <>
                        <img 
                          src={selectedAssetObj.image_url || "/default-token.png"} 
                          alt={selectedAssetObj.symbol}
                          className="dropdown-token-image"
                        />
                        <span>{selectedAssetObj.symbol}</span>
                      </>
                    ) : (
                      <span>Select Token</span>
                    )}
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="dropdown-content">
                      <div className="search-container">
                        <input
                          type="text"
                          placeholder="Search tokens..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                          autoFocus
                        />
                      </div>
                      <div className="dropdown-list">
                        {filteredAssets.length > 0 ? (
                          filteredAssets.map((asset) => (
                            <div
                              key={asset.id}
                              className={`dropdown-item ${selectedAsset === asset.symbol ? 'selected' : ''}`}
                              onClick={() => handleAssetChange(asset.symbol)}
                            >
                              <img 
                                src={asset.image_url || "/default-token.png"} 
                                alt={asset.symbol}
                                className="dropdown-token-image"
                              />
                              <div className="token-info">
                                <span className="token-symbol">{asset.symbol}</span>
                                <span className="token-name">{asset.name}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-results">No tokens found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="interval-select">
                <div className="interval-pill-group">
                  {INTERVAL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`interval-pill ${interval === opt.value ? 'active' : ''}`}
                      onClick={() => handleIntervalChange({ target: { value: opt.value } })}
                      disabled={loading}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chart-controls">
                <button
                  className={`grid-toggle-btn ${showGridlines ? 'active' : ''}`}
                  onClick={toggleGridlines}
                  title="Toggle gridlines"
                >
                  <span className="grid-icon">⊞</span>
                  <span>Grid</span>
                </button>
              </div>

              {selectedAssetObj && (
                <div className="current-price">
                  <span className="price-label">Current Price:</span>
                  <span className="price-value">
                    ${formatPrice(selectedAssetObj.price_usd)}
                  </span>
                </div>
              )}
            </div>

            <div className="chart-container">
              <div ref={chartContainerRef} className="candlestick-chart">
                {loading && (
                  <div className="chart-loading">
                    <img src={logoGlyph} alt="" className="chart-loading-glyph" />
                  </div>
                )}
                {!selectedAsset && (
                  <div className="chart-placeholder">
                    <span className="chart-icon">📊</span>
                    <p>Select an asset to view chart</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="trading-container">
            <div className="trading-column">
              {selectedAssetObj && (
                <div className="asset-details">
                  <div className="token-image-circle">
                    <img
                      src={selectedAssetObj.image_url || "/default-token.png"}
                      alt={selectedAssetObj.symbol}
                      className="token-image"
                    />
                  </div>
                  <h3>{selectedAssetObj.name} <span className="asset-symbol">({selectedAssetObj.symbol})</span></h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Holders</span>
                      <span className="detail-value">{selectedAssetObj.holders}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Liquidity</span>
                      <span className="detail-value">${parseFloat(selectedAssetObj.liquidity).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Supply</span>
                      <span className="detail-value">{parseFloat(selectedAssetObj.total_supply).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Market Cap</span>
                      <span className="detail-value">{selectedAssetObj.market_cap}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Honey Pot</span>
                      <span className="detail-value" style={{color: selectedAssetObj.honey_pot ? "red" : "green"}}>
                        {selectedAssetObj.honey_pot ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Highest Holder %</span>
                      <span className="detail-value">{selectedAssetObj.highest_holder}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="trading-column">
              <div className="trade-form">
                <h3>Trade {selectedAssetObj ? selectedAssetObj.symbol : ''}</h3>
                <div className="trade-actions">
                  <div className="trade-toggles-row">
                    <div className="input-type-selector">
                      <div className="clickable-text-group">
                        <span
                          className={`clickable-text ${inputType === "amount" ? "active" : ""}`}
                          onClick={() => handleInputTypeChange("amount")}
                        >
                          Amount
                        </span>
                        <span
                          className={`clickable-text ${inputType === "quantity" ? "active" : ""}`}
                          onClick={() => handleInputTypeChange("quantity")}
                        >
                          Quantity
                        </span>
                      </div>
                    </div>

                    <div className="side-toggle" role="tablist" aria-label="Buy or sell">
                      <button
                        type="button"
                        className={`side-toggle-btn side-buy ${tradeSide === "buy" ? "active" : ""}`}
                        onClick={() => handleSideToggle("buy")}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        className={`side-toggle-btn side-sell ${tradeSide === "sell" ? "active" : ""}`}
                        onClick={() => handleSideToggle("sell")}
                      >
                        Sell
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="trade-amount">
                      {inputType === "amount" ? "Amount ($)" : "Quantity"}
                    </label>
                    <input
                      id="trade-amount"
                      type="number"
                      placeholder={inputType === "amount" ? "Enter USD amount..." : "Enter quantity..."}
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={loading || !selectedAsset}
                      step={inputType === "amount" ? "0.01" : "0.000001"}
                      min="0"
                    />
                    {tradeError && (
                      <div className="trade-error-message" style={{color: 'red', fontSize: '14px', marginTop: '5px'}}>
                        {tradeError}
                      </div>
                    )}
                  </div>
                  
                  {tradeSide === "sell" && (
                    <div className="sell-percent-row">
                      {[25, 50, 75, 100].map((percent) => (
                        <button
                          key={percent}
                          type="button"
                          className="sell-percent-btn"
                          onClick={() => handleSellPercent(percent)}
                          disabled={loading || sellLoading || !selectedAsset}
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                  )}

                  {amount && selectedAssetObj && (
                    <div className="conversion-info">
                      {inputType === "amount" ? (
                        <span>≈ {(parseFloat(amount) / parseFloat(selectedAssetObj.price_usd)).toFixed(6)} {selectedAssetObj.symbol}</span>
                      ) : (
                        <span>≈ ${(parseFloat(amount) * parseFloat(selectedAssetObj.price_usd)).toFixed(2)}</span>
                      )}
                    </div>
                  )}
                  <div className="button-group">
                    {tradeSide === "buy" ? (
                      <button
                        className="trade-submit-btn buy-btn"
                        onClick={() => handleTrade("buy")}
                        disabled={loading || !selectedAsset || !amount}
                      >
                        {loading ? (
                          <>
                            <span className="button-spinner"></span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span className="trade-icon">↗</span>
                            <span>Buy</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className="trade-submit-btn sell-btn"
                        onClick={() => handleTrade("sell")}
                        disabled={sellLoading || loading || !selectedAsset || !amount}
                      >
                        {sellLoading || loading ? (
                          <>
                            <span className="button-spinner"></span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span className="trade-icon">↙</span>
                            <span>Sell</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Trade;