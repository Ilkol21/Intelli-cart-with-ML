// src/pages/ListPage.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../styles';

// Інтерфейси для типізації
interface ListItem {
    id: string;
    name: string;
    quantity: number;
    completed: boolean;
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

    useEffect(() => {
        const fetchList = async () => {
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

        if (listId) {
            fetchList();
        }
    }, [listId]);

    const handleAddItem = async (e: FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || !list) return;

        try {
            const response = await axios.post(`/api/lists/${listId}/items`, { name: newItemName });
            setList({ ...list, items: [...list.items, response.data] });
            setNewItemName('');
        } catch (err) {
            console.error('Failed to add item:', err);
            setError('Не вдалося додати товар.');
        }
    };

    const handleToggleItem = async (itemId: string, completed: boolean) => {
        if (!list) return;
        try {
            const response = await axios.patch(`/api/lists/items/${itemId}`, { completed: !completed });
            const updatedItems = list.items.map(item => item.id === itemId ? response.data : item);
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
                    placeholder="Новий товар"
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
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleItem(item.id, item.completed)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <span style={{ textDecoration: item.completed ? 'line-through' : 'none', flexGrow: 1 }}>
              {item.name} (кількість: {item.quantity})
            </span>
                        <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '18px' }}>
                            &times;
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
