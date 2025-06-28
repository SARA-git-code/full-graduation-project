import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminDashboard = () => {
  const { pathname } = useLocation();

  return (
    <div className="main-content">
      <div className="container py-4">
        <h1 className="mb-4">Admin Panel</h1>

        <div className="btn-group mb-4">
          <Link
            to="/admin"
            className={`btn btn-${
              pathname === "/admin" ? "primary" : "outline-primary"
            }`}
          >
            Home
          </Link>
          <Link
            to="/admin/users"
            className={`btn btn-${
              pathname === "/admin/users" ? "primary" : "outline-primary"
            }`}
          >
            Users
          </Link>
          <Link
            to="/admin/donations"
            className={`btn btn-${
              pathname === "/admin/donations" ? "primary" : "outline-primary"
            }`}
          >
            Donations
          </Link>
          <Link
            to="/admin/reports"
            className={`btn btn-${
              pathname === "/admin/reports" ? "primary" : "outline-primary"
            }`}
          >
            Reports
          </Link>
        </div>

        <div
          className="card shadow p-4"
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
