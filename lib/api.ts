import axios from "axios";

const localUrl = process.env.NEXT_PUBLIC_API_URL_LOCAL ?? "http://localhost:8000";
const liveUrl = process.env.NEXT_PUBLIC_API_URL_LIVE ?? "http://52.231.159.124";
const apiEnv = process.env.NEXT_PUBLIC_API_ENV ?? "live";

export const BASE_URL = apiEnv === "local" ? localUrl : liveUrl;

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
