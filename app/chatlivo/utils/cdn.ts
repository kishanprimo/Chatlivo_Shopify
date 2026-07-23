const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "") || "";

export const cdnImage = (path: string) => `${CDN_URL}/${path.replace(/^\//, "")}`;
