import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card, Table } from "../Components/common";
import { leaveAPI } from "../services/api";

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await leaveAPI.list({ page: 1, limit: 20 });
      setLeaves(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col">
        <Header title="Leave Management" />

        <div className="flex-1 p-8 space-y-6">
          {/* 🔹 Page Intro */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Manage Leave Requests
            </h2>
            <p className="text-sm text-slate-500">
              View and track employee leave applications
            </p>
          </div>

          {/* 🔹 Table Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <Card title="Leave Requests">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table
                  columns={[
                    { key: "employee", label: "Employee" },
                    { key: "leave_type", label: "Type" },
                    { key: "start_date", label: "From" },
                    { key: "end_date", label: "To" },

                    // 🔥 Status with styling
                    {
                      key: "status",
                      label: "Status",
                      render: (value) => (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            value === "approved"
                              ? "bg-green-100 text-green-600"
                              : value === "pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {value}
                        </span>
                      ),
                    },
                  ]}
                  data={leaves}
                  loading={loading}
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
