import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import adminService from "../backend/admin.js";
import organizeService from "../backend/organize.js";
import { Trash2, Users, Trophy } from "lucide-react";

const ROLES = ["participant", "organizer", "admin"];

export default function AdminDashboard() {
  const me = useSelector((s) => s.auth.userData);
  const [users, setUsers] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [usersRes, hackathonsRes] = await Promise.all([
          adminService.getAllUsers(),
          organizeService.getAllHackathons(),
        ]);
        setUsers(usersRes.users || []);
        setHackathons(hackathonsRes || []);
      } catch (err) {
        setError("Failed to load admin data. Make sure your account has admin access.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      const { user } = await adminService.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: user.role } : u)));
    } catch (err) {
      alert(err.message || "Failed to update role.");
    }
  };

  const handleDeleteHackathon = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This also removes its rounds, teams, and submissions.`)) return;
    try {
      await adminService.deleteHackathon(id);
      setHackathons((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete hackathon.");
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6 mt-20">Loading admin dashboard...</div>;
  if (error) return <div className="max-w-4xl mx-auto p-6 mt-20 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 mt-20 space-y-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Users ({users.length})</h2>
        </div>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    {u._id === me?._id ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">{u.role} (you)</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm bg-white"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Hackathons ({hackathons.length})</h2>
        </div>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Prize Pool</th>
                <th className="p-3">Round</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {hackathons.map((h) => (
                <tr key={h._id} className="border-t">
                  <td className="p-3">{h.name}</td>
                  <td className="p-3">{h.prizePool}</td>
                  <td className="p-3">{h.roundAt} / {h.roundTotal}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDeleteHackathon(h._id, h.name)} className="text-red-600 hover:text-red-800" title="Delete hackathon">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
