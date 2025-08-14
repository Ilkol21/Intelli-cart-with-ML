// src/styles.ts
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
    }
};