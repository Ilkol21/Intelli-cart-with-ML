import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';

interface ChatMsg {
    id: string;
    orderId: string;
    fromUserId: string;
    fromRole: string;
    text: string;
    createdAt: string;
}

interface Props {
    orderId: string;
}

const ROLE_LABELS: Record<string, string> = { user: 'Ви', delivery: 'Кур\'єр', admin: 'Адмін' };
const WS_BASE = 'ws://localhost:8080';

export function OrderChat({ orderId }: Props) {
    const { user } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (!open) return;

        setLoading(true);
        apiClient.get(`/admin/chat/${orderId}`)
            .then((res: { data: ChatMsg[] }) => setMessages(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));

        const socket = io(`${WS_BASE}/chat`, {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        const joinRoom = () => socket.emit('join-order-room', orderId);

        socket.on('connect', joinRoom);
        socket.on('reconnect', joinRoom);

        socket.on('new-message', (msg: ChatMsg) => {
            if (msg.orderId === orderId) {
                setMessages((prev: ChatMsg[]) => [...prev, msg]);
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [open, orderId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const sendMessage = () => {
        if (!text.trim() || !socketRef.current || !user) return;
        socketRef.current.emit('send-message', {
            orderId,
            fromUserId: String(user.id),
            fromRole: user.role || 'user',
            text: text.trim(),
        });
        setText('');
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
            {!open && (
                <button onClick={() => setOpen(true)} style={styles.toggleBtn}>
                    💬 Чат з кур'єром
                </button>
            )}

            {open && (
                <div style={styles.panel}>
                    <div style={styles.header}>
                        <span>Чат по замовленню</span>
                        <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
                    </div>

                    <div style={styles.messages}>
                        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Завантаження...</p>}
                        {!loading && messages.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#aaa' }}>Повідомлень ще немає</p>
                        )}
                        {messages.map(msg => {
                            const isOwn = msg.fromUserId === String(user?.id);
                            return (
                                <div key={msg.id} style={{ ...styles.message, alignSelf: isOwn ? 'flex-end' : 'flex-start' }}>
                                    <div style={styles.msgMeta}>
                                        <span style={styles.msgRole}>{ROLE_LABELS[msg.fromRole] || msg.fromRole}</span>
                                        <span style={styles.msgTime}>
                                            {new Date(msg.createdAt).toLocaleTimeString('uk-UA')}
                                        </span>
                                    </div>
                                    <div style={{
                                        ...styles.msgBubble,
                                        background: isOwn ? '#dbeafe' : '#f3f4f6',
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={styles.inputRow}>
                        <input
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Повідомлення..."
                            style={styles.input}
                        />
                        <button onClick={sendMessage} style={styles.sendBtn}>→</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    toggleBtn: {
        padding: '10px 18px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '24px',
        cursor: 'pointer',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
    },
    panel: {
        width: 340,
        height: 440,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#3b82f6',
        color: 'white',
        fontWeight: 600,
        fontSize: 14,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: 16,
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    message: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '85%',
    },
    msgMeta: {
        display: 'flex',
        gap: 6,
        marginBottom: 2,
        fontSize: 11,
        color: '#9ca3af',
    },
    msgRole: { fontWeight: 600, color: '#6b7280' },
    msgTime: {},
    msgBubble: {
        padding: '8px 10px',
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.4,
    },
    inputRow: {
        display: 'flex',
        gap: 8,
        padding: '10px 12px',
        borderTop: '1px solid #e5e7eb',
    },
    input: {
        flex: 1,
        padding: '8px 10px',
        border: '1px solid #d1d5db',
        borderRadius: 6,
        fontSize: 13,
        outline: 'none',
    },
    sendBtn: {
        padding: '8px 14px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 16,
    },
};
