"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BottomNav from "./BottomNav";

export default function ProfileClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [tradeType, setTradeType] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);

      const { data: contractor } = await supabase
        .from("contractors")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (contractor) {
        setBusinessName(contractor.business_name || "");
        setPhone(contractor.phone || "");
        setTradeType(contractor.trade_type || "");
        setLogoUrl(contractor.logo_url || null);
      }
      setLoading(false);
    });
  }, []);

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${userId}/logo.${ext}`;

    const { error } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      alert(error.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(path);

    console.log("Public URL:", publicUrl);
    setLogoUrl(publicUrl);
    setUploading(false);
  };

  const save = async () => {
    if (!userId) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("contractors").upsert({
      id: userId,
      email: user?.email,
      business_name: businessName,
      phone,
      trade_type: tradeType,
      logo_url: logoUrl,
    });

    if (error) {
      console.error("Save error:", error);
      alert(error.message);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const inp = {
    width: "100%",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "15px 16px",
    color: "#f1f5f9",
    fontSize: "17px",
    outline: "none",
    fontFamily: "'Familjen Grotesk',sans-serif",
  };

  const lbl = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#cbd5e1",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f59e0b",
          fontFamily: "sans-serif",
        }}
      >
        Loading...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f1f5f9",
        fontFamily: "'Familjen Grotesk',sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "480px",
          margin: "0 auto",
        }}
      >
        <div>
          <div style={{ fontSize: "26px", color: "#f59e0b", fontWeight: 700 }}>
            Quotr
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#475569",
              letterSpacing: "1.5px",
              marginTop: "2px",
            }}
          >
            PROFILE
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 0" }}
      >
        {/* Logo upload */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "#1e293b",
              border: "2px solid #334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "16px",
                background: "#1e293b",
                border: "2px solid #334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "6px",
                  }}
                />
              ) : (
                <span style={{ fontSize: "28px" }}>🏢</span>
              )}
            </div>
          </div>
          <div>
            <label
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "10px",
                color: "#f59e0b",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Familjen Grotesk',sans-serif",
              }}
            >
              {uploading ? "Uploading..." : "Upload logo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadLogo}
                style={{ display: "none" }}
              />
            </label>
            <div
              style={{ fontSize: "11px", color: "#475569", marginTop: "6px" }}
            >
              PNG, JPG or WebP · Max 2MB
            </div>
          </div>
        </div>

        {/* Business name */}
        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Business name</label>
          <input
            style={inp}
            placeholder="e.g. Mike's Roofing Co."
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Phone number</label>
          <input
            style={inp}
            placeholder="e.g. (215) 555-0182"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Trade type */}
        <div style={{ marginBottom: "32px" }}>
          <label style={lbl}>Primary trade</label>
          <input
            style={inp}
            placeholder="e.g. Roofing"
            value={tradeType}
            onChange={(e) => setTradeType(e.target.value)}
          />
        </div>

        {/* Save */}
        <button
          onClick={save}
          style={{
            width: "100%",
            background: saved ? "#22c55e" : "#f59e0b",
            color: "#111",
            border: "none",
            borderRadius: "14px",
            padding: "18px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Familjen Grotesk',sans-serif",
            boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
            transition: "background 0.2s",
          }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save profile"}
        </button>

        {/* Sing Out */}
        <button
          onClick={signOut}
          style={{
            width: "100%",
            background: "transparent",
            color: "#475569",
            border: "1px solid #1e293b",
            borderRadius: "14px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Familjen Grotesk',sans-serif",
            marginTop: "12px",
          }}
        >
          Sign out
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
