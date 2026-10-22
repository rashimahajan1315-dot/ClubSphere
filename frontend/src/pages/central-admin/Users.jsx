import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/auth";
import { fetchClubs } from "../../api/clubs";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "club_admin",
  club_id: "",
};

const ROLE_LABELS = {
  student: "Student",
  club_admin: "Club Admin",
  central_admin: "Central Admin",
};

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.users)) return value.users;
  if (Array.isArray(value?.clubs)) return value.clubs;
  return [];
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const firstFieldError = Object.values(data).flat().find((item) => typeof item === "string");
    if (firstFieldError) return firstFieldError;
  }
  return fallback;
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  const loadUsers = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const [userData, clubData] = await Promise.all([
        fetchUsers(roleFilter ? { role: roleFilter } : {}),
        fetchClubs(),
      ]);
      setUsers(asArray(userData));
      setClubs(asArray(clubData));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load users. Please try again."));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const getClubName = (clubId) => {
    if (!clubId) return "Unassigned";
    const club = clubs.find((item) => String(item.id) === String(clubId));
    return club?.name || "Unknown club";
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, ROLE_LABELS[user.role] || user.role, getClubName(user.club_id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [users, search, clubs]);

  const counts = useMemo(() => ({
    total: users.length,
    students: users.filter((user) => user.role === "student").length,
    clubAdmins: users.filter((user) => user.role === "club_admin").length,
    centralAdmins: users.filter((user) => user.role === "central_admin").length,
  }), [users]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createUser({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        club_id: form.club_id || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      setSuccess("Club admin account created successfully.");
      await loadUsers(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create account. Please check the details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClubAssign = async (userId, clubId) => {
    setError("");
    setSuccess("");
    setAssigningId(userId);
    try {
      await updateUser(userId, { club_id: clubId || null });
      setSuccess("Club assignment updated.");
      await loadUsers(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to assign club."));
    } finally {
      setAssigningId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete the account for ${user.name || user.email}? This action may be permanent.`)) return;

    setError("");
    setSuccess("");
    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      setSuccess("User account deleted.");
      await loadUsers(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete user."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-brand-600 font-semibold mb-1">CENTRAL ADMINISTRATION</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-2">Manage student accounts, club administrators, and club assignments.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
            setSuccess("");
          }}
          className="btn-primary shrink-0"
        >
          {showForm ? "Cancel" : "+ New Club Admin"}
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="shrink-0" aria-label="Dismiss error">✕</button>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")} className="shrink-0" aria-label="Dismiss message">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Users in view", value: counts.total, hint: "Based on selected role filter" },
          { label: "Students", value: counts.students, hint: "Student accounts" },
          { label: "Club admins", value: counts.clubAdmins, hint: "Manage individual clubs" },
          { label: "Central admins", value: counts.centralAdmins, hint: "Platform administrators" },
        ].map((item) => (
          <div key={item.label} className="card !p-5">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{item.value}</p>
            <p className="text-xs text-gray-400 mt-2">{item.hint}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create a club admin</h2>
            <p className="text-sm text-gray-500 mt-1">Add the account details and assign the administrator to a club.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-name" className="label">Full name</label>
              <input id="user-name" name="name" className="input-field" value={form.name} onChange={handleChange} placeholder="Enter full name" autoComplete="name" required />
            </div>
            <div>
              <label htmlFor="user-email" className="label">Email address</label>
              <input id="user-email" name="email" type="email" className="input-field" value={form.email} onChange={handleChange} placeholder="name@college.edu" autoComplete="email" required />
            </div>
            <div>
              <label htmlFor="user-password" className="label">Temporary password</label>
              <input id="user-password" name="password" type="password" className="input-field" value={form.password} onChange={handleChange} minLength={8} autoComplete="new-password" placeholder="At least 8 characters" required />
            </div>
            <div>
              <label htmlFor="user-club" className="label">Assign to club</label>
              <select id="user-club" name="club_id" className="input-field" value={form.club_id} onChange={handleChange} required>
                <option value="">Select a club</option>
                {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
              </select>
              {clubs.length === 0 && <p className="text-xs text-amber-600 mt-1">No clubs available. Create a club before adding its admin.</p>}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setForm(emptyForm); }}>Cancel</button>
            <button type="submit" disabled={submitting || clubs.length === 0} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? "Creating account…" : "Create Club Admin Account"}
            </button>
          </div>
        </form>
      )}

      <section className="card !p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All accounts</h2>
            <p className="text-sm text-gray-500 mt-1">{filteredUsers.length} {filteredUsers.length === 1 ? "account" : "accounts"} shown</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <input
              type="search"
              className="input-field !w-full sm:min-w-56"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, club…"
              aria-label="Search users"
            />
            <select className="input-field !w-full sm:!w-auto" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter users by role">
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="club_admin">Club admins</option>
              <option value="central_admin">Central admins</option>
            </select>
            <button type="button" onClick={() => loadUsers()} className="btn-secondary shrink-0" disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-14 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
            <p className="text-sm text-gray-500 mt-3">Loading user accounts…</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-14 px-5 text-center">
            <div className="text-3xl mb-3">⌕</div>
            <p className="font-semibold text-gray-800">No users found</p>
            <p className="text-sm text-gray-500 mt-1">Try changing the role filter or search term.</p>
            {(search || roleFilter) && <button type="button" className="text-sm text-brand-700 font-semibold mt-3" onClick={() => { setSearch(""); setRoleFilter(""); }}>Clear filters</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">User</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Club assignment</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-4 min-w-56">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-semibold shrink-0">
                          {(user.name || user.email || "U").trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user.name || "Unnamed user"}</p>
                          <p className="text-gray-500 text-xs mt-1 break-all">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.role === "central_admin" ? "bg-violet-50 text-violet-700" : user.role === "club_admin" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                        {ROLE_LABELS[user.role] || (user.role || "Unknown role").replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 min-w-52">
                      {user.role === "club_admin" ? (
                        <select
                          className="input-field !py-2 !text-sm"
                          value={user.club_id || ""}
                          disabled={assigningId === user.id}
                          onChange={(event) => handleClubAssign(user.id, event.target.value)}
                          aria-label={`Assign club for ${user.name || user.email}`}
                        >
                          <option value="">Unassigned</option>
                          {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
                        </select>
                      ) : (
                        <span className="text-gray-600">{getClubName(user.club_id)}</span>
                      )}
                      {assigningId === user.id && <p className="text-xs text-gray-400 mt-1">Updating assignment…</p>}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === user.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
