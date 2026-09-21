import React, { useState } from 'react';
import { SlidersHorizontal, Sparkles, RefreshCw, Zap, Compass, Heart, Film, Flame } from 'lucide-react';

const PRESETS = [
  {
    name: 'Cerebral Sci-Fi',
    icon: Sparkles,
    color: '#C9572C',
    values: {
      mindBending: 95,
      emotional: 55,
      action: 50,
      comedy: 15,
      dark: 50,
      romantic: 20,
      adventure: 85
    }
  },
  {
    name: 'High Adrenaline',
    icon: Flame,
    color: '#E9896A',
    values: {
      mindBending: 40,
      emotional: 30,
      action: 95,
      comedy: 25,
      dark: 70,
      romantic: 15,
      adventure: 90
    }
  },
  {
    name: 'Heartfelt Drama',
    icon: Heart,
    color: '#632C32',
    values: {
      mindBending: 45,
      emotional: 95,
      action: 15,
      comedy: 50,
      dark: 20,
      romantic: 80,
      adventure: 35
    }
  },
  {
    name: 'Dark Neo-Noir',
    icon: Zap,
    color: '#632C32',
    values: {
      mindBending: 80,
      emotional: 45,
      action: 60,
      comedy: 10,
      dark: 95,
      romantic: 20,
      adventure: 40
    }
  }
];

export default function VibeMixer({ onMixVibe, isMixing = false }) {
  const [dimensions, setDimensions] = useState({
    mindBending: 75,
    emotional: 60,
    action: 40,
    comedy: 50,
    dark: 30,
    romantic: 20,
    adventure: 70
  });

  const dimensionConfigs = [
    { key: 'mindBending', label: 'Mind-Bending', color: '#C9572C' },
    { key: 'emotional', label: 'Emotional', color: '#632C32' },
    { key: 'action', label: 'Action', color: '#E9896A' },
    { key: 'comedy', label: 'Comedy', color: '#D7A84B' },
    { key: 'dark', label: 'Dark', color: '#632C32' },
    { key: 'romantic', label: 'Romantic', color: '#E9896A' },
    { key: 'adventure', label: 'Adventure', color: '#C9572C' }
  ];

  const handleSliderChange = (key, value) => {
    setDimensions(prev => ({ ...prev, [key]: Number(value) }));
  };

  const applyPreset = (preset) => {
    setDimensions(preset.values);
  };

  const handleReset = () => {
    setDimensions({
      mindBending: 50,
      emotional: 50,
      action: 50,
      comedy: 50,
      dark: 50,
      romantic: 50,
      adventure: 50
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onMixVibe) {
      onMixVibe(dimensions);
    }
  };

  // Determine top two dominant dimensions
  const dominantDims = Object.entries(dimensions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key, val]) => {
      const conf = dimensionConfigs.find(c => c.key === key);
      return `${conf ? conf.label : key} (${val}%)`;
    });

  return (
    <div
      style={{
        padding: '32px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: '6px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '40px',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <SlidersHorizontal size={18} color="var(--accent-burnt-orange)" />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-burnt-orange)', fontWeight: 'bold' }}>
              ✦ LOCAL MATHEMATICAL AI ENGINE
            </span>
          </div>
          <h3 className="font-editorial" style={{ fontSize: '1.7rem', color: 'var(--text-charcoal)', margin: 0 }}>
            VIBE MIXER SLIDERS
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Fine-tune 7 sensory dimensions to formulate your exact mathematical recommendation vector.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-medium)',
            borderRadius: '4px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={14} />
          <span>Reset All to 50%</span>
        </button>
      </div>

      {/* Quick Presets Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
          QUICK TASTE PRESETS:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESETS.map(preset => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg-sand)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-charcoal)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={14} color={preset.color} />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px',
          marginBottom: '24px'
        }}
      >
        {dimensionConfigs.map(dim => {
          const val = dimensions[dim.key];
          return (
            <div
              key={dim.key}
              style={{
                padding: '14px 18px',
                backgroundColor: 'var(--bg-sand)',
                border: '1px solid var(--border-light)',
                borderRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
                  {dim.label}
                </span>
                <span className="font-editorial" style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--accent-burnt-orange)' }}>
                  {val}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={val}
                onChange={e => handleSliderChange(dim.key, e.target.value)}
                style={{
                  width: '100%',
                  accentColor: dim.color,
                  cursor: 'pointer'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Footer Info & Submit */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-medium)'
        }}
      >
        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent-burnt-orange)' }}>Dominant Sensory Tuning:</strong>{' '}
          {dominantDims.join(' • ')}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isMixing}
          className="btn-cinematic-primary"
          style={{
            minWidth: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isMixing ? 0.7 : 1
          }}
        >
          {isMixing ? (
            <>
              <RefreshCw size={17} className="animate-spin" />
              <span>COMPUTING VECTORS...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>CALCULATE HYBRID VIBE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

