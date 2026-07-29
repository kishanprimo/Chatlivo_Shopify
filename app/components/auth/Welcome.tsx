interface WelcomeProps {
  onLogin: () => void;
  onSignup: () => void;
}

export default function Welcome({
  onLogin,
  onSignup,
}: WelcomeProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f6f6f7",
      }}
    >
      <div
        style={{
          width: "500px",
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "12px",
          }}
        >
          Chatlivo
        </h1>

        <p
          style={{
            color: "#6b7280",
            lineHeight: 1.6,
            marginBottom: "30px",
          }}
        >
          Connect your Shopify store with Chatlivo and manage CRM,
          WhatsApp, AI, Campaigns and Analytics from one platform.
        </p>

        <button
          onClick={onSignup}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Create New Account
        </button>

        <button
          onClick={onLogin}
          style={{
            width: "100%",
            padding: "14px",
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Log In
        </button>
      </div>
    </div>
  );
}