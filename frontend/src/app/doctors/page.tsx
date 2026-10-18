"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  MapPin,
  Search,
  Sparkles,
  Copy,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Brain,
  Activity,
  Bone,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Markdown } from "@/components/ui/Markdown";
import { apiPost, copyText } from "@/lib/utils";

const SPECIALTY_PRESETS = [
  { name: "Cardiologist", icon: Heart },
  { name: "Neurologist", icon: Brain },
  { name: "Orthopedic", icon: Bone },
  { name: "General Physician", icon: Stethoscope },
  { name: "Dermatologist", icon: Activity },
  { name: "Endocrinologist", icon: Sparkles },
];

export default function DoctorsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    specialty: "General Physician",
    location: "",
    condition: "",
    insurance: "",
    preference: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await apiPost<{ result: string }>("/api/doctors", formData);
      setResult(data.result);
      toast("Doctor guidance generated successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to locate specialists";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="section-pill mb-3">Healthcare Discovery</span>
        <h1 className="page-title mt-2">
          Doctor &amp; Specialist <span className="text-gradient">Finder</span>
        </h1>
        <p className="page-subtitle text-sm sm:text-base">
          AI-guided specialist discovery, questions for consultation, clinic credentials verification, and triage advice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Search Parameters Form */}
        <div className="lg:col-span-5">
          <div className="card-glow sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-400" />
              Specialist Search
            </h2>

            {/* Quick Presets */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Quick Specialties</label>
              <div className="flex flex-wrap gap-1.5">
                {SPECIALTY_PRESETS.map((p) => {
                  const Icon = p.icon;
                  const active = formData.specialty === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, specialty: p.name }))}
                      className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                        active
                          ? "bg-rose-950 border border-rose-700 text-rose-300 font-medium"
                          : "bg-gray-800/80 border border-gray-700/80 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="label">Specialty Category</label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="select"
                >
                  <optgroup label="Primary Care">
                    <option value="General Physician">General Physician / Internist</option>
                    <option value="Family Medicine">Family Medicine Doctor</option>
                    <option value="Pediatrician">Pediatrician (Child Specialist)</option>
                    <option value="Geriatrician">Geriatrician (Elderly Care)</option>
                  </optgroup>
                  <optgroup label="Specialists">
                    <option value="Cardiologist">Cardiologist (Heart &amp; Vascular)</option>
                    <option value="Neurologist">Neurologist (Brain &amp; Nerve)</option>
                    <option value="Orthopedic Surgeon">Orthopedic Surgeon (Bones &amp; Joints)</option>
                    <option value="Dermatologist">Dermatologist (Skin &amp; Hair)</option>
                    <option value="Endocrinologist">Endocrinologist (Diabetes &amp; Hormones)</option>
                    <option value="Gastroenterologist">Gastroenterologist (Digestive)</option>
                    <option value="Pulmonologist">Pulmonologist (Lungs &amp; Asthma)</option>
                    <option value="ENT Specialist">Otolaryngologist (ENT)</option>
                    <option value="Psychiatrist">Psychiatrist (Mental Health)</option>
                    <option value="Gynecologist">Obstetrician / Gynecologist (OB-GYN)</option>
                    <option value="Oncologist">Oncologist (Cancer Specialist)</option>
                    <option value="Ophthalmologist">Ophthalmologist (Eye Care)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="label">Location or Region</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="City, State, or Postal Code"
                  />
                  <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="label">Medical Concern / Symptoms</label>
                <textarea
                  name="condition"
                  rows={2}
                  value={formData.condition}
                  onChange={handleChange}
                  className="textarea"
                  placeholder="Describe what symptoms or diagnosis you are seeking care for..."
                />
              </div>

              <div>
                <label className="label">Insurance / Hospital Preference</label>
                <input
                  type="text"
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. BlueCross, Medicare, NHS, Private"
                />
              </div>

              <div>
                <label className="label">Doctor Preferences</label>
                <input
                  type="text"
                  name="preference"
                  value={formData.preference}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Female doctor, evening slots, telehealth available"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm justify-center shadow-lg shadow-primary-600/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner w-4 h-4 border-2" />
                    <span>Searching Medical Networks...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>Find Specialists</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Results Panel */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="card min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="spinner w-20 h-20 border-4 border-t-rose-500" />
                <Stethoscope className="w-8 h-8 text-rose-400 absolute inset-0 m-auto" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analyzing Specialist Credentials</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Curating appointment questions, credential checklists, verification registries, and location triage tips...
              </p>
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
                    <Stethoscope className="w-5 h-5 text-rose-400" />
                    Recommended Guidance &amp; Directory
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formData.specialty} {formData.location ? `• ${formData.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      copyText(result);
                      toast("Recommendations copied to clipboard!", "success");
                    }}
                    className="btn-outline text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="btn-ghost text-xs px-2.5 py-1.5 text-gray-400 hover:text-white"
                  >
                    New Search
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[700px] pr-2">
                <Markdown content={result} />
              </div>
            </motion.div>
          ) : (
            <div className="card min-h-[500px] flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <Building2 className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-base font-semibold text-gray-300 mb-1">
                No Doctor Search Yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                Choose a medical specialty and location to discover verified practitioners, consultation preparations, and questions to ask your physician.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
