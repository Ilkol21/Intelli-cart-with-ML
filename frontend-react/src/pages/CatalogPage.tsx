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
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await apiClient.get('/products');
                const grouped = response.data.reduce((acc: { [key: string]: Product[] }, product: Product) => {
                    const category = product.category || 'Інше';
                    if (!acc[category]) acc[category] = [];
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

    const categories = Object.keys(groupedProducts).sort();

    const visibleGroups = categories
        .filter(cat => !activeCategory || cat === activeCategory)
        .reduce<{ [key: string]: Product[] }>((acc, cat) => {
            const q = search.toLowerCase().trim();
            const filtered = q
                ? groupedProducts[cat].filter(p => p.name.toLowerCase().includes(q))
                : groupedProducts[cat];
            if (filtered.length > 0) acc[cat] = filtered;
            return acc;
        }, {});

    const totalVisible = Object.values(visibleGroups).reduce((s, arr) => s + arr.length, 0);

    if (loading) return <p>Завантаження каталогу...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <RecommendedProducts />

            <h2>Каталог товарів</h2>

            {/* Пошук */}
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Пошук товарів..."
                style={filterStyles.searchInput}
            />

            {/* Фільтр по категоріям */}
            <div style={filterStyles.categoryRow}>
                <button
                    onClick={() => setActiveCategory('')}
                    style={{ ...filterStyles.catBtn, ...(activeCategory === '' ? filterStyles.catBtnActive : {}) }}
                >
                    Всі
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
                        style={{ ...filterStyles.catBtn, ...(activeCategory === cat ? filterStyles.catBtnActive : {}) }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Результати */}
            {totalVisible === 0 ? (
                <p style={{ color: '#888', marginTop: '2rem' }}>Нічого не знайдено</p>
            ) : (
                Object.keys(visibleGroups).map(category => (
                    <div key={category} style={{ marginBottom: '40px' }}>
                        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{category}</h3>
                        <div style={styles.catalogGrid}>
                            {visibleGroups[category].map(product => (
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
            )}
        </div>
    );
}

const filterStyles: Record<string, React.CSSProperties> = {
    searchInput: {
        width: '100%',
        padding: '10px 14px',
        fontSize: '15px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        marginBottom: '14px',
        boxSizing: 'border-box',
        outline: 'none',
    },
    categoryRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '24px',
    },
    catBtn: {
        padding: '6px 16px',
        borderRadius: '20px',
        border: '1px solid #d1d5db',
        background: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#374151',
        transition: 'all 0.15s',
    },
    catBtnActive: {
        background: '#3b82f6',
        borderColor: '#3b82f6',
        color: 'white',
    },
};