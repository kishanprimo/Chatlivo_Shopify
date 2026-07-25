import { useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
//import Dashboard from "../components/dashboard/Dashboard";
// import Welcome from "../components/auth/Welcome";
// import Login from "../components/auth/Login";
import ChatlivoApp from "../chatlivo/App";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function AppIndex() {
  const [screen, setScreen] = useState<
    "welcome" | "login" | "signup" | "otp" | "dashboard"
  >("welcome");

  const [organizationId, setOrganizationId] = useState<number | null>(null);

  switch (screen) {
    case "welcome":
      // return (
      //   <Welcome
      //     onLogin={() => setScreen("login")}
      //     onSignup={() => setScreen("signup")}
      //   />
      // );

    case "login":
      // return (
      //   <Login
      //     onBack={() => setScreen("welcome")}
      //     onLoginSuccess={(organizationId) => {
      //       setOrganizationId(organizationId);
      //       setScreen("dashboard");
      //     }}
      //   />
      // );

    case "signup":
      return <div>Signup Screen</div>;

    case "otp":
      return <div>Verify OTP Screen</div>;
    case "dashboard":
      return (
        <ChatlivoApp />
      );
    default:
      return null;
  }
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};