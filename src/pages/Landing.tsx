import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Landing() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("active", true);
    if (error) return setMsg(error.message);
    setCampaigns(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDonate(campaignId: string, currentTotal: number) {
    if (!amount || Number(amount) <= 0) return setMsg("Enter a valid amount");
    setMsg("Processing donation...");

    const { error: donErr } = await supabase
      .from("donations")
      .insert({ amount: Number(amount), campaign: campaignId });

    if (donErr) return setMsg(donErr.message);

    const newTotal = Number(currentTotal || 0) + Number(amount);

    const { error: updErr } = await supabase
      .from("campaigns")
      .update({ current_amount: newTotal })
      .eq("id", campaignId);

    if (updErr) return setMsg(updErr.message);

    setMsg(`Thank you! R${amount} donated.`);
    setAmount("");
    load();
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Riverside Community Hub</h1>
      <p>
        Youth programmes, gym, event rooms, and a food-parcel drive — all under
        one roof.
      </p>

      <div style={{ marginTop: 24 }}>
        <Link to="/signup" style={{ marginRight: 12 }}>Sign up</Link>
        <Link to="/login">Login</Link>
      </div>

      <h2 style={{ marginTop: 40 }}>Active Campaigns</h2>
      <p>{msg}</p>

      {campaigns.length === 0 ? (
        <p>No active campaigns.</p>
      ) : (
        campaigns.map((c) => {
          const progress = Math.min(
            100,
            Math.round((c.current_amount / c.goal_amount) * 100)
          );
          return (
            <div
              key={c.id}
              style={{
                border: "1px solid #ccc",
                padding: 16,
                marginBottom: 16,
                borderRadius: 8,
              }}
            >
              <strong>{c.title}</strong>
              <p>
                R{c.current_amount} raised of R{c.goal_amount} ({progress}%)
              </p>
              <div
                style={{
                  height: 12,
                  background: "#eee",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "#F4B400",
                  }}
                />
              </div>
              <input
                type="number"
                placeholder="Amount (R)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ padding: 8, marginRight: 8 }}
              />
              <button
                onClick={() => handleDonate(c.id, c.current_amount)}
                style={{ padding: 8 }}
              >
                Donate
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}