import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL;

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function getResources() {
  const res = await fetch(`${API_URL}/api/resources`);
  return res.json();
}

export async function getCampaigns() {
  const res = await fetch(`${API_URL}/api/campaigns`);
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_URL}/api/me`, {
    headers: await authHeaders(),
  });
  return res.json();
}

export async function getMyBookings() {
  const res = await fetch(`${API_URL}/api/bookings`, {
    headers: await authHeaders(),
  });
  return res.json();
}

export async function createBooking(input: {
  resource_id: string;
  start_time: string;
  end_time: string;
}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
  };
  const res = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function getAllBookings() {
  const res = await fetch(`${API_URL}/api/admin/bookings`, {
    headers: await authHeaders(),
  });
  return res.json();
}

export async function updateBookingStatus(
  id: string,
  status: "approved" | "rejected"
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
  };
  const res = await fetch(`${API_URL}/api/admin/bookings/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function createDonation(input: {
  amount: number;
  campaign_id: string;
  donor_id?: string;
}) {
  const res = await fetch(`${API_URL}/api/donations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function getAllDonations() {
  const res = await fetch(`${API_URL}/api/admin/donations`, {
    headers: await authHeaders(),
  });
  return res.json();
}