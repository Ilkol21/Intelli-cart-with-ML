import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng } from 'leaflet';

interface DeliveryItem {
    id: string;
    name: string;
    quantity: number;
    price: string;
}

interface Delivery {
    id: string;
    status: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    items: DeliveryItem[];
}

export function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Delivery | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError('');
                const response = await apiClient.get(`/deliveries/my-orders/${id}`);
                setOrder(response.data);
            } catch (err) {
                console.error('Failed to fetch order details:', err);
                setError('Не вдалося завантажити деталі замовлення.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    if (loading) return <p>Завантаження деталей замовлення...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!order) return <p>Замовлення не знайдено.</p>;

    const position = new LatLng(order.latitude, order.longitude);

    return (
        <div>
            <Link to="/my-orders">← Назад до історії</Link>
            <h2>Деталі замовлення #{order.id.substring(0, 8)}</h2>
            <p><strong>Статус:</strong> {order.status}</p>
            <p><strong>Дата:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <h3>Товари в замовленні:</h3>
            <ul>
                {order.items.map(item => (
                    <li key={item.id}>
                        {item.name} x {item.quantity} - {Number(item.price).toFixed(2)} UAH
                    </li>
                ))}
            </ul>

            <h3>Адреса доставки:</h3>
            <MapContainer center={position} zoom={15} style={{ height: '300px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position}></Marker>
            </MapContainer>
        </div>
    );
}