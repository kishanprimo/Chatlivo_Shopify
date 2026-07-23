import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("chat_saas_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/verify-otp") ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/signup") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      Cookies.remove("chat_saas_auth_token");
      Cookies.remove("is_user_verified");
      Cookies.remove("is_setup_done");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    const err = new Error(message);
    (err as any).message = message;
    return Promise.reject(err);
  },
);

export default apiClient;
