import React from 'react';

/**
 * CinematicBackground:
 * Ultra-high-performance, 100% lag-free cinematic background.
 * - ZERO expensive CSS filter: blur() computations.
 * - ZERO JavaScript canvas repaint loops.
 * - Uses pure multi-stop radial gradients pre-rasterized by GPU.
 * - Hardware isolated with contain: strict and transform: translate3d(0,0,0).
 */
export default function CinematicBackground({ theme = 'night' }) {
  const isNight = theme === 'night';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        contain: 'strict',
        backgroundColor: isNight ? '#120A18' : '#EFE7DB',
        transition: 'background-color 0.4s ease',
      }}
    >
      {/* Bloom 1: Electric Lavender (Top Left) - Multi-stop gradient with natural softness */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '75vw',
          height: '75vw',
          maxWidth: '900px',
          maxHeight: '900px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at 45% 45%, rgba(168, 117, 255, 0.16) 0%, rgba(168, 117, 255, 0.08) 35%, rgba(168, 117, 255, 0.02) 60%, transparent 72%)'
            : 'radial-gradient(circle at 45% 45%, rgba(128, 81, 214, 0.11) 0%, rgba(128, 81, 214, 0.05) 35%, rgba(128, 81, 214, 0.01) 60%, transparent 72%)',
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          animation: 'cinematicNebulaDrift1 36s ease-in-out infinite alternate',
        }}
      />

      {/* Bloom 2: Cosmic Pink / Deep Wine (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '70vw',
          height: '70vw',
          maxWidth: '850px',
          maxHeight: '850px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at 55% 55%, rgba(228, 107, 168, 0.14) 0%, rgba(228, 107, 168, 0.06) 35%, rgba(228, 107, 168, 0.01) 60%, transparent 72%)'
            : 'radial-gradient(circle at 55% 55%, rgba(201, 90, 138, 0.09) 0%, rgba(201, 90, 138, 0.04) 35%, rgba(201, 90, 138, 0.01) 60%, transparent 72%)',
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          animation: 'cinematicNebulaDrift2 42s ease-in-out infinite alternate',
        }}
      />

      {/* Bloom 3: Celestial Gold Projector Halo (Center-Right) */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '35%',
          width: '55vw',
          height: '55vw',
          maxWidth: '650px',
          maxHeight: '650px',
          borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at center, rgba(231, 196, 106, 0.09) 0%, rgba(231, 196, 106, 0.03) 40%, transparent 68%)'
            : 'radial-gradient(circle at center, rgba(178, 138, 53, 0.06) 0%, rgba(178, 138, 53, 0.02) 40%, transparent 68%)',
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          animation: 'cinematicNebulaDrift3 50s ease-in-out infinite',
        }}
      />

      {/* 35mm Cinema Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isNight
            ? 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(18, 10, 24, 0.65) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(246, 240, 230, 0.45) 100%)',
        }}
      />
    </div>
  );
}
