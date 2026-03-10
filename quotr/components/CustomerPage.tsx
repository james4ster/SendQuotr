"use client";
import { useState } from "react";

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

function calcMonthly(amount: number, apr: number, months: number) {
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
    tag: "0% Interest",
    tagColor: "#16a34a",
    tagBg: "#dcfce7",
  },
  { months: 24, apr: 9.99, tag: null, tagColor: null, tagBg: null },
  { months: 36, apr: 12.99, tag: null, tagColor: null, tagBg: null },
  {
    months: 60,
    apr: 14.99,
    tag: "Lowest payment",
    tagColor: "#1d4ed8",
    tagBg: "#dbeafe",
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { display:none; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
  .fade-up { animation:fadeUp 0.25s ease forwards; }
  .check-pop { animation:checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
`;

export default function CustomerPage({ quote }: { quote: any }) {
  const [selected, setSelected] = useState(0);
  const [showPlans, setShowPlans] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [payFull, setPayFull] = useState(false);

  const contractor =
    quote.contractors?.business_name ||
    quote.contractors?.email ||
    "Your contractor";
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
        <style>{css}</style>
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
            ? `${contractor} has been notified and will be in touch shortly.`
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
      <style>{css}</style>

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
            overflow: "hidden",
          }}
        >
          {quote.contractors?.logo_url ? (
            <img
              src={quote.contractors.logo_url}
              alt="logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "4px",
              }}
            />
          ) : (
            contractor.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#111827", fontWeight: 700, fontSize: "16px" }}>
            {contractor}
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

        {quote.expiry_days && (
          <div
            style={{ marginTop: "18px", fontSize: "13px", color: "#64748b" }}
          >
            ⏱ Quote valid for {quote.expiry_days} days
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
        {quote.description && (
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
              {quote.description}
            </div>
          </div>
        )}

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
                            : term.tagBg!,
                          color: active ? "#ffffff" : term.tagColor!,
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
            ["From", contractor],
            ["Job total", fmt(quote.amount)],
            ["Trade", quote.trade],
            ["Valid for", `${quote.expiry_days} days`],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div
                key={label as string}
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
          <br />
          Powered by Quotr · Subject to credit approval
        </div>
      </div>
    </div>
  );
}
