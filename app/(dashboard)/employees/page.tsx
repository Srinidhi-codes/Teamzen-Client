"use client";
import { useState, useEffect } from "react";
import client from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Activity,
  History,
  X,
  ChevronRight,
  Info,
  Zap
} from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    department_id: "",
    designation_id: "",
  });

  const {
    data: employees,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await client.get("/users/");
      return response.data;
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredEmployees = employees?.filter(
    (emp: any) =>
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = filteredEmployees?.length || 0;
  const paginatedEmployees = filteredEmployees?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCreateEmployee = async () => {
    try {
      await client.post("/users/", formData);
      setShowForm(false);
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        department_id: "",
        designation_id: "",
      });
      refetch();
      toast.success("Operational Node Deployed Successfully");
    } catch (error) {
      toast.error("Deployment Failure: Check parameters.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "fullName",
      label: "Node Identity",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black italic shadow-inner">
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-black italic text-foreground leading-tight">
              {row.first_name} {row.last_name}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
              Level 1 Access
            </span>
          </div>
        </div>
      )
    },
    {
      key: "email",
      label: "Comms Link",
      render: (val: string) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-3.5 h-3.5 opacity-40" />
          <span className="text-sm font-bold lowercase tracking-tight">{val}</span>
        </div>
      )
    },
    {
      key: "phone_number",
      label: "Direct Signal",
      render: (val: string) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-3.5 h-3.5 opacity-40" />
          <span className="text-[12px] font-black tabular-nums">{val || "REDACTED"}</span>
        </div>
      )
    },
    {
      key: "role",
      label: "Functional Role",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-primary opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{val}</span>
        </div>
      )
    },
    {
      key: "is_active",
      label: "System Status",
      render: (val: boolean) => (
        <Badge variant={val ? "success" : "danger"} >
          {val ? "Active State" : "Deactivated"}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-premium-h1">Colleague Directory</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Audit and navigate through operational personnel.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-secondary" : "btn-primary"}
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel Entry" : "Register Node"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {/* Create Employee Form */}
          {showForm && (
            <div className="animate-in slide-in-from-top-4 duration-500">
              <Card title="Personnel Registration">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-premium-label ml-1">Universal Identifier (Email)</label>
                      <input
                        type="email"
                        placeholder="email@organization.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-premium-label ml-1">Given Name</label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="input"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-premium-label ml-1">Surname</label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <Button onClick={handleCreateEmployee} className="btn-primary px-12 h-14 rounded-2xl">
                      Authorize Deployment
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search & Filter */}
          <div className="bg-card rounded-4xl border border-border shadow-xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30" />
              <input
                type="text"
                placeholder="Query personnel by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/30 border-none h-14 pl-14 pr-6 rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20 transition-all placeholder:text-muted-foreground/30 tabular-nums"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground opacity-40">
                <Activity className="w-6 h-6" />
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Network Status</p>
                <p className="text-xs font-black italic">NOMINAL</p>
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-premium-label flex items-center gap-3">
                <Users className="w-4 h-4 text-primary" />
                Personnel Ledger
              </h2>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                {filteredEmployees?.length || 0} Entities
              </span>
            </div>

            <div className="bg-card rounded-4xl border border-border shadow-2xl overflow-hidden p-2">
              <DataTable
                columns={columns}
                data={paginatedEmployees || []}
                isLoading={isLoading}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                paginationLabel="Entities"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-10">
          <Card title="Network Insights">
            <div className="space-y-8">
              <div className="p-6 rounded-3xl bg-linear-to-br from-primary/10 to-transparent border border-primary/20 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Core Capacity</p>
                  <p className="text-3xl font-black italic tracking-tighter">84.2%</p>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic">
                  Node synchronization is currently within the standard deviation of expected efficiency.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Active Connections", val: "2,481", icon: Users },
                  { label: "Temporal Latency", val: "14ms", icon: History },
                  { label: "System Uptime", val: "99.98%", icon: Zap },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-black tabular-nums">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="p-10 rounded-[3rem] bg-muted/30 border border-border/50 border-dashed flex flex-col items-center justify-center text-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <Info className="w-12 h-12 text-primary/40 relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest underline decoration-primary/30 underline-offset-4 decoration-2">Audit Notice</h3>
              <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed max-w-[200px] mx-auto">
                All node registrations are logged for temporal auditing by HQ.
              </p>
            </div>
            <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest px-8 border-primary/20 hover:border-primary/50 text-primary/60">
              View Compliance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
