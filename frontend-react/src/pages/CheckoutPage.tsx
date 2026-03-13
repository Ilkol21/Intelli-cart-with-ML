import React, { useContext, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CartContext } from '../context/CartContext';
import apiClient from '../services/apiClient'; // <-- ОСНОВНЕ ВИПРАВЛЕННЯ: Використовуємо наш apiClient
import { useNavigate } from 'react-router-dom';
import L, { LatLng } from 'leaflet';
import { RecommendedProducts } from '../components/RecommendedProducts';

interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number | string; // Дозволяємо рядок
}

// Виправляємо іконку маркера, яка часто "ламається" в React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


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
    const [position, setPosition] = useState<LatLng | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLng>(new L.LatLng(50.45, 30.52)); // Київ за замовчуванням
    const navigate = useNavigate();

    useEffect(() => {
        // Запитуємо геолокацію при завантаженні сторінки
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userPosition = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
                setPosition(userPosition);
                setMapCenter(userPosition);
            },
            () => {
                console.warn("Could not get user location, using default.");
                setPosition(new L.LatLng(50.45, 30.52)); // Якщо відмовили, ставимо Київ
            }
        );
    }, []);

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
                price: Number(item.price), // Перетворюємо на число перед відправкою
            })),
        };

        try {
            // --- ОСНОВНЕ ВИПРАВЛЕННЯ: Використовуємо apiClient ---
            await apiClient.post('/deliveries', orderData);
            alert('Замовлення успішно створено!');
            clearCart();
            navigate('/my-orders'); // Перенаправляємо на історію замовлень
        } catch (error) {
            console.error("Failed to create order", error);
            alert('Не вдалося створити замовлення.');
        }
    };

    const total = cartItems.reduce((sum: number, item: CartItem) => sum + Number(item.price) * item.quantity, 0);

    return (
        <div>
            <h2>Оформлення замовлення</h2>
            <h3>Ваш кошик:</h3>

            {cartItems.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {cartItems.map((item: CartItem) => (
                        <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                            <span>{item.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                <span>{(Number(item.price) * item.quantity).toFixed(2)} UAH</span>
                                <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Видалити</button>
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
            <MapContainer center={mapCenter} zoom={13} style={{ height: '400px', width: '100%' }} key={mapCenter.toString()} >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && <Marker position={position}></Marker>}
                <LocationMarker setPosition={setPosition} />
            </MapContainer>

            <button onClick={handleOrder} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1.2rem' }}>Замовити</button>
        </div>
    );
}
