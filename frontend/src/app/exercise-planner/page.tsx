"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Sparkles,
  Copy,
  Download,
  Flame,
  Activity,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Markdown } from "@/components/ui/Markdown";
import { apiPost, copyText, downloadText } from "@/lib/utils";

export default function ExercisePlannerPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    fitness_level: "beginner",
    fitness_goal: "General fitness",
    equipment: "minimal/home gym",
    activity_level: "moderate",
    duration_weeks: "4",
    days_per_week: "4",
    medical_conditions: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);

    try {
      const payload = {
        age: formData.age ? parseFloat(formData.age) : undefined,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        fitness_level: formData.fitness_level,
        fitness_goal: formData.fitness_goal,
        equipment: formData.equipment,
        activity_level: formData.activity_level,
        duration_weeks: parseInt(formData.duration_weeks, 10),
        days_per_week: parseInt(formData.days_per_week, 10),
        medical_conditions: formData.medical_conditions,
      };

      const data = await apiPost<{ plan: string }>("/api/exercise-plan", payload);
      setPlan(data.plan);
      toast("Workout routine generated successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate workout plan";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="section-pill mb-3">Adaptive Training</span>
        <h1 className="page-title mt-2">
          AI Exercise &amp; Workout <span className="text-gradient">Planner</span>
        </h1>
        <p className="page-subtitle text-sm sm:text-base">
          Personalized fitness routines adapted to your schedule, equipment, conditioning, and joint-health considerations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-5">
          <div className="card-glow sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-400" />
              Workout Configuration
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g. 26"
                  />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g. 74"
                  />
                </div>
                <div>
                  <label className="label">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g. 178"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Fitness Level</label>
                  <select
                    name="fitness_level"
                    value={formData.fitness_level}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="label">Days / Week</label>
                  <select
                    name="days_per_week"
                    value={formData.days_per_week}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="2">2 Days</option>
                    <option value="3">3 Days</option>
                    <option value="4">4 Days</option>
                    <option value="5">5 Days</option>
                    <option value="6">6 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Primary Fitness Goal</label>
                <select
                  name="fitness_goal"
                  value={formData.fitness_goal}
                  onChange={handleChange}
                  className="select"
                >
                  <option value="General fitness">General Functional Fitness</option>
                  <option value="Weight loss">Weight Loss &amp; Fat Burn</option>
                  <option value="Muscle gain">Hypertrophy &amp; Muscle Build</option>
                  <option value="Endurance">Stamina &amp; Aerobic Capacity</option>
                  <option value="Strength">Max Strength &amp; Core Stability</option>
                  <option value="Mobility">Mobility &amp; Posture Restoration</option>
                </select>
              </div>

              <div>
                <label className="label">Available Equipment</label>
                <select
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleChange}
                  className="select"
                >
                  <option value="bodyweight only">Bodyweight Only (No Equipment)</option>
                  <option value="minimal/home gym">Dumbbells &amp; Resistance Bands</option>
                  <option value="full gym">Full Commercial Gym Access</option>
                  <option value="calisthenics park">Outdoor / Pullup Bar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Program Length</label>
                  <select
                    name="duration_weeks"
                    value={formData.duration_weeks}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="2">2 Weeks</option>
                    <option value="4">4 Weeks</option>
                    <option value="8">8 Weeks</option>
                    <option value="12">12 Weeks</option>
                  </select>
                </div>
                <div>
                  <label className="label">Activity Pace</label>
                  <select
                    name="activity_level"
                    value={formData.activity_level}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="light">Gentle Pace</option>
                    <option value="moderate">Moderate</option>
                    <option value="vigorous">High Intensity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Injuries or Pain Areas</label>
                <textarea
                  name="medical_conditions"
                  rows={2}
                  value={formData.medical_conditions}
                  onChange={handleChange}
                  className="textarea"
                  placeholder="e.g. Lower back stiffness, knee pain, rotator cuff"
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
                    <span>Constructing Program...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Workout Plan</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Results */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="card min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="spinner w-20 h-20 border-4 border-t-amber-500" />
                <Dumbbell className="w-8 h-8 text-amber-400 absolute inset-0 m-auto" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Architecting Exercise Blocks</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Structuring splits, rest intervals, warmups, progressive overload schemes, and safe form cues...
              </p>
            </div>
          ) : plan ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glow flex flex-col h-full"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-800">
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-amber-400" />
                    Custom Workout Schedule
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formData.duration_weeks}-Week Protocol • {formData.days_per_week} Sessions/Week
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      copyText(plan);
                      toast("Workout plan copied to clipboard!", "success");
                    }}
                    className="btn-outline text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={() => downloadText(plan, `workout_plan_${Date.now()}.txt`)}
                    className="btn-outline text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={() => setPlan(null)}
                    className="btn-ghost text-xs px-2.5 py-1.5 text-gray-400 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[700px] pr-2">
                <Markdown content={plan} />
              </div>
            </motion.div>
          ) : (
            <div className="card min-h-[500px] flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <Dumbbell className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-base font-semibold text-gray-300 mb-1">
                No Workout Plan Generated
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                Fill in your parameters on the left and select &quot;Generate AI Workout Plan&quot; to inspect your custom workout schedule.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
