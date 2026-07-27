"use client";
import { useState, useEffect } from "react";
import client from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
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
  Info,
} from "lucide-react";
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
      toast.success("Employee added successfully.");
    } catch (error) {
      toast.error("Could not add employee. Check the details and try again.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "fullName",
      label: "Name",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground leading-tight text-sm">
              {row.first_name} {row.last_name}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
      render: (val: string) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-3.5 h-3.5 opacity-40" />
          <span className="text-sm font-medium lowercase">{val}</span>
        </div>
      )
    },
    {
      key: "phone_number",
      label: "Phone",
      render: (val: string) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-3.5 h-3.5 opacity-40" />
          <span className="text-sm font-medium tabular-nums">{val || "—"}</span>
        </div>
      )
    },
    {
      key: "role",
      label: "Role",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-primary opacity-40" />
          <span className="text-sm font-medium text-primary capitalize">{val}</span>
        </div>
      )
    },
    {
      key: "is_active",
      label: "Status",
      render: (val: boolean) => (
        <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize ${
          val ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive"
        }`}>
          {val ? "Active" : "Inactive"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20 p-4 sm:p-8">
      <PageHeader
        title="Employees"
        description="Browse and manage people in your organization."
        actions={
          <Button
            onClick={() => setShowForm(!showForm)}
            className={`h-9 rounded-md ${showForm ? "btn-secondary" : "btn-primary"}`}
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "Add employee"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {showForm && (
            <div className="animate-in slide-in-from-top-4 duration-500">
              <Card title="Add employee">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Email</label>
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
                        <label className="text-sm font-medium ml-1">First name</label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="input"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Last name</label>
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
                    <Button onClick={handleCreateEmployee} className="btn-primary h-9 rounded-md px-6">
                      Save employee
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Search by name, email, or role…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/30 border-none h-9 pl-10 pr-4 rounded-md text-sm font-medium focus:ring-2 ring-primary/20 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span>{filteredEmployees?.length || 0} employees</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Directory
              </h2>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden p-1">
              <DataTable
                columns={columns}
                data={paginatedEmployees || []}
                isLoading={isLoading}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                paginationLabel="employees"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="Overview">
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary">Headcount utilization</p>
                  <p className="text-2xl font-semibold">84.2%</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Current staffing levels are within the expected range for this period.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Active employees", val: "2,481", icon: Users },
                  { label: "Average response time", val: "14ms", icon: History },
                  { label: "System uptime", val: "99.98%", icon: Activity },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="p-6 rounded-xl bg-muted/30 border border-border border-dashed flex flex-col items-center justify-center text-center gap-4">
            <Info className="w-8 h-8 text-primary/40" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Compliance note</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                New employee records are logged for audit purposes.
              </p>
            </div>
            <Button variant="outline" className="h-9 rounded-md text-sm font-medium px-4 border-primary/20 text-primary/80">
              View compliance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
