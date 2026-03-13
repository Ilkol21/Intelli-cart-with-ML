import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface Recommendation {
    item: string;
    type: 'similar' | 'frequency' | 'recipe';
}

interface RecommendationContextType {
    recommendations: Recommendation[];
    clearRecommendations: () => void;
}

export const RecommendationContext = createContext<RecommendationContextType>({
    recommendations: [],
    clearRecommendations: () => {},
});

const storageKey = (userId: string) => `recommendations_${userId}`;

const loadFromStorage = (userId: string): Recommendation[] => {
    try {
        const raw = localStorage.getItem(storageKey(userId));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveToStorage = (userId: string, items: Recommendation[]) => {
    localStorage.setItem(storageKey(userId), JSON.stringify(items));
};

export const RecommendationProvider = ({ children }: { children: ReactNode }) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const { user } = useContext(AuthContext);

    // Завантажуємо збережені рекомендації при зміні користувача
    useEffect(() => {
        if (user?.id) {
            setRecommendations(loadFromStorage(String(user.id)));
        } else {
            setRecommendations([]);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        const socket: Socket = io('ws://localhost:8080', { path: '/socket.io/' });

        socket.on('connect', () => {
            socket.emit('register', user.id);
        });

        socket.on('new_recommendation', (data: Recommendation) => {
            setRecommendations(prev => {
                if (prev.find(rec => rec.item === data.item)) return prev;
                const updated = [...prev, data];
                saveToStorage(String(user.id), updated);
                return updated;
            });
        });

        return () => { socket.disconnect(); };
    }, [user?.id]);

    const clearRecommendations = () => {
        if (user?.id) localStorage.removeItem(storageKey(String(user.id)));
        setRecommendations([]);
    };

    return (
        <RecommendationContext.Provider value={{ recommendations, clearRecommendations }}>
            {children}
        </RecommendationContext.Provider>
    );
};
