// src/pages/ListPage.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../styles';

// Оновлюємо інтерфейси
interface ListItem {
    id: string;
    name: string;
    quantity: number;
    completed: boolean;
    price?: number;
    store?: string;
    imageUrl?: string;
}

interface ShoppingList {
    id: string;
    name: string;
    items: ListItem[];
}

export function ListPage() {
    const { listId } = useParams<{ listId: string }>();
    const [list, setList] = useState<ShoppingList | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchList = async () => {
        if (!listId) return;
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`/api/lists/${listId}`);
            setList(response.data);
        } catch (err) {
            console.error('Failed to fetch list details:', err);
            setError('Не вдалося завантажити список.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, [listId]);

    // --- ОНОВЛЕНА ЛОГІКА ---
    const handleAddItem = async (e: FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || !list) return;

        try {
            setError('');
            // 1. Спочатку робимо запит на отримання повної інформації про товар
            const productInfoResponse = await axios.get(`/api/products/info?name=${newItemName}`);
            const productInfo = productInfoResponse.data;

            // 2. Додаємо товар до нашого списку покупок
            const addItemResponse = await axios.post(`/api/lists/${listId}/items`, { name: productInfo.name });

            // 3. Об'єднуємо дані та оновлюємо стан
            const newItemWithDetails: ListItem = { ...addItemResponse.data, ...productInfo };
            setList({ ...list, items: [...list.items, newItemWithDetails] });
            setNewItemName('');

        } catch (err) {
            console.error('Failed to add item:', err);
            setError('Не вдалося додати товар або знайти інформацію про нього.');
        }
    };

    const handleToggleItem = async (itemId: string, completed: boolean) => {
        if (!list) return;
        try {
            const response = await axios.patch(`/api/lists/items/${itemId}`, { completed: !completed });
            const updatedItems = list.items.map(item => item.id === itemId ? { ...item, ...response.data } : item);
            setList({ ...list, items: updatedItems });
        } catch (err) {
            console.error('Failed to update item:', err);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        if (!list) return;
        try {
            await axios.delete(`/api/lists/items/${itemId}`);
            const filteredItems = list.items.filter(item => item.id !== itemId);
            setList({ ...list, items: filteredItems });
        } catch (err) {
            console.error('Failed to remove item:', err);
        }
    };

    if (loading) return <p>Завантаження списку...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!list) return <p>Список не знайдено.</p>;

    return (
        <div>
            <Link to="/lists">← Назад до всіх списків</Link>
            <h2>{list.name}</h2>

            <form onSubmit={handleAddItem} style={{ ...styles.form, marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Назва страви (напр. Arrabiata)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>Додати</button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {list.items.map((item) => (
                    <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderBottom: '1px solid #eee' }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ flexGrow: 1 }}>
              <span style={{ textDecoration: item.completed ? 'line-through' : 'none', fontWeight: 'bold' }}>
                {item.name}
              </span>
                            {item.price && (
                                <small style={{ display: 'block', color: '#6c757d' }}>
                                    Ціна: {item.price} UAH ({item.store})
                                </small>
                            )}
                        </div>
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleItem(item.id, item.completed)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '18px' }}>
                            &times;
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
