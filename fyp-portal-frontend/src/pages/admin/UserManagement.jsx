import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  UserCheck,
  Loader2,
  Filter,
  MoreVertical,
} from "lucide-react";
import Layout from "../../layouts/DashboardLayout";
import API from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data || []);
    } catch (err) {
      toast.error("Failed to fetch user registry");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setActionLoading(userId);

    try {
      if (currentStatus === "active") {
        // Suspend user
        await API.put(`/admin/suspend/${userId}`);
        toast.success("User suspended successfully");
      } else {
        // Activate user (was suspended)
        await API.put(`/admin/activate/${userId}`);
        toast.success("User activated successfully");
      }
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.response?.data?.message || "Status update failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Logic for Filtering and Searching
  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === "all" || user.role === filter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  //Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setActionLoading(userId);
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      toast.error("Failed to delete user");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
              <Users className="text-brand-teal" size={32} /> User Registry
            </h1>
            <p className="text-slate-400 font-medium">
              Manage permissions and account access
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-brand-muted border border-slate-200 dark:border-teal-900/30 rounded-xl outline-none focus:ring-2 ring-brand-teal/20 transition-all w-64 dark:text-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-white dark:bg-brand-muted border border-slate-200 dark:border-teal-900/30 px-4 py-2 rounded-xl font-bold text-sm outline-none dark:text-white"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-brand-muted rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 dark:border-teal-900/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-brand-dark/50 border-b dark:border-teal-900/30">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">
                    User Identity
                  </th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">
                    System Role
                  </th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">
                    Account Status
                  </th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-teal-900/10">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={user._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-teal-900/5 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-black text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <StatusBadge status={user.role} />
                      </td>
                      <td className="p-6">
                        <StatusBadge status={user.status || "active"} />
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleStatusToggle(
                                user._id,
                                user.status || "active",
                              )
                            }
                            disabled={actionLoading === user._id}
                            className={`p-2 rounded-lg transition-all ${
                              user.status === "suspended"
                                ? "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                                : "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white"
                            }`}
                            title={
                              user.status === "suspended"
                                ? "Activate User"
                                : "Suspend User"
                            }
                          >
                            {actionLoading === user._id ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : user.status === "suspended" ? (
                              <UserCheck size={18} />
                            ) : (
                              <ShieldAlert size={18} />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            title="Delete User"
                          >
                            {actionLoading === user._id ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filteredUsers.length === 0 && !loading && (
              <div className="p-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-brand-dark rounded-full flex items-center justify-center mx-auto">
                  <Users className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-400 font-bold">
                  No users found matching your criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;
