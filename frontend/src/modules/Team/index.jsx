import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Mail,
  Crown,
  UserCheck,
  Calendar,
  Loader,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { authAPI } from "../../api/admin";

const Team = ({ user }) => {
  const currentUser = user || authAPI.getStoredUser() || {};
  const isManager = currentUser?.role === "manager";
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.getUsers();
      const data = res.data || res || [];
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load team users:", err);
      setError(err?.message || "Failed to load team users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const name = u.full_name || u.username || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalMembers = usersList.length;
  const managersCount = usersList.filter((u) => u.role === "manager").length;
  const usersCount = usersList.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
              <Users className="h-3.5 w-3.5" />
              Team Directory & Roles
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Team Directory
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registered users in your project management system database with their roles and assignment capabilities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700">
              👥 {totalMembers} Total Members
            </span>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Database Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalMembers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Project Managers</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{managersCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Team Members (Users)</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{usersCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, @username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Filter className="h-3.5 w-3.5" /> Role:
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="manager">👑 Project Managers</option>
            <option value="user">👤 Team Members (Users)</option>
          </select>
        </div>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <Loader className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading team members...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Users className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No members found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No database users matched your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((member) => {
            const isManagerRole = member.role === "manager";
            const displayName = member.full_name || member.username;

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-indigo-200"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm flex-shrink-0 ${
                      isManagerRole
                        ? "bg-gradient-to-br from-purple-600 to-indigo-600"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                    }`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {displayName}
                      </h3>
                      {user?.id === member.id && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      @{member.username}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isManagerRole
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isManagerRole ? <Crown className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        {isManagerRole ? "Project Manager" : "Team Member"}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    ID: #{member.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;
