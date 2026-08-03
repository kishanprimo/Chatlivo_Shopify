const CDN_URL = import.meta.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "") || "";

export const cdnImage = (path: string) => `${CDN_URL}/${path.replace(/^\//, "")}`;
