export const buildImageUrl = (path?: string | null) => {
  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (!path || typeof path !== "string") return "";

  // If already a full URL, just return it
  if (path.startsWith("http")) {
    return path;
  }

  // Remove leading slashes from path
  const cleanPath = path.replace(/^\/+/, "");

  return `${baseUrl}${cleanPath}`;
};
