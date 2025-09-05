// src/components/RecipeSuggestions.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
    container: { overflowX: 'auto', display: 'flex', gap: '15px', padding: '10px 0' } as React.CSSProperties,
    card: { flex: '0 0 200px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' } as React.CSSProperties,
    img: { width: '100%', height: '120px', objectFit: 'cover' } as React.CSSProperties,
    title: { padding: '10px', fontWeight: 'bold', fontSize: '14px' } as React.CSSProperties,
};

export function RecipeSuggestions() {
    const [recipes, setRecipes] = useState<any[]>([]);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                // Отримуємо 5 випадкових рецептів для демонстрації
                const requests = Array.from({ length: 5 }, () => axios.get('https://www.themealdb.com/api/json/v1/1/random.php'));
                const responses = await Promise.all(requests);
                setRecipes(responses.map(res => res.data.meals[0]));
            } catch (error) {
                console.error("Failed to fetch recipes", error);
            }
        };
        fetchRecipes();
    }, []);

    return (
        <div style={{ margin: '40px 0' }}>
            <h3>Смачні рецепти</h3>
            <div style={styles.container}>
                {recipes.map(recipe => (
                    <div key={recipe.idMeal} style={styles.card}>
                        <img src={recipe.strMealThumb} alt={recipe.strMeal} style={styles.img} />
                        <p style={styles.title}>{recipe.strMeal}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
