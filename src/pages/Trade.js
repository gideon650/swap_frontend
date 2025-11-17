import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { createChart } from "lightweight-charts";
import { useSearchParams } from "react-router-dom";
import "./Trade.css";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const [tradeError, setTradeError] = useState(null);
  const [inputType, setInputType] = useState("amount"); // "quantity" or "amount"
  const [showGridlines, setShowGridlines] = useState(true); // New state for gridlines toggle
  const [portfolio, setPortfolio] = useState(null); // Add portfolio state
  const chartContainerRef = useRef();
  const chartInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Filter function to exclude USDT
  const filterOutUSDT = useCallback((tokens) => {
    return tokens.filter(asset => asset.symbol !== 'USDT');
  }, []);

  // Function to get star rating based on balance
  const getStarRating = useCallback((balance) => {
    if (balance >= 5000) return 5;
    else if (balance >= 1001) return 4;
    else if (balance >= 501) return 3;
    else if (balance >= 201) return 2;
    else return 1;
  }, []);

  // Function to check if user can trade (2 stars or more)
  const canTrade = useCallback(() => {
    if (!portfolio) return false;
    const balance = Number(portfolio.balance_usd || 0);
    return getStarRating(balance) >= 2;
  }, [portfolio, getStarRating]);

  // Function to get amount needed for 2 stars
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

  // Fetch portfolio data
  const fetchPortfolio = useCallback(async () => {
    try {
      // Remove setPortfolioLoading(true);
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
    // Remove setPortfolioLoading(false);
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
      // Only allow selection if the token exists and is not USDT
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
      
      // Filter out USDT from the assets list
      const filteredAssetList = filterOutUSDT(assetList);
      setAssets(filteredAssetList);

      if (filteredAssetList.length > 0 && !searchParams.get('token')) {
        setSelectedAsset(filteredAssetList[0].symbol);
        fetchCandlestickData(filteredAssetList[0].symbol, interval);
      }
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
    setTradeError(null); // Clear trade error when asset changes
    if (symbol) {
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

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    // Clear trade error when user changes amount
    if (tradeError) {
      setTradeError(null);
    }

    // Check for minimum amounts and set error if below threshold
    if (value && !isNaN(parseFloat(value))) {
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

  // New function to toggle gridlines
  const toggleGridlines = () => {
    setShowGridlines(!showGridlines);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.applyOptions({
        grid: {
          vertLines: { 
            color: showGridlines ? 'transparent' : 'rgba(42, 46, 57, 0.6)',
            style: 0,
            visible: !showGridlines
          },
          horzLines: { 
            color: showGridlines ? 'transparent' : 'rgba(42, 46, 57, 0.6)',
            style: 0,
            visible: !showGridlines
          }
        }
      });
    }
  };

  const handleTrade = async (type) => {
    setTradeError(null);

    // Check if user can trade (star rating restriction) - ONLY for BUY trades
    if (type === "buy" && !canTrade()) {
      const amountNeeded = getAmountForTwoStars();
      setTradeError(`You need at least 2 stars to buy. Add $${amountNeeded.toFixed(2)} to your wallet to unlock buying.`);
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

    // Check minimum amounts for buy trades ONLY
    if (type === "buy") {
      if (inputType === "amount") {
        // For amount type: check if entered amount is at least $201
        if (amountValue < 201) {
          setTradeError("Minimum amount is $201");
          return;
        }
      } else if (inputType === "quantity") {
        // For quantity type: calculate total cost and check if it's at least $201
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

      // Add the appropriate field based on input type
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
        alert(`${type.toUpperCase()} order successful: ${response.data.message}`);
        setAmount("");
        fetchCandlestickData(selectedAsset, interval);
        // Refresh portfolio after successful trade
        fetchPortfolio();
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

  const cleanupChart = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }
    candleSeriesRef.current = null;
  };

  const handleChartResize = () => {
    if (chartInstanceRef.current && chartContainerRef.current) {
      const { clientWidth, clientHeight } = chartContainerRef.current;
      chartInstanceRef.current.applyOptions({ 
        width: clientWidth,
        height: clientHeight 
      });
      chartInstanceRef.current.timeScale().fitContent();
    }
  };

  const getTickSize = (price) => {
    if (price < 0.00001) return 0.000001;
    if (price < 0.0001) return 0.00001;
    if (price < 0.001) return 0.0001;
    if (price < 0.01) return 0.001;
    if (price < 0.1) return 0.01;
    if (price < 1) return 0.1;
    if (price < 10) return 0.01;
    if (price < 100) return 0.1;
    return 1;
  };

  const getPrecision = (price) => {
    if (price < 0.00001) return 8;
    if (price < 0.0001) return 7;
    if (price < 0.001) return 6;
    if (price < 0.01) return 5;
    if (price < 0.1) return 4;
    if (price < 1) return 3;
    if (price < 10) return 2;
    return 2;
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
    
    // Improved price range calculation
    const priceRange = maxPrice - minPrice;
    const padding = Math.max(priceRange * 0.05, maxPrice * 0.001); // 5% of range or 0.1% of max price

    const chart = createChart(container, {
      width: width,
      height: height,
      layout: {
        background: { color: "#12151C" },
        textColor: "#D9D9D9",
        fontSize: 12
      },
      // Enhanced gridlines configuration
      grid: {
        vertLines: { 
          color: showGridlines ? 'rgba(42, 46, 57, 0.6)' : 'transparent',
          style: 0, // Solid line
          visible: showGridlines
        },
        horzLines: { 
          color: showGridlines ? 'rgba(42, 46, 57, 0.6)' : 'transparent',
          style: 0, // Solid line
          visible: showGridlines
        }
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#758696",
          width: 1,
          style: 1,
          labelBackgroundColor: "#1E2530"
        },
        horzLine: {
          color: "#758696",
          width: 1,
          style: 1,
          labelBackgroundColor: "#1E2530"
        }
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "rgba(42, 46, 57, 0.8)",
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
        borderColor: "rgba(42, 46, 57, 0.8)",
        scaleMargins: {
          top: 0.05,
          bottom: 0.05
        },
        autoScale: true,
        mode: 0, // Normal mode instead of percentage
        alignLabels: true,
        borderVisible: true,
        ticksVisible: true,
        entireTextOnly: false,
        visible: true,
        // Force minimum and maximum visible range
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
      upColor: '#4CAF50',
      downColor: '#FF5252',
      borderUpColor: '#4CAF50',
      borderDownColor: '#FF5252',
      wickUpColor: '#4CAF50',
      wickDownColor: '#FF5252',
      priceFormat: {
        type: 'price',
        precision: getPrecision(maxPrice),
        minMove: getTickSize(maxPrice)
      },
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineWidth: 1,
      priceLineColor: '#4CAF50',
      priceLineStyle: 2
    });

    candleSeriesRef.current = candleSeries;

    // Ensure proper data formatting and sorting
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
      .sort((a, b) => a.time - b.time); // Ensure chronological order

    candleSeries.setData(formattedData);

    // Set visible range to show recent data
    if (formattedData.length > 0) {
      const startIndex = Math.max(0, formattedData.length - 50); // Show last 50 candles
      const timeRange = {
        from: formattedData[startIndex].time,
        to: formattedData[formattedData.length - 1].time
      };
      
      // Small delay to ensure chart is rendered
      setTimeout(() => {
        chart.timeScale().setVisibleRange(timeRange);
        
        // Set price range with padding
        chart.priceScale('right').applyOptions({
          scaleMargins: {
            top: 0.1,
            bottom: 0.1
          }
        });
      }, 100);
    }

    // Custom autoscale to ensure proper Y-axis scaling
    candleSeries.applyOptions({
      autoscaleInfoProvider: () => {
        // Get visible data range
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
        
        // Filter data for visible range
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

    window.addEventListener('resize', handleChartResize);

    return () => {
      window.removeEventListener('resize', handleChartResize);
      cleanupChart();
    };
  }, [candlestickData, showGridlines]); // Added showGridlines to dependencies

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

  useEffect(() => {
    fetchAssets();
    fetchPortfolio(); // Fetch portfolio on component mount
  }, [fetchAssets, fetchPortfolio]);

  const selectedAssetObj = assets.find(asset => asset.symbol === selectedAsset);

  return (
    <div className="trade-container">
      <div className="trade-header">
        <h1>MARKET</h1>
        <p className="subtitle">Live market data and trading platform</p>
      </div>
      
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
                <label htmlFor="interval-select">Interval:</label>
                <select
                  id="interval-select"
                  value={interval}
                  onChange={handleIntervalChange}
                  disabled={loading}
                >
                  {INTERVAL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* New gridlines toggle button */}
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
                    ${parseFloat(selectedAssetObj.price_usd).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 5
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="chart-container">
              <div ref={chartContainerRef} className="candlestick-chart">
                {loading && (
                  <div className="chart-loading">
                    <div className="loading-spinner"></div>
                    <div>Loading chart data...</div>
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
                  {/* Input type selector - Updated to clickable text only */}
                  <div className="input-type-selector">
                    <div className="clickable-text-group">
                      <span
                        className={`clickable-text ${inputType === "amount" ? "active" : ""}`}
                        onClick={() => setInputType("amount")}
                      >
                        Amount
                      </span>
                      <span
                        className={`clickable-text ${inputType === "quantity" ? "active" : ""}`}
                        onClick={() => setInputType("quantity")}
                      >
                        Quantity
                      </span>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="trade-amount">
                      {inputType === "amount" ? "Amount ($)" : "Quantity"}
                    </label>
                    <input
                      id="trade-amount"
                      type="number"
                      placeholder={inputType === "amount" ? "Enter dollar amount..." : "Enter quantity..."}
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
                  
                  {/* Display conversion info */}
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
                    <button 
                      className="buy-btn" 
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
                    <button 
                      className="sell-btn" 
                      onClick={() => handleTrade("sell")}
                      disabled={loading || !selectedAsset || !amount}
                    >
                      {loading ? (
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