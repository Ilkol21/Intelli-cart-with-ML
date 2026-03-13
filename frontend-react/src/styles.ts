// src/styles.ts
import {CSSProperties} from "react";

export const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '300px',
        gap: '10px',
    } as React.CSSProperties,
    input: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
    },
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    catalogGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
    },
    productCard: {
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '15px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    } as CSSProperties,
    productImage: {
        maxWidth: '100%',
        height: '150px',
        objectFit: 'contain',
        marginBottom: '15px',
    } as CSSProperties,
};