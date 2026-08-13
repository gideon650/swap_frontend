import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaCoins, FaWallet, FaCheckCircle, FaPlusCircle, FaInfoCircle } from 'react-icons/fa';
import './CreateToken.css';

const CreateToken = () => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [userStarRating, setUserStarRating] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkUserEligibility();
    }, []);

    const checkUserEligibility = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/portfolio/`,
                { headers: { Authorization: `Token ${token}` }}
            );
            
            const balance = response.data.balance_usd;
            let stars = 1;
            if (balance >= 5000) stars = 5;
            else if (balance >= 1001) stars = 4;
            else if (balance >= 501) stars = 3;
            else if (balance >= 201) stars = 2;
            
            setUserStarRating(stars);

            // Changed from 5 to 3 stars
            if (stars < 4) {
                setError('You need to be at least a 4-star user to create tokens. Current rating: ' + stars + ' stars');
            }
        } catch (error) {
            setError('Failed to check eligibility');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (userStarRating < 4) {
            setError('You need to be at least a 4-star user to create tokens');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/create-synthetic-asset/`,
                { name, symbol, image_url: imageUrl },
                { headers: { Authorization: `Token ${token}` }}
            );

            if (response.data.status === 'success') {
                navigate('/settings', { 
                    state: { message: 'Token created successfully! Pending admin verification.' }
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create token');
        } finally {
            setLoading(false);
        }
    };

    const renderStarRating = () => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star} 
                        className={`star ${star <= userStarRating ? 'filled' : ''}`}
                    >
                        <FaStar />
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="create-token-container">
            <div className="create-token-header">
                <h1><FaPlusCircle className="header-icon" /> Create Token</h1>
                <div className="rating-info">
                    <p>Your Investor Rating:</p>
                    {renderStarRating()}
                </div>
            </div>

            {error ? (
                <div className="eligibility-container">
                    <div className="error-card">
                        <h2><FaCheckCircle className="error-icon" /> Eligibility Status</h2>
                        <p className="error-message">{error}</p>
                        <div className="requirements">
                            <h3><FaCoins /> Requirements for 3-star rating:</h3>
                            <ul>
                                <li><span className="requirement-badge">$301+</span> Minimum balance</li>
                                <li><span className="requirement-badge">Verified</span> Profile status</li>
                                <li><span className="requirement-badge">Active</span> Trading history</li>
                            </ul>
                        </div>
                        <button onClick={() => navigate('/wallet')} className="action-button deposit-button">
                            <FaWallet /> Deposit Funds
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="create-token-form">
                    <div className="form-group">
                        <label>Token Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., My Awesome Token"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Token Symbol</label>
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            placeholder="e.g., MAT"
                            maxLength={10}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Token Image URL</label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/token-image.png"
                            required
                        />
                    </div>

                    <div className="token-info-card">
                        <h3><FaInfoCircle /> Token Details</h3>
                        <ul>
                            <li>Initial Price: <span>$0.00001</span></li>
                            <li>Initial Supply: <span>1,000,000,000</span></li>
                            <li>Status: <span className="status-pending">Pending Verification</span></li>
                        </ul>
                    </div>

                    <button 
                        type="submit" 
                        className="action-button submit-button" 
                        disabled={loading || userStarRating < 3}
                    >
                        {loading ? 'Creating...' : 'Create Token'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default CreateToken;