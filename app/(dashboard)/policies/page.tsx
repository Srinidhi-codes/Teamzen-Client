"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePolicies } from "@/lib/api/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FileText, Upload, Trash2, Plus, Minus, Maximize2, ArrowRight, RotateCcw } from "lucide-react";
import moment from "moment";
import Link from "next/link";

export default function PoliciesPage() {
    const { policies, isLoading, isUploading, upload, remove } = usePolicies();

    // Dialog states
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);
    const [zoom, setZoom] = useState(1);

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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground capitalize">
                        Policy Management
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm sm:text-base flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Access organization protocols and documentations.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => window.location.reload()}
                        className="p-3 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-xl transition-all active:rotate-180 duration-500"
                        title="Synchronize Data"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto rounded-2xl gap-2 font-black px-6 py-6 shadow-xl shadow-primary/20 hover:scale-105 transition-all text-[11px] uppercase tracking-widest">
                                <Upload className="w-5 h-5 text-primary-foreground" />
                                Upload Policy
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-4xl shadow-2xl">
                            <DialogHeader className="p-8 pb-4 bg-linear-to-br from-primary/10 to-transparent">
                                <DialogTitle className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xl font-black tracking-tight">Upload Protocol</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Organization Document</span>
                                    </div>
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Document Title</Label>
                                        <Input
                                            placeholder="e.g. Leave Policy 2024"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-12 rounded-xl bg-muted/50 border-border focus:ring-primary/20 font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Optional)</Label>
                                        <Textarea
                                            placeholder="Brief summary of the document contents..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="min-h-[100px] rounded-xl bg-muted/50 border-border focus:ring-primary/20 font-medium resize-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Document File</Label>
                                        <div className="relative group/file">
                                            <Input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="h-14 rounded-xl bg-muted/50 border-dashed border-2 border-border group-hover/file:border-primary/30 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 pt-2.5"
                                                required
                                            />
                                        </div>
                                        <p className="text-[9px] font-medium text-muted-foreground italic px-1">Supported: PDF, DOC, DOCX up to 10MB</p>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Initialize Upload
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                                            setZoom(1);
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

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-7xl w-[95vw] h-[90vh] sm:h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl sm:rounded-4xl border-none shadow-2xl transition-all duration-300">
                    <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <DialogTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-black tracking-tight truncate max-w-[200px] sm:max-w-sm">{selectedPdf?.title}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol Terminal</span>
                            </div>
                        </DialogTitle>

                        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl self-end sm:self-auto">
                            <div className="w-px h-4 bg-border mx-1" />
                            <button
                                onClick={() => {
                                    if (selectedPdf?.url) window.open(selectedPdf.url, '_blank')
                                }}
                                className="w-8 h-8 rounded-lg hover:bg-background flex items-center justify-center transition-all"
                                title="Full Screen"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </DialogHeader>
                    <div className="grow bg-[#525659] relative overflow-auto custom-scrollbar flex items-center justify-center p-4">
                        {selectedPdf?.url ? (
                            <div
                                className="origin-top transition-transform duration-200 shadow-2xl bg-white w-full h-full min-h-[500px]"
                                style={{
                                    transform: `scale(${zoom})`,
                                    height: `${100 / zoom}%`,
                                    width: `${100 / zoom}%`
                                }}
                            >
                                <iframe
                                    src={`${selectedPdf.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full border-none"
                                    title={selectedPdf.title}
                                />
                            </div>
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
