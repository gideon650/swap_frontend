import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; // ADD THIS IMPORT
import BEP20QR from '../assets/images/BEP20.png';
import TRC20QR from '../assets/images/TRC20.png';
import SOLQR from '../assets/images/SOL.png';
import ERC20QR from '../assets/images/ERC20.png';
import WithdrawalNotificationBadge from './WithdrawalNotificationBadge';
import DepositNotificationBadge from './DepositNotificationBadge';
import "./Wallet.css";

const staticMerchants = [
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
  const routeLocation = useLocation(); // ADD THIS LINE
  
  // State variables
  const [tab, setTab] = useState("deposit");
  const [depositMethod, setDepositMethod] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [depositCryptoType, setDepositCryptoType] = useState("");
  const [message, setMessage] = useState("");
  const [network, setNetwork] = useState("");
  const [chain, setChain] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [trades, setTrades] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState("");
  const [showBuyTrades, setShowBuyTrades] = useState(true);
  const [showSellTrades, setShowSellTrades] = useState(true);
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bybitEmail, setBybitEmail] = useState("");
  const [internalWalletId, setInternalWalletId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [usdToNgn, setUsdToNgn] = useState(1500);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBankNotAvailable, setShowBankNotAvailable] = useState(false);
  const [showDeposits, setShowDeposits] = useState(true);
  const [showWithdrawals, setShowWithdrawals] = useState(true);
  const [amountError, setAmountError] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState(null);
  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [merchantError, setMerchantError] = useState("");
  const [showMerchantList, setShowMerchantList] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  // Initial merchants list
  const [merchants, setMerchants] = useState([]);

  
  const MINIMUM_AMOUNT = 3;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Network configurations
  const networkAddresses = {
    BSC: "0xBE64FcDFb202BddFFcfB0d3eFFAbD2E87C6680B9",
    TRC20: "TEHiejHxpS6gogLfbcQYy5Bew8qUy3DYt8",
    SOL: "9QNKBSSxKK583F7dW2wezzfA6zWQciuSMDaQctc1pSKY",
    ERC20: "0xBE64FcDFb202BddFFcfB0d3eFFAbD2E87C6680B9"
  };

  const networkQRCodes = {
    BSC: BEP20QR,
    TRC20: TRC20QR,
    SOL: SOLQR,
    ERC20: ERC20QR
  };

  const bybitWalletEmail = "395552798";

  // Handle URL tab parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(routeLocation.search);
    const tabParam = searchParams.get('tab');
    
    console.log('URL tab parameter:', tabParam);
    
    if (tabParam) {
      if (tabParam === 'referral') {
        setTab('referral');
      } else if (tabParam === 'deposit') {
        setTab('deposit');
      } else if (tabParam === 'withdraw') {
        setTab('withdraw');
      } else if (tabParam === 'history') {
        setTab('history');
      }
    }
  }, [routeLocation.search]);

  // Fetch user balance, transactions, and referral info on component mount
  useEffect(() => {
    fetchAllUserData();
  }, []);
  
  const fetchAllUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };

      // Fetch user balance and referral code
      const portfolioResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/portfolio/`, 
          config
      );
      setUserBalance(portfolioResponse.data.balance_usd);
      
      // Add specific referral code API call
      const referralResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/referral-code/`, 
          config
      );
      
      // Update both referral code and stats
      if (referralResponse.data) {
          setReferralCode(referralResponse.data.referral_code);
          setReferralStats(referralResponse.data.stats);
      }
    
      // Fetch transactions from the new endpoint
      const transactionsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions/`, config);

      // Normalize trades data
      const trades = (transactionsResponse.data.trades || []).map(tx => ({
          id: tx.id,
          trade_type: tx.trade_type,
          quantity: tx.quantity,
          asset__symbol: tx.asset__symbol,
          status: "COMPLETED",
          timestamp: tx.timestamp,
      }));

      // Normalize deposits data
      const deposits = (transactionsResponse.data.deposits || []).map(tx => ({
          id: tx.id,
          type: "Deposit",
          amount: tx.amount,
          method: tx.method,
          status: tx.status,
          created_at: tx.created_at || tx.timestamp,
      }));

      // Normalize and format withdrawals data with proper method display
      const withdrawals = (transactionsResponse.data.withdrawals || []).map(tx => {
          let displayMethod = tx.display_method || tx.method;
          let recipientDetails = tx.recipient_details || tx.to_address;

          // Ensure we have properly formatted information for withdrawals if the backend didn't provide it
          if (!tx.display_method) {
              // Format display based on method
              switch(tx.method) {
                  case 'INTERNAL':
                      displayMethod = 'Internal Transfer';
                      recipientDetails = `Account: ${tx.to_address}`;
                      break;
                  case 'BANK':
                      displayMethod = 'Bank Transfer';
                      if (tx.to_address) {
                          try {
                              const bankDetails = JSON.parse(tx.to_address);
                              recipientDetails = `${bankDetails.bank_name} - ${bankDetails.account_number}`;
                          } catch {
                              recipientDetails = tx.to_address;
                          }
                      }
                      break;
                  case 'BYBIT':
                      displayMethod = 'Bybit';
                      recipientDetails = `UID: ${tx.to_address}`;
                      break;
                  case 'ON_CHAIN':
                      displayMethod = 'On-Chain';
                      recipientDetails = tx.chain ? `${tx.to_address} (${tx.chain})` : tx.to_address;
                      break;
                  default:
                      // No action needed for default case
                      break;
              }
          }

          return {
              id: tx.id,
              type: "Withdrawal",
              amount: tx.amount,
              method: tx.method,
              display_method: displayMethod,
              recipient_details: recipientDetails,
              status: tx.status,
              created_at: tx.created_at || tx.timestamp,
              chain: tx.chain,
              to_address: tx.to_address
          };
      });
    
      setTrades(trades);
      setDeposits(deposits);
      setWithdrawals(withdrawals);
      setMessage("");
    } catch (error) {
      console.error("Transactions fetch error:", error);
      setMessage("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };
 
  // Add a function to fetch merchant balances
  const fetchMerchantBalances = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/merchant-balances/`,
        { 
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update merchants with their current balances (only real merchants, not static ones)
      setMerchants(prevMerchants => 
        prevMerchants.map(merchant => {
          if (merchant.isStatic) return merchant; // Don't update static merchants
          const balanceInfo = response.data.find(m => m.id === merchant.id);
          return {
            ...merchant,
            currentBalance: balanceInfo ? balanceInfo.balance : 0
          };
        })
      );
    } catch (error) {
      console.error('Error fetching merchant balances:', error);
    }
  };

  // Updated useEffect to include static merchants
  // Fixed useEffect for fetching merchants
useEffect(() => {
  const fetchAllMerchantData = async () => {
    try {
      setMerchantsLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch real merchants from API first
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/approved-merchants/`,
        { 
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const approvedMerchants = response.data.map(merchant => ({
        id: merchant.id,
        username: merchant.name,
        bankName: merchant.bank_name,
        accountNumber: merchant.account_number,
        starRating: merchant.star_rating || 5,
        verified: true,
        isStatic: false // Real merchants are not static
      }));
      
      // Combine static merchants with real merchants
      // Put real merchants first, then static merchants
      const combinedMerchants = [...approvedMerchants, ...staticMerchants];
      
      setMerchants(combinedMerchants);

      // After setting merchants, fetch balances for real merchants only
      if (approvedMerchants.length > 0) {
        await fetchMerchantBalances();
      }
    } catch (error) {
      console.error('Error fetching merchants:', error);
      
      // If API fails, still show static merchants
      setMerchants(staticMerchants);
      
      setMerchantError(
        error.response?.data?.error || 
        'Failed to load merchants from server. Showing sample merchants.'
      );
    } finally {
      setMerchantsLoading(false);
    }
  };
  
  fetchAllMerchantData();
}, []);

  // Updated function to check if merchant is eligible
  const isMerchantEligible = (merchant, amount) => {
    // Static merchants are never eligible
    if (merchant.isStatic) return false;
    
    if (!merchant.currentBalance) return true; // If we don't have balance data, assume eligible
    
    // Check if merchant has less than 4-star rating equivalent balance
    if (merchant.starRating < 4) return false;
    
    const requiredBalance = parseFloat(amount) * 1.1; // 10% buffer
    return merchant.currentBalance >= requiredBalance;
  };
  
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn");
        if (res.data && res.data.tether && res.data.tether.ngn) {
          setUsdToNgn(res.data.tether.ngn);
        } else {
          setMessage("Exchange rate data not available");
        }
      } catch (err) {
        setMessage("Failed to fetch exchange rate. Please try again later.");
        console.error("Exchange rate fetch error:", err);
      }
    };
    fetchRate();
  }, []);
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  };

  // Method mapping for API format
  const mapMethodToApiFormat = (method) => {
    const methodMapping = {
      'naira': 'BANK_TRANSFER',
      'crypto': depositCryptoType === "viaBuybit" ? 'BYBIT' : 'ON_CHAIN',
      'usdt': 'BYBIT',
      'BYBIT': 'BYBIT',
      'INTERNAL': 'INTERNAL',
      'ON_CHAIN': 'ON_CHAIN',
      'BANK': 'BANK'
    };
    return methodMapping[method] || method;
  };

  const nairaValue =
    amount && usdToNgn
      ? (parseFloat(amount) * usdToNgn).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  const validateForm = () => {
    // Check minimum amount first
    if (amount === "" || parseFloat(amount) < MINIMUM_AMOUNT) {
      setAmountError(true);
      setMessage(`Minimum ${tab === "deposit" ? "deposit" : "withdrawal"} amount is $${MINIMUM_AMOUNT}`);
      return false;
    } else {
      setAmountError(false);
    }
    
    if (tab === "withdraw" && parseFloat(amount) > userBalance) {
      setMessage("Insufficient balance for this withdrawal");
      return false;
    }
    
    if (amount === "" || parseFloat(amount) <= 0) {
      setMessage("Please enter a valid amount");
      return false;
    }
    
    if (tab === "deposit" && depositMethod === "crypto" && transactionId === "") {
      setMessage("Transaction ID is required");
      return false;
    }
    
    // Enhanced validation for withdraw methods
    if (tab === "withdraw") {
      switch (withdrawMethod) {
        case "naira":
        case "BANK":
          if (bankAccount === "" || bankName === "" || accountName === "" || !selectedMerchant) {
            setMessage("All bank details and merchant selection are required");
            return false;
          }
          break;
        case "usdt":
        case "BYBIT":
          if (bybitEmail === "") {
            setMessage("Bybit email is required");
            return false;
          }
          break;
        case "INTERNAL":
          if (internalWalletId === "") {
            setMessage("Internal wallet ID is required");
            return false;
          }
          break;
        case "ON_CHAIN":
          if (walletAddress === "" || chain === "") {
            setMessage("Wallet address and chain selection are required");
            return false;
          }
          break;
        default:
          setMessage("Please select a withdrawal method");
          return false;
      }
    }
    
    return true;
  };

  const submitTransaction = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Token ${token}` } };

      let requestData = {};
      let url = "";

      if (tab === "deposit") {
        url = `${API_BASE_URL}/deposit/`;
        if (depositMethod === "crypto") {
          requestData = {
            method: mapMethodToApiFormat(depositMethod),
            crypto_type: depositCryptoType,
            transaction_id: transactionId,
            amount: parseFloat(amount),
            ...(depositCryptoType === "onchain" && { network }),
          };
        } else {
          // BANK_TRANSFER (naira) deposit
          if (!selectedMerchant) {
            setMessage("Please select a merchant for bank transfer");
            return;
          }
          
          requestData = {
            method: mapMethodToApiFormat(depositMethod),
            transaction_id: transactionId,
            amount: parseFloat(amount),
            merchant_id: selectedMerchant.id // Include merchant_id for BANK_TRANSFER
          };
        }
      } else {
        url = `${API_BASE_URL}/withdraw/`;
        const apiWithdrawMethod = mapMethodToApiFormat(withdrawMethod);
        requestData = {
          method: apiWithdrawMethod,
          amount: parseFloat(amount)
        };
        
        switch (apiWithdrawMethod) {
          case "BANK":
            if (!selectedMerchant) {
              setMessage("Please select a merchant for bank withdrawal");
              return;
            }
            requestData.account_name = accountName;
            requestData.account_number = bankAccount;
            requestData.bank_name = bankName;
            requestData.merchant_id = selectedMerchant.id; // Use the original merchant ID
            break;
          case "BYBIT":
            requestData.email = bybitEmail;
            break;
          case "INTERNAL":
            requestData.account_number = internalWalletId;
            break;
          case "ON_CHAIN":
            requestData.wallet_address = walletAddress;
            requestData.chain = chain;
            break;
          default:
            // No action needed for default case
            break;
        }
      }

      const response = await axios.post(url, requestData, config);
    
      if (response.data.status === "success") {
        setMessage(response.data.message || "Request submitted successfully!");
      } else {
        setMessage(response.data.message || response.data.error || "Request could not be processed");
      }
    } catch (error) {
      let errorMessage = "Something went wrong";
      
      if (error.response) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.status) {
          errorMessage = errorData.status;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    // Check if amount is less than minimum
    if (value && parseFloat(value) < MINIMUM_AMOUNT) {
      setAmountError(true);
    } else {
      setAmountError(false);
    }
  };

  const handleDepositMethodChange = (method) => {
    setDepositMethod(method);
    setDepositCryptoType("");
    setNetwork("");
    setShowQRCode(false);
  };
  
  const handleWithdrawMethodChange = (method) => {
    setWithdrawMethod(method);
    setAmount("");
    setBankAccount("");
    setBankName("");
    setAccountName("");
    setBybitEmail("");
    setInternalWalletId("");
    setWalletAddress("");
    setChain("");
    setAmountError(false);
  };

  const handleNetworkSelect = (selectedNetwork) => {
    setNetwork(selectedNetwork);
    setShowQRCode(true);
  };

  const handleBackToNetworks = () => {
    setShowQRCode(false);
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

  // Bank withdrawal popup
  const renderBankNotAvailablePopup = () => (
    showBankNotAvailable && (
      <div className="wallet-popup-overlay">
        <div className="wallet-popup">
          <h3>Notice</h3>
          <p>This is not available in your country.</p>
          <button className="submit-button" onClick={() => setShowBankNotAvailable(false)}>OK</button>
        </div>
      </div>
    )
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
                // Reset form fields only on success
                setTransactionId("");
                setAmount("");
                setBankAccount("");
                setBankName("");
                setAccountName("");
                setBybitEmail("");
                setInternalWalletId("");
                setWalletAddress("");
                setChain("");
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

  const renderQRCodeView = () => {
    const currentAddress = networkAddresses[network];
    const currentQRCode = networkQRCodes[network];
    
    return (
      <div className="qrcode-deposit-view">
        <div className="qrcode-header">
          <button onClick={handleBackToNetworks} className="back-button">
            ← Back
          </button>
          <div className="network-info">
            Network: <span className="network-name">{network}</span>
          </div>
        </div>
        
        <div className="qrcode-container">
          <div className="qrcode-image">
            <img 
              src={currentQRCode}
              alt={`${network} QR Code`}
              style={{
                width: '200px',
                height: '200px',
                display: 'block',
                margin: '0 auto',
                borderRadius: '8px',
                border: '2px solid #800080'
              }}
            />
          </div>
        </div>
        
        <div className="wallet-address-container">
          <h3>Wallet Address</h3>
          <div className="copy-address-box">
            <span className="address-text">{currentAddress}</span>
            <button 
              onClick={() => copyToClipboard(currentAddress)}
              className="copy-address-button"
            >
              Copy Address
            </button>
          </div>
        </div>
        
        <div className="withdraw-field-group">
          <h3>Confirm Your Deposit</h3>
          <div className="form-group">
            <label>Amount (USDT)</label>
            <input 
              type="number" 
              placeholder="Enter deposit amount" 
              value={amount} 
              onChange={handleAmountChange} 
            />
            {amountError && (
              <div className="amount-error-message">
                Minimum deposit amount is ${MINIMUM_AMOUNT}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Transaction hash</label>
            <input 
              type="text" 
              placeholder="Enter transaction hash" 
              value={transactionId} 
              onChange={(e) => setTransactionId(e.target.value)} 
            />
          </div>
          <button className="submit-button" onClick={submitTransaction} disabled={loading || amountError}>
            {loading ? "Processing..." : "Confirm Deposit"}
          </button>
        </div>
        
        <div className="deposit-warning">
          <p>Please make sure that your transaction id is correct. Otherwise, your deposited funds will not be added to your available balance — nor will it be refunded.</p>
          <p><strong>Important:</strong> After making your deposit, you MUST submit your transaction hash above for verification.</p>
        </div>
        
      </div>
    );
  };


// Complete renderDepositInterface function
const renderDepositInterface = () => {
  // Calculate total amount with 3.5% fee
  const calculateTotalWithFee = (amount) => {
    if (!amount || amount === "" || parseFloat(amount) <= 0) return "0";
    const baseAmount = parseFloat(amount);
    const fee = baseAmount * 0.035; // 3.5% fee
    return (baseAmount + fee).toFixed(2);
  };

  const totalWithFee = amount ? calculateTotalWithFee(amount) : "0";

  // Filter merchants based on search term
  const filteredMerchants = merchants.filter(merchant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      merchant.username.toLowerCase().includes(searchLower) ||
      merchant.bankName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="deposit-section">       
      <div className="selection-container">
        <div className="deposit-method-buttons">
          <button 
            onClick={() => handleDepositMethodChange("naira")} 
            className={depositMethod === "naira" ? "active-button" : ""}
          >
            Deposit p2p
          </button>
          <button 
            onClick={() => handleDepositMethodChange("crypto")} 
            className={depositMethod === "crypto" ? "active-button" : ""}
          >
            Deposit Crypto
          </button>
        </div>
      </div>

      {depositMethod === "crypto" && (
        <div className="crypto-deposit-options">
          <h8>Deposit crypto</h8>
          <div className="method-buttons">
            <button 
              onClick={() => setDepositCryptoType("viaBuybit")}
              className={depositCryptoType === "viaBuybit" ? "active-button" : ""}>
              Via Bybit
            </button>
            <button 
              onClick={() => setDepositCryptoType("onchain")}
              className={depositCryptoType === "onchain" ? "active-button" : ""}>
              On-chain Deposit
            </button>
          </div>
        </div>
      )}

      {depositMethod === "crypto" && depositCryptoType === "viaBuybit" && (
        <div className="deposit-form">
          <div className="form-group">
            <p>USDT</p>
            <div className="copy-box">
              {bybitWalletEmail} <button onClick={() => copyToClipboard(bybitWalletEmail)}>Copy</button>
            </div>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input 
              type="number" 
              placeholder="Enter quantity (USDT)" 
              value={amount} 
              onChange={handleAmountChange} 
            />
            {amountError && (
              <div className="amount-error-message">
                Minimum deposit amount is ${MINIMUM_AMOUNT}
              </div>
            )}
            {amount && !amountError && (
              <div style={{ marginTop: 8, color: "#008000" }}>
                ≈ ₦{nairaValue} NGN
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Transaction hash</label>
            <input 
              type="text" 
              placeholder="Enter transaction hash" 
              value={transactionId} 
              onChange={(e) => setTransactionId(e.target.value)} 
            />
          </div>
          <button className="submit-button" onClick={submitTransaction} disabled={loading || amountError}>
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      )}

      {depositMethod === "crypto" && depositCryptoType === "onchain" && !showQRCode && (
        <div className="deposit-form">
          <div className="form-group">
            <label>Amount (USDT)</label>
            <input 
              type="number" 
              placeholder="Enter deposit amount" 
              value={amount} 
              onChange={handleAmountChange} 
            />
            {amountError && (
              <div className="amount-error-message">
                Minimum deposit amount is ${MINIMUM_AMOUNT}
              </div>
            )}
            {amount && !amountError && (
              <div style={{ marginTop: 8, color: "#008000" }}>
                ≈ ₦{nairaValue} NGN
              </div>
            )}
          </div>
          <div className="form-group">
            <label>USDT</label>
            <button 
              className="full-width-button" 
              onClick={() => setNetwork("select")}
            >
              Select Network
            </button>
          </div>
          {network === "select" && (
            <>
              <div className="form-group">
                <label>Network Options</label>
                <div className="method-buttons">
                  <button onClick={() => handleNetworkSelect("TRC20")}>TRC20</button>
                  <button onClick={() => handleNetworkSelect("ERC20")}>ERC20</button>
                  <button onClick={() => handleNetworkSelect("BSC")}>BEP20</button>
                  <button onClick={() => handleNetworkSelect("SOL")}>SOL</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {depositMethod === "crypto" && depositCryptoType === "onchain" && showQRCode && (
        renderQRCodeView()
      )}

      {depositMethod === "naira" && (
        <div className="deposit-form">
          <div className="form-group">
            <label>Amount (USD)</label>
            <input 
              type="number" 
              placeholder="Enter deposit amount" 
              value={amount} 
              onChange={handleAmountChange} 
            />
            {amountError && (
              <div className="amount-error-message">
                Minimum deposit amount is ${MINIMUM_AMOUNT}
              </div>
            )}
            {amount && !amountError && (
              <div style={{ marginTop: 8, color: "#008000" }}>
                Total to pay
                ≈ ₦{(parseFloat(totalWithFee) * usdToNgn).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} NGN
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Select Merchant</label>
            <button 
              className="merchant-select-button"
              onClick={() => setShowMerchantList(!showMerchantList)}
            >
              {selectedMerchant ? selectedMerchant.username : 'Select merchant available to you'}
            </button>
            
            {showMerchantList && (
              <div className="merchant-list-container">
                {merchantsLoading ? (
                  <div className="loading-message">
                    <div className="spinner"></div>
                    <p>Loading merchants...</p>
                  </div>
                ) : merchantError ? (
                  <div className="error-message">
                    {merchantError}
                  </div>
                ) : (
                  <>
                    <div className="merchant-search-container">
                      <input
                        type="text"
                        placeholder="Search by username or bank name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="merchant-search-input"
                        style={{
                          width: '100%',
                          padding: '10px',
                          marginBottom: '10px',
                          backgroundColor: '#000',
                          color: '#fff',
                          border: '1px solid #800080',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <table className="merchant-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Bank Name</th>
                          <th>Level</th>
                          <th>Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMerchants.map(merchant => (
                          <tr 
                            key={merchant.id}
                            onClick={() => {
                              // Don't allow clicking on static merchants
                              if (merchant.isStatic) {
                                setMerchantError('This merchant is currently unavailable');
                                return;
                              }
                              
                              if (!amount) {
                                setMerchantError('Please enter amount first');
                                return;
                              }
                              
                              if (!isMerchantEligible(merchant, amount)) {
                                setMerchantError('This merchant is currently unavailable');
                                return;
                              }
                              
                              setSelectedMerchant(merchant);
                              setShowMerchantList(false);
                              setMerchantError('');
                              setSearchTerm('');
                            }}
                            className={`${selectedMerchant?.id === merchant.id ? 'selected' : ''} ${
                              merchant.isStatic || !isMerchantEligible(merchant, amount || 0) || merchant.starRating < 4 ? 'disabled-merchant' : ''
                            }`}
                            style={{
                              opacity: merchant.isStatic || !isMerchantEligible(merchant, amount || 0) || merchant.starRating < 4 ? 0.3 : 1,
                              cursor: merchant.isStatic || !isMerchantEligible(merchant, amount || 0) || merchant.starRating < 4 ? 'not-allowed' : 'pointer',
                              backgroundColor: merchant.isStatic ? 'rgba(128,128,128,0.1)' : 'transparent'
                            }}
                          >
                            <td>{merchant.username}</td>
                            <td>{merchant.bankName}</td>
                            <td>{getStarRating(merchant.starRating * 1000)}</td>
                            <td>
                              {merchant.verified && (
                                <span className="verified-icon">✓</span>
                              )}
                              {merchant.isStatic && (
                                <span className="unavailable-icon" title="Currently unavailable">⚫</span>
                              )}
                              {!merchant.isStatic && !isMerchantEligible(merchant, amount || 0) && (
                                <span className="insufficient-balance-icon" title="Insufficient balance">⚠️</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {selectedMerchant && (
              <>
                <div className="selected-merchant-details"
                  style={{
                    background: "rgba(128,0,128,0.10)",
                    borderRadius: "14px",
                    padding: "1.7rem 1.5rem",
                    marginTop: "1rem",
                    border: "1px solid rgba(128,0,128,0.3)"
                  }}
                >
                  <h4 style={{ marginBottom: "1rem", color: "#800080" }}>Merchant Details</h4>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Username:</strong> {selectedMerchant.username}
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Bank Name:</strong> {selectedMerchant.bankName}
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Account Number:</strong> {selectedMerchant.accountNumber}
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Rating:</strong> {getStarRating(selectedMerchant.starRating * 1000)}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(selectedMerchant.accountNumber)}
                    className="copy-button"
                    style={{
                      padding: "0.5rem 1rem", // Smaller padding
                      fontSize: "0.8rem", // Smaller font
                      margin: "0 auto", // Center the button
                      display: "block" // Make it a block element for centering
                    }}
                  >
                    Copy
                  </button>
                </div>

                <div className="form-group">
                  <label>Transaction ID</label>
                  <input 
                    type="text" 
                    placeholder="Bank narration" 
                    value={transactionId} 
                    onChange={(e) => setTransactionId(e.target.value)} 
                  />
                </div>

                <button 
                  className="submit-button" 
                  onClick={submitTransaction} 
                  disabled={loading || amountError || !transactionId}
                >
                  {loading ? "Processing..." : "Submit"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Complete renderWithdrawInterface function
const renderWithdrawInterface = () => {
  const calculateAmountAfterFee = (amount) => {
    if (!amount || amount === "" || parseFloat(amount) <= 0) return {netAmount: 0, fee: 0};
    const baseAmount = parseFloat(amount);
    const fee = baseAmount * 0.05; 
    const netAmount = baseAmount - fee;
    return {netAmount: netAmount.toFixed(2), fee: fee.toFixed(2)};
  };

  const amountAfterFee = amount ? calculateAmountAfterFee(amount) : {netAmount: 0, fee: 0};

  // Filter merchants based on search term
  const filteredMerchants = merchants.filter(merchant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      merchant.username.toLowerCase().includes(searchLower) ||
      merchant.bankName.toLowerCase().includes(searchLower)
    );
  });

  // Dynamic placeholder based on withdrawal method
  const getAmountPlaceholder = () => {
    switch(withdrawMethod) {
      case "INTERNAL":
      case "BANK":
      case "naira":
        return "Enter amount";
      case "BYBIT":
      case "usdt":
      case "ON_CHAIN":
        return "Enter amount (Transaction fee = $1)";
      default:
        return "Enter amount";
    }
  };

  return (
    <div className="withdraw-section">
      <div className="method-buttons">
        <button 
          onClick={() => handleWithdrawMethodChange("INTERNAL")}
          className={withdrawMethod === "INTERNAL" ? "active-button" : ""}>
          Internal Transfer
        </button>
        <button 
          onClick={() => handleWithdrawMethodChange("BYBIT")}
          className={withdrawMethod === "BYBIT" || withdrawMethod === "usdt" ? "active-button" : ""}>
          Bybit UID
        </button>
        <button 
          onClick={() => handleWithdrawMethodChange("ON_CHAIN")}
          className={withdrawMethod === "ON_CHAIN" ? "active-button" : ""}>
          On-Chain Transfer
        </button>
        <button 
          onClick={() => handleWithdrawMethodChange("BANK")}
          className={withdrawMethod === "BANK" || withdrawMethod === "naira" ? "active-button" : ""}>
          p2p
        </button>
      </div>

      {withdrawMethod && (
        <div className="withdraw-form">
          <div className="form-group">
            <label>Amount</label>
            <input 
              type="number" 
              placeholder={getAmountPlaceholder()}
              value={amount} 
              onChange={handleAmountChange} 
            />
            {amountError && (
              <div className="amount-error-message">
                Minimum withdrawal amount is ${MINIMUM_AMOUNT}
              </div>
            )}
            {parseFloat(amount) > userBalance && (
              <p className="error-text">Insufficient balance</p>
            )}
            {amount && !amountError && withdrawMethod === "BANK" && (
              <div style={{ marginTop: 8, color: "#800080", fontSize: "0.9rem" }}>
                <div>You will receive: ${amountAfterFee.netAmount}</div>
              </div>
            )}
          </div>
          
          {(withdrawMethod === "INTERNAL") && (
            <div className="withdraw-field-group" id="internal-fields">
              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  placeholder="Recipient address" 
                  value={internalWalletId}
                  onChange={(e) => setInternalWalletId(e.target.value)} 
                />
              </div>
            </div>
          )}
          
          {(withdrawMethod === "BYBIT" || withdrawMethod === "usdt") && (
            <div className="withdraw-field-group" id="bybit-fields">
              <div className="form-group">
                <label>Bybit UID</label>
                <input 
                  type="email" 
                  placeholder="Bybit UID" 
                  value={bybitEmail}
                  onChange={(e) => setBybitEmail(e.target.value)} 
                />
              </div>
            </div>
          )}
          
          {withdrawMethod === "ON_CHAIN" && (
            <div className="withdraw-field-group" id="onchain-fields">
              <div className="form-group">
                <label>Wallet Address</label>
                <input 
                  type="text" 
                  placeholder="Wallet Address" 
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Chain</label>
                <div className="network-selection-container">
                  {chain ? (
                    <div className="selected-network">
                      <span>Selected: {chain}</span>
                      <button 
                        className="change-network-btn"
                        onClick={() => setChain("")}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="network-grid">
                      {["TRC20", "ERC20", "BEP20", "SOL"].map((network) => (
                        <button
                          key={network}
                          className="network-grid-item"
                          onClick={() => setChain(network)}
                        >
                          {network}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(withdrawMethod === "BANK" || withdrawMethod === "naira") && (
            <div className="withdraw-field-group" id="bank-fields">
              <div className="form-group">
                <label>Select Merchant</label>
                <button 
                  className="merchant-select-button"
                  onClick={() => setShowMerchantList(!showMerchantList)}
                >
                  {selectedMerchant ? selectedMerchant.username : 'Select merchant available to you'}
                </button>
                
                {showMerchantList && (
                  <div className="merchant-list-container">
                    {merchantsLoading ? (
                      <div className="loading-message">
                        <div className="spinner"></div>
                        <p>Loading merchants...</p>
                      </div>
                    ) : merchantError ? (
                      <div className="error-message">
                        {merchantError}
                      </div>
                    ) : (
                      <>
                        <div className="merchant-search-container">
                          <input
                            type="text"
                            placeholder="Search by username or bank name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="merchant-search-input"
                            style={{
                              width: '100%',
                              padding: '10px',
                              marginBottom: '10px',
                              backgroundColor: '#000',
                              color: '#fff',
                              border: '1px solid #800080',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                        <table className="merchant-table">
                          <thead>
                            <tr>
                              <th>Username</th>
                              <th>Bank Name</th>
                              <th>Level</th>
                              <th>Verified</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMerchants.map(merchant => (
                              <tr 
                                key={merchant.id}
                                onClick={() => {
                                  // Don't allow clicking on static merchants
                                  if (merchant.isStatic) {
                                    setMerchantError('This merchant is currently unavailable');
                                    return;
                                  }
                                  
                                  if (!amount) {
                                    setMerchantError('Please enter amount first');
                                    return;
                                  }
                                  
                                  if (!isMerchantEligible(merchant, amount) || merchant.starRating < 4) {
                                    setMerchantError('This merchant is currently unavailable');
                                    return;
                                  }
                                  
                                  setSelectedMerchant(merchant);
                                  setShowMerchantList(false);
                                  setMerchantError('');
                                  setSearchTerm('');
                                }}
                                className={`${selectedMerchant?.id === merchant.id ? 'selected' : ''} ${
                                  merchant.isStatic || !isMerchantEligible(merchant, amount || 0) || merchant.starRating < 4 ? 'disabled-merchant' : ''
                                }`}
                                style={{
                                  opacity: merchant.isStatic || !isMerchantEligible(merchant, amount || 0) || merchant.starRating < 4 ? 0.3 : 1,
                                  cursor: merchant.isStatic || !isMerchantEligible(merchant, amount || 0) || merchant.starRating < 4 ? 'not-allowed' : 'pointer',
                                  backgroundColor: merchant.isStatic ? 'rgba(128,128,128,0.1)' : 'transparent'
                                }}
                              >
                                <td>{merchant.username}</td>
                                <td>{merchant.bankName}</td>
                                <td>{getStarRating(merchant.starRating * 1000)}</td>
                                <td>
                                  {merchant.verified && (
                                    <span className="verified-icon">✓</span>
                                  )}
                                  {merchant.isStatic && (
                                    <span className="unavailable-icon" title="Currently unavailable">⚫</span>
                                  )}
                                  {!merchant.isStatic && !isMerchantEligible(merchant, amount || 0) && (
                                    <span className="insufficient-balance-icon" title="Insufficient balance">⚠️</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Your Account Number</label>
                <input 
                  type="text" 
                  placeholder="Account Number" 
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Your Bank Name</label>
                <input 
                  type="text" 
                  placeholder="Bank Name" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Your Account Name</label>
                <input 
                  type="text" 
                  placeholder="Account Name" 
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)} 
                />
              </div>
              
              <div style={{
                background: "rgba(128,0,128,0.10)",
                borderRadius: "14px",
                padding: "1.7rem 1.2rem",
                margin: "1.2rem 0",
                border: "2px solid #800080",
                color: "white",
                boxShadow: "0 4px 16px rgba(128,0,128,0.10)",
                fontFamily: "inherit",
                textAlign: "center"
              }}>
                <div style={{ marginBottom: "1.1rem", fontWeight: 300, fontSize: "0.8rem", lineHeight: 1.7 }}>
                  1. A 5% fee will be deducted from your withdrawal amount.<br />
                  2. You'll receive the amount after fee deduction.<br />
                  3. The merchant will receive the full amount (including fee).<br />
                  4. Please ensure the payment account details you provide match your <span style={{ color: "#800080" }}>SWAPVIEW</span> account name.<br />
                  5. You'll be matched with a merchant who will send funds to the provided details above.<br />
                  6. In case of discrepancies or if funds aren't received after 24 hours, contact our support immediately.
                </div>
                {amount && !amountError && (
                  <div style={{ marginTop: "1rem", fontWeight: "bold", color: "#800080" }}>
                    <div>Amount entered: ${amount}</div>
                    <div>Fee (5%): ${amountAfterFee.fee}</div>
                    <div>You will receive: ${amountAfterFee.netAmount}</div>
                  </div>
                )}
                <div>
                  {renderStarRating()}
                </div>
              </div>
            </div>
          )}
          
          <button 
            className="submit-button" 
            onClick={submitTransaction} 
            disabled={loading || parseFloat(amount) > userBalance || amountError || (withdrawMethod === "BANK" && !selectedMerchant)}
          >
            {loading ? "Processing..." : "Submit Withdrawal"}
          </button>
        </div>
      )}
    </div>
  );
};
  const renderTradeGroup = (type, trades, show, setShow) => (
    <div className="trade-group">
      <button
        className={`trade-group-toggle ${!show ? 'collapsed' : ''}`}
        onClick={() => setShow(!show)}
      >
        {type} Trades ({trades.length})
      </button>
      {show && trades.length > 0 && (
        <div className="transaction-table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Quantity</th>
                <th>Token</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td>{trade.trade_type}</td>
                  <td>{trade.quantity}</td>
                  <td>{trade.asset__symbol}</td>
                  <td>
                    <span className={`status-badge ${trade.status ? trade.status.toLowerCase() : 'completed'}`}>
                      {trade.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {show && trades.length === 0 && <p>No {type.toLowerCase()} trades found.</p>}
    </div>
  );

  const renderTransactionHistory = () => {
    const buyTrades = trades.filter((trade) => trade.trade_type === "BUY");
    const sellTrades = trades.filter((trade) => trade.trade_type === "SELL");

    // Format date for mobile
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return window.innerWidth <= 767 ? 
        `${date.getDate()}/${date.getMonth()+1}` : 
        date.toLocaleDateString();
    };

    // Format amount for mobile
    const formatAmount = (amount) => {
      return window.innerWidth <= 767 ? 
        `$${parseFloat(amount).toFixed(0)}` : 
        `$${parseFloat(amount).toFixed(2)}`;
    };

    return (
      <div className="transaction-history">
        
        {/* Buy/Sell Trades Section */}
        <div className="trade-section">
          {renderTradeGroup("Buy", buyTrades, showBuyTrades, setShowBuyTrades)}
          {renderTradeGroup("Sell", sellTrades, showSellTrades, setShowSellTrades)}
        </div>

        {/* Deposits Section */}
        <div className="transaction-section">
          <button
            className={`trade-group-toggle ${!showDeposits ? 'collapsed' : ''}`}
            onClick={() => setShowDeposits(!showDeposits)}
          >
            Deposits ({deposits.length})
          </button>
          {showDeposits && deposits.length === 0 ? (
            <p className="no-transactions">No deposits found</p>
          ) : showDeposits && (
            <div className="transaction-table-container">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit.id}>
                      <td>{formatDate(deposit.created_at)}</td>
                      <td>{formatAmount(deposit.amount)}</td>
                      <td>{deposit.method}</td>
                      <td>
                        <span className={`status-badge ${deposit.status.toLowerCase()}`}>
                          {window.innerWidth <= 767 ? 
                            deposit.status.substring(0, 3) : 
                            deposit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawals Section */}
        <div className="transaction-section">
          <button
            className={`trade-group-toggle ${!showWithdrawals ? 'collapsed' : ''}`}
            onClick={() => setShowWithdrawals(!showWithdrawals)}
          >
            Withdrawals ({withdrawals.length})
          </button>
          {showWithdrawals && withdrawals.length === 0 ? (
            <p className="no-transactions">No withdrawals found</p>
          ) : showWithdrawals && (
            <div className="transaction-table-container">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    {window.innerWidth > 767 && <th>Recipient</th>}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td>{formatDate(withdrawal.created_at || withdrawal.timestamp)}</td>
                      <td>{formatAmount(withdrawal.amount)}</td>
                      <td>
                        {window.innerWidth <= 767 ? 
                          (withdrawal.display_method || withdrawal.method).substring(0, 5) : 
                          (withdrawal.display_method || withdrawal.method)}
                      </td>
                      {window.innerWidth > 767 && (
                        <td>
                          {withdrawal.recipient_details || withdrawal.to_address || "N/A"}
                        </td>
                      )}
                      <td>
                        <span className={`status-badge ${withdrawal.status.toLowerCase()}`}>
                          {window.innerWidth <= 767 ? 
                            withdrawal.status.substring(0, 3) : 
                            withdrawal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReferralSystem = () => {
    return (
      <div className="referral-section">
        <div className="referral-info">
          <p>Don't Miss Out - Unlock Your Invite Rewards Now!</p>
          <p>Invite friends and earn 15% of each person's first deposit straight into your wallet!</p>
          {referralCode ? (
            <div className="referral-code-box">
              <p>Your Referral Code:</p>
              <div className="copy-box">
                {referralCode} <button onClick={() => copyToClipboard(referralCode)}>Copy</button>
              </div>
            </div>
          ) : (
            <p>Loading your referral code...</p>
          )}
          {referralStats && (
            <div className="referral-stats">
              <h3>Your Referral Stats</h3>
              <p>Total Referrals: {referralStats.total}</p>
              <p>Funded Referrals: {referralStats.funded}</p>

              {referralStats.funded >= 1 ? (
                <div className="bonus-received">
                  <p className="bonus-message">🎉 You've earned referral bonuses!</p>
                  <p className="bonus-details">
                    Total Bonus Earned: ${referralStats.total_bonus_earned?.toFixed(2) || '0.00'}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#800080', marginTop: '8px' }}>
                    💡 Keep referring more friends to earn more bonuses!
                  </p>
                </div>
              ) : (
                <p className="bonus-pending">
                  Refer friends who make deposits to start earning bonuses!
                </p>
              )}
              
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                background: 'rgba(128,0,128,0.1)', 
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <p><strong>How it works:</strong></p>
                <p>• Share your referral code with friends</p>
                <p>• When they sign up and make their first deposit</p>
                <p>• You instantly earn 15% of their deposit amount</p>
                <p>• Unlimited referrals = unlimited bonuses!</p>
              </div>
            </div>
          )}
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
      
      <div className="wallet-tabs">
        <button
          onClick={() => setTab("deposit")}
          className={tab === "deposit" ? "active-tab" : ""}
          style={{ position: 'relative' }} 
        >
          Deposit
          <DepositNotificationBadge />
        </button>
        <button
          onClick={() => setTab("withdraw")}
          className={tab === "withdraw" ? "active-tab" : ""}
          style={{ position: 'relative' }} 
        >
          Withdraw
          <WithdrawalNotificationBadge />
        </button>
        <button
          onClick={() => setTab("history")}
          className={tab === "history" ? "active-tab" : ""}
        >
          History
        </button>
        <button
          onClick={() => setTab("referral")}
          className={tab === "referral" ? "active-tab" : ""}
        >
          Invite
        </button>
      </div>
      
      {/* Tab content rendering */}
      {tab === "deposit" && renderDepositInterface()}
      {tab === "withdraw" && renderWithdrawInterface()}
      {tab === "history" && renderTransactionHistory()}
      {tab === "referral" && renderReferralSystem()}
      
      {/* Popups */}
      {renderBankNotAvailablePopup()}
      {renderMessagePopup()}
    </div>
  );
};

export default Wallet;