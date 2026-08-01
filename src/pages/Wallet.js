import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Wallet.css";

export const staticMerchants = [
  {
    id: 'static-1',
    username: 'TraderMike',
    bankName: 'Opay',
    accountNumber: '7038529174',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-2',
    username: 'JayEx',
    bankName: 'Zenith Bank',
    accountNumber: '2057841963',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-3',
    username: 'CryptoTunde',
    bankName: 'Kuda Bank',
    accountNumber: '1849372658',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-4',
    username: 'SwapBola',
    bankName: 'First Bank',
    accountNumber: '3647258910',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-5',
    username: 'CashChuks',
    bankName: 'PalmPay',
    accountNumber: '8529741630',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-6',
    username: 'TraderEmeka',
    bankName: 'GTBank',
    accountNumber: '0149638527',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-7',
    username: 'CoinFemi',
    bankName: 'Moniepoint',
    accountNumber: '6071482935',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-8',
    username: 'SwiftKenny',
    bankName: 'Access Bank',
    accountNumber: '9528374106',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-9',
    username: 'ProfitSeyi',
    bankName: 'UBA',
    accountNumber: '4736192085',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-10',
    username: 'DollarIfe',
    bankName: 'VBank',
    accountNumber: '2840617359',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-11',
    username: 'TraderKunle',
    bankName: 'Sterling Bank',
    accountNumber: '1593748260',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-12',
    username: 'PaxChinedu',
    bankName: 'Fidelity Bank',
    accountNumber: '7260851493',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-13',
    username: 'CashGbenga',
    bankName: 'Union Bank',
    accountNumber: '8417396205',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-14',
    username: 'TraderUche',
    bankName: 'Wema Bank',
    accountNumber: '5082647391',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-15',
    username: 'CoinSegun',
    bankName: 'Opay',
    accountNumber: '3658471920',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-16',
    username: 'TraderOba',
    bankName: 'FCMB',
    accountNumber: '9174628053',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-17',
    username: 'CryptoIbrahim',
    bankName: 'Polaris Bank',
    accountNumber: '6429375801',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-18',
    username: 'TraderMusty',
    bankName: 'Kuda Bank',
    accountNumber: '2831069547',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-19',
    username: 'TraderJay',
    bankName: 'Stanbic IBTC',
    accountNumber: '7594823016',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-20',
    username: 'CoinBossK',
    bankName: 'PalmPay',
    accountNumber: '1027385649',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-21',
    username: 'CashPlugSam',
    bankName: 'Zenith Bank',
    accountNumber: '4850692713',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-22',
    username: 'SwapDee',
    bankName: 'First Bank',
    accountNumber: '6194738520',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-23',
    username: 'TraderVic',
    bankName: 'Moniepoint',
    accountNumber: '3472805196',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-24',
    username: 'CoinMax',
    bankName: 'GTBank',
    accountNumber: '8096514732',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-25',
    username: 'DollarTee',
    bankName: 'Access Bank',
    accountNumber: '2758439601',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-26',
    username: 'PaxLeo',
    bankName: 'VBank',
    accountNumber: '5631082947',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-27',
    username: 'TraderDan',
    bankName: 'UBA',
    accountNumber: '9417263058',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-28',
    username: 'CashMo',
    bankName: 'Sterling Bank',
    accountNumber: '1205864793',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-29',
    username: 'TraderRay',
    bankName: 'Fidelity Bank',
    accountNumber: '6748291350',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-30',
    username: 'SwapKelz',
    bankName: 'Union Bank',
    accountNumber: '3960517284',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-31',
    username: 'TraderRichie',
    bankName: 'Opay',
    accountNumber: '8273645019',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-32',
    username: 'CoinDuke',
    bankName: 'Wema Bank',
    accountNumber: '5084729163',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-33',
    username: 'TraderChris',
    bankName: 'FCMB',
    accountNumber: '7396158240',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-34',
    username: 'CryptoBen',
    bankName: 'Polaris Bank',
    accountNumber: '1652940387',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-35',
    username: 'P2PJide',
    bankName: 'Kuda Bank',
    accountNumber: '4815327609',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-36',
    username: 'CoinTobi',
    bankName: 'Stanbic IBTC',
    accountNumber: '9027461853',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-37',
    username: 'TraderLex',
    bankName: 'PalmPay',
    accountNumber: '2648051739',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-38',
    username: 'SwapKay',
    bankName: 'Zenith Bank',
    accountNumber: '5179832604',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-39',
    username: 'DollarObi',
    bankName: 'First Bank',
    accountNumber: '8406297153',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-40',
    username: 'PaxTee',
    bankName: 'Moniepoint',
    accountNumber: '3751942068',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-41',
    username: 'TraderDimeji',
    bankName: 'GTBank',
    accountNumber: '6924573801',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-42',
    username: 'CashRemi',
    bankName: 'Access Bank',
    accountNumber: '1487206359',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-43',
    username: 'TraderVal',
    bankName: 'VBank',
    accountNumber: '7063815294',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-44',
    username: 'SwapJay',
    bankName: 'UBA',
    accountNumber: '9530427681',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-45',
    username: 'TraderKing',
    bankName: 'Sterling Bank',
    accountNumber: '2816359047',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-46',
    username: 'P2PLord',
    bankName: 'Fidelity Bank',
    accountNumber: '5249761803',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-47',
    username: 'CoinDon',
    bankName: 'Union Bank',
    accountNumber: '8697320154',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-48',
    username: 'TraderBoss',
    bankName: 'Opay',
    accountNumber: '4026581397',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-49',
    username: 'DollarChief',
    bankName: 'Wema Bank',
    accountNumber: '7153948620',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-50',
    username: 'QueenSwap',
    bankName: 'FCMB',
    accountNumber: '3480652917',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-51',
    username: 'AdaP2P',
    bankName: 'Polaris Bank',
    accountNumber: '9274158063',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-52',
    username: 'CoinMimi',
    bankName: 'Kuda Bank',
    accountNumber: '1865092743',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-53',
    username: 'TraderAmaka',
    bankName: 'Stanbic IBTC',
    accountNumber: '5037814269',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-54',
    username: 'CryptoLola',
    bankName: 'PalmPay',
    accountNumber: '6492037851',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-55',
    username: 'SwapZainab',
    bankName: 'Zenith Bank',
    accountNumber: '8156349720',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-56',
    username: 'TraderBlessing',
    bankName: 'First Bank',
    accountNumber: '2704861395',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-57',
    username: 'P2PJoy',
    bankName: 'Moniepoint',
    accountNumber: '4923578106',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-58',
    username: 'CashNgozi',
    bankName: 'GTBank',
    accountNumber: '7508124639',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-59',
    username: 'CoinChioma',
    bankName: 'Access Bank',
    accountNumber: '3641857902',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-60',
    username: 'TraderHalima',
    bankName: 'VBank',
    accountNumber: '0294637158',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-61',
    username: 'QueenEx',
    bankName: 'UBA',
    accountNumber: '5817029346',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-62',
    username: 'MariamSwap',
    bankName: 'Sterling Bank',
    accountNumber: '9462381507',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-63',
    username: 'TraderPrecious',
    bankName: 'Fidelity Bank',
    accountNumber: '1358726094',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-64',
    username: 'P2PAisha',
    bankName: 'Union Bank',
    accountNumber: '6940572831',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-65',
    username: 'BellaTrader',
    bankName: 'Opay',
    accountNumber: '2075384619',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-66',
    username: 'SwapGeneral',
    bankName: 'Wema Bank',
    accountNumber: '4826193750',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-67',
    username: 'PaxLegend',
    bankName: 'FCMB',
    accountNumber: '7391058426',
    starRating: 4,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-68',
    username: 'TraderPrince',
    bankName: 'Polaris Bank',
    accountNumber: '8603741952',
    starRating: 5,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-69',
    username: 'CashLord',
    bankName: 'Kuda Bank',
    accountNumber: '3459208176',
    starRating: 3,
    verified: true,
    isStatic: true
  },
  {
    id: 'static-70',
    username: 'CoinEmperor',
    bankName: 'Stanbic IBTC',
    accountNumber: '5172069384',
    starRating: 4,
    verified: true,
    isStatic: true
  }
];


const Wallet = () => {
  // State variables
  const [message, setMessage] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch user balance on component mount
  useEffect(() => {
    fetchAllUserData();
  }, []);
  
  const fetchAllUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };

      // Fetch user balance
      const portfolioResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/portfolio/`, 
          config
      );
      setUserBalance(portfolioResponse.data.balance_usd);

      setMessage("");
    } catch (error) {
      console.error("User data fetch error:", error);
      setMessage("Failed to load account data");
    } finally {
      setLoading(false);
    }
  };
 
  const getStarRating = (balance) => {
  let filledStars = 0;
  if (balance >= 5000) filledStars = 5;
  else if (balance >= 1001) filledStars = 4;
  else if (balance >= 501) filledStars = 3;
  else if (balance >= 201) filledStars = 2;
  else filledStars = 1;
  
  const emptyStars = 5 - filledStars;
  
  return (
    <span style={{ color: 'gold' }}>
      {"★".repeat(filledStars) + "☆".repeat(emptyStars)}
    </span>
  );
};

  // Star rating UI
  const renderStarRating = () => (
    <div className="wallet-star-rating" style={{ margin: "10px 0", fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>
      {getStarRating(userBalance)}
    </div>
  );

  // Add this to your component right before the return statement
  const renderMessagePopup = () => {
    if (!message) return null;
    
    // Check if message is an object (like the error response from API)
    let displayMessage = message;
    if (typeof message === 'object') {
      // Handle API error responses
      if (message.message) {
        displayMessage = message.message;
      } else if (message.error) {
        displayMessage = message.error;
      } else {
        displayMessage = JSON.stringify(message);
      }
    }
    
    // Determine if it's an error (red) or success (green)
    const isError = typeof displayMessage === 'string' && (
      displayMessage.toLowerCase().includes('error') || 
      displayMessage.toLowerCase().includes('fail') || 
      displayMessage.toLowerCase().includes('already exists') ||
      displayMessage.toLowerCase().includes('insufficient') ||
      displayMessage.toLowerCase().includes('minimum')
    );
    
    const statusClass = isError ? 'error' : 'success';
    const statusTitle = isError ? 'Error' : 'Success';
    
    return (
      <div className="wallet-popup-overlay">
        <div className={`wallet-popup ${statusClass}`}>
          <h3>{statusTitle}</h3>
          <p>{displayMessage}</p>
          <button 
            className="submit-button" 
            onClick={() => {
              setMessage("");
              if (!isError) {
                fetchAllUserData();
              }
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

return (
    <div className="wallet-container">
      <h1>ASSETS</h1>
      {/* Top Section: Balance, Star Rating */}
      <div className="wallet-balance-top">
        <div className="wallet-balance-amount">
          {parseFloat(userBalance || 0).toFixed(2)} 
          <span style={{ fontSize: "1rem", marginLeft: "4px" }}>USD</span>
        </div>
        <div className="balance-label">Available Balance</div>
      </div>
      <div className="wallet-star-rating">
        {getStarRating(userBalance)}
      </div>

      {/* Invite & Earn now lives on its own page, /invite */}
      <Link to="/invite" className="wallet-invite-link">
        <span>🎁 Invite friends — earn 15% on their first deposit</span>
        <span aria-hidden="true">→</span>
      </Link>
      
      {/* Popups */}
      {renderMessagePopup()}
    </div>
  );
};

export default Wallet;