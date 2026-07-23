import apiClient from "./apiClient";

interface TranslatePayload {
  language_name: string | undefined;
  text: string;
}

interface TranslateResponse {
  translated_text: string;
}

export const languageService = {
  translate: (payload: TranslatePayload) =>
    apiClient.post<TranslateResponse>("/language/translate", payload).then((r) => r.data),
};
