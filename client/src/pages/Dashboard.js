import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <p>You are now logged in ✅</p>
      <button
        style={{ padding: "10px 20px", marginTop: "20px" }}
        onClick={() => navigate("/chat")}
      >
        Go to Chat 💬
      </button>
    </div>
  );
}

export default Dashboard;
