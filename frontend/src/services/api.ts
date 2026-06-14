import axios from "axios";

/**
 * Shared Axios instance for talking to the ESP32 backend REST API.
 * The base URL can be overridden via VITE_API_BASE_URL for different
 * deployment environments without touching component code.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/tank";
console.log("Connecting to API at:", API_BASE_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});
