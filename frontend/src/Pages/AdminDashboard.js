import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card, Button, Table } from "../Components/common";
import { employeeAPI } from "../services/api";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.list({ page: 1, limit: 50 });
      setEmployees(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await employeeAPI.delete(id);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <Header
          title="Admin Dashboard"
          subtitle="Manage all employees and system settings"
          stats={[
            { label: "Total Employees", value: employees.length },
            {
              label: "Active Users",
              value: employees.filter((e) => e.is_active).length,
            },
            { label: "Departments", value: "8" },
            { label: "Last Updated", value: "Today" },
          ]}
        />

        <div className="flex-1 p-8 overflow-y-auto">
          <Card title="Employee Management">
            <Table
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "department", label: "Department" },
                { key: "role", label: "Role" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteEmployee(row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={employees}
              loading={loading}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}
