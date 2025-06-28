import React, { useEffect, useState } from "react";
import axios from "axios";

const ReportsAdmin = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await axios.get("/admin/reports", { withCredentials: true });
      setReports(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch reports:", err.message);
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm("Delete the reported donation?")) return;
    try {
      await axios.delete(`/admin/donations/${donationId}`, { withCredentials: true });
      fetchReports();
    } catch (err) {
      alert("Failed to delete donation");
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm("Ban the reported user?")) return;
    try {
      await axios.patch(`/admin/users/${userId}/ban`, {}, { withCredentials: true });
      fetchReports();
    } catch (err) {
      alert("Failed to ban user");
    }
  };

  const handleIgnoreReport = async (reportId) => {
    try {
      await axios.delete(`/admin/reports/${reportId}`, { withCredentials: true });
      fetchReports();
    } catch (err) {
      alert("Failed to ignore report");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h3 className="mb-3">User Reports</h3>
      {reports.length === 0 ? (
        <p>No reports at the moment.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Against</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id}>
                <td>{r.reporter?.name || "Unknown"}</td>
                <td>{r.targetType === "donation" ? r.donation?.title : r.reportedUser?.name}</td>
                <td>{r.targetType}</td>
                <td>{r.reason}</td>
                <td>
                  {r.targetType === "donation" && r.donation && (
                    <button className="btn btn-sm btn-danger me-1" onClick={() => handleDeleteDonation(r.donation._id)}>
                      Delete Post
                    </button>
                  )}
                  {r.targetType === "user" && r.reportedUser && (
                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleBanUser(r.reportedUser._id)}>
                      Ban User
                    </button>
                  )}
                  <button className="btn btn-sm btn-secondary" onClick={() => handleIgnoreReport(r._id)}>
                    Ignore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportsAdmin;
