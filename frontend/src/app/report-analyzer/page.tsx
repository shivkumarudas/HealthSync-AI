"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Copy,
  Download,
  RotateCcw,
  AlertCircle,
  FileSearch,
  CheckCircle2,
  FileCheck2,
  ImageIcon,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Markdown } from "@/components/ui/Markdown";
import { apiUpload, formatBytes, copyText, downloadText } from "@/lib/utils";

export default function ReportAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [analyzedFilename, setAnalyzedFilename] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Uploading document...",
    "Extracting clinical data...",
    "Consulting Gemini Multimodal AI...",
    "Generating structured medical insights...",
  ];

  const handleFileChange = (selected: File) => {
    const validExtensions = ["pdf", "png", "jpg", "jpeg", "webp"];
    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      toast("Unsupported format. Please upload PDF, PNG, JPG, or WEBP.", "error");
      return;
    }

    if (selected.size > 16 * 1024 * 1024) {
      toast("File exceeds 16MB limit.", "error");
      return;
    }

    setFile(selected);
    if (selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast("Please upload a medical report first.", "warning");
      return;
    }

    setLoading(true);
    setProgressStep(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgressStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await apiUpload<{ result: string; filename: string }>("/api/analyze", formData);
      clearInterval(interval);
      setProgressStep(steps.length - 1);
      setResult(data.result);
      setAnalyzedFilename(data.filename);
      toast("Report analyzed successfully!", "success");
    } catch (err: unknown) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Failed to analyze document";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setAnalyzedFilename("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="section-pill mb-3">Multimodal Analysis</span>
        <h1 className="page-title mt-2">
          AI Medical Report <span className="text-gradient">Analyzer</span>
        </h1>
        <p className="page-subtitle text-sm sm:text-base">
          Upload laboratory tests, blood work, imaging descriptions, or discharge notes for structured, easy-to-read insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload and File controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-glow">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-400" />
              Upload Medical Document
            </h2>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`upload-zone flex flex-col items-center justify-center min-h-[220px] ${
                isDragging ? "upload-zone-active" : ""
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />

              {file ? (
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-950 border border-primary-800 flex items-center justify-center text-primary-400 mb-3 shadow-lg">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-7 h-7" />
                    ) : (
                      <FileText className="w-7 h-7" />
                    )}
                  </div>
                  <span className="font-semibold text-white text-sm max-w-[260px] truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">{formatBytes(file.size)}</span>
                  <span className="badge badge-green mt-3">Ready to Analyze</span>
                </div>
              ) : (
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">
                    Drag and drop your medical file here
                  </p>
                  <p className="text-xs text-gray-400">or click to browse your device</p>
                  <span className="text-[11px] text-gray-500 mt-4">
                    PDF, PNG, JPG, or WEBP (Max 16MB)
                  </span>
                </div>
              )}
            </div>

            {/* Image Preview if applicable */}
            {previewUrl && (
              <div className="mt-4 p-2 bg-gray-950 rounded-xl border border-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Report Preview"
                  className="max-h-48 w-full object-contain rounded-lg"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="btn-primary flex-1 py-3 text-sm"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner w-4 h-4 border-2" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4" />
                    <span>Start Analysis</span>
                  </div>
                )}
              </button>

              {file && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-outline p-3 rounded-xl"
                  title="Remove File"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="card space-y-3 text-sm">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-400" /> Supported Diagnostic Types
            </h3>
            <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
              <li>• Complete Blood Count (CBC) & Metabolic Panels</li>
              <li>• Lipid, Liver, and Renal Function Tests</li>
              <li>• Endocrinology & Thyroid Panels (TSH, T3, T4)</li>
              <li>• Radiology & Ultrasound findings summaries</li>
              <li>• Clinic prescriptions & Doctor consultations</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results & Insights */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="card min-h-[480px] flex flex-col items-center justify-center p-8 text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="spinner w-20 h-20 border-4 border-t-primary-500" />
                <FileSearch className="w-8 h-8 text-primary-400 absolute inset-0 m-auto" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analyzing Diagnostics</h3>
              <p className="text-sm text-gray-400 max-w-xs mb-6">
                {steps[progressStep]}
              </p>
              <div className="w-full max-w-xs bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${((progressStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glow flex flex-col h-full"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-800">
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-primary-400" />
                    Structured Clinical Insights
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{analyzedFilename}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      copyText(result);
                      toast("Analysis copied to clipboard!", "success");
                    }}
                    className="btn-outline text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={() => downloadText(result, `report_analysis_${Date.now()}.txt`)}
                    className="btn-outline text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={handleReset}
                    className="btn-ghost text-xs px-2.5 py-1.5 text-gray-400 hover:text-white"
                  >
                    New Analysis
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[640px] pr-2">
                <Markdown content={result} />
              </div>
            </motion.div>
          ) : (
            <div className="card min-h-[480px] flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <FileSearch className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-base font-semibold text-gray-300 mb-1">
                No Report Analyzed Yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                Upload your report in PDF or image format on the left and click &quot;Start Analysis&quot; to review AI-generated findings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
