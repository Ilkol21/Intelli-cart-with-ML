// src/pages/CheckoutPage.tsx
import React, { useContext, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import L, { LatLng } from 'leaflet';
import { RecommendedProducts } from '../components/RecommendedProducts';

interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

function LocationMarker({ setPosition }: { setPosition: (pos: LatLng) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return null;
}

export function CheckoutPage() {
    const { cartItems, clearCart, removeFromCart, updateQuantity } = useContext(CartContext);
    const [position, setPosition] = useState<LatLng | null>(new L.LatLng(50.45, 30.52));
    const navigate = useNavigate();

    const handleOrder = async () => {
        if (!position) {
            alert("Будь ласка, виберіть адресу на карті.");
            return;
        }
        if (cartItems.length === 0) {
            alert("Ваш кошик порожній.");
            return;
        }

        const orderData = {
            latitude: position.lat,
            longitude: position.lng,
            items: cartItems.map((item: CartItem) => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        try {
            await axios.post('/api/deliveries', orderData);
            alert('Замовлення успішно створено!');
            clearCart();
            navigate('/catalog');
        } catch (error) {
            console.error("Failed to create order", error);
            alert('Не вдалося створити замовлення.');
        }
    };

    const total = cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

    return (
        <div>
            <h2>Оформлення замовлення</h2>
            <h3>Ваш кошик:</h3>

            {cartItems.length > 0 ? (
                <ul>
                    {cartItems.map((item: CartItem) => (
                        <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>{item.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                <span>{(item.price * item.quantity).toFixed(2)} UAH</span>
                                <button onClick={() => removeFromCart(item.id)} style={{ color: 'red' }}>Видалити</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Ваш кошик порожній.</p>
            )}

            <h4>Всього: {total.toFixed(2)} UAH</h4>

            <RecommendedProducts />

            <h3>Виберіть адресу доставки на карті:</h3>
            <MapContainer center={[50.45, 30.52]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && <Marker position={position}></Marker>}
                <LocationMarker setPosition={setPosition} />
            </MapContainer>

            <button onClick={handleOrder} style={{ marginTop: '20px' }}>Замовити</button>
        </div>
    );
}
