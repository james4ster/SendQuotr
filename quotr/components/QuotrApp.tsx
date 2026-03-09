"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import BottomNav from "./BottomNav";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
const fmtDec = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

function calcMonthly(amount: number, apr: number, months: number): number {
  if (apr === 0) return amount / months;
  const r = apr / 100 / 12;
  return (
    (amount * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1)
  );
}

const TERMS = [
  {
    months: 12,
    apr: 0,
    label: "12 months",
    tag: "0% Interest",
    tagColor: "#16a34a",
    tagBg: "#dcfce7",
  },
  {
    months: 24,
    apr: 9.99,
    label: "24 months",
    tag: null,
    tagColor: null,
    tagBg: null,
  },
  {
    months: 36,
    apr: 12.99,
    label: "36 months",
    tag: null,
    tagColor: null,
    tagBg: null,
  },
  {
    months: 60,
    apr: 14.99,
    label: "60 months",
    tag: "Lowest payment",
    tagColor: "#1d4ed8",
    tagBg: "#dbeafe",
  },
];

const TRADES = [
  "Roofing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Landscaping",
  "Windows",
  "Kitchen",
  "Flooring",
  "Bathroom",
  "General",
  "Other",
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  textarea { resize:none; }
  ::-webkit-scrollbar { display:none; }
  input[type=range] { -webkit-appearance:none; height:4px; border-radius:2px; background:#334155; width:100%; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:#f59e0b; cursor:pointer; border:3px solid #0f172a; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
  .fade-up { animation:fadeUp 0.25s ease forwards; }
  .check-pop { animation:checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
`;

// ─── DEMO TOGGLE BAR ─────────────────────────────────────────────────
function DemoBar({
  view,
  setView,
}: {
  view: string;
  setView: (v: string) => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#f59e0b",
        maxWidth: "430px",
        margin: "0 auto",
        padding: "12px 16px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "rgba(0,0,0,0.5)",
          fontFamily: "'Familjen Grotesk',sans-serif",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        PREVIEW MODE — TOGGLE VIEWS
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {[
          { id: "contractor", label: "📱 Contractor view" },
          { id: "customer", label: "👤 Customer view" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: view === id ? "#111827" : "rgba(0,0,0,0.15)",
              color: view === id ? "#f59e0b" : "rgba(0,0,0,0.6)",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Familjen Grotesk',sans-serif",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CONTRACTOR VIEW ─────────────────────────────────────────────────
function ContractorView({ onSent }: { onSent: (q: any) => void }) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [trade, setTrade] = useState("");
  const [desc, setDesc] = useState("");
  const [expiry, setExpiry] = useState("7");
  const [sending, setSending] = useState(false);
  const [customTrade, setCustomTrade] = useState("");

  const num = Number(amount.replace(/[^0-9]/g, "")) || 0;
  const lowest = num > 0 ? calcMonthly(num, 0, 12) : 0;
  const ready =
    customer.trim() && phone.replace(/\D/g, "").length >= 10 && num > 0;

  const send = async () => {
    if (!ready) return;
    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const res = await fetch("/api/send-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customer,
        customer_phone: phone,
        amount: num,
        trade: trade === "Other" ? customTrade : trade,
        description: desc,
        expiry_days: Number(expiry),
        contractor_id: user?.id,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setSending(false);
      onSent({
        customer,
        phone,
        amount: num,
        trade,
        desc,
        expiry,
        slug: data.slug,
      });
    } else {
      setSending(false);
      alert("Something went wrong. Please try again.");
    }
  };

  const lbl = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#cbd5e1",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "8px",
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f1f5f9",
        fontFamily: "'Familjen Grotesk',sans-serif",
        maxWidth: "430px",
        margin: "0 auto",
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
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "28px",
              color: "#f59e0b",
            }}
          >
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
            SEND A QUOTE IN 30 SECONDS
          </div>
        </div>
        <div
          style={{
            padding: "7px 14px",
            borderRadius: "100px",
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
            fontSize: "12px",
            color: "#f59e0b",
            fontWeight: 700,
          }}
        >
          FREE
        </div>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        {/* Name */}
        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Customer name *</label>
          <input
            style={inp}
            placeholder="e.g. Sarah Thompson"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Customer phone *</label>
          <input
            style={inp}
            placeholder="e.g. (215) 555-0182"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Job total *</label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#f59e0b",
                fontSize: "24px",
                fontFamily: "'Instrument Serif',serif",
                pointerEvents: "none",
              }}
            >
              $
            </span>
            <input
              style={{
                ...inp,
                paddingLeft: "34px",
                color: "#f59e0b",
                fontSize: "30px",
                fontFamily: "'Instrument Serif',serif",
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.25)",
              }}
              placeholder="0"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                const r = e.target.value.replace(/[^0-9]/g, "");
                setAmount(r ? Number(r).toLocaleString() : "");
              }}
            />
          </div>
        </div>

        {/* Live preview */}
        {num > 0 && customer && (
          <div
            className="fade-up"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.18)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#cbd5e1",
                  marginBottom: "2px",
                }}
              >
                {customer} will see
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                pay as low as...
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: "26px",
                  color: "#f59e0b",
                }}
              >
                {fmt(lowest)}
                <span
                  style={{
                    fontSize: "14px",
                    fontFamily: "'Familjen Grotesk',sans-serif",
                    color: "#64748b",
                  }}
                >
                  /mo
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>
                0% · 12 months
              </div>
            </div>
          </div>
        )}

        {/* Optional toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px dashed #334155",
            borderRadius: "12px",
            padding: "13px",
            color: "#94a3b8",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Familjen Grotesk',sans-serif",
            marginBottom: "18px",
          }}
        >
          {expanded
            ? "▲  Hide optional details"
            : "＋  Add trade, description & expiry (optional)"}
        </button>

        {expanded && (
          <div className="fade-up">
            <div style={{ marginBottom: "18px" }}>
              <label style={lbl}>Trade type</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {TRADES.map((t) => (
                  <div
                    key={t}
                    onClick={() => setTrade(trade === t ? "" : t)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${trade === t ? "rgba(245,158,11,0.4)" : "#334155"}`,
                      background:
                        trade === t ? "rgba(245,158,11,0.1)" : "transparent",
                      color: trade === t ? "#f59e0b" : "#94a3b8",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>

              {trade === "Other" && (
                <input
                  style={{ ...inp, marginTop: "10px", fontSize: "14px" }}
                  placeholder="Enter trade type..."
                  value={customTrade}
                  onChange={(e) => setCustomTrade(e.target.value)}
                />
              )}
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={lbl}>Job description</label>
              <textarea
                style={{ ...inp, minHeight: "76px", fontSize: "14px" }}
                placeholder="e.g. Full roof replacement, 2,400 sq ft..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={lbl}>Quote expires in</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["3", "7", "14", "30"].map((d) => (
                  <div
                    key={d}
                    onClick={() => setExpiry(d)}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "center",
                      border: `1px solid ${expiry === d ? "rgba(245,158,11,0.4)" : "#334155"}`,
                      background:
                        expiry === d ? "rgba(245,158,11,0.1)" : "transparent",
                      color: expiry === d ? "#f59e0b" : "#94a3b8",
                    }}
                  >
                    {d}d
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={send}
          style={{
            width: "100%",
            background: ready ? "#f59e0b" : "#1e293b",
            color: ready ? "#111" : "#475569",
            border: "none",
            borderRadius: "14px",
            padding: "19px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: ready ? "pointer" : "default",
            fontFamily: "'Familjen Grotesk',sans-serif",
            transition: "all 0.2s",
            boxShadow: ready ? "0 4px 20px rgba(245,158,11,0.3)" : "none",
          }}
        >
          {sending
            ? "Sending..."
            : `📱  Send quote to ${customer || "customer"}`}
        </button>
        {!ready && (
          <div
            style={{
              textAlign: "center",
              color: "#475569",
              fontSize: "13px",
              marginTop: "10px",
            }}
          >
            Name, phone & amount required
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SENT CONFIRMATION ────────────────────────────────────────────────
function SentView({ quote, onAnother }: { quote: any; onAnother: () => void }) {
  const lowest = calcMonthly(quote.amount, 0, 12);
  return (
    <div
      className="fade-up"
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f1f5f9",
        fontFamily: "'Familjen Grotesk',sans-serif",
        maxWidth: "430px",
        margin: "0 auto",
        padding: "44px 20px",
      }}
    >
      <div
        className="check-pop"
        style={{
          width: "84px",
          height: "84px",
          borderRadius: "50%",
          margin: "0 auto 24px",
          background: "rgba(34,197,94,0.12)",
          border: "2px solid rgba(34,197,94,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "38px",
        }}
      >
        ✓
      </div>

      <div
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: "32px",
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        Quote sent to
        <br />
        <span style={{ color: "#f59e0b", fontStyle: "italic" }}>
          {quote.customer}
        </span>
      </div>
      <div
        style={{
          color: "#94a3b8",
          fontSize: "15px",
          textAlign: "center",
          lineHeight: 1.7,
          marginBottom: "32px",
        }}
      >
        {quote.customer} will get a text with a link
        <br />
        to view their payment options.
      </div>

      {/* Text preview */}
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "16px",
          padding: "18px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "#475569",
            letterSpacing: "1px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          TEXT THEY'LL RECEIVE
        </div>
        <div
          style={{
            background: "#0f172a",
            borderRadius: "14px 14px 14px 4px",
            padding: "16px",
            fontSize: "14px",
            color: "#cbd5e1",
            lineHeight: 1.9,
          }}
        >
          Hi {quote.customer} 👋
          <br />
          <br />
          Your quote is ready.
          <br />
          <br />
          Total:{" "}
          <strong style={{ color: "#f1f5f9" }}>{fmt(quote.amount)}</strong>
          <br />
          Or as low as{" "}
          <strong style={{ color: "#f59e0b" }}>{fmt(lowest)}/mo</strong>
          <br />
          <br />
          Tap to view &amp; apply:
          <br />
          <span style={{ color: "#60a5fa" }}>sendquotr.com/q/••••••</span>
        </div>
      </div>

      {/* Commission */}
      <div
        style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.18)",
          borderRadius: "14px",
          padding: "16px 18px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              color: "#f59e0b",
              letterSpacing: "1px",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            IF THEY FINANCE
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8" }}>
            Your estimated commission
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: "30px",
            color: "#f59e0b",
          }}
        >
          {fmt(quote.amount * 0.02)}
        </div>
      </div>

      <button
        onClick={onAnother}
        style={{
          width: "100%",
          background: "#f59e0b",
          color: "#111",
          border: "none",
          borderRadius: "14px",
          padding: "18px",
          fontSize: "16px",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Familjen Grotesk',sans-serif",
          boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
        }}
      >
        Send another quote
      </button>
    </div>
  );
}

// ─── CUSTOMER VIEW ────────────────────────────────────────────────────
function CustomerView({ quote }: { quote: any }) {
  const [selected, setSelected] = useState(0);
  const [showPlans, setShowPlans] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [payFull, setPayFull] = useState(false);

  const showFinancing = quote.amount >= 1000;
  const lowestMonthly = calcMonthly(quote.amount, 0, 12);
  const chosenMonthly = calcMonthly(
    quote.amount,
    TERMS[selected].apr,
    TERMS[selected].months,
  );

  if (applied) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          fontFamily: "'Familjen Grotesk',sans-serif",
          maxWidth: "430px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          className="check-pop"
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            background: "#111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "44px",
            marginBottom: "28px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: "34px",
            color: "#111827",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          {payFull ? "Payment confirmed!" : "Application submitted!"}
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: "16px",
            textAlign: "center",
            lineHeight: 1.7,
            marginBottom: "36px",
          }}
        >
          {payFull
            ? `${quote.contractor} has been notified and will be in touch shortly.`
            : "You'll receive a decision in about 60 seconds. No impact to your credit score."}
        </div>
        <div
          style={{
            background: "#f9fafb",
            borderRadius: "24px",
            padding: "28px",
            width: "100%",
            textAlign: "center",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            {payFull ? "Total due" : "Your selected plan"}
          </div>
          {payFull ? (
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "48px",
                color: "#111827",
              }}
            >
              {fmt(quote.amount)}
            </div>
          ) : (
            <>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: "48px",
                  color: "#111827",
                }}
              >
                {fmtDec(chosenMonthly)}
                <span
                  style={{
                    fontSize: "18px",
                    color: "#9ca3af",
                    fontFamily: "'Familjen Grotesk',sans-serif",
                  }}
                >
                  /mo
                </span>
              </div>
              <div
                style={{ color: "#9ca3af", fontSize: "14px", marginTop: "8px" }}
              >
                {TERMS[selected].months} months ·{" "}
                {TERMS[selected].apr === 0
                  ? "0% interest"
                  : `${TERMS[selected].apr}% APR`}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily: "'Familjen Grotesk',sans-serif",
        maxWidth: "430px",
        margin: "0 auto",
      }}
    >
      {/* Contractor bar */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #f1f5f9",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: "#111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "18px",
            color: "#f59e0b",
            flexShrink: 0,
          }}
        >
          {quote.contractor.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#111827", fontWeight: 700, fontSize: "16px" }}>
            {quote.contractor}
          </div>
          <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "1px" }}>
            Sent you a quote
          </div>
        </div>
        {quote.trade && (
          <div
            style={{
              padding: "5px 12px",
              borderRadius: "100px",
              background: "#f1f5f9",
              fontSize: "12px",
              color: "#374151",
              fontWeight: 700,
            }}
          >
            {quote.trade}
          </div>
        )}
      </div>

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(160deg,#111827 0%,#1e293b 100%)",
          padding: "36px 24px 52px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#94a3b8",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          Your quote total
        </div>
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: "68px",
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-1px",
          }}
        >
          {fmt(quote.amount)}
        </div>

        {showFinancing && (
          <div style={{ marginTop: "22px", display: "inline-block" }}>
            <div
              style={{
                background: "#f59e0b",
                borderRadius: "20px",
                padding: "20px 28px",
                display: "inline-block",
                boxShadow: "0 8px 32px rgba(245,158,11,0.35)",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(0,0,0,0.5)",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Or pay as low as
              </div>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: "52px",
                  color: "#111827",
                  lineHeight: 1,
                }}
              >
                {fmtDec(lowestMonthly)}
                <span
                  style={{
                    fontSize: "18px",
                    fontFamily: "'Familjen Grotesk',sans-serif",
                    color: "rgba(0,0,0,0.4)",
                  }}
                >
                  /mo
                </span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(0,0,0,0.45)",
                  marginTop: "6px",
                  fontWeight: 500,
                }}
              >
                12 months · 0% interest · no credit impact
              </div>
            </div>
          </div>
        )}

        {quote.expiry && (
          <div
            style={{ marginTop: "18px", fontSize: "13px", color: "#64748b" }}
          >
            ⏱ Quote valid for {quote.expiry} days
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: "-1px",
            left: 0,
            right: 0,
            height: "32px",
            background: "#ffffff",
            borderRadius: "32px 32px 0 0",
          }}
        />
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* Description */}
        {quote.desc && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "18px",
              padding: "20px",
              marginBottom: "18px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                letterSpacing: "1.5px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              SCOPE OF WORK
            </div>
            <div
              style={{ fontSize: "15px", color: "#374151", lineHeight: 1.8 }}
            >
              {quote.desc}
            </div>
          </div>
        )}

        {/* Trust row */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {[
            { icon: "🔒", text: "Soft check only" },
            { icon: "⚡", text: "60 sec decision" },
            { icon: "✦", text: "0% options" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{
                flex: 1,
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "12px 8px",
                textAlign: "center",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                {icon}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        {showFinancing && !showPlans && (
          <button
            className="fade-up"
            onClick={() => setShowPlans(true)}
            style={{
              width: "100%",
              background: "#111827",
              border: "none",
              borderRadius: "18px",
              padding: "22px 24px",
              cursor: "pointer",
              fontFamily: "'Familjen Grotesk',sans-serif",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "2px",
                }}
              >
                See payment plans
              </div>
              <div
                style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}
              >
                Takes 2 minutes to apply
              </div>
            </div>
            <div
              style={{
                background: "#f59e0b",
                borderRadius: "12px",
                padding: "10px 16px",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: "22px",
                  color: "#111",
                  lineHeight: 1,
                }}
              >
                {fmtDec(lowestMonthly)}
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: "'Familjen Grotesk',sans-serif",
                    color: "rgba(0,0,0,0.5)",
                  }}
                >
                  /mo
                </span>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(0,0,0,0.45)",
                  fontWeight: 600,
                }}
              >
                FROM
              </div>
            </div>
          </button>
        )}

        {/* Plans */}
        {showFinancing && showPlans && (
          <div className="fade-up" style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                letterSpacing: "1.5px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              CHOOSE YOUR PLAN
            </div>
            {TERMS.map((term, i) => {
              const monthly = calcMonthly(quote.amount, term.apr, term.months);
              const active = selected === i;
              return (
                <div
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{
                    background: active ? "#111827" : "#ffffff",
                    border: `2px solid ${active ? "#f59e0b" : "#e2e8f0"}`,
                    borderRadius: "16px",
                    padding: "18px 20px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: active
                      ? "0 4px 20px rgba(0,0,0,0.1)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Instrument Serif',serif",
                        fontSize: "30px",
                        color: active ? "#f59e0b" : "#111827",
                        lineHeight: 1,
                      }}
                    >
                      {fmtDec(monthly)}
                      <span
                        style={{
                          fontSize: "14px",
                          fontFamily: "'Familjen Grotesk',sans-serif",
                          color: active ? "#64748b" : "#9ca3af",
                        }}
                      >
                        /mo
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: active ? "#94a3b8" : "#6b7280",
                        marginTop: "5px",
                      }}
                    >
                      {term.months} months ·{" "}
                      {term.apr === 0 ? "0% interest" : `${term.apr}% APR`}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    {term.tag && (
                      <div
                        style={{
                          padding: "5px 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: active
                            ? "rgba(255,255,255,0.1)"
                            : term.tagBg,
                          color: active ? "#ffffff" : term.tagColor,
                        }}
                      >
                        {term.tag}
                      </div>
                    )}
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: `2px solid ${active ? "#f59e0b" : "#d1d5db"}`,
                        background: active ? "#f59e0b" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#111",
                      }}
                    >
                      {active ? "✓" : ""}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => {
                setApplying(true);
                setTimeout(() => {
                  setApplying(false);
                  setApplied(true);
                }, 1400);
              }}
              style={{
                width: "100%",
                background: "#f59e0b",
                color: "#111827",
                border: "none",
                borderRadius: "16px",
                padding: "20px",
                fontSize: "17px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Familjen Grotesk',sans-serif",
                marginTop: "8px",
                boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
              }}
            >
              {applying
                ? "Submitting..."
                : `Apply for ${fmtDec(chosenMonthly)}/mo →`}
            </button>
            <div
              style={{
                textAlign: "center",
                marginTop: "12px",
                fontSize: "13px",
                color: "#9ca3af",
              }}
            >
              No impact to your credit score to check rates
            </div>
          </div>
        )}

        {/* Pay in full */}
        <button
          onClick={() => {
            setPayFull(true);
            setTimeout(() => setApplied(true), 700);
          }}
          style={{
            width: "100%",
            background: "#f8fafc",
            color: "#374151",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "17px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Familjen Grotesk',sans-serif",
            marginBottom: "28px",
          }}
        >
          Pay {fmt(quote.amount)} in full
        </button>

        {/* Quote details */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "16px",
            padding: "18px 20px",
            marginBottom: "20px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              letterSpacing: "1.5px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            QUOTE DETAILS
          </div>
          {[
            ["From", quote.contractor],
            ["Job total", fmt(quote.amount)],
            ["Trade", quote.trade],
            ["Valid for", `${quote.expiry} days`],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#111827",
                    fontWeight: 600,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
        </div>

        <div
          style={{
            textAlign: "center",
            color: "#c4c9d4",
            fontSize: "12px",
            lineHeight: 2,
          }}
        >
          Financing provided by Wisetack
          <br />
          Powered by Quotr · Subject to credit approval
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("contractor");
  const [state, setState] = useState("form");
  const [sentData, setSentData] = useState<any>(null);

  const DEMO_QUOTE = {
    contractor: "Mike's Roofing Co.",
    customer: "Sarah Thompson",
    amount: 12400,
    trade: "Roofing",
    desc: "Full roof replacement, architectural shingles, 2,400 sq ft. Includes removal of existing roof and complete site cleanup.",
    expiry: "7",
  };

  return (
    <div style={{ background: "#0a0f1a", minHeight: "100vh" }}>
      <style>{css}</style>
      <DemoBar
        view={view}
        setView={(v) => {
          setView(v);
          setState("form");
          setSentData(null);
        }}
      />

      {view === "contractor" && state === "form" && (
        <ContractorView
          onSent={(q) => {
            setSentData(q);
            setState("sent");
          }}
        />
      )}
      {view === "contractor" && state === "sent" && sentData && (
        <SentView
          quote={sentData}
          onAnother={() => {
            setSentData(null);
            setState("form");
          }}
        />
      )}
      {view === "customer" && <CustomerView quote={DEMO_QUOTE} />}
      <BottomNav />
    </div>
  );
}
