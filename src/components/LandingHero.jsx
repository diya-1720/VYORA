import React from 'react';
import { Film, Music, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingHero({ onSignIn }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        padding: '50px 20px 80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      {/* Brand Subtitle / Stamp */}
      <div
        className="seq-item seq-delay-1"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}
      >
        <span className="stamp-badge-pink">✦ CINEMATIC CULTURE MAGAZINE</span>
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--vyora-text-muted)', fontWeight: 600 }}>
          DISCOVERY ENGINE
        </span>
      </div>

      {/* Main Asymmetrical Hero Layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '40px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '60px'
        }}
      >
        {/* Left Column: Brand Title, Tagline & Primary Statement */}
        <div style={{ flex: '1 1 500px', minWidth: '280px' }}>
          <h1
            className="font-display seq-item seq-delay-2"
            style={{
              fontSize: 'clamp(3.5rem, 8vw, 7.5rem)',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: 'var(--vyora-text)',
              margin: '0 0 4px 0',
              lineHeight: 0.92
            }}
          >
            VYORA <span className="vyora-mark">✦</span>
          </h1>

          <p
            className="font-display seq-item seq-delay-3"
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              fontStyle: 'italic',
              color: 'var(--vyora-accent)',
              marginBottom: '28px'
            }}
          >
            Find Your Vibe.
          </p>

          <div
            className="seq-item seq-delay-4"
            style={{
              padding: '24px 28px',
              backgroundColor: 'var(--vyora-surface)',
              borderLeft: '4px solid var(--vyora-accent)',
              borderRadius: '4px',
              boxShadow: 'var(--shadow-md)',
              maxWidth: '580px'
            }}
          >
            <h2
              className="heading-editorial"
              style={{
                fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
                color: 'var(--vyora-text)',
                lineHeight: 1.1,
                marginBottom: '10px'
              }}
            >
              "WHAT ARE WE FEELING TODAY?"
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--vyora-text-muted)', margin: 0, lineHeight: 1.5 }}>
              Let VYORA figure it out. A movie magazine that learned how to read your vibe.
            </p>
          </div>
        </div>

        {/* Right Column: Visual Poster Composition */}
        <div
          className="seq-item-scale seq-delay-5"
          style={{ flex: '1 1 320px', minWidth: '280px', display: 'flex', justifyContent: 'center' }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '340px',
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '260px',
                height: '370px',
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '3px solid var(--vyora-border-strong)',
                transform: 'rotate(-2deg)'
              }}
              className="animate-float gpu-accelerated"
            >
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800"
                alt="Arrival Movie Visual Hero"
                loading="eager"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(18, 10, 24, 0.95) 0%, transparent 60%)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  color: 'var(--vyora-text)'
                }}
              >
                <span className="stamp-badge-gold" style={{ alignSelf: 'flex-start', marginBottom: '6px', fontSize: '0.62rem' }}>
                  94% VIBE MATCH ✦
                </span>
                <h3 className="font-display" style={{ fontSize: '1.4rem', color: 'var(--vyora-text)', margin: 0 }}>
                  ARRIVAL
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Twin Experience Choice Cards: REEL VIBE vs SOUND VIBE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '860px',
          margin: '0 auto 48px auto'
        }}
      >
        {/* REEL VIBE (Active) */}
        <div
          onClick={() => navigate('/movie-home')}
          className="seq-item seq-delay-6"
          style={{
            padding: '32px 28px',
            backgroundColor: 'var(--vyora-surface)',
            border: '2px solid var(--vyora-accent)',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'transform 0.3s var(--ease-cinematic), box-shadow 0.3s ease',
            boxShadow: 'var(--shadow-md)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--vyora-glow)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--vyora-accent)',
                color: '#120A18',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--vyora-glow)'
              }}
            >
              <Film size={24} />
            </div>
            <span className="stamp-badge" style={{ fontSize: '0.65rem' }}>ACTIVE EXPERIENCE</span>
          </div>

          <h3 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--vyora-text)', marginBottom: '8px' }}>
            🎬 ✦ REEL VIBE
          </h3>

          <p style={{ fontSize: '0.92rem', color: 'var(--vyora-text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            Find your next movie obsession through mood, atmosphere, and sensory DNA.
          </p>

          <button
            type="button"
            className="btn-cinematic-primary"
            style={{ width: '100%', padding: '12px 20px', fontSize: '0.85rem' }}
          >
            <span>ENTER REEL VIBE</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* SOUND VIBE (Coming Soon) */}
        <div
          className="seq-item seq-delay-7"
          style={{
            padding: '32px 28px',
            backgroundColor: 'var(--vyora-bg-secondary)',
            border: '1px dashed var(--vyora-border-strong)',
            borderRadius: '6px',
            textAlign: 'left',
            opacity: 0.85,
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--vyora-surface)',
                border: '1px solid var(--vyora-border)',
                color: 'var(--vyora-text-muted)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Music size={24} />
            </div>
            <span className="stamp-badge-pink" style={{ fontSize: '0.65rem' }}>
              COMING SOON
            </span>
          </div>

          <h3 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--vyora-text-muted)', marginBottom: '8px' }}>
            🎵 ✦ SOUND VIBE
          </h3>

          <p style={{ fontSize: '0.92rem', color: 'var(--vyora-text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            Curated sonic discoveries & music taste integration. (Future Version)
          </p>

          <button
            type="button"
            disabled
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '0.85rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--vyora-border)',
              color: 'var(--vyora-text-muted)',
              borderRadius: '3px',
              cursor: 'not-allowed'
            }}
          >
            <span>IN DEVELOPMENT</span>
          </button>
        </div>
      </div>

      {/* Auth Options */}
      <div
        className="seq-item seq-delay-8"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}
      >
        <button
          type="button"
          onClick={() => navigate('/movie-home')}
          className="btn-cinematic-secondary"
          style={{ padding: '12px 24px', fontSize: '0.88rem' }}
        >
          <span>Continue as Guest</span>
        </button>

        <button
          type="button"
          onClick={onSignIn}
          className="btn-cinematic-ghost"
          style={{ padding: '12px 24px', fontSize: '0.88rem' }}
        >
          <UserCheck size={16} />
          <span>Sign In / Create Profile</span>
        </button>
      </div>
    </header>
  );
}
