import axios from "axios";

/** Same-origin client for Next.js Route Handlers. Supabase Auth owns the
 * cookie session, so this client must not attach legacy bearer/refresh tokens. */
const RestClient = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: { Accept: "application/json" },
  timeout: 15_000,
});

RestClient.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  } else if (config.data !== undefined && !config.headers.has("Content-Type")) {
    config.headers.set("Content-Type", "application/json");
  }
  return config;
});

export default RestClient;
