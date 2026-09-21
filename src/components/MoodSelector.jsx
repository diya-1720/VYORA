import React from 'react';
import SectionTitle from './SectionTitle';
import MoodCard from './MoodCard';
import { Sparkles, X } from 'lucide-react';

export default function MoodSelector({ moods, selectedMood, onSelectMood, onResetMood }) {
  return (
    <section
      id="mood-discovery"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '50px 16px 70px 16px'
      }}
    >
      <SectionTitle
        badgeText="CURATED MOOD ENGINE"
        title="WHAT ARE YOU IN THE MOOD FOR?"
        subtitle="Select an emotional or sensory state to calibrate the recommendation algorithms."
      />

      {/* Selected Mood State Message Banner */}
      {selectedMood && (
        <div
          className="animate-fade-in"
          style={{
            marginBottom: '32px',
            padding: '16px 20px',
            backgroundColor: 'var(--vyora-surface)',
            border: `2px solid ${selectedMood.accent}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: 'var(--shadow-md), var(--vyora-glow)',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: selectedMood.accent,
                boxShadow: `0 0 12px ${selectedMood.accent}`
              }}
              className="animate-glow"
            />
            <span style={{ fontSize: '1rem', color: 'var(--vyora-text)' }}>
              Your current mood: <strong style={{ color: selectedMood.accent, fontFamily: 'var(--font-editorial)' }}>{selectedMood.title}</strong>
            </span>
          </div>

          <button
            onClick={onResetMood}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: 'var(--vyora-bg-secondary)',
              border: '1px solid var(--vyora-border-strong)',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: 'var(--vyora-text)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--vyora-accent)';
              e.currentTarget.style.color = 'var(--vyora-accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--vyora-border-strong)';
              e.currentTarget.style.color = 'var(--vyora-text)';
            }}
          >
            <X size={14} />
            <span>RESET FILTERS</span>
          </button>
        </div>
      )}

      {/* Mood Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(230px, 45vw, 270px), 1fr))',
          gap: '20px'
        }}
      >
        {moods.map((mood, idx) => (
          <MoodCard
            key={mood.id}
            mood={mood}
            index={idx}
            isSelected={selectedMood?.id === mood.id}
            isAnySelected={!!selectedMood}
            onSelect={onSelectMood}
          />
        ))}
      </div>
    </section>
  );
}
