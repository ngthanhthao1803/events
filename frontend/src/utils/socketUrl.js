export function getSocketUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }

  return window.location.origin;
}
