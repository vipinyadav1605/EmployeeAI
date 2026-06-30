import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card, Button } from "../Components/common";

function MLPage() {
  const [salary, setSalary] = useState("");
  const [years, setYears] = useState("");
  const [performance, setPerformance] = useState("");
  const [result, setResult] = useState(null);
  const [importance, setImportance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImportance();
  }, []);

  const fetchImportance = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/ml/feature_importance/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setImportance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const predict = async () => {
    const token = localStorage.getItem("accessToken");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/ml/predict/",
        {
          salary,
          years,
          performance,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <Header
          title="Employee Attrition Prediction"
          subtitle="Estimate employee attrition risk using the trained ML model."
        />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <Card title="Prediction Inputs" subtitle="Enter the employee signals.">
            <div className="grid md:grid-cols-3 gap-4">
              <input
                placeholder="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                placeholder="Years"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                placeholder="Performance (1-5)"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button onClick={predict} loading={loading} className="mt-5">
              Predict
            </Button>
          </Card>

          {result && (
            <Card>
              <div
                className={`p-4 rounded-lg border ${
                  result.will_leave
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}
              >
                <div className="text-lg font-semibold mb-1">
                  {result.will_leave
                    ? "High Attrition Risk"
                    : "Low Attrition Risk"}
                </div>
                <div className="text-sm">
                  Probability:{" "}
                  <span className="font-semibold">{result.probability}%</span>
                </div>
              </div>
            </Card>
          )}

          {importance && (
            <Card title="Feature Importance">
              <div className="space-y-4">
                {Object.entries(importance).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{key}</span>
                      <span className="text-slate-500">{value}</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default MLPage;
