<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../services/api';
import { authStore } from '../stores/auth';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLES = ['user', 'admin', 'delivery'];
const ROLE_LABELS: Record<string, string> = {
  user: 'Користувач',
  admin: 'Адмін',
  delivery: 'Кур\'єр',
};

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref('');
const updatingId = ref<number | null>(null);
const currentUserId = computed(() => (authStore.user as any)?.id);

const search = ref('');
const filterRole = ref('');
const filterStatus = ref('');

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim();
  return users.value.filter(u => {
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole   = !filterRole.value   || u.role === filterRole.value;
    const matchesStatus = !filterStatus.value || String(u.is_active) === filterStatus.value;
    return matchesSearch && matchesRole && matchesStatus;
  });
});

const fetchUsers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await apiClient.get('/admin/users');
    users.value = data;
  } catch (err) {
    error.value = 'Не вдалося завантажити користувачів';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const updateRole = async (user: User, newRole: string) => {
  updatingId.value = user.id;
  try {
    await apiClient.patch(`/admin/users/${user.id}/role`, { role: newRole });
    user.role = newRole;
  } catch (err) {
    console.error('Failed to update role', err);
    alert('Не вдалося оновити роль');
  } finally {
    updatingId.value = null;
  }
};

const toggleStatus = async (user: User) => {
  updatingId.value = user.id;
  try {
    await apiClient.patch(`/admin/users/${user.id}/status`, { is_active: !user.is_active });
    user.is_active = !user.is_active;
  } catch (err) {
    console.error('Failed to update status', err);
    alert('Не вдалося змінити статус');
  } finally {
    updatingId.value = null;
  }
};

onMounted(fetchUsers);
</script>

<template>
  <div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
      <h2 style="margin:0">Користувачі</h2>
      <button @click="fetchUsers" style="padding:6px 14px; border-radius:6px; cursor:pointer">
        ↻ Оновити
      </button>
    </div>

    <div class="filters">
      <input
        v-model="search"
        placeholder="Пошук за ім'ям або email..."
        class="filter-input"
      />
      <select v-model="filterRole" class="filter-select">
        <option value="">Всі ролі</option>
        <option v-for="r in ROLES" :key="r" :value="r">{{ ROLE_LABELS[r] }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="">Всі статуси</option>
        <option value="true">Активні</option>
        <option value="false">Заблоковані</option>
      </select>
      <span class="filter-count">{{ filteredUsers.length }} / {{ users.length }}</span>
    </div>

    <div v-if="error" style="color:red; margin-bottom:1rem">{{ error }}</div>
    <div v-if="loading" style="text-align:center; padding:2rem; color:#888">Завантаження...</div>

    <div v-else-if="filteredUsers.length === 0" style="text-align:center; padding:2rem; color:#888">
      Нікого не знайдено
    </div>

    <table v-else class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Ім'я</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Статус</th>
          <th>Дата реєстрації</th>
          <th>Змінити роль</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'current-user': user.id === currentUserId }">
          <td class="mono">{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span class="role-badge" :class="'role-' + user.role">
              {{ ROLE_LABELS[user.role] || user.role }}
            </span>
          </td>
          <td>
            <span class="status-badge" :class="user.is_active ? 'active' : 'inactive'">
              {{ user.is_active ? 'Активний' : 'Заблокований' }}
            </span>
          </td>
          <td>{{ new Date(user.created_at).toLocaleString('uk-UA') }}</td>
          <td>
            <template v-if="user.id === currentUserId">
              <span style="color:#9ca3af; font-size:0.85rem">— це ви —</span>
            </template>
            <template v-else>
              <select
                :value="user.role"
                :disabled="updatingId === user.id"
                @change="updateRole(user, ($event.target as HTMLSelectElement).value)"
                style="padding:4px 8px; border-radius:6px; border:1px solid #ddd; cursor:pointer"
              >
                <option v-for="r in ROLES" :key="r" :value="r">{{ ROLE_LABELS[r] }}</option>
              </select>
              <span v-if="updatingId === user.id" style="font-size:0.75rem; color:#888; margin-left:6px">...</span>
            </template>
          </td>
          <td>
            <template v-if="user.id !== currentUserId">
              <button
                :disabled="updatingId === user.id"
                @click="toggleStatus(user)"
                class="status-btn"
                :class="user.is_active ? 'disable' : 'enable'"
              >
                {{ user.is_active ? 'Заблокувати' : 'Розблокувати' }}
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
.users-table th,
.users-table td {
  border: 1px solid #e5e7eb;
  padding: 10px 12px;
  text-align: left;
  vertical-align: middle;
}
.users-table th {
  background: #f9fafb;
  font-weight: 600;
  white-space: nowrap;
}
.users-table tbody tr:hover {
  background: #f9fafb;
}
.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}
.role-user     { background: #6b7280; }
.role-admin    { background: #3b82f6; }
.role-delivery { background: #10b981; }
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 500; color: white; }
.status-badge.active   { background: #10b981; }
.status-badge.inactive { background: #ef4444; }
.status-btn { padding: 4px 10px; border-radius: 6px; border: 1px solid; cursor: pointer; font-size: 0.82rem; background: white; }
.status-btn.disable { border-color: #ef4444; color: #ef4444; }
.status-btn.disable:hover { background: #fef2f2; }
.status-btn.enable  { border-color: #10b981; color: #10b981; }
.status-btn.enable:hover  { background: #f0fdf4; }
.status-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.mono {
  font-family: monospace;
  font-size: 0.82rem;
  color: #6b7280;
}
.current-user { background: #fefce8; }
.filters {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.filter-input {
  flex: 1;
  min-width: 200px;
  padding: 7px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}
.filter-input:focus { border-color: #3b82f6; }
.filter-select {
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}
.filter-count {
  font-size: 0.85rem;
  color: #9ca3af;
  white-space: nowrap;
}
</style>
