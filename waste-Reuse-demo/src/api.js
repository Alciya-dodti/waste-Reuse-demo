/**
 * API utility module.
 * Creates a reusable Axios instance for backend requests and tracks user interactions.
 */
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
  console.error("API base URL is missing");
}

export function getApiBaseUrl() {
  return (API_BASE_URL || "").replace(/\/+$/, "");
}

export function buildApiUrl(path) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

const API = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000
});

export function trackVisit(serviceName) {
  console.log("User visited:", serviceName);
}

export default API;