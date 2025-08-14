// src/components/Notifications.tsx
import React, { useState, useEffect, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const notificationStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    zIndex: 1000,
    transition: 'opacity 0.5s ease-in-out',
    opacity: 0,
};

export function Notifications() {
    const { user } = useContext(AuthContext);
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Підключаємось до WebSocket тільки якщо користувач залогінений
        if (user?.id) {
            // URL нашого api-gateway
            const socket: Socket = io('http://localhost:3000');

            socket.on('connect', () => {
                console.log('Connected to WebSocket server!');
                // Реєструємо користувача на сервері, щоб отримувати персональні сповіщення
                socket.emit('register', user.id);
            });

            // Слухаємо подію 'new_recommendation'
            socket.on('new_recommendation', (data: { item: string }) => {
                console.log('New recommendation received:', data.item);
                setRecommendation(data.item);
                setIsVisible(true);

                // Ховаємо сповіщення через 5 секунд
                setTimeout(() => {
                    setIsVisible(false);
                }, 5000);
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from WebSocket server.');
            });

            // Відключаємось при розмонтуванні компонента
            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const visibleStyle = isVisible ? { opacity: 1 } : { opacity: 0 };

    return (
        <div style={{ ...notificationStyle, ...visibleStyle }}>
            <strong>Рекомендація:</strong> Можливо, вам також потрібен "{recommendation}"?
        </div>
    );
}
