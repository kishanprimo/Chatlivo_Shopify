import axios from "axios";

export const fetchMetadata = async (url: string) => {
  const localStorageKey = `metadata_${encodeURIComponent(url)}`;

  try {
    const cachedData = localStorage.getItem(localStorageKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // External third-party service — intentionally uses plain axios (not apiClient)
    const response = await axios.get(`https://api.microlink.io`, {
      params: { url },
    });

    const data = response.data.data;

    const metadata = {
      title: data.title || "",
      description: data.description || "",
      image: data.image?.url || data.logo?.url || "",
    };

    localStorage.setItem(localStorageKey, JSON.stringify(metadata));
    
    return metadata;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return { title: "", description: "", image: "" };
  }
}
