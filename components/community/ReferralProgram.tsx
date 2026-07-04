'use client';
/**
 * TKAG-7: Community & Referral Program — ReferralProgram component
 * Allows users to generate a unique referral code, copy it, and view
 * their usage statistics and earned rewards.
 */

import React, { useState, useEffect } from 'react';
import type { Referral, ReferralReward } from '../../types/community';
import {
  generateCode,
  getUserReferralStats,
  getRewards,
} from '../../services/referralService';
import '../../styles/community.css';

interface ReferralProgramProps {
  userId: string;
}

const ReferralProgram: React.FC<ReferralProgramProps> = ({ userId }) => {
  const [code, setCode] = useState<string | null>(null);
  const [stats, setStats] = useState<Referral | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // ── Fetch existing stats (and code) when the component mounts ──────────────
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [data, rewardData] = await Promise.all([
          getUserReferralStats(userId),
          getRewards(userId),
        ]);
        setStats(data);
        setRewards(rewardData);
        if (data.code) setCode(data.code);
      } catch {
        setError('Failed to load referral stats. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  // ── Generate a new referral code ───────────────────────────────────────────
  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const newCode = await generateCode();
      setCode(newCode);
      // Refresh stats so usedCount / rewardsEarned reflect the new code
      const updatedStats = await getUserReferralStats(userId);
      setStats(updatedStats);
    } catch {
      setError('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Copy code to clipboard ─────────────────────────────────────────────────
  const handleCopyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      // Reset the success indicator after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setError('Failed to copy code. Please copy it manually.');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(iso));

  const statusLabel: Record<ReferralReward['status'], string> = {
    pending: 'Pending',
    paid: 'Paid',
    cancelled: 'Cancelled',
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="referral-container">
      <h1 className="referral-heading">Referral Program</h1>
      <p className="referral-subheading">
        Share your unique code with friends. Earn rewards every time someone
        makes their first purchase using your link.
      </p>

      {/* ── Error banner ── */}
      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* ── Code generation / display section ── */}
      <div className="referral-section">
        <h2 className="section-title">Your Referral Code</h2>

        {/* Show skeleton while loading on first mount */}
        {loading && !code && (
          <div className="loading-state" aria-busy="true" aria-label="Loading referral data">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        )}

        {/* Generate button — only shown when no code exists yet */}
        {!code && !loading && (
          <button
            className="btn-primary"
            onClick={handleGenerateCode}
            disabled={loading}
          >
            Generate My Referral Code
          </button>
        )}

        {/* Code display card — shown once a code is available */}
        {code && (
          <div className="code-card">
            <p className="code-label">Your Referral Code</p>
            <div className="code-display">{code}</div>
            <button
              className={`btn-copy ${copySuccess ? 'btn-copy--success' : ''}`}
              onClick={handleCopyCode}
              aria-label="Copy referral code to clipboard"
            >
              {copySuccess ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
        )}
      </div>

      {/* ── Stats section ── */}
      {stats && (
        <div className="referral-section">
          <h2 className="section-title">Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.usedCount}</span>
              <span className="stat-label">Times Used</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{formatCurrency(stats.rewardsEarned)}</span>
              <span className="stat-label">Total Earned</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{formatDate(stats.createdAt)}</span>
              <span className="stat-label">Member Since</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Rewards history section ── */}
      {rewards.length > 0 && (
        <div className="referral-section">
          <h2 className="section-title">Rewards History</h2>
          <div className="rewards-list">
            {rewards.map((reward) => (
              <div key={reward.id} className="reward-item">
                <div className="reward-info">
                  <span className="reward-amount">{formatCurrency(reward.amount)}</span>
                  <span className="reward-date">{formatDate(reward.earnedAt)}</span>
                </div>
                <span className={`reward-status reward-status--${reward.status}`}>
                  {statusLabel[reward.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty rewards state ── */}
      {rewards.length === 0 && stats && (
        <div className="referral-section">
          <div className="empty-state">
            <p className="empty-state__text">
              No rewards yet — share your code to start earning!
            </p>
          </div>
        </div>
      )}

      {/* ── How it works explainer ── */}
      <div className="referral-section referral-how-it-works">
        <h2 className="section-title">How It Works</h2>
        <ol className="how-it-works-list">
          <li className="how-it-works-item">
            <span className="step-number">1</span>
            <div>
              <strong>Generate your code</strong>
              <p>Click the button above to get your unique 8-character referral code.</p>
            </div>
          </li>
          <li className="how-it-works-item">
            <span className="step-number">2</span>
            <div>
              <strong>Share with friends</strong>
              <p>Send your code to friends who love natural skincare.</p>
            </div>
          </li>
          <li className="how-it-works-item">
            <span className="step-number">3</span>
            <div>
              <strong>Earn rewards</strong>
              <p>Receive a reward every time a friend completes their first purchase.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ReferralProgram;