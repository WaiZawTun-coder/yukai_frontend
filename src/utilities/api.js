import { useAuth } from "../context/AuthContext";
import { getBackendUrl } from "./url";

export const useApi = () => {
  const { accessToken, refreshToken, logout, loading } = useAuth();

  const apiFetch = async (
    url,
    { method = "GET", body = null, headers = {}, retry = true } = {},
  ) => {
    if (loading) return;
    const isFormData = body instanceof FormData;

    const defaultHeaders = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const res = await fetch(getBackendUrl() + url, {
      method,
      headers: defaultHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : null,
      credentials: "include",
    });

    const contentType = res.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await res.json()
        : await res.text();

    if (!res.ok) {
      if (res.status === 401 && retry) {
        try {
          const newToken = await refreshToken();
          return apiFetch(url, { method, body, headers, retry: false });
        } catch (err) {
          logout();
          throw err;
        }
      }
      if (res.status === 403) {
        logout();
        throw new Error({ status: false, message: "This account is banned" });
      }
      // showSnackbar("Failed", "", "error");
      throw data;
    }

    return data;
  };

  return apiFetch;
};
