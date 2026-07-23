"use client";
import "@/i18n/index";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/utils/hooks";
import { codeToI18n, LANGUAGES } from "@/i18n/languages";
import { setLanguage } from "@/app/store/Slices/userConfigureSlice";

const LANG_STORAGE_KEY = "app_language";
const RTL_LANGS = ["ar", "ur", "fa", "he"];

const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.userProfile.language);

  // On first client render, sync localStorage → Redux (fixes SSR default "EN")
  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && LANGUAGES[saved] && saved !== language) {
      dispatch(setLanguage(saved));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const i18nCode = codeToI18n(language);
    if (i18n.language !== i18nCode) {
      i18n.changeLanguage(i18nCode);
      localStorage.setItem("i18nextLng", i18nCode);
    }
    document.documentElement.dir = RTL_LANGS.includes(i18nCode) ? "rtl" : "ltr";
    document.documentElement.lang = i18nCode;
  }, [language, i18n]);

  return <>{children}</>;
};

export default I18nProvider;
