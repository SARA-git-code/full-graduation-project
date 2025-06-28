import React, { useEffect, useState } from "react";
import axios from "axios";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users", { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err.message);
    }
  };

  const toggleBan = async (id) => {
    try {
      await axios.patch(`/admin/users/${id}/ban`, {}, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      alert("Failed to toggle ban");
    }
  };

  const toggleAdmin = async (id) => {
    try {
      await axios.patch(`/admin/users/${id}/role`, {}, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      alert("Failed to toggle role");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/admin/users/${id}`, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h3 className="mb-3">Manage Users</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Banned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isBanned ? "Yes" : "No"}</td>
              <td>
                <button className="btn btn-sm btn-warning me-1" onClick={() => toggleBan(u._id)}>
                  {u.isBanned ? "Unban" : "Ban"}
                </button>
                <button className="btn btn-sm btn-secondary me-1" onClick={() => toggleAdmin(u._id)}>
                  {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersAdmin;
