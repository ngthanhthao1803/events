export function getSocketUrl() {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:3001";
  }

  const configuredUrl = import.meta.env.VITE_SOCKET_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  return window.location.origin;
}
