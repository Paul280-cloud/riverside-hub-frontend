import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function ensureProfile(userId: string, fullName: string) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existing) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName || "Member",
        role: "member",
        membership_tier: "free",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (user) {
      try {
        await ensureProfile(
          user.id,
          (user.user_metadata?.full_name as string) || "Member"
        );
      } catch (err) {
        console.warn("Profile check failed:", err);
      }
    }

    navigate("/dashboard");
  }

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>Login</button>
      </form>
      <p>{msg}</p>
      <p>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}