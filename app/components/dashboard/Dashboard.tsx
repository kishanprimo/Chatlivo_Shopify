interface DashboardProps {
  organizationId: number;
}

export default function Dashboard({
  organizationId,
}: DashboardProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f6f7",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            marginBottom: "12px",
          }}
        >
          🎉 Chatlivo Connected
        </h1>

        <p>
          Shopify Store successfully connected with Chatlivo.
        </p>

        <br />

        <strong>
          Organization ID :
        </strong>

        <p>{organizationId}</p>

        <hr
          style={{
            margin: "30px 0",
          }}
        />

        <h2>Coming Next</h2>

        <ul>
          <li>CRM</li>
          <li>WhatsApp</li>
          <li>AI</li>
          <li>Campaigns</li>
          <li>Analytics</li>
        </ul>
      </div>
    </div>
  );
}