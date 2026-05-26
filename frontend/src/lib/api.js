import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const apiClient = axios.create({
  baseURL: API,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("fp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiGet = async (path, config = {}) => (await apiClient.get(path, config)).data;
export const apiPost = async (path, body, config = {}) => (await apiClient.post(path, body, config)).data;
export const apiPut = async (path, body, config = {}) => (await apiClient.put(path, body, config)).data;
export const apiDelete = async (path, config = {}) => (await apiClient.delete(path, config)).data;
