import React from "react";
import { useNavigate } from "react-router-dom";
import "./CashbackTerms.css";

const CashbackTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="ct-page">
      <div className="ct-container">
        <button className="ct-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1 className="ct-title">
          <span className="ct-shimmer-text">July Cashback Promotion</span>
        </h1>
        <p className="ct-subtitle">Terms &amp; Conditions</p>

        <section className="ct-section">
          <h2>Promotion Period</h2>
          <ul>
            <li>Promotion runs from 12:00 AM (UTC) July 4, 2026 until 11:59 PM (UTC) July 7, 2026.</li>
            <li>Deposits made outside this period are not eligible.</li>
          </ul>
        </section>

        <section className="ct-section">
          <h2>Eligibility</h2>
          <ul>
            <li>Promotion is open to verified users with active accounts.</li>
            <li>Only one promotional reward per user during the campaign.</li>
            <li>Multiple accounts owned or controlled by the same individual are prohibited.</li>
          </ul>
        </section>

        <section className="ct-section">
          <h2>Cashback Structure</h2>
          <ul>
            <li>Deposit $100–$199.99: Eligible for 10% cashback.</li>
            <li>Deposit $200 or more: Eligible for 20% cashback.</li>
            <li>Cashback is calculated based on the user's net eligible deposit.</li>
          </ul>
        </section>

        <section className="ct-section">
          <h2>Minimum Trading Requirement</h2>
          <p>
            To qualify for cashback, users must complete a minimum trading volume
            equal to 5x their eligible deposit amount through swaps on the platform
            during the promotion period or within 7 days after their qualifying deposit.
          </p>
          <div className="ct-example-box">
            <strong>Example:</strong>
            <ul>
              <li>Deposit $100 → Minimum trading volume: $500</li>
              <li>Deposit $250 → Minimum trading volume: $1,250</li>
            </ul>
          </div>
          <p>
            Deposits that are not accompanied by the required trading volume will not qualify.
          </p>
        </section>

        <section className="ct-section">
          <h2>Net Deposit Requirement</h2>
          <p>Only net deposits qualify.</p>
          <p>Net Deposit = Total Deposits − Total Withdrawals</p>
          <p>
            If a user withdraws any portion of their qualifying deposit before meeting
            the trading requirement, the eligible cashback may be reduced or cancelled.
          </p>
        </section>

        <section className="ct-section">
          <h2>Withdrawal Restriction</h2>
          <p>Users must not withdraw more than 6% of their qualifying deposit until:</p>
          <ul>
            <li>the required trading volume has been completed; and</li>
            <li>cashback has been credited.</li>
          </ul>
          <p>Failure to comply will void eligibility.</p>
        </section>

        <section className="ct-section">
          <h2>Cashback Distribution</h2>
          <ul>
            <li>Cashback will be credited within 7 business days after the campaign ends and after eligibility has been verified.</li>
            <li>Cashback may be paid in USDT or another supported asset determined by the platform.</li>
          </ul>
        </section>

        <section className="ct-section">
          <h2>Anti-Abuse Policy</h2>
          <p>The platform reserves the right to disqualify users who engage in:</p>
          <ul>
            <li>Wash trading.</li>
            <li>Self-trading.</li>
            <li>Circular or artificial trading intended solely to qualify for cashback.</li>
            <li>Multiple account abuse.</li>
            <li>Fraudulent deposits.</li>
            <li>Any activity considered abusive or manipulative.</li>
          </ul>
        </section>

        <section className="ct-section">
          <h2>Right to Audit</h2>
          <p>
            The platform may review any account before issuing rewards. Users may be
            required to provide additional verification.
          </p>
        </section>

        <section className="ct-section">
          <h2>Reward Cap</h2>
          <p>
            Maximum cashback per user is $500 (or another amount determined by the
            platform), regardless of total deposits.
          </p>
        </section>

        <section className="ct-section">
          <h2>Campaign Changes</h2>
          <p>
            The platform reserves the right to modify, suspend, or terminate the
            promotion if abuse, technical issues, or unforeseen circumstances occur.
          </p>
        </section>

        <section className="ct-section">
          <h2>Final Decision</h2>
          <p>
            All decisions regarding eligibility, trading volume calculations, cashback
            amounts, and violations of these terms shall be final.
          </p>
        </section>

        <button className="ct-back-btn ct-back-btn-bottom" onClick={() => navigate(-1)}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CashbackTerms;