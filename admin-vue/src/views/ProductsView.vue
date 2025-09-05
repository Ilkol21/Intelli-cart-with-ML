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
const newProduct = ref({
  name: '',
  description: '',
  price: 0,
  category: '',
});
const imageFile = ref<File | null>(null);
const error = ref<string | null>(null);

const fetchProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    products.value = response.data;
  } catch (err) {
    error.value = 'Failed to fetch products';
    console.error(err);
  }
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    imageFile.value = target.files[0];
  }
};

const handleAddProduct = async () => {
  const formData = new FormData();
  formData.append('name', newProduct.value.name);
  formData.append('description', newProduct.value.description);
  formData.append('price', String(newProduct.value.price));
  formData.append('category', newProduct.value.category);
  if (imageFile.value) {
    formData.append('image', imageFile.value);
  }

  try {
    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    products.value.push(response.data);
    // Reset form
    newProduct.value = { name: '', description: '', price: 0, category: '' };
    imageFile.value = null;
    // Optionally reset the file input visually
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  } catch (err) {
    error.value = 'Failed to add product';
    console.error(err);
  }
};

onMounted(fetchProducts);
</script>

<template>
  <div>
    <h2>Управління товарами</h2>
    <div v-if="error" style="color: red">{{ error }}</div>

    <form @submit.prevent="handleAddProduct" class="product-form">
      <h3>Додати новий товар</h3>
      <input type="text" v-model="newProduct.name" placeholder="Назва" required />
      <input type="text" v-model="newProduct.description" placeholder="Опис" required />
      <input type="number" v-model="newProduct.price" placeholder="Ціна" required />
      <input type="text" v-model="newProduct.category" placeholder="Категорія" required />

      <div>
        <label for="image-upload">Зображення товару</label>
        <input id="image-upload" type="file" @change="onFileChange" accept="image/*" />
      </div>

      <button type="submit">Додати товар</button>
    </form>

    <h3>Існуючі товари</h3>
    <table class="product-table">
      <thead>
      <tr>
        <th>Зображення</th>
        <th>Назва</th>
        <th>Ціна</th>
        <th>Категорія</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="product in products" :key="product.id">
        <td>
          <!-- Змінено шлях, щоб він був відносним до головного домену -->
          <img v-if="product.imageUrl" :src="`http://localhost:8080${product.imageUrl}`" :alt="product.name" width="50" />
        </td>
        <td>{{ product.name }}</td>
        <td>{{ product.price }} UAH</td>
        <td>{{ product.category }}</td>
      </tr>
      </tbody>
    </table>
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
.product-table {
  width: 100%;
  border-collapse: collapse;
}
.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.product-table th {
  background-color: #f2f2f2;
}
.product-table img {
  max-width: 50px;
  height: auto;
  border-radius: 4px;
}
</style>
