import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import apiClient from '../services/apiClient';
import { styles } from '../styles';
import { RecommendedProducts } from '../components/RecommendedProducts'; // <-- ДОДАНО ІМПОРТ

// Інтерфейс для товару
interface Product {
    id: string;
    name: string;
    description: string;
    price: number | string;
    imageUrl: string;
    category: string;
}

export function CatalogPage() {
    const [groupedProducts, setGroupedProducts] = useState<{ [key: string]: Product[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await apiClient.get('/products');

                const grouped = response.data.reduce((acc: { [key: string]: Product[] }, product: Product) => {
                    const category = product.category || 'Uncategorized';
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(product);
                    return acc;
                }, {});

                setGroupedProducts(grouped);
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
            {/* --- ДОДАНО СЕКЦІЮ РЕКОМЕНДАЦІЙ --- */}
            <RecommendedProducts />

            <h2>Каталог товарів</h2>

            {Object.keys(groupedProducts).length > 0 ? (
                Object.keys(groupedProducts).map(category => (
                    <div key={category} style={{ marginBottom: '40px' }}>
                        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{category}</h3>
                        <div style={styles.catalogGrid}>
                            {groupedProducts[category].map(product => (
                                <div key={product.id} style={styles.productCard}>
                                    <img src={`http://localhost:8080${product.imageUrl}`} alt={product.name} style={styles.productImage} />
                                    <h4>{product.name}</h4>
                                    <p>{Number(product.price).toFixed(2)} UAH</p>
                                    <button onClick={() => addToCart(product)} style={styles.button}>
                                        Додати в кошик
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p>Товари не знайдено. Будь ласка, додайте їх через адмін-панель.</p>
            )}
        </div>
    );
}