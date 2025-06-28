import React, { useEffect, useState } from "react";
import axios from "axios";

const DonationsAdmin = () => {
  const [donations, setDonations] = useState([]);

  const fetchDonations = async () => {
    try {
      const res = await axios.get("/admin/donations", { withCredentials: true });
      setDonations(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch donations:", err.message);
    }
  };

  const deleteDonation = async (id) => {
    if (!window.confirm("Delete this donation?")) return;
    try {
      await axios.delete(`/admin/donations/${id}`, { withCredentials: true });
      fetchDonations();
    } catch (err) {
      alert("Failed to delete donation");
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <div>
      <h3 className="mb-3">Manage Donations</h3>
      <table className="table table-hover table-bordered">
  <thead className="table-light">
    <tr>
      <th>Title</th>
      <th>Kind</th>
      <th>User</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {donations.map((d) => (
      <tr key={d._id}>
        <td>{d.title}</td>
        <td>{d.kind}</td>
        <td>{d.user?.name || "Unknown"}</td>
        <td>
          <span className={`badge bg-${d.isValid ? "success" : "secondary"}`}>
            {d.isValid ? "Available" : "Picked"}
          </span>
        </td>
        <td>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => deleteDonation(d._id)}
          >
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

export default DonationsAdmin;
