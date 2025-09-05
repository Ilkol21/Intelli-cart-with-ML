// src/components/RecommendedProducts.tsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const styles = {
    container: { overflowX: 'auto', display: 'flex', gap: '15px', padding: '10px 0' } as React.CSSProperties,
    card: { flex: '0 0 180px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', padding: '10px', textAlign: 'center' } as React.CSSProperties,
    img: { width: '100%', height: '100px', objectFit: 'cover', marginBottom: '10px' } as React.CSSProperties,
    title: { fontWeight: 'bold', fontSize: '14px', height: '40px' } as React.CSSProperties,
    button: { width: '100%', padding: '8px', marginTop: '10px', cursor: 'pointer' } as React.CSSProperties,
};

export function RecommendedProducts() {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const terms = ['Chicken', 'Beef', 'Salmon', 'Pasta'];
                const randomTerm = terms[Math.floor(Math.random() * terms.length)];
                const response = await axios.get(`/api/products/info?name=${randomTerm}`);

                // Для демонстрації додамо кілька однакових товарів
                setRecommendations([response.data, response.data, response.data, response.data]);
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
            }
        };
        fetchRecommendations();
    }, []);

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div style={{ margin: '40px 0' }}>
            <h3>Разом із цим замовляють</h3>
            <div style={styles.container}>
                {recommendations.map((product, index) => (
                    <div key={`${product.id}-${index}`} style={styles.card}>
                        <img src={product.imageUrl} alt={product.name} style={styles.img} />
                        <p style={styles.title}>{product.name}</p>
                        <p>Ціна: {product.price} UAH</p>
                        <button onClick={() => addToCart(product)} style={styles.button}>Додати</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
