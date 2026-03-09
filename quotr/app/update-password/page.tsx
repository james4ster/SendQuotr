"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else router.push("/");
    setLoading(false);
  };

  const inp = {
    width: "100%",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "15px 16px",
    color: "#f1f5f9",
    fontSize: "16px",
    outline: "none",
    fontFamily: "sans-serif",
    marginBottom: "12px",
  } as React.CSSProperties;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div
          style={{
            fontSize: "32px",
            color: "#f59e0b",
            marginBottom: "8px",
            fontWeight: 700,
          }}
        >
          Quotr
        </div>
        <div
          style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "15px" }}
        >
          Choose a new password
        </div>
        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: "10px",
              padding: "12px",
              color: "#f87171",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}
        <input
          style={inp}
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handle}
          style={{
            width: "100%",
            background: "#f59e0b",
            color: "#111",
            border: "none",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Please wait..." : "Update password"}
        </button>
      </div>
    </div>
  );
}
