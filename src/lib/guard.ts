export function requireRole(role: "admin" | "kasir") {
  const r = localStorage.getItem("role");
  if (r !== role) {
    window.location.href = "/login";
  }
}
