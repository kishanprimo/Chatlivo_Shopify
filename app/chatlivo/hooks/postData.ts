"use client"
import { useState } from "react";
import apiClient from "@/services/apiClient";

const useApiPost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const postData = async (url: string, bodyData: any, contentType = "application/json") => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(url, bodyData, {
        headers: { "Content-Type": contentType },
      });

      setData(response.data);
      return response.data;
    } catch (err: any) {      
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, postData };
};

export default useApiPost;
