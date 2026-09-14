import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 16, background: "#1e3a5f", color: "white" }}>
        <Link to="/" style={{ color: "white", marginRight: 16 }}>Home</Link>
        <Link to="/dashboard" style={{ color: "white", marginRight: 16 }}>Dashboard</Link>
        <Link to="/admin" style={{ color: "white", marginRight: 16 }}>Admin</Link>
        <Link to="/login" style={{ color: "white" }}>Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}