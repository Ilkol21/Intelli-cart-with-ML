<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../services/api';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUSES = ['pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'];

const STATUS_LABELS: Record<string, string> = {
  pending:     'Очікує',
  confirmed:   'Підтверджено',
  in_progress: 'В дорозі',
  delivered:   'Доставлено',
  cancelled:   'Скасовано',
};

const STATUS_COLORS: Record<string, string> = {
  pending:     '#f59e0b',
  confirmed:   '#3b82f6',
  in_progress: '#8b5cf6',
  delivered:   '#10b981',
  cancelled:   '#ef4444',
};

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref('');
const filterStatus = ref('');
const updatingId = ref<string | null>(null);

const filteredOrders = computed(() =>
  filterStatus.value
    ? orders.value.filter(o => o.status === filterStatus.value)
    : orders.value
);

const fetchOrders = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await apiClient.get('/admin/orders');
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
    const { data } = await apiClient.patch(`/admin/orders/${order.id}/status`, { status: newStatus });
    order.status = data.status;
  } catch (err) {
    console.error('Failed to update status', err);
    alert('Не вдалося оновити статус');
  } finally {
    updatingId.value = null;
  }
};

const orderTotal = (order: Order) =>
  order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2);

onMounted(fetchOrders);
</script>

<template>
  <div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem">
      <h2 style="margin:0">Замовлення</h2>
      <div style="display:flex; gap:10px; align-items:center">
        <select v-model="filterStatus" style="padding:6px 10px; border-radius:6px; border:1px solid #ddd">
          <option value="">Всі статуси</option>
          <option v-for="s in STATUSES" :key="s" :value="s">{{ STATUS_LABELS[s] }}</option>
        </select>
        <button @click="fetchOrders" style="padding:6px 14px; border-radius:6px; cursor:pointer">
          ↻ Оновити
        </button>
      </div>
    </div>

    <div v-if="error" style="color:red; margin-bottom:1rem">{{ error }}</div>
    <div v-if="loading" style="text-align:center; padding:2rem; color:#888">Завантаження...</div>

    <div v-else-if="filteredOrders.length === 0" style="text-align:center; padding:2rem; color:#888">
      Замовлень не знайдено
    </div>

    <table v-else class="orders-table">
      <thead>
        <tr>
          <th>ID замовлення</th>
          <th>Дата</th>
          <th>User ID</th>
          <th>Товари</th>
          <th>Сума</th>
          <th>Статус</th>
          <th>Змінити статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredOrders" :key="order.id">
          <td class="mono">{{ order.id.substring(0, 8) }}…</td>
          <td>{{ new Date(order.createdAt).toLocaleString('uk-UA') }}</td>
          <td class="mono">{{ order.userId }}</td>
          <td>
            <div v-for="item in order.items" :key="item.id" style="font-size:0.85rem">
              {{ item.name }} × {{ item.quantity }}
            </div>
          </td>
          <td style="white-space:nowrap">{{ orderTotal(order) }} ₴</td>
          <td>
            <span class="status-badge" :style="{ backgroundColor: STATUS_COLORS[order.status] }">
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
            <span v-if="updatingId === order.id" style="font-size:0.75rem; color:#888; margin-left:6px">...</span>
          </td>
        </tr>
      </tbody>
    </table>
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
  white-space: nowrap;
}
.orders-table tbody tr:hover {
  background: #f9fafb;
}
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}
.mono {
  font-family: monospace;
  font-size: 0.82rem;
  color: #6b7280;
}
</style>
