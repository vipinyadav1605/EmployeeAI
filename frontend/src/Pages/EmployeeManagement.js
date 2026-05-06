import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card, Button, Table } from "../Components/common";
import { employeeAPI } from "../services/api";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.list({ page: 1, limit: 10 });
      setEmployees(res.data.results);
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
        <Header title="Employee Management" />

        <div className="flex-1 p-8 space-y-6">
          {/* 🔹 Page Intro */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Manage Employees
            </h2>
            <p className="text-sm text-slate-500">
              View and manage employee records
            </p>
          </div>

          {/* 🔹 Table Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <Card>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table
                  columns={[
                    { key: "name", label: "Name" },
                    { key: "email", label: "Email" },
                    { key: "department", label: "Department" },
                  ]}
                  data={employees}
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
