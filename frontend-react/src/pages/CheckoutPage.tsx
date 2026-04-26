import React, { useContext, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CartContext } from '../context/CartContext';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router-dom';
import L, { LatLng } from 'leaflet';
import { RecommendedProducts } from '../components/RecommendedProducts';

interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number | string;
}

// Поля адреси які свідчать про реальне місце доставки
const VALID_ADDRESS_FIELDS = ['road', 'pedestrian', 'footway', 'path', 'cycleway',
    'residential', 'suburb', 'neighbourhood', 'quarter', 'house_number'];

// Поля які свідчать про воду/нежилу місцевість
const INVALID_ADDRESS_FIELDS = ['ocean', 'sea', 'bay', 'water', 'waterway',
    'river', 'lake', 'reservoir', 'strait', 'gulf'];

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function formatAddress(addr: Record<string, string>): string {
    const parts: string[] = [];
    if (addr.road || addr.pedestrian || addr.footway)
        parts.push(addr.road || addr.pedestrian || addr.footway);
    if (addr.house_number) parts[0] = `${parts[0]}, ${addr.house_number}`;
    if (addr.suburb || addr.neighbourhood || addr.quarter)
        parts.push(addr.suburb || addr.neighbourhood || addr.quarter);
    if (addr.city || addr.town || addr.village)
        parts.push(addr.city || addr.town || addr.village);
    if (addr.state) parts.push(addr.state);
    return parts.filter(Boolean).join(' • ') || addr.display_name || '—';
}

function LocationMarker({ onPick }: { onPick: (pos: LatLng) => void }) {
    const map = useMapEvents({
        click(e) {
            map.flyTo(e.latlng, map.getZoom());
            onPick(e.latlng);
        },
    });
    return null;
}

export function CheckoutPage() {
    const { cartItems, clearCart, removeFromCart, updateQuantity } = useContext(CartContext);
    const [position, setPosition] = useState<LatLng | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLng>(new L.LatLng(50.45, 30.52));
    const [addressText, setAddressText] = useState<string>('');
    const [addressError, setAddressError] = useState<string>('');
    const [geocoding, setGeocoding] = useState(false);
    const [ordering, setOrdering] = useState(false);
    const navigate = useNavigate();

    const reverseGeocode = useCallback(async (latlng: LatLng) => {
        setGeocoding(true);
        setAddressText('');
        setAddressError('');
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${latlng.lat}&lon=${latlng.lng}`,
                { headers: { 'Accept-Language': 'uk,en' } }
            );
            const data = await res.json();
            const addr: Record<string, string> = data.address || {};

            // Перевіряємо чи це вода/океан
            const isWater = INVALID_ADDRESS_FIELDS.some(f => f in addr) ||
                (data.type === 'water') ||
                (data.class === 'waterway') ||
                (data.class === 'natural' && !VALID_ADDRESS_FIELDS.some(f => f in addr));

            if (isWater) {
                setAddressError('⚠️ Сюди не доставляємо — це водойма або нежила місцевість. Виберіть інше місце.');
                setPosition(null);
                return;
            }

            // Перевіряємо чи є хоча б місто/населений пункт
            const hasLocation = addr.city || addr.town || addr.village ||
                addr.suburb || addr.road || addr.residential;

            if (!hasLocation) {
                setAddressError('⚠️ Не вдалося визначити адресу. Спробуйте вибрати точніше місце.');
                setPosition(null);
                return;
            }

            setPosition(latlng);
            setAddressText(formatAddress(addr));
        } catch {
            // Якщо геокодування недоступне — дозволяємо продовжити без адреси
            setPosition(latlng);
            setAddressText('Адреса не визначена (офлайн режим)');
        } finally {
            setGeocoding(false);
        }
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
                setMapCenter(latlng);
                reverseGeocode(latlng);
            },
            () => {
                const kyiv = new L.LatLng(50.45, 30.52);
                setMapCenter(kyiv);
                reverseGeocode(kyiv);
            }
        );
    }, []);

    const handleOrder = async () => {
        if (!position || addressError) {
            alert('Будь ласка, виберіть коректну адресу доставки на карті.');
            return;
        }
        if (cartItems.length === 0) {
            alert('Ваш кошик порожній.');
            return;
        }
        setOrdering(true);
        try {
            await apiClient.post('/deliveries', {
                latitude: position.lat,
                longitude: position.lng,
                address: addressText,
                items: cartItems.map((item: CartItem) => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.price),
                })),
            });
            alert('Замовлення успішно створено!');
            clearCart();
            navigate('/my-orders');
        } catch {
            alert('Не вдалося створити замовлення.');
        } finally {
            setOrdering(false);
        }
    };

    const total = cartItems.reduce((sum: number, item: CartItem) => sum + Number(item.price) * item.quantity, 0);
    const canOrder = !!position && !addressError && !geocoding && cartItems.length > 0;

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
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 0 }}>
                Натисніть на карті щоб вказати точку доставки
            </p>

            <MapContainer center={mapCenter} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '8px' }} key={mapCenter.toString()}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && <Marker position={position} />}
                <LocationMarker onPick={reverseGeocode} />
            </MapContainer>

            {/* Блок адреси під картою */}
            <div style={{ marginTop: '12px', minHeight: '48px' }}>
                {geocoding && (
                    <div style={addressBoxStyle('#f3f4f6', '#374151')}>
                        🔍 Визначаємо адресу...
                    </div>
                )}
                {!geocoding && addressError && (
                    <div style={addressBoxStyle('#fef2f2', '#b91c1c')}>
                        {addressError}
                    </div>
                )}
                {!geocoding && !addressError && addressText && (
                    <div style={addressBoxStyle('#f0fdf4', '#166534')}>
                        📍 <strong>Адреса доставки:</strong> {addressText}
                    </div>
                )}
            </div>

            <button
                onClick={handleOrder}
                disabled={!canOrder || ordering}
                style={{ marginTop: '16px', padding: '12px 28px', fontSize: '1rem', borderRadius: '8px', cursor: canOrder ? 'pointer' : 'not-allowed', background: canOrder ? '#3b82f6' : '#d1d5db', color: 'white', border: 'none', fontWeight: 600 }}
            >
                {ordering ? 'Оформлення...' : 'Замовити'}
            </button>
        </div>
    );
}

function addressBoxStyle(bg: string, color: string): React.CSSProperties {
    return {
        padding: '10px 14px',
        borderRadius: '8px',
        backgroundColor: bg,
        color,
        fontSize: '0.9rem',
    };
}
