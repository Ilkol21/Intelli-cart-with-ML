import React, { useContext, useEffect, useState } from 'react';
import { RecommendationContext } from '../context/RecommendationContext';

export function Notifications() {
    const { recommendations } = useContext(RecommendationContext);
    const [lastRecommendation, setLastRecommendation] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (recommendations.length > 0) {
            const newRec = recommendations[recommendations.length - 1];
            setLastRecommendation(newRec.item);
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000); // Сповіщення зникає через 5 секунд

            return () => clearTimeout(timer);
        }
    }, [recommendations]);

    if (!visible || !lastRecommendation) {
        return null;
    }

    return (
        <div style={notificationStyle}>
            <strong>Рекомендація:</strong> Можливо, вам також потрібен '{lastRecommendation}'?
        </div>
    );
}

const notificationStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    zIndex: 1000,
};