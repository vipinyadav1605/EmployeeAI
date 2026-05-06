import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card, Button } from "../Components/common";

export default function ProjectManagement() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <Header title="Project Management" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          {/* Page Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-700">
              Manage Your Projects
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Create, track, and organize all your projects in one place
            </p>
          </div>

          {/* Card */}
          <Card
            title="Projects"
            className="bg-white rounded-2xl shadow-lg border border-slate-200"
          >
            <div className="flex flex-col gap-6">
              {/* Action Bar */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-lg font-medium text-slate-700">
                  Project List
                </h3>

                <Button
                  variant="primary"
                  className="px-5 py-2 rounded-xl shadow hover:shadow-md transition-all duration-200"
                >
                  + Create New Project
                </Button>
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm mb-2">No projects yet</p>
                <span className="text-xs text-slate-400">
                  Start by creating your first project
                </span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
