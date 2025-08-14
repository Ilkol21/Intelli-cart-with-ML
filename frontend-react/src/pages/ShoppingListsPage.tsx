// src/pages/ShoppingListsPage.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // <-- Імпортуємо Link
import { styles } from '../styles';

interface ShoppingList {
    id: string; // Змінено з _id на id для сумісності з TypeORM
    name: string;
    ownerId: string;
    createdAt: string;
}

export function ShoppingListsPage() {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [newListName, setNewListName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLists = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/api/lists');
            setLists(response.data);
        } catch (err) {
            console.error('Failed to fetch lists:', err);
            setError('Не вдалося завантажити списки.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    const handleCreateList = async (e: FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        try {
            setError('');
            const response = await axios.post('/api/lists', { name: newListName });
            setLists([...lists, response.data]);
            setNewListName('');
        } catch (err) {
            console.error('Failed to create list:', err);
            setError('Не вдалося створити список.');
        }
    };

    const handleDeleteList = async (listId: string) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей список?')) {
            try {
                await axios.delete(`/api/lists/${listId}`);
                setLists(lists.filter(list => list.id !== listId));
            } catch (err) {
                console.error('Failed to delete list:', err);
                setError('Не вдалося видалити список.');
            }
        }
    };

    return (
        <div>
            <h2>Мої списки покупок</h2>

            <form onSubmit={handleCreateList} style={{ ...styles.form, marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Назва нового списку"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>Створити список</button>
            </form>

            {loading && <p>Завантаження...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && lists.length === 0 && <p>У вас ще немає жодного списку.</p>}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {lists.map((list) => (
                    <li key={list.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                        <Link to={`/lists/${list.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                            <strong>{list.name}</strong>
                            <br />
                            <small>Створено: {new Date(list.createdAt).toLocaleString()}</small>
                        </Link>
                        <button onClick={() => handleDeleteList(list.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '18px' }}>
                            &times;
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}