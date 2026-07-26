import React from 'react';
import { GAME_TYPES } from '../data/gameData';
import { GameIcon } from '../components/Icons';

export default function GameTypePage({ game, onSelect }) {
  return (
    <div className="gtp-wrap">
      {/* Game Banner */}
      <div className="gtp-banner">
        <div className="gtp-banner-icon">🎮</div>
        <div>
          <div className="gtp-banner-name">{game?.name || 'Select Game Type'}</div>
          <div className="gtp-banner-sub">Choose your game type below</div>
        </div>
      </div>

      {/* Grid */}
      <div className="gtp-grid">
        {GAME_TYPES.map((gt, i) => (
          <div
            key={gt.id}
            className="gtp-cell anim-in"
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => onSelect(gt)}
          >
            <div className="gtp-icon-wrap">
              <GameIcon name={gt.icon} />
            </div>
            <div className="gtp-label">{gt.label}</div>
            <div className="gtp-win-badge">{gt.win}x</div>
          </div>
        ))}
      </div>

      <style>{`
        .gtp-wrap {
          background: #f0f4ff;
          min-height: 100vh;
          padding-bottom: 80px;
        }

        /* ── BANNER ── */
        .gtp-banner {
          background: linear-gradient(135deg, #1565C0 0%, #1976D2 60%, #1E88E5 100%);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 3px solid #0D47A1;
          box-shadow: 0 2px 12px rgba(21,101,192,0.3);
        }

        .gtp-banner-icon {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }

        .gtp-banner-name {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .gtp-banner-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.75);
          margin-top: 2px;
        }

        /* ── GRID ── */
        .gtp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px;
        }

        /* ── CARD ── */
        .gtp-cell {
          background: #ffffff;
          border-radius: 14px;
          padding: 18px 10px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          border: 2px solid #BBDEFB;
          position: relative;
          overflow: hidden;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
          box-shadow: 0 2px 8px rgba(21,101,192,0.08);
        }

        .gtp-cell:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 24px rgba(21,101,192,0.20);
          border-color: #1976D2;
        }

        .gtp-cell:active {
          transform: scale(0.97);
        }

        /* Blue top accent bar */
        .gtp-cell::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #1565C0, #42A5F5);
          border-radius: 14px 14px 0 0;
        }

        /* ── ICON CIRCLE ── */
        .gtp-icon-wrap {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
          border-radius: 50%;
          border: 2px solid #90CAF9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          transition: transform 0.2s;
        }

        .gtp-cell:hover .gtp-icon-wrap {
          transform: scale(1.12) rotate(-5deg);
        }

        .gtp-icon-wrap svg {
          width: 28px;
          height: 28px;
          fill: #1565C0;
        }

        /* ── LABEL ── */
        .gtp-label {
          font-size: 12px;
          font-weight: 700;
          color: #0D47A1;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          line-height: 1.3;
        }

        /* ── WIN BADGE ── */
        .gtp-win-badge {
          margin-top: 6px;
          background: linear-gradient(135deg, #1565C0, #42A5F5);
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 10px;
          border-radius: 20px;
          letter-spacing: 1px;
        }

        /* ── ANIMATION ── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-in { animation: fadeInUp 0.35s ease both; }
      `}</style>
    </div>
  );
}