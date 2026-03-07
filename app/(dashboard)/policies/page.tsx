"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePolicies } from "@/lib/api/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FileText, Upload, Trash2 } from "lucide-react";
import moment from "moment";

export default function PoliciesPage() {
    const { policies, isLoading, isUploading, upload, remove } = usePolicies();

    // Dialog states
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) {
            toast.error("Please provide title and file");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("file", file);

        try {
            await upload.mutateAsync(formData);
            toast.success("Policy uploaded successfully");
            setIsOpen(false);
            setTitle("");
            setDescription("");
            setFile(null);
        } catch (error) {
            toast.error("Failed to upload policy");
            console.error(error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Policy Management</h1>
                    <p className="text-muted-foreground">Upload and manage organization policies and documents.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies?.map((policy: any) => (
                        <div key={policy.id} className="group relative bg-card rounded-4xl p-6 border border-border hover:shadow-primary/5 shadow-xl shadow-border/5 overflow-hidden hover:scale-102 transition-all duration-500 flex flex-col min-h-[220px]">
                            {/* Background Decorative Icon */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none">
                                <FileText className="w-24 h-24 rotate-12 text-primary" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black tracking-tight text-lg leading-none mb-1 line-clamp-1">{policy.title}</h3>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <span>{moment(policy.created_at).format("MMM D, YYYY")}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{policy.file_size ? (policy.file_size / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shrink-0 ${policy.is_processed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                        {policy.is_processed ? 'Ready' : 'In Work'}
                                    </div>
                                </div>

                                {policy.description ? (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                                        {policy.description}
                                    </p>
                                ) : (
                                    <div className="grow" />
                                )}

                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/50">
                                    <button
                                        onClick={() => {
                                            setSelectedPdf({
                                                url: policy.file_url || policy.file,
                                                title: policy.title
                                            });
                                            setIsViewOpen(true);
                                        }}
                                        className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 flex items-center gap-2 group/btn"
                                    >
                                        <span className="group-hover/btn:mr-1 transition-all">View Document</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!isLoading && policies?.length === 0 && (
                        <div className="col-span-full text-center p-8 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                            No policies uploaded yet.
                        </div>
                    )}
                </div>
            )}

            {/* PDF Viewer Modal */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-5xl h-[calc(100vh-12rem)] flex flex-col p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-4 border-b bg-card">
                        <DialogTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black tracking-tight">{selectedPdf?.title}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Document Viewer</span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grow bg-muted/50 relative">
                        {selectedPdf?.url ? (
                            <iframe
                                src={`${selectedPdf.url}#toolbar=0`}
                                className="w-full h-full border-none"
                                title={selectedPdf.title}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
