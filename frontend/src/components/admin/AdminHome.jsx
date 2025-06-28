import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Gift, AlertTriangle } from "lucide-react";

const StatCard = ({ icon, label, value }) => (
  <div className="col-md-4 mb-4">
    <div className="card text-center shadow-sm p-4">
      <div className="mb-2">{icon}</div>
      <h4 className="fw-bold">{value}</h4>
      <p className="text-muted">{label}</p>
    </div>
  </div>
);

const AdminHome = () => {
  const [stats, setStats] = useState({ users: 0, donations: 0, reports: 0 });

  const fetchStats = async () => {
    try {
      const res = await axios.get("/admin/summary", { withCredentials: true });
      setStats(res.data);
    } catch (err) {
      console.error("❌ Failed to load summary:", err.message);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h3 className="mb-4">Welcome, Admin 👋</h3>
      <div className="row">
        <StatCard icon={<Users size={40} />} label="Users" value={stats.users} />
        <StatCard icon={<Gift size={40} />} label="Donations" value={stats.donations} />
        <StatCard icon={<AlertTriangle size={40} />} label="Reports" value={stats.reports} />
      </div>
    </div>
  );
};

export default AdminHome;
