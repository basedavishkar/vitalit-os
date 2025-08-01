"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/api/auth";

export default function LoginForm() {
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(role, password);
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (error) {
      setError("Invalid role or password");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 320,
        margin: "2rem auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h2>Login</h2>
      <select value={role} onChange={(e) => setRole(e.target.value)} required>
        <option value="">Select Role</option>
        <option value="admin">Admin</option>
        <option value="doctor">Doctor</option>
        <option value="staff">Staff</option>
      </select>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Log In</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
