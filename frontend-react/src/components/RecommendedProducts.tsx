import React, { useContext, useEffect, useState } from 'react';
import { RecommendationContext } from '../context/RecommendationContext';
import { CartContext } from '../context/CartContext';
import apiClient from '../services/apiClient';
import { styles } from '../styles';
import { AxiosResponse } from 'axios';

// Інтерфейс для товару
interface Product {
    id: string;
    name: string;
    description: string;
    price: number | string;
    imageUrl: string;
    category: string;
}

export function RecommendedProducts() {
    const { recommendations } = useContext(RecommendationContext);
    const { addToCart } = useContext(CartContext);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (recommendations.length === 0) {
                setRecommendedProducts([]);
                return;
            }

            setLoading(true);
            try {
                // Кожен запит повертає Promise<AxiosResponse<Product>>
                const productPromises = recommendations.map(rec =>
                    apiClient.get<Product>(`/products/info?name=${rec.item}`)
                );

                // Явно типізуємо responses як масив результатів
                const responses = await Promise.allSettled(productPromises) as PromiseSettledResult<AxiosResponse<Product>>[];

                const successfulProducts: Product[] = responses
                    .filter((res): res is PromiseFulfilledResult<AxiosResponse<Product>> => res.status === "fulfilled")
                    .map(res => res.value.data);

                // Унікальні товари за id
                const uniqueProducts = Array.from(
                    new Map(successfulProducts.map(p => [p.id, p])).values()
                );

                setRecommendedProducts(uniqueProducts);
            } catch (error) {
                console.error("Failed to fetch product details for recommendations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [recommendations]);


    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div style={{ marginBottom: '40px' }}>
            <h3>Вам може сподобатися</h3>
            {loading ? <p>Завантаження рекомендацій...</p> : (
                <div style={styles.catalogGrid}>
                    {recommendedProducts.map((product) => (
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
            )}
        </div>
    );
}