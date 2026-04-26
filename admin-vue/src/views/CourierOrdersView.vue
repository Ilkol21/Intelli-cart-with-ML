<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { io, Socket } from 'socket.io-client';
import apiClient from '../services/api';
import { authStore } from '../stores/auth';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  deliveryPersonId: string | null;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  items: OrderItem[];
}

interface ChatMsg {
  id: string;
  orderId: string;
  fromUserId: string;
  fromRole: string;
  text: string;
  createdAt: string;
}

const STATUSES = ['pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  pending:     'Очікує',
  confirmed:   'Підтверджено',
  in_progress: 'В дорозі',
  delivered:   'Доставлено',
  cancelled:   'Скасовано',
};

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref('');
const updatingId = ref<string | null>(null);

const chatOpen = ref(false);
const activeOrder = ref<Order | null>(null);
const messages = ref<ChatMsg[]>([]);
const newMessage = ref('');
const chatLoading = ref(false);
const messagesEl = ref<HTMLElement | null>(null);

let socket: Socket | null = null;

const wsBase = import.meta.env.VITE_WS_URL || 'ws://localhost:8081';

const fetchOrders = async () => {
  loading.value = true;
  error.value = '';
  try {
    const endpoint = authStore.isAdmin ? '/admin/orders' : '/admin/courier/orders';
    const { data } = await apiClient.get(endpoint);
    orders.value = data;
  } catch (err) {
    error.value = 'Не вдалося завантажити замовлення';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (order: Order, newStatus: string) => {
  updatingId.value = order.id;
  try {
    const endpoint = authStore.isAdmin
      ? `/admin/orders/${order.id}/status`
      : `/admin/courier/orders/${order.id}/status`;
    const { data } = await apiClient.patch(endpoint, { status: newStatus });
    order.status = data.status;
  } catch (err) {
    alert('Не вдалося оновити статус');
  } finally {
    updatingId.value = null;
  }
};

const openChat = async (order: Order) => {
  activeOrder.value = order;
  chatOpen.value = true;
  chatLoading.value = true;
  messages.value = [];

  try {
    const { data } = await apiClient.get(`/admin/chat/${order.id}`);
    messages.value = data;
  } catch (err) {
    console.error('Failed to load chat history', err);
  } finally {
    chatLoading.value = false;
  }

  if (!socket) {
    socket = io(`${wsBase}/chat`, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });
  }

  const joinCurrentRoom = () => {
    if (!activeOrder.value) return;
    socket!.emit('join-order-room', activeOrder.value.id);
    if (authStore.isAdmin) socket!.emit('join-admin-room');
  };

  socket.off('connect');
  socket.off('reconnect');
  socket.on('connect', joinCurrentRoom);
  socket.on('reconnect', joinCurrentRoom);

  joinCurrentRoom();

  socket.off('new-message');
  socket.on('new-message', (msg: ChatMsg) => {
    if (msg.orderId === activeOrder.value?.id) {
      messages.value.push(msg);
      scrollToBottom();
    }
  });

  scrollToBottom();
};

const closeChat = () => {
  chatOpen.value = false;
  activeOrder.value = null;
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !activeOrder.value || !socket) return;
  const user = authStore.user as any;
  socket.emit('send-message', {
    orderId: activeOrder.value.id,
    fromUserId: String(user?.id || ''),
    fromRole: authStore.role,
    text: newMessage.value.trim(),
  });
  newMessage.value = '';
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  });
};

const orderTotal = (order: Order) =>
  order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2);

function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#3b82f6',
    in_progress: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444',
  };
  return map[status] || '#9ca3af';
}

function roleLabel(role: string): string {
  const map: Record<string, string> = { user: 'Клієнт', admin: 'Адмін', delivery: 'Кур\'єр' };
  return map[role] || role;
}

onMounted(fetchOrders);

onUnmounted(() => {
  socket?.disconnect();
});
</script>

<template>
  <div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem">
      <h2 style="margin:0">{{ authStore.isAdmin ? 'Замовлення кур\'єрів' : 'Мої замовлення' }}</h2>
      <button @click="fetchOrders" style="padding:6px 14px; border-radius:6px; cursor:pointer">
        ↻ Оновити
      </button>
    </div>

    <div v-if="error" style="color:red; margin-bottom:1rem">{{ error }}</div>
    <div v-if="loading" style="text-align:center; padding:2rem; color:#888">Завантаження...</div>

    <div v-else-if="orders.length === 0" style="text-align:center; padding:2rem; color:#888">
      Немає призначених замовлень
    </div>

    <table v-else class="orders-table">
      <thead>
        <tr>
          <th>ID замовлення</th>
          <th>Дата</th>
          <th>Товари</th>
          <th>Сума</th>
          <th>Статус</th>
          <th>Змінити статус</th>
          <th>Чат</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td class="mono">{{ order.id.substring(0, 8) }}…</td>
          <td>{{ new Date(order.createdAt).toLocaleString('uk-UA') }}</td>
          <td>
            <div v-for="item in order.items" :key="item.id" style="font-size:0.85rem">
              {{ item.name }} × {{ item.quantity }}
            </div>
          </td>
          <td style="white-space:nowrap">{{ orderTotal(order) }} ₴</td>
          <td>
            <span class="status-badge" :style="{ backgroundColor: statusColor(order.status) }">
              {{ STATUS_LABELS[order.status] || order.status }}
            </span>
          </td>
          <td>
            <select
              :value="order.status"
              :disabled="updatingId === order.id"
              @change="updateStatus(order, ($event.target as HTMLSelectElement).value)"
              style="padding:4px 8px; border-radius:6px; border:1px solid #ddd; cursor:pointer"
            >
              <option v-for="s in STATUSES" :key="s" :value="s">{{ STATUS_LABELS[s] }}</option>
            </select>
          </td>
          <td>
            <button @click="openChat(order)" class="chat-btn">💬 Чат</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Chat Panel -->
    <div v-if="chatOpen && activeOrder" class="chat-overlay">
      <div class="chat-panel">
        <div class="chat-header">
          <span>Чат — замовлення #{{ activeOrder.id.substring(0, 8) }}</span>
          <button @click="closeChat" class="close-btn">✕</button>
        </div>

        <div ref="messagesEl" class="chat-messages">
          <div v-if="chatLoading" style="text-align:center; color:#888; padding:1rem">Завантаження...</div>
          <div v-else-if="messages.length === 0" style="text-align:center; color:#aaa; padding:1rem">
            Повідомлень ще немає
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message"
            :class="msg.fromRole"
          >
            <div class="msg-meta">
              <span class="msg-role">{{ roleLabel(msg.fromRole) }}</span>
              <span class="msg-time">{{ new Date(msg.createdAt).toLocaleTimeString('uk-UA') }}</span>
            </div>
            <div class="msg-text">{{ msg.text }}</div>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="newMessage"
            placeholder="Повідомлення..."
            @keyup.enter="sendMessage"
          />
          <button @click="sendMessage">Надіслати</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
.orders-table th,
.orders-table td {
  border: 1px solid #e5e7eb;
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
}
.orders-table th {
  background: #f9fafb;
  font-weight: 600;
}
.orders-table tbody tr:hover { background: #f9fafb; }
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}
.mono { font-family: monospace; font-size: 0.82rem; color: #6b7280; }
.chat-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
}
.chat-btn:hover { background: #eff6ff; }

.chat-overlay {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
.chat-panel {
  width: 360px;
  height: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}
.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.message {
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 85%;
  font-size: 0.88rem;
}
.message.user     { background: #f3f4f6; align-self: flex-start; }
.message.delivery { background: #d1fae5; align-self: flex-end; }
.message.admin    { background: #dbeafe; align-self: flex-end; }
.msg-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 3px;
  font-size: 0.75rem;
  color: #9ca3af;
}
.msg-role { font-weight: 600; color: #6b7280; }
.chat-input {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
}
.chat-input input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.88rem;
  outline: none;
}
.chat-input input:focus { border-color: #3b82f6; }
.chat-input button {
  padding: 8px 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.88rem;
}
.chat-input button:hover { background: #2563eb; }
</style>
