"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handle = async () => {
    setLoading(true);
    setError("");
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) setError(error.message);
    else setResetSent(true);
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

  if (resetSent)
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
        <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
          <div
            style={{
              color: "#f1f5f9",
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            Check your email
          </div>
          <div
            style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "24px" }}
          >
            We sent a password reset link to {email}
          </div>
          <span
            onClick={() => {
              setResetSent(false);
              setForgotPassword(false);
            }}
            style={{
              color: "#f59e0b",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Back to sign in
          </span>
        </div>
      </div>
    );

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

        {/* Subtitle */}
        <div
          style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "15px" }}
        >
          {forgotPassword
            ? "Enter your email to reset your password"
            : isSignup
              ? "Create your account"
              : "Welcome back"}
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

        {/* Email always shown */}
        <input
          style={inp}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password hidden in forgot password mode */}
        {!forgotPassword && (
          <input
            style={inp}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {/* Main button */}
        <button
          onClick={forgotPassword ? handleReset : handle}
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
            marginBottom: "16px",
          }}
        >
          {loading
            ? "Please wait..."
            : forgotPassword
              ? "Send reset link"
              : isSignup
                ? "Create account"
                : "Sign in"}
        </button>

        {/* Forgot password link */}
        {!isSignup && !forgotPassword && (
          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <span
              onClick={() => setForgotPassword(true)}
              style={{ color: "#475569", fontSize: "13px", cursor: "pointer" }}
            >
              Forgot password?
            </span>
          </div>
        )}

        {/* Sign up / sign in toggle */}
        {!forgotPassword && (
          <div
            style={{ textAlign: "center", color: "#64748b", fontSize: "14px" }}
          >
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => setIsSignup(!isSignup)}
              style={{ color: "#f59e0b", cursor: "pointer", fontWeight: 600 }}
            >
              {isSignup ? "Sign in" : "Sign up"}
            </span>
          </div>
        )}

        {/* Back to sign in when in forgot password mode */}
        {forgotPassword && (
          <div style={{ textAlign: "center" }}>
            <span
              onClick={() => setForgotPassword(false)}
              style={{ color: "#475569", fontSize: "13px", cursor: "pointer" }}
            >
              Back to sign in
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
