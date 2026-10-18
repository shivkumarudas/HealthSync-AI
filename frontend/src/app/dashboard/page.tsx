"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Apple,
  Dumbbell,
  MessageCircle,
  Stethoscope,
  UserCheck,
  Activity,
  Scale,
  Flame,
  Clock,
  Sparkles,
  ArrowUpRight,
  X,
  Save,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { API_BASE, calcBMI, ANALYSIS_META } from "@/lib/utils";

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface UserProfile {
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  gender?: string | null;
  blood_group?: string | null;
  medical_conditions?: string | null;
  allergies?: string | null;
  fitness_goal?: string | null;
  activity_level?: string | null;
  dietary_preference?: string | null;
}

interface HistoryItem {
  id: number;
  type: string;
  input_summary: string;
  result: string;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<UserProfile>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meRes, profileRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/me`, { credentials: "include" }),
        fetch(`${API_BASE}/api/profile`, { credentials: "include" }),
        fetch(`${API_BASE}/api/history?limit=10`, { credentials: "include" }),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData);
      }
      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfile(pData.profile);
        setFormData(pData.profile || {});
      }
      if (historyRes.ok) {
        const hData = await historyRes.json();
        setHistory(hData.history || []);
      }
    } catch {
      // Offline or network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      toast("Health profile updated successfully!", "success");
      setProfile({ ...formData });
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating profile";
      toast(msg, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const bmiData =
    profile?.weight && profile?.height
      ? calcBMI(Number(profile.weight), Number(profile.height))
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 section-pill mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HealthSync AI Hub</span>
          </div>
          <h1 className="page-title">
            Welcome back, <span className="text-gradient">{user?.username || "Health Explorer"}</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Track your vitals, view AI analysis reports, and maintain peak wellness.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(profile || {});
            setModalOpen(true);
          }}
          className="btn-primary text-sm py-2.5 px-4 self-start sm:self-center"
        >
          <UserCheck className="w-4 h-4" />
          Edit Health Profile
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* BMI Card */}
        <div className="stat-card">
          <div className="stat-icon bg-blue-950 text-blue-400 border border-blue-900/60">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">BMI Index</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white">
                {bmiData ? bmiData.bmi : "—"}
              </span>
              {bmiData && (
                <span
                  className={`badge ${
                    bmiData.category === "Normal weight"
                      ? "badge-green"
                      : bmiData.category === "Underweight"
                      ? "badge-blue"
                      : bmiData.category === "Overweight"
                      ? "badge-yellow"
                      : "badge-red"
                  }`}
                >
                  {bmiData.category}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {profile?.height ? `Height: ${profile.height} cm` : "Add height & weight"}
            </p>
          </div>
        </div>

        {/* Weight */}
        <div className="stat-card">
          <div className="stat-icon bg-emerald-950 text-emerald-400 border border-emerald-900/60">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Current Weight</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-white">{profile?.weight || "—"}</span>
              <span className="text-xs text-gray-400">kg</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Blood Group: {profile?.blood_group || "Not set"}
            </p>
          </div>
        </div>

        {/* Activity Level */}
        <div className="stat-card">
          <div className="stat-icon bg-amber-950 text-amber-400 border border-amber-900/60">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Activity Routine</span>
            <p className="text-base font-bold text-white mt-0.5 capitalize truncate">
              {profile?.activity_level || "Not specified"}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 truncate">
              Goal: {profile?.fitness_goal || "General wellness"}
            </p>
          </div>
        </div>

        {/* AI Analyses Done */}
        <div className="stat-card">
          <div className="stat-icon bg-purple-950 text-purple-400 border border-purple-900/60">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">AI Analyses</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white">{history.length}</span>
              <span className="text-xs text-gray-400">sessions</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Synchronized to SQLite</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              AI Healthcare Services
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Analyze Report", icon: FileText, href: "/report-analyzer", color: "text-blue-400 border-blue-900/50 bg-blue-950/30" },
                { label: "Diet Planner", icon: Apple, href: "/diet-planner", color: "text-emerald-400 border-emerald-900/50 bg-emerald-950/30" },
                { label: "Workout Routine", icon: Dumbbell, href: "/exercise-planner", color: "text-amber-400 border-amber-900/50 bg-amber-950/30" },
                { label: "Chat Assistant", icon: MessageCircle, href: "/chatbot", color: "text-purple-400 border-purple-900/50 bg-purple-950/30" },
                { label: "Find Doctors", icon: Stethoscope, href: "/doctors", color: "text-rose-400 border-rose-900/50 bg-rose-950/30" },
                { label: "Edit Health Data", icon: UserCheck, onClick: () => setModalOpen(true), color: "text-teal-400 border-teal-900/50 bg-teal-950/30" },
              ].map((item) => {
                const Icon = item.icon;
                const content = (
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${item.color}`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-200">
                      {item.label}
                    </span>
                  </div>
                );

                return item.href ? (
                  <Link key={item.label} href={item.href}>
                    {content}
                  </Link>
                ) : (
                  <button key={item.label} onClick={item.onClick} type="button">
                    {content}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Profile Overview Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Personal Health Attributes</h3>
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Modify
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
                <span className="text-xs text-gray-500 block mb-0.5">Age</span>
                <span className="text-gray-200 font-medium">{profile?.age ? `${profile.age} yrs` : "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
                <span className="text-xs text-gray-500 block mb-0.5">Gender</span>
                <span className="text-gray-200 font-medium capitalize">{profile?.gender || "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
                <span className="text-xs text-gray-500 block mb-0.5">Diet Style</span>
                <span className="text-gray-200 font-medium capitalize">{profile?.dietary_preference || "Standard"}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 col-span-2 sm:col-span-3">
                <span className="text-xs text-gray-500 block mb-0.5">Medical Conditions & Sensitivities</span>
                <span className="text-gray-300 text-xs sm:text-sm">
                  {profile?.medical_conditions || "No chronic illnesses specified"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 col-span-2 sm:col-span-3">
                <span className="text-xs text-gray-500 block mb-0.5">Allergies</span>
                <span className="text-gray-300 text-xs sm:text-sm">
                  {profile?.allergies || "No identified allergies"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="space-y-6">
          <div className="card flex flex-col h-full">
            <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Recent Activity</span>
              <span className="text-xs font-normal text-gray-500">{history.length} logged</span>
            </h3>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl shimmer" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-gray-500 my-auto">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No analysis performed yet.</p>
                <Link
                  href="/report-analyzer"
                  className="text-xs text-primary-400 hover:underline mt-2 inline-block"
                >
                  Analyze your first report →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {history.map((item) => {
                  const meta = ANALYSIS_META[item.type] || {
                    emoji: "📊",
                    label: item.type,
                    color: "badge-gray",
                  };
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/90 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`badge ${meta.color} gap-1`}>
                          <span>{meta.emoji}</span>
                          <span>{meta.label}</span>
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 font-medium line-clamp-1">
                        {item.input_summary || "Session request"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.result}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Health Profile Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary-400" />
                  Update Health Attributes
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label">Age</label>
                    <input
                      type="number"
                      value={formData.age || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, age: Number(e.target.value) || null })
                      }
                      className="input"
                      placeholder="e.g. 28"
                    />
                  </div>
                  <div>
                    <label className="label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: Number(e.target.value) || null })
                      }
                      className="input"
                      placeholder="e.g. 70"
                    />
                  </div>
                  <div>
                    <label className="label">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, height: Number(e.target.value) || null })
                      }
                      className="input"
                      placeholder="e.g. 175"
                    />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select
                      value={formData.gender || ""}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="select"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Blood Group</label>
                    <select
                      value={formData.blood_group || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, blood_group: e.target.value })
                      }
                      className="select"
                    >
                      <option value="">Select</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Activity Level</label>
                    <select
                      value={formData.activity_level || "moderate"}
                      onChange={(e) =>
                        setFormData({ ...formData, activity_level: e.target.value })
                      }
                      className="select"
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Lightly Active</option>
                      <option value="moderate">Moderately Active</option>
                      <option value="active">Very Active</option>
                      <option value="athlete">Athlete</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Dietary Preference</label>
                  <select
                    value={formData.dietary_preference || "none"}
                    onChange={(e) =>
                      setFormData({ ...formData, dietary_preference: e.target.value })
                    }
                    className="select"
                  >
                    <option value="none">Standard / Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="keto">Keto</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>

                <div>
                  <label className="label">Fitness & Health Goals</label>
                  <input
                    type="text"
                    value={formData.fitness_goal || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fitness_goal: e.target.value })
                    }
                    className="input"
                    placeholder="e.g. Lose 5kg, Lower cholesterol, Build stamina"
                  />
                </div>

                <div>
                  <label className="label">Medical Conditions / Diagnoses</label>
                  <textarea
                    rows={2}
                    value={formData.medical_conditions || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, medical_conditions: e.target.value })
                    }
                    className="textarea"
                    placeholder="e.g. Type 2 Diabetes, Mild Asthma, Hypertension"
                  />
                </div>

                <div>
                  <label className="label">Allergies / Drug Sensitivities</label>
                  <textarea
                    rows={2}
                    value={formData.allergies || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, allergies: e.target.value })
                    }
                    className="textarea"
                    placeholder="e.g. Peanuts, Penicillin, Lactose intolerant"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-outline text-sm py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary text-sm py-2 px-5"
                  >
                    {savingProfile ? (
                      <div className="spinner w-4 h-4 border-2" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
