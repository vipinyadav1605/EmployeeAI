import React, { useState, useEffect } from "react";
import axios from "axios";

function MLPage() {
  const [salary, setSalary] = useState("");
  const [years, setYears] = useState("");
  const [performance, setPerformance] = useState("");

  const [result, setResult] = useState(null);
  const [importance, setImportance] = useState(null);

  useEffect(() => {
    fetchImportance();
  }, []);

  const fetchImportance = async () => {
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
  };

  const predict = async () => {
    const token = localStorage.getItem("accessToken");

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 space-y-6">
      {/* 🔹 Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-wide">
          Employee Attrition Prediction
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Predict employee risk using ML model
        </p>
      </div>

      {/* 🔹 Input Card */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold">Enter Details</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            placeholder="Salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="Years"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="Performance (1-5)"
            value={performance}
            onChange={(e) => setPerformance(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={predict}
          className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-xl text-sm font-medium shadow-md"
        >
          Predict
        </button>
      </div>

      {/* 🔹 Result Card */}
      {result && (
        <div
          className={`p-5 rounded-2xl shadow-lg border ${
            result.will_leave
              ? "bg-red-500/10 border-red-500"
              : "bg-green-500/10 border-green-500"
          }`}
        >
          <div className="text-lg font-semibold mb-1">
            {result.will_leave
              ? "⚠ High Attrition Risk"
              : " Low Attrition Risk"}
          </div>
          <div className="text-sm text-slate-300">
            Probability:{" "}
            <span className="font-medium">{result.probability}%</span>
          </div>
        </div>
      )}

      {/* 🔹 Feature Importance */}
      {importance && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h2 className="font-semibold mb-4 text-lg"> Feature Importance</h2>

          <div className="space-y-3">
            {Object.entries(importance).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{key}</span>
                  <span>{value}</span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${value * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MLPage;
