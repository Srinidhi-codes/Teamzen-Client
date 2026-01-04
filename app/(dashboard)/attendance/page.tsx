"use client";

import { usePayrollRuns } from "@/lib/api/hooks";
import { useState } from "react";

export default function PayrollPage() {
  const { data: payrollRuns, isLoading, create, calculate } = usePayrollRuns();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    payroll_month: new Date().toISOString().split("T")[0],
  });

  const handleCreatePayroll = async () => {
    try {
      await create.mutateAsync(formData);
      setShowForm(false);
      alert("Payroll run created successfully");
    } catch (error) {
      alert("Failed to create payroll");
    }
  };

  const handleCalculate = async (runId: number) => {
    try {
      await calculate.mutateAsync(runId);
      alert("Payroll calculated successfully");
    } catch (error) {
      alert("Failed to calculate payroll");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Create Payroll Run
        </button>
      </div>

      {/* Create Payroll Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            New Payroll Run
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payroll Month
              </label>
              <input
                type="month"
                value={formData.payroll_month}
                onChange={(e) =>
                  setFormData({ ...formData, payroll_month: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <button
              onClick={handleCreatePayroll}
              disabled={create.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {create.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">
            Total Employees
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {payrollRuns?.[0]?.total_employees || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Gross Salary</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            ₹{payrollRuns?.[0]?.total_gross_salary?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">
            Total Deductions
          </div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            ₹{payrollRuns?.[0]?.total_deductions?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">Net Salary</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            ₹{payrollRuns?.[0]?.total_net_salary?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Payroll Runs Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payroll Runs</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollRuns?.map((run: any) => (
                  <tr key={run.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(run.payroll_month).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {run.total_employees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{run.total_gross_salary?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${run.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : run.status === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {run.status === "draft" && (
                        <button
                          onClick={() => handleCalculate(run.id)}
                          disabled={calculate.isPending}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Calculate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
