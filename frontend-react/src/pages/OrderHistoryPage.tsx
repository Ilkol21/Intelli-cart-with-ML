import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { styles } from '../styles';

interface Delivery {
    id: string;
    status: string;
    createdAt: string;
}

export function OrderHistoryPage() {
    const [orders, setOrders] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await apiClient.get('/deliveries/my-orders');
                setOrders(response.data);
            } catch (err) {
                console.error('Failed to fetch order history:', err);
                setError('Не вдалося завантажити історію замовлень.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <p>Завантаження історії...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Мої замовлення</h2>
            {orders.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {orders.map(order => (
                        <li key={order.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                            <Link to={`/my-orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>Замовлення #{order.id.substring(0, 8)}</strong>
                                        <p>Статус: {order.status}</p>
                                    </div>
                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>У вас ще немає замовлень.</p>
            )}
        </div>
    );
}