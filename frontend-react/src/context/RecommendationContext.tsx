import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

// Тип для однієї рекомендації
interface Recommendation {
    item: string;
    type: 'similar' | 'frequency' | 'recipe'; // Додамо тип рекомендації
}

interface RecommendationContextType {
    recommendations: Recommendation[];
}

export const RecommendationContext = createContext<RecommendationContextType>({ recommendations: [] });

export const RecommendationProvider = ({ children }: { children: ReactNode }) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user?.id) return;

        // Підключаємось до WebSocket через наш Nginx
        const socket: Socket = io('ws://localhost:8080', {
            path: '/socket.io/'
        });

        socket.on('connect', () => {
            console.log('WebSocket connected!');
            // Реєструємо користувача на сервері, щоб отримувати персоналізовані рекомендації
            socket.emit('register', user.id);
        });

        // Слухаємо нові рекомендації від сервера
        socket.on('new_recommendation', (data: Recommendation) => {
            console.log('New recommendation received:', data);
            // Додаємо нову рекомендацію, уникаючи дублікатів
            setRecommendations(prev => {
                if (!prev.find(rec => rec.item === data.item)) {
                    return [...prev, data];
                }
                return prev;
            });
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected.');
        });

        // Відключаємось при розмонтуванні компонента
        return () => {
            socket.disconnect();
        };
    }, [user]); // Перепідключаємось, якщо користувач змінюється

    return (
        <RecommendationContext.Provider value={{ recommendations }}>
            {children}
        </RecommendationContext.Provider>
    );
};
