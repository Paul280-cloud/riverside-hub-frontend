import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [resources, setResources] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [resourceId, setResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function loadResources() {
    const { data, error } = await supabase.from("resources").select("*");
    if (error) setMsg(error.message);
    else setResources(data || []);
  }

  async function loadBookings() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return setBookings([]);

    const { data, error } = await supabase
      .from("bookings")
      .select("*, resources(name, type)")
      .eq("member_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Bookings fetch error:", error.message);
      setBookings([]);
    } else {
      setBookings(data || []);
    }
  }

  useEffect(() => {
    loadResources();
    loadBookings();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Creating booking...");

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return setMsg("You need to log in first.");

    const { error } = await supabase.from("bookings").insert({
      resource_id: resourceId,
      member_id: userId,
      start_time: startTime,
      end_time: endTime,
      status: "pending",
    });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg("Booking created (pending approval).");
      setResourceId("");
      setStartTime("");
      setEndTime("");
      setTimeout(loadBookings, 400);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Dashboard</h1>
      <button onClick={handleLogout} style={{ marginBottom: 16 }}>
        Logout
      </button>

      <h2>Make a Booking</h2>
      <form onSubmit={handleBooking} style={{ marginBottom: 32 }}>
        <select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          required
          style={{ display: "block", padding: 8, marginBottom: 8, width: "100%" }}
        >
          <option value="">Choose a resource…</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.type})
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          style={{ display: "block", padding: 8, marginBottom: 8, width: "100%" }}
        />

        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          style={{ display: "block", padding: 8, marginBottom: 8, width: "100%" }}
        />

        <button type="submit" style={{ padding: 8 }}>
          Request Booking
        </button>
      </form>

      <p>{msg}</p>

      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b.id}
            style={{ border: "1px solid #ccc", padding: 12, marginBottom: 8 }}
          >
            <strong>{b.resources?.name || "Resource"}</strong> — {b.status}
            <br />
            {new Date(b.start_time).toLocaleString()} →{" "}
            {new Date(b.end_time).toLocaleString()}
          </div>
        ))
      )}
    </div>
  );
}