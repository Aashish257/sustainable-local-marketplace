import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:6000/api', // Updated to match running backend
});

// Products
export const getAllProducts = () => API.get('/products');
export const getProductById = (id) => API.get(`/products/${id}`);
