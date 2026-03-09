"use client";
import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();

  const tabs = [
    { icon: "📱", label: "Quote", href: "/" },
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0f172a",
        borderTop: "1px solid #1e293b",
        display: "flex",
        zIndex: 200,
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      {tabs.map(({ icon, label, href }) => {
        const active = path === href;
        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{
              flex: 1,
              padding: "12px 0 16px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "20px" }}>{icon}</span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                fontFamily: "'Familjen Grotesk',sans-serif",
                color: active ? "#f59e0b" : "#475569",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
