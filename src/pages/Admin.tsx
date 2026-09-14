import { useEffect, useState } from "react";
import { getAllBookings, updateBookingStatus } from "../api";

export default function Admin() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await getAllBookings();
    if (res.error) return setMsg(res.error);
    setBookings(res.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id: string, status: "approved" | "rejected") {
    setMsg(`Updating booking...`);
    const res = await updateBookingStatus(id, status);
    if (res.error) setMsg(res.error);
    else {
      setMsg(`Booking ${status}.`);
      load();
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin — Bookings</h1>
      <p>{msg}</p>

      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b.id}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              marginBottom: 8,
              background: b.status === "pending" ? "#fffbe6" : "#f6ffed",
            }}
          >
            <strong>{b.resources?.name}</strong> — {b.status}
            <br />
            Member: {b.profiles?.full_name || b.member_id?.slice(0, 8)}
            <br />
            {new Date(b.start_time).toLocaleString()} →{" "}
            {new Date(b.end_time).toLocaleString()}
            <br />
            {b.status === "pending" && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => handleAction(b.id, "approved")}
                  style={{ marginRight: 8, padding: "6px 12px" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(b.id, "rejected")}
                  style={{ padding: "6px 12px" }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}