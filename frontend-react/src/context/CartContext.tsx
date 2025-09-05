// src/context/CartContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

export const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<any[]>([]);

    const addToCart = (product: any) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    // --- НОВА ФУНКЦІЯ ---
    const removeFromCart = (productId: string) => {
        setCartItems((prevItems) => prevItems.filter(item => item.id !== productId));
    };

    // --- НОВА ФУНКЦІЯ ---
    const updateQuantity = (productId: string, amount: number) => {
        setCartItems((prevItems) =>
            prevItems.map(item => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + amount;
                    // Не дозволяємо кількості бути менше 1
                    return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
                }
                return item;
            }).filter(item => item.quantity > 0) // Видаляємо товар, якщо кількість стала 0
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
