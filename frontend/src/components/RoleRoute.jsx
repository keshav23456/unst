import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Route guard: only lets users whose role is in `roles` see `children`.
// Signed-out users go to /login; signed-in users with the wrong role go to
// `fallback`. This is a UX convenience only - the real enforcement is the
// requireRole middleware on the backend routes these pages call.
export default function RoleRoute({ roles, fallback = "/", children }) {
  const navigate = useNavigate();
  const { status, checked, userData } = useSelector((s) => s.auth);
  const allowed = status && roles.includes(userData?.role);

  useEffect(() => {
    if (!checked) return; // still finding out whether there's a session
    if (!status) navigate("/login");
    else if (!allowed) navigate(fallback);
  }, [checked, status, allowed, navigate, fallback]);

  if (!checked) return <h1 className="p-6 mt-20">Loading...</h1>;
  return allowed ? <>{children}</> : null;
}
