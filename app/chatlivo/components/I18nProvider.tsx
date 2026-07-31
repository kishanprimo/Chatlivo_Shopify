import React from "react";

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider = ({ children }: I18nProviderProps) => {
  return <>{children}</>;
};

export default I18nProvider;
