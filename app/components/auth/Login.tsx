// import { useState } from "react";
// import API_BASE_URL from "../../services/api";
// import { useAppBridge } from "@shopify/app-bridge-react";

// interface LoginProps {
//     onBack: () => void;
//     onLoginSuccess: (organizationId: number) => void;
// }

// export default function Login({
//     onBack,
//     onLoginSuccess,
// }: LoginProps) {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const app = useAppBridge();

//     console.log("App Bridge:", app);
//     console.log("Keys:", Object.keys(app));
//     console.log("Own Keys:", Reflect.ownKeys(app));
//     console.log("Window:", window.shopify);
//     const handleLogin = async () => {
//         try {
//             setLoading(true);
//             console.log("1. Starting login");
//             const response = await fetch(`${API_BASE_URL}/auth/signup`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     email,
//                     password,
//                     login_type: "email",
//                     is_signup: false,
//                 }),
//             });
//             console.log("2. Login API completed");
//             const data = await response.json();

//             console.log("LOGIN RESPONSE:", data);

//             if (!response.ok) {
//                 alert(data.message || "Login failed");
//                 return;
//             }
//             console.log("4. Connect request completed");

//             const connectResponse = await fetch("/api/shopify/connect", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     token: data.data.token,
//                 }),
//             });

//             const connectData = await connectResponse.json();
//             console.log("5. Connect response:", connectData);
//             console.log(connectData);

//             if (!connectResponse.ok) {
//                 alert(connectData.message);
//                 return;
//             }
//             const token = data.data.token;
//             const redirectUrl =
//                 `${import.meta.env.VITE_CHATLIVO_APP_URL}/shopify-auth?token=${encodeURIComponent(token)}`;

//             console.log("Redirect URL:", redirectUrl);

//             window.open(redirectUrl, "_top");
//             // window.location.href =
//             //     `${import.meta.env.VITE_CHATLIVO_APP_URL}/shopify-auth?token=${encodeURIComponent(token)}`;
//             // We'll use these in the next step
//             // const token = data.data.token;
//             // const organizationId = data.data.organization_id;
//         } catch (error) {
//             console.error(error);
//             alert("Network Error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div
//             style={{
//                 minHeight: "100vh",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 background: "#f6f6f7",
//             }}
//         >
//             <div
//                 style={{
//                     width: "420px",
//                     background: "#fff",
//                     padding: "40px",
//                     borderRadius: "12px",
//                     boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
//                 }}
//             >
//                 <h2
//                     style={{
//                         textAlign: "center",
//                         marginBottom: "30px",
//                     }}
//                 >
//                     Chatlivo Login
//                 </h2>

//                 <div style={{ marginBottom: "20px" }}>
//                     <label>Email</label>

//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Enter your email"
//                         style={{
//                             width: "100%",
//                             marginTop: "8px",
//                             padding: "12px",
//                             border: "1px solid #d1d5db",
//                             borderRadius: "8px",
//                             boxSizing: "border-box",
//                         }}
//                     />
//                 </div>

//                 <div style={{ marginBottom: "25px" }}>
//                     <label>Password</label>

//                     <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Enter your password"
//                         style={{
//                             width: "100%",
//                             marginTop: "8px",
//                             padding: "12px",
//                             border: "1px solid #d1d5db",

//                             borderRadius: "8px",
//                             boxSizing: "border-box",
//                         }}
//                     />
//                 </div>

//                 <button
//                     onClick={handleLogin}
//                     disabled={loading}
//                     style={{
//                         width: "100%",
//                         padding: "14px",
//                         background: "#000",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "8px",
//                         cursor: loading ? "not-allowed" : "pointer",
//                         opacity: loading ? 0.7 : 1,
//                         fontSize: "16px",
//                     }}
//                 >
//                     {loading ? "Logging In..." : "Log In"}
//                 </button>

//                 <button
//                     onClick={onBack}
//                     style={{
//                         width: "100%",
//                         marginTop: "15px",
//                         padding: "12px",
//                         background: "transparent",
//                         border: "none",
//                         cursor: "pointer",
//                         color: "#2563eb",
//                     }}
//                 >
//                     ← Back
//                 </button>
//             </div>
//         </div>
//     );
// }