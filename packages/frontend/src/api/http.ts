import axios from 'axios';

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: (() => void) | null) {
  logoutCallback = callback;
}

const http = axios.create();

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && logoutCallback) {
      logoutCallback();
    }
    return Promise.reject(error);
  }
);

export default http;
