"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/common/Card";
import { Layers, BarChart3 } from "lucide-react";
import { departmentData } from "@/components/analytics/analyticsData";

const payrollData = [
  { month: "Jan", salary: 500000 },
  { month: "Feb", salary: 520000 },
  { month: "Mar", salary: 510000 },
  { month: "Apr", salary: 530000 },
  { month: "May", salary: 550000 },
  { month: "Jun", salary: 560000 },
];

const leaveData = [
  { leave_type: "Casual Leave", used: 8, remaining: 2 },
  { leave_type: "Earned Leave", used: 12, remaining: 8 },
  { leave_type: "Loss of Pay", used: 0, remaining: 10 },
];

const COLORS = ["#0d9488", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

const tooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export function AnalyticsTrendCharts() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card title="Payroll trend" icon={BarChart3}>
        <div className="mt-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, "Payroll"]}
              />
              <Line
                type="monotone"
                dataKey="salary"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ fill: "#0d9488", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Cost by department" icon={Layers}>
        <div className="mt-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any) => `₹${value.toLocaleString()}`}
              />
              <Bar dataKey="cost" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export function LeaveUsageChart() {
  return (
    <Card title="Leave usage">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={leaveData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={10}
              dataKey="used"
            >
              {leaveData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
