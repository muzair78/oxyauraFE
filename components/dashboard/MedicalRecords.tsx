"use client";

import { useRef, useState, useEffect } from "react";
import api from "@/lib/api";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getUser } from "@/lib/auth";
import {
  Calendar,
  ChevronDown,
  Download,
  Eye,
  File,
  FileText,
  FolderOpen,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type DocCategory = "Reports" | "Prescriptions" | "Diet Plans" | "Other";

interface MedicalDocument {
  id: string;
  category: DocCategory;
  fileName: string;
  fileSize: string;
  dateUploaded: string;
  doctorOrIssuer?: string;
  notes?: string;
}

export default function MedicalRecords() {
  const user = getUser();
  const userName = user?.fullname || "User";

  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState<"All" | DocCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    setIsFetching(true);
    api
      .get(`/reports/user/${user.id}`)
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const records = (res.data as any[]).map((r) => ({
          id: String(r.id),
          category: (r.document_type ?? r.documentType ?? "Other") as DocCategory,
          fileName: r.file_name ?? r.fileName ?? r.filename ?? "Document",
          fileSize: r.file_size ?? r.fileSize ?? "",
          dateUploaded: r.uploaded_at
            ? new Date(r.uploaded_at).toLocaleDateString()
            : r.created_at
            ? new Date(r.created_at).toLocaleDateString()
            : "",
          doctorOrIssuer: r.doctor_or_issuer ?? r.issuer ?? "",
          notes: r.notes ?? "",
        }));
        setDocuments(records);
      })
      .catch((err) => {
        console.error("Failed to fetch records:", err);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [user?.id]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<MedicalDocument | null>(null);
  const [docToDelete, setDocToDelete] = useState<MedicalDocument | null>(null);

  // New Document Form state
  const [newCategory, setNewCategory] = useState<DocCategory>("Reports");
  const [newFileName, setNewFileName] = useState("");
  const [newIssuer, setNewIssuer] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentType", newCategory);
    formData.append("userId", String(user?.id ?? ""));

    try {
      setIsUploading(true);
      const res = await api.post(
        "/reports/upload",
        formData
      );
      console.log("Upload response:", res.data);
      // Re-fetch documents so the new upload appears in the list
      if (user?.id) {
        const listRes = await api.get(`/reports/user/${user.id}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const records = (listRes.data as any[]).map((r) => ({
          id: String(r.id),
          category: (r.document_type ?? r.documentType ?? "Other") as DocCategory,
          fileName: r.file_name ?? r.fileName ?? r.filename ?? "Document",
          fileSize: r.file_size ?? r.fileSize ?? "",
          dateUploaded: r.uploaded_at
            ? new Date(r.uploaded_at).toLocaleDateString()
            : r.created_at
            ? new Date(r.created_at).toLocaleDateString()
            : "",
          doctorOrIssuer: r.doctor_or_issuer ?? r.issuer ?? "",
          notes: r.notes ?? "",
        }));
        setDocuments(records);
      }
      // Only reset and close on success
      setIsUploadModalOpen(false);
      setNewFileName("");
      setNewIssuer("");
      setNewNotes("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  console.log(documents , "docs")

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/reports/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setDocToDelete(null);
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  const handleDownload = (doc: MedicalDocument) => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `========================================\nOXYAURA MEDICAL RECORD\n========================================\nDocument: ${doc.fileName}\nCategory: ${doc.category}\nDate Uploaded: ${doc.dateUploaded}\nProvider: ${doc.doctorOrIssuer || "N/A"}\n\nClinical Notes:\n${doc.notes || "No additional notes provided."}\n========================================`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = doc.fileName.replace(".pdf", ".txt");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      activeCategory === "All" || doc.category === activeCategory;
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.doctorOrIssuer &&
        doc.doctorOrIssuer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  console.log(filteredDocuments , "filtered docs")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#f8fafc] flex flex-col min-h-screen">
        {/* Sleek Top Navigation Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 hidden sm:block opacity-60" />
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
                <FolderOpen className="size-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  Medical Records
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block font-medium">
                  Your secure, centralized clinical document repository
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70 transition-all cursor-pointer">
            <div className="size-7 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              {userName.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
              {userName}
            </span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
          {/* Documents Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
            {/* Top Action Header: Title + Upload Document Button */}
            <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-2xs">
                  <FolderOpen className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base md:text-lg">
                      Your Uploaded Data
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {documents.length} files
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View, download, or delete your health records
                  </p>
                </div>
              </div>

              {/* Single Unified Upload Document Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs md:text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              >
                <UploadCloud className="size-4" />
                Upload Document
              </button>
            </div>

            {/* Controls: Category Filter Tabs + Search Bar */}
            <div className="px-5 md:px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Pills Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/70 rounded-2xl overflow-x-auto scrollbar-none w-fit shadow-2xs">
                {(["All", "Reports", "Prescriptions", "Diet Plans", "Other"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-teal-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            {/* Document List (Clean row cards with File Name, Date Uploaded, and Actions only) */}
            <div className="divide-y divide-slate-100">
              {isFetching ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="size-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">Loading your documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="size-16 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <File className="size-8" />
                  </div>
                  <h4 className="font-semibold text-slate-700 text-sm">No documents found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Try adjusting your search terms or upload a new medical document.
                  </p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* File Name & Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-11 rounded-2xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-600 shrink-0 group-hover:scale-105 group-hover:bg-teal-100/80 transition-all shadow-2xs">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-900 transition-colors">
                          {doc.category || ""}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span className="font-medium text-slate-500">{doc.fileSize}</span>
                          <span>•</span>
                          <span className="text-slate-400">{doc.doctorOrIssuer || "Medical Document"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date Uploaded & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Date Uploaded */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Calendar className="size-3.5 text-slate-400" />
                        <span>{doc.dateUploaded}</span>
                      </div>

                      {/* Actions: View, Download, Delete Only */}
                      <div className="flex items-center gap-1.5">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className="size-9 rounded-xl bg-slate-100/80 hover:bg-teal-50 hover:text-teal-700 text-slate-600 flex items-center justify-center transition-all cursor-pointer hover:shadow-xs active:scale-95"
                          title="View Document"
                        >
                          <Eye className="size-4" />
                        </button>

                        {/* Download Button */}
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="size-9 rounded-xl bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 flex items-center justify-center transition-all cursor-pointer hover:shadow-xs active:scale-95"
                          title="Download Document"
                        >
                          <Download className="size-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDocToDelete(doc)}
                          className="size-9 rounded-xl bg-slate-100/80 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition-all cursor-pointer hover:shadow-xs active:scale-95"
                          title="Delete Document"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Upload Document Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 md:p-7 space-y-5 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                    <UploadCloud className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Upload Medical Document
                    </h3>
                    <p className="text-xs text-slate-400">
                      Attach lab reports, prescriptions, diet charts, or other files
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                    setNewFileName("");
                    setNewIssuer("");
                    setNewNotes("");
                  }}
                  className="size-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs md:text-sm">
                {/* Category Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Select Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["Reports", "Prescriptions", "Diet Plans", "Other"] as DocCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          newCategory === cat
                            ? "border-teal-600 bg-teal-50/80 text-teal-800 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setSelectedFile(file);
                      setNewFileName(file.name);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-teal-500 bg-teal-50/40"
                      : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setNewFileName(file.name);
                      }
                    }}
                  />
                  <UploadCloud className="size-7 text-teal-600 mx-auto mb-1.5" />
                  {selectedFile ? (
                    <p className="font-semibold text-teal-700 text-xs">{selectedFile.name}</p>
                  ) : (
                    <p className="font-semibold text-slate-700 text-xs">
                      Click to browse or drag & drop document
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports PDF, DOCX, JPG or PNG (up to 25MB)
                  </p>
                </div>

                {/* File Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Document Title / File Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lipid_Panel_Blood_Report"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15"
                  />
                </div>

                {/* Doctor / Facility */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Issuing Doctor or Facility (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Jenkins or Apex Diagnostic"
                    value={newIssuer}
                    onChange={(e) => setNewIssuer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setSelectedFile(null);
                      setNewFileName("");
                      setNewIssuer("");
                      setNewNotes("");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold cursor-pointer shadow-md shadow-teal-600/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Document Modal */}
        {viewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 md:p-7 space-y-5 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Document Preview
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[260px]">
                      {viewingDoc.fileName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="size-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs md:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-teal-700 bg-teal-50 border border-teal-100/80 px-2 py-0.5 rounded-lg text-xs">
                      {viewingDoc.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">File Name:</span>
                    <span className="font-semibold text-slate-800">{viewingDoc.fileName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span className="text-slate-700 font-medium">{viewingDoc.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Date Uploaded:</span>
                    <span className="text-slate-700 font-medium">{viewingDoc.dateUploaded}</span>
                  </div>
                  {viewingDoc.doctorOrIssuer && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Issuer / Doctor:</span>
                      <span className="text-slate-800 font-medium">{viewingDoc.doctorOrIssuer}</span>
                    </div>
                  )}
                </div>

                {viewingDoc.notes && (
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                    <p className="text-xs font-semibold text-teal-900 mb-1">Clinical Summary:</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{viewingDoc.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer text-xs md:text-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(viewingDoc)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer shadow-xs text-xs md:text-sm active:scale-95"
                >
                  <Download className="size-3.5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {docToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scale-in">
              <div className="size-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
                <Trash2 className="size-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  Delete Document
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-slate-800">"{docToDelete.fileName}"</span>?
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(docToDelete.id)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-md shadow-rose-600/20 active:scale-95 text-xs md:text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
