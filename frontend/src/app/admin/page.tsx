"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Activity,
  Trash2,
  Search,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  FileText,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { API_BASE } from "@/lib/utils";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDeleteUser, setSelectedDeleteUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        credentials: "include",
      });

      if (res.status === 403 || res.status === 401) {
        toast("Admin privileges required.", "error");
        router.push("/dashboard");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load users list.");
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching admin data";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (!selectedDeleteUser) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/${selectedDeleteUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove user account.");
      }

      toast(data.message || "User account removed.", "success");
      setUsers((prev) => prev.filter((u) => u.id !== selectedDeleteUser.id));
      setSelectedDeleteUser(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed";
      toast(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="section-pill mb-2">Platform Administration</span>
          <h1 className="page-title mt-1 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-yellow-400" />
            Admin <span className="text-gradient">Console</span>
          </h1>
          <p className="page-subtitle text-sm sm:text-base">
            Manage user accounts, roles, and review registered platform activity.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="btn-outline text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Registry
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="stat-card">
          <div className="stat-icon bg-blue-950 text-blue-400 border border-blue-800">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400">Total Registered</span>
            <p className="text-2xl font-bold text-white mt-0.5">{users.length}</p>
            <span className="text-[11px] text-gray-500">Platform Accounts</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-yellow-950 text-yellow-400 border border-yellow-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400">Administrators</span>
            <p className="text-2xl font-bold text-white mt-0.5">{adminCount}</p>
            <span className="text-[11px] text-gray-500">Privileged Roles</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-950 text-emerald-400 border border-emerald-800">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400">Standard Patients</span>
            <p className="text-2xl font-bold text-white mt-0.5">{users.length - adminCount}</p>
            <span className="text-[11px] text-gray-500">Active Members</span>
          </div>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="card-glow overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-gray-800">
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user or email address..."
              className="input pl-9 py-2 text-xs"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          </div>
          <span className="text-xs text-gray-400">
            Showing {filteredUsers.length} of {users.length} registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950/70 text-xs uppercase text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="spinner w-8 h-8 border-2 mx-auto mb-2" />
                    <span className="text-xs text-gray-500">Querying platform database...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-950 border border-primary-800 text-primary-400 flex items-center justify-center font-bold text-xs">
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <span>{u.username}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          u.role === "admin" ? "badge-yellow" : "badge-green"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => setSelectedDeleteUser(u)}
                          className="btn-outline text-xs px-2.5 py-1 text-red-400 border-red-900/60 hover:bg-red-950/40 hover:border-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-500 font-mono">Protected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {selectedDeleteUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Delete User Account</h3>
                  <p className="text-xs text-gray-400">Irreversible operational action</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {selectedDeleteUser.username}
                </span>{" "}
                ({selectedDeleteUser.email})? All profile data, history, and records will be
                permanently purged.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDeleteUser(null)}
                  className="btn-outline text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                  className="btn-danger text-xs px-4 py-2"
                >
                  {deleteLoading ? "Purging..." : "Confirm Deletion"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
