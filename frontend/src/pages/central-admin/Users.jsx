import { useEffect, useState } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  assignClubAdmin,
} from "../../api/auth";
import { fetchClubs } from "../../api/clubs";


const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "club_admin",
  club_id: "",
};


export default function Users() {

  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [roleFilter, setRoleFilter] = useState("");


  const loadUsers = async () => {

    setLoading(true);
    setError("");

    try {

      const [userData, clubData] =
        await Promise.all([
          fetchUsers(
            roleFilter
              ? { role: roleFilter }
              : {}
          ),
          fetchClubs(),
        ]);

      setUsers(userData);
      setClubs(clubData);

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Failed to load users."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadUsers();
  }, [roleFilter]);


  const getClubName = (clubId) => {

    const club = clubs.find(
      (club) => club.id === clubId
    );

    return club?.name || "—";
  };


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {

      await createUser(form);

      setForm(emptyForm);
      setShowForm(false);

      await loadUsers();

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Failed to create account."
      );

    } finally {

      setSubmitting(false);

    }
  };


  
const handleClubAssign = async (userId, clubId) => {
  if (!clubId) {
    setError("Please select a club to assign.");
    return;
  }

  try {
    setError("");

    await assignClubAdmin(userId, clubId);
    await loadUsers();
  } catch (err) {
    setError(
      err.response?.data?.detail ||
        "Failed to assign club."
    );
  }


  };


  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Delete this account permanently?"
    );

    if (!confirmed) return;

    try {

      await deleteUser(id);

      await loadUsers();

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Failed to delete user."
      );

    }
  };


  return (
    <div className="page-container">

      {/* Header */}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">
            Manage Users
          </h1>

          <p className="text-gray-500 mt-1">
            Manage students and club administrators.
          </p>

        </div>


        <div className="flex gap-2 flex-wrap">

          <select
            className="input-field !w-auto"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >

            <option value="">
              All roles
            </option>

            <option value="student">
              Students
            </option>

            <option value="club_admin">
              Club Admins
            </option>

            <option value="central_admin">
              Central Admins
            </option>

          </select>


          <button
            onClick={() => {
              setShowForm((value) => !value);
              setError("");
            }}
            className="btn-primary"
          >
            {showForm
              ? "Cancel"
              : "+ New Club Admin"}
          </button>

        </div>

      </div>


      {/* Error */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-5">
          {error}
        </div>
      )}


      {/* Create Club Admin */}

      {showForm && (

        <form
          onSubmit={handleSubmit}
          className="card grid sm:grid-cols-2 gap-4 mb-8"
        >

          <div>

            <label className="label">
              Name
            </label>

            <input
              name="name"
              className="input-field"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>


          <div>

            <label className="label">
              Email
            </label>

            <input
              name="email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={handleChange}
              required
            />

          </div>


          <div>

            <label className="label">
              Temporary Password
            </label>

            <input
              name="password"
              type="password"
              className="input-field"
              value={form.password}
              onChange={handleChange}
              minLength="8"
              required
            />

          </div>


          <div>

            <label className="label">
              Assign to Club
            </label>

            <select
              name="club_id"
              className="input-field"
              value={form.club_id}
              onChange={handleChange}
              required
            >

              <option value="">
                Select a club
              </option>

              {clubs.map((club) => (

                <option
                  key={club.id}
                  value={club.id}
                >
                  {club.name}
                </option>

              ))}

            </select>

          </div>


          <button
            type="submit"
            disabled={submitting}
            className="btn-primary sm:col-span-2"
          >

            {submitting
              ? "Creating..."
              : "Create Club Admin Account"}

          </button>

        </form>

      )}


      {/* Users Table */}

      {loading ? (

        <div className="text-center py-10">

          <p className="text-gray-500">
            Loading users...
          </p>

        </div>

      ) : (

        <div className="overflow-x-auto card !p-0">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-left text-gray-500">

              <tr>

                <th className="p-3">
                  Name
                </th>

                <th className="p-3">
                  Email
                </th>

                <th className="p-3">
                  Role
                </th>

                <th className="p-3">
                  Club
                </th>

                <th className="p-3">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {users.map((user) => (

                <tr
                  key={user.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >

                  <td className="p-3 font-medium text-gray-800">
                    {user.name}
                  </td>


                  <td className="p-3">
                    {user.email}
                  </td>


                  <td className="p-3 capitalize">
                    {user.role?.replace(
                      "_",
                      " "
                    )}
                  </td>


                  <td className="p-3">

                    {user.role === "club_admin" ? (

                      <select
                        className="input-field !py-1 !w-auto text-xs"
                        value={
                          user.club_id || ""
                        }
                        onChange={(e) =>
                          handleClubAssign(
                            user.id,
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Unassigned
                        </option>

                        {clubs.map((club) => (

                          <option
                            key={club.id}
                            value={club.id}
                          >
                            {club.name}
                          </option>

                        ))}

                      </select>

                    ) : (

                      getClubName(
                        user.club_id
                      )

                    )}

                  </td>


                  <td className="p-3">

                    <button
                      onClick={() =>
                        handleDelete(user.id)
                      }
                      className="text-red-500 text-sm font-semibold"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {users.length === 0 && (

            <p className="text-gray-500 p-4">
              No users found.
            </p>

          )}

        </div>

      )}

    </div>
  );
}