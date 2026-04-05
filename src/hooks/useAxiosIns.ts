import { useEffect } from "react";
import axios from "axios";
import useRefreshToken from "./useRefreshToken";

export const provincesOpenAPI = axios.create({
  baseURL: import.meta.env.VITE_VN_PROVINCES_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

export const rawAxios = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const rawPublicAxios = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const axiosIns = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const useAxiosIns = () => {
  const refreshToken = useRefreshToken();

  useEffect(() => {
    const requestIntercept = axiosIns.interceptors.request.use(
      async (config) => {
        // if (!config.headers["Authorization"]) {
        //   const token = getAccessToken();
        //   config.headers["Authorization"] = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    const responseIntercept = axiosIns.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error?.config;
        if (error?.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // Nếu đang refresh, đẩy request này vào hàng đợi (Queue)
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return axiosIns(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          return new Promise((resolve, reject) => {
            refreshToken()
              .then((newToken) => {
                if (!newToken) {
                  processQueue(new Error("Refresh failed"));
                  reject(error);
                  return;
                }

                processQueue(null);
                resolve(axiosIns(originalRequest));
              })
              .catch((err) => {
                processQueue(err);
                reject(err);
              })
              .finally(() => {
                isRefreshing = false;
              });
          });
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.request.eject(requestIntercept);
      axios.interceptors.response.eject(responseIntercept);
    };
  }, [refreshToken]);

  return axiosIns;
};

export default useAxiosIns;
