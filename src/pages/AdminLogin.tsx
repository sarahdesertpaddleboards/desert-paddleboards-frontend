import { useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        `${API_BASE_URL}/admin/login`,
        { email, password },
        { withCredentials: true }
      );

      // After successful login, redirect to admin products page
      window.location.href = "/admin";
    } catch (err: any) {
      console.error("LOGIN ERROR", err);
      setError("Invalid login");
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="border p-3 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded w-full"
        >
          Login
        </button>

        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
