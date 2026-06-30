import React from "react";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import { Card } from "../Components/common";

export default function AttendanceManagement() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <Header title="Attendance Management" />
        <div className="flex-1 p-8">
          <Card title="Attendance Records">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600">Present</p>
                <p className="text-2xl font-bold text-blue-600">92%</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-slate-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">5%</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-slate-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">3%</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-slate-600">Work from Home</p>
                <p className="text-2xl font-bold text-green-600">15%</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
