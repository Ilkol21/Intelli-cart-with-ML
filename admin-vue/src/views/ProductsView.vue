<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

const products = ref<Product[]>([]);
const newProduct = ref({ name: '', description: '', price: 0, category: '' });
const newImageFile = ref<File | null>(null);
const error = ref<string | null>(null);

// --- Редагування ---
const editingProduct = ref<Product | null>(null);
const editImageFile = ref<File | null>(null);
const editImagePreview = ref<string>('');
const saving = ref(false);

const fetchProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    products.value = response.data;
  } catch (err) {
    error.value = 'Не вдалося завантажити товари';
  }
};

const onNewFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) newImageFile.value = file;
};

const handleAddProduct = async () => {
  const formData = new FormData();
  formData.append('name', newProduct.value.name);
  formData.append('description', newProduct.value.description);
  formData.append('price', String(newProduct.value.price));
  formData.append('category', newProduct.value.category);
  if (newImageFile.value) formData.append('image', newImageFile.value);

  try {
    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    products.value.push(response.data);
    newProduct.value = { name: '', description: '', price: 0, category: '' };
    newImageFile.value = null;
    (document.getElementById('new-image-upload') as HTMLInputElement).value = '';
  } catch (err) {
    error.value = 'Не вдалося додати товар';
  }
};

const openEdit = (product: Product) => {
  editingProduct.value = { ...product };
  editImageFile.value = null;
  editImagePreview.value = product.imageUrl ? `http://localhost:8080${product.imageUrl}` : '';
};

const closeEdit = () => {
  editingProduct.value = null;
  editImageFile.value = null;
  editImagePreview.value = '';
};

const onEditFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    editImageFile.value = file;
    editImagePreview.value = URL.createObjectURL(file);
  }
};

const handleSaveProduct = async () => {
  if (!editingProduct.value) return;
  saving.value = true;

  const formData = new FormData();
  formData.append('name', editingProduct.value.name);
  formData.append('description', editingProduct.value.description || '');
  formData.append('price', String(editingProduct.value.price));
  formData.append('category', editingProduct.value.category || '');
  if (editImageFile.value) formData.append('image', editImageFile.value);

  try {
    const response = await apiClient.put(`/products/${editingProduct.value.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const idx = products.value.findIndex(p => p.id === editingProduct.value!.id);
    if (idx !== -1) products.value[idx] = response.data;
    closeEdit();
  } catch (err) {
    error.value = 'Не вдалося зберегти товар';
  } finally {
    saving.value = false;
  }
};

onMounted(fetchProducts);
</script>

<template>
  <div>
    <h2>Управління товарами</h2>
    <div v-if="error" style="color:red; margin-bottom:1rem">{{ error }}</div>

    <!-- Форма додавання -->
    <form @submit.prevent="handleAddProduct" class="product-form">
      <h3>Додати новий товар</h3>
      <input type="text" v-model="newProduct.name" placeholder="Назва" required />
      <input type="text" v-model="newProduct.description" placeholder="Опис" />
      <input type="number" v-model="newProduct.price" placeholder="Ціна" required />
      <input type="text" v-model="newProduct.category" placeholder="Категорія" required />
      <div>
        <label for="new-image-upload">Зображення</label>
        <input id="new-image-upload" type="file" @change="onNewFileChange" accept="image/*" />
      </div>
      <button type="submit">Додати товар</button>
    </form>

    <!-- Таблиця -->
    <h3>Існуючі товари ({{ products.length }})</h3>
    <table class="product-table">
      <thead>
        <tr>
          <th>Зображення</th>
          <th>Назва</th>
          <th>Ціна</th>
          <th>Категорія</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <img v-if="product.imageUrl"
              :src="`http://localhost:8080${product.imageUrl}`"
              :alt="product.name" width="50" />
            <span v-else style="color:#aaa; font-size:0.8rem">немає</span>
          </td>
          <td>{{ product.name }}</td>
          <td>{{ product.price }} UAH</td>
          <td>{{ product.category }}</td>
          <td>
            <button class="edit-btn" @click="openEdit(product)">✏️ Редагувати</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Модальне вікно редагування -->
    <div v-if="editingProduct" class="modal-overlay" @click.self="closeEdit">
      <div class="modal">
        <h3>Редагування товару</h3>

        <div class="image-preview">
          <img v-if="editImagePreview" :src="editImagePreview" alt="preview" />
          <div v-else class="no-image">Зображення відсутнє</div>
        </div>

        <div class="field">
          <label>Нове зображення</label>
          <input type="file" @change="onEditFileChange" accept="image/*" />
        </div>
        <div class="field">
          <label>Назва</label>
          <input type="text" v-model="editingProduct.name" required />
        </div>
        <div class="field">
          <label>Опис</label>
          <input type="text" v-model="editingProduct.description" />
        </div>
        <div class="field">
          <label>Ціна (UAH)</label>
          <input type="number" v-model="editingProduct.price" required />
        </div>
        <div class="field">
          <label>Категорія</label>
          <input type="text" v-model="editingProduct.category" />
        </div>

        <div class="modal-actions">
          <button class="save-btn" @click="handleSaveProduct" :disabled="saving">
            {{ saving ? 'Збереження...' : '💾 Зберегти' }}
          </button>
          <button class="cancel-btn" @click="closeEdit">Скасувати</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin-bottom: 2rem;
}
.product-form input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.product-table {
  width: 100%;
  border-collapse: collapse;
}
.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  vertical-align: middle;
}
.product-table th { background: #f9fafb; font-weight: 600; }
.product-table img { max-width: 50px; height: auto; border-radius: 4px; }
.edit-btn {
  padding: 4px 12px;
  border: 1px solid #3b82f6;
  background: white;
  color: #3b82f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.edit-btn:hover { background: #eff6ff; }

/* Модалка */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal h3 { margin: 0; }
.image-preview {
  width: 100%;
  height: 180px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f9fafb;
}
.image-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.no-image { color: #9ca3af; font-size: 0.9rem; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 0.85rem; font-weight: 500; color: #374151; }
.field input {
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
}
.modal-actions { display: flex; gap: 10px; margin-top: 6px; }
.save-btn {
  flex: 1;
  padding: 9px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
}
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cancel-btn {
  padding: 9px 20px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
}
</style>
