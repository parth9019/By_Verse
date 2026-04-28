import api from "./axios";

export const getProducts = () => api.get("/admin/products");

export const createProduct = (data) =>
  api.post("/admin/products", data);

export const deleteProduct = (id) =>
  api.delete(`/admin/products/${id}`);
