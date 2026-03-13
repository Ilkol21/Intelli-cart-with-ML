import React, { useContext, useEffect, useState } from 'react';
import { RecommendationContext } from '../context/RecommendationContext';

const DISPLAY_MS = 12000;

export function Notifications() {
    const { recommendations } = useContext(RecommendationContext);
    const [lastRecommendation, setLastRecommendation] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);
    const [fading, setFading] = useState(false);
    const [progress, setProgress] = useState(100);

    const dismiss = () => {
        setFading(true);
        setTimeout(() => { setVisible(false); setFading(false); }, 350);
    };

    useEffect(() => {
        if (recommendations.length === 0) return;
        const newRec = recommendations[recommendations.length - 1];
        setLastRecommendation(newRec.item);
        setFading(false);
        setProgress(100);
        setVisible(true);

        // Прогрес-бар
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            setProgress(Math.max(0, 100 - (elapsed / DISPLAY_MS) * 100));
        }, 50);

        const timer = setTimeout(() => {
            clearInterval(interval);
            dismiss();
        }, DISPLAY_MS);

        return () => { clearTimeout(timer); clearInterval(interval); };
    }, [recommendations]);

    if (!visible || !lastRecommendation) return null;

    return (
        <div style={{ ...toastStyle, opacity: fading ? 0 : 1, transform: fading ? 'translateY(12px)' : 'translateY(0)' }}>
            <div style={headerStyle}>
                <span style={iconStyle}>🛒</span>
                <span style={titleStyle}>Може зацікавити</span>
                <button onClick={dismiss} style={closeStyle} title="Закрити">✕</button>
            </div>
            <p style={textStyle}>
                Додайте до кошика: <strong>{lastRecommendation}</strong>
            </p>
            <div style={progressTrackStyle}>
                <div style={{ ...progressBarStyle, width: `${progress}%` }} />
            </div>
        </div>
    );
}

const toastStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '290px',
    backgroundColor: '#fff',
    color: '#1f2937',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
    zIndex: 1000,
    overflow: 'hidden',
    transition: 'opacity 0.35s ease, transform 0.35s ease',
    border: '1px solid #e5e7eb',
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px 6px',
};

const iconStyle: React.CSSProperties = { fontSize: '18px' };

const titleStyle: React.CSSProperties = {
    flex: 1,
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#111827',
};

const closeStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#9ca3af',
    padding: '0 2px',
    lineHeight: 1,
};

const textStyle: React.CSSProperties = {
    margin: '0 14px 12px',
    fontSize: '0.88rem',
    color: '#4b5563',
    lineHeight: 1.45,
};

const progressTrackStyle: React.CSSProperties = {
    height: '3px',
    backgroundColor: '#f3f4f6',
};

const progressBarStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.05s linear',
};