import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
    setMsg("Creating account...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) return setMsg(error.message);

    if (data.user) {
      try {
        await ensureProfile(data.user.id, name);
      } catch (err) {
        console.warn("Profile creation deferred until login");
      }
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      setMsg("Account created. Redirecting…");
      setTimeout(() => navigate("/dashboard"), 800);
    } else {
      setMsg("Account created. Check your email to verify, then log in.");
      setTimeout(() => navigate("/login"), 1500);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
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
        <button type="submit" style={{ padding: 8 }}>Sign up</button>
      </form>
      <p>{msg}</p>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}