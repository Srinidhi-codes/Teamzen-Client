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
import { DataTable, Column } from "@/components/common/DataTable";
import {
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  FileText,
  Download,
  Printer,
  Activity,
  Calendar,
  Layers,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample data
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

const departmentData = [
  { name: "Engineering", employees: 45, cost: 2500000 },
  { name: "Sales", employees: 30, cost: 1800000 },
  { name: "Marketing", employees: 15, cost: 900000 },
  { name: "HR", employees: 8, cost: 480000 },
];

const attendanceData = [
  { date: "Mon", present: 95, absent: 5 },
  { date: "Tue", present: 98, absent: 2 },
  { date: "Wed", present: 92, absent: 8 },
  { date: "Thu", present: 96, absent: 4 },
  { date: "Fri", present: 99, absent: 1 },
];

const COLORS = ["#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export default function AnalyticsPage() {

  const deptColumns: Column<any>[] = [
    {
      key: "name",
      label: "Operational Unit",
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold italic">{val}</span>
        </div>
      )
    },
    {
      key: "employees",
      label: "Node Count",
      render: (val: number) => <span className="font-black tabular-nums">{val} Entities</span>
    },
    {
      key: "cost",
      label: "Total Value",
      render: (val: number) => <span className="font-black tabular-nums text-primary">₹{val.toLocaleString()}</span>
    },
    {
      key: "avgSalary",
      label: "Avg Resource Cost",
      render: (_: any, row: any) => (
        <span className="font-bold tabular-nums opacity-60">₹{Math.round(row.cost / row.employees).toLocaleString()}</span>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-premium-h1">Command Matrix</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Predictive analytics and operational telemetry.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-dashed border-2 hover:border-primary transition-all">
            <Calendar className="w-4 h-4 mr-2" />
            Time Interval: Q2-2024
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Aggregate Cost", val: "₹65,80,000", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
          { label: "Active Connections", val: "108 Nodes", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "System Velocity", val: "94.2%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Data Integrity", val: "99.9%", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-4xl border border-border shadow-xl p-8 space-y-4 hover:border-primary/30 transition-all group">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-black italic tracking-tighter">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card title="Financial Trajectory" icon={BarChart3}>
          <div className="h-[350px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, "Yield"]}
                />
                <Line
                  type="monotone"
                  dataKey="salary"
                  stroke="#7c3aed"
                  strokeWidth={4}
                  dot={{ fill: "#7c3aed", r: 6, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Unit Value Distribution" icon={Layers}>
          <div className="h-[350px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="cost" fill="#7c3aed" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Summary and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <Card title="Temporal Utilization">
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

          <div className="bg-linear-to-br from-primary to-primary-foreground text-primary-foreground rounded-[2.5rem] p-10 space-y-6 shadow-2xl">
            <Activity className="w-10 h-10 text-white animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-xl font-black italic tracking-tighter">Operational Alert</h3>
              <p className="text-xs font-medium opacity-70 leading-relaxed">
                Engineering cost has exceeded the threshold by 4.2% this interval. Recommended audit sequence initiated.
              </p>
            </div>
            <Button variant="secondary" className="w-full h-12 rounded-2xl font-black text-[10px] tracking-widest uppercase">
              Launch Diagnostics
            </Button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-premium-label flex items-center gap-3">
              <Activity className="w-4 h-4 text-primary" />
              Unit Summary Matrix
            </h2>
          </div>

          <div className="bg-card rounded-4xl border border-border shadow-2xl overflow-hidden p-2">
            <DataTable
              columns={deptColumns}
              data={departmentData}
              isLoading={false}
            />
          </div>

          {/* Export Deck */}
          <div className="bg-muted/30 border border-border/50 rounded-4xl p-10 flex flex-wrap gap-6 items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black italic">Archive Portal</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol Compliant Data Export</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white/50 backdrop-blur-sm border-2">
                <FileText className="w-4 h-4 mr-2 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Digital PDF</span>
              </Button>
              <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white/50 backdrop-blur-sm border-2">
                <Download className="w-4 h-4 mr-2 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">XML Binary</span>
              </Button>
              <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white/50 backdrop-blur-sm border-2">
                <Printer className="w-4 h-4 mr-2 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Physical Array</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
