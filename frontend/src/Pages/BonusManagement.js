import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card, Button, Table } from "../Components/common";

function BonusManagement() {
  const [bonuses, setBonuses] = useState([]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <Header title="Bonus Management" />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          <Card
            title="Bonus Allocations"
            className="shadow-lg rounded-2xl border border-slate-200 bg-white"
          >
            <div className="flex flex-col gap-6">
              {/* Top Actions */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-slate-700">
                  Manage Employee Bonuses
                </h2>

                <Button
                  variant="primary"
                  className="px-5 py-2 rounded-xl shadow hover:shadow-md transition-all duration-200"
                >
                  + Add New Bonus
                </Button>
              </div>

              {/* Table Wrapper */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <Table
                  columns={[
                    { key: "employee", label: "Employee" },
                    { key: "amount", label: "Amount" },
                    { key: "status", label: "Status" },
                  ]}
                  data={bonuses}
                  loading={false}
                  emptyMessage="No bonuses allocated"
                />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default BonusManagement;
