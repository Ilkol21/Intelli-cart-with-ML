import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient'; // Використовуємо наш централізований клієнт
import { CartContext } from '../context/CartContext';
import { styles } from '../styles';

// Інтерфейс для товару, який ми отримуємо з бекенду
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
}

export function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError('');
                // --- ОСНОВНА ЗМІНА ТУТ ---
                // Завантажуємо всі товари з нашого каталогу
                const response = await apiClient.get('/products');
                setProducts(response.data);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError('Не вдалося завантажити каталог товарів.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <p>Завантаження каталогу...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Каталог товарів</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {products.map((product) => (
                    <div key={product.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                        <img src={product.imageUrl || 'https://placehold.co/200x150'} alt={product.name} style={{ maxWidth: '100%', height: '150px', objectFit: 'cover' }} />
                        <h3 style={{ fontSize: '1rem', height: '40px' }}>{product.name}</h3>
                        <p style={{ fontWeight: 'bold' }}>{product.price} UAH</p>
                        <button
                            onClick={() => addToCart(product)}
                            style={styles.button}
                        >
                            Додати в кошик
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
