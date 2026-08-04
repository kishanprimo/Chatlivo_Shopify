"use client";
import { ReactNode, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import InstallPopUpWrapper from "./InstallPopUpWrapper";
//import ShowUnreadNotificationCount from "./ShowUnreadNotificationCount";
const ToastProviders = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="dark"
        closeButton={true}
        limit={3}
        toastStyle={{ background: "#1e293b", color: "#fff" }}
      />
    </>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000, // evict unused cache after 10 min
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});

const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_SIGNIN_ID!}>
        <Provider store={store}>
           
          <QueryClientProvider client={queryClient}>
            {/* <InstallPopUpWrapper /> */}
            {/* <ShowUnreadNotificationCount /> */}
            {children}
          </QueryClientProvider>
          <ToastProviders />
        </Provider>
      </GoogleOAuthProvider>
    </>
  );
}
export default AppProvider;
