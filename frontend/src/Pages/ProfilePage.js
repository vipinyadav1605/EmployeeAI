import React from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card, Button } from "../Components/common";
import { useAuth } from "../App";
function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <Header title="Profile Settings" />
        <div className="flex-1 p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-slate-600">{user?.email}</p>
                <p className="text-sm text-slate-600 mt-1 capitalize">
                  {user?.role}
                </p>
              </div>
            </Card>

            <Card title="Personal Information" className="lg:col-span-2">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <Button variant="primary">Save Changes</Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
export default ProfilePage;
