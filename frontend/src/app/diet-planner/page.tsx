"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Apple,
  Sparkles,
  Copy,
  Download,
  RotateCcw,
  Utensils,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Markdown } from "@/components/ui/Markdown";
import { apiPost, copyText, downloadText } from "@/lib/utils";

export default function DietPlannerPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activity_level: "moderate",
    dietary_preference: "none",
    fitness_goal: "Weight loss",
    medical_conditions: "",
    allergies: "",
    duration_days: "7",
    calories_target: "",
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
        activity_level: formData.activity_level,
        dietary_preference: formData.dietary_preference,
        fitness_goal: formData.fitness_goal,
        medical_conditions: formData.medical_conditions,
        allergies: formData.allergies,
        duration_days: parseInt(formData.duration_days, 10),
        calories_target: formData.calories_target || undefined,
      };

      const data = await apiPost<{ plan: string }>("/api/diet-plan", payload);
      setPlan(data.plan);
      toast("Diet plan generated successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate plan";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="section-pill mb-3">Custom Nutrition</span>
        <h1 className="page-title mt-2">
          AI Diet &amp; Nutrition <span className="text-gradient">Planner</span>
        </h1>
        <p className="page-subtitle text-sm sm:text-base">
          Personalized meal routines calculated against your metabolic baseline, dietary choices, and medical constraints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-5">
          <div className="card-glow sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              Nutritional Parameters
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
                    placeholder="e.g. 28"
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
                    placeholder="e.g. 72"
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
                    placeholder="e.g. 175"
                  />
                </div>
              </div>

              <div>
                <label className="label">Primary Wellness Goal</label>
                <select
                  name="fitness_goal"
                  value={formData.fitness_goal}
                  onChange={handleChange}
                  className="select"
                >
                  <option value="Weight loss">Weight Loss / Calorie Deficit</option>
                  <option value="Muscle gain">Muscle Gain / High Protein</option>
                  <option value="Maintain weight">Weight Maintenance</option>
                  <option value="Manage diabetes">Blood Sugar &amp; Diabetes Care</option>
                  <option value="Heart health">Cardiovascular Health</option>
                  <option value="General wellness">General Longevity &amp; Energy</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Diet Style</label>
                  <select
                    name="dietary_preference"
                    value={formData.dietary_preference}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="none">Standard / Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto (Low Carb)</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <select
                    name="duration_days"
                    value={formData.duration_days}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Activity Level</label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  className="select"
                >
                  <option value="sedentary">Sedentary (Desk Job, minimal exercise)</option>
                  <option value="light">Lightly Active (1-3 workouts/week)</option>
                  <option value="moderate">Moderately Active (3-5 workouts/week)</option>
                  <option value="active">Very Active (Daily intense workouts)</option>
                </select>
              </div>

              <div>
                <label className="label">Allergies &amp; Restrictions</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Peanuts, lactose, gluten"
                />
              </div>

              <div>
                <label className="label">Medical Conditions</label>
                <textarea
                  name="medical_conditions"
                  rows={2}
                  value={formData.medical_conditions}
                  onChange={handleChange}
                  className="textarea"
                  placeholder="e.g. Hypertension, thyroid issues, GERD"
                />
              </div>

              <div>
                <label className="label">Target Calories (Optional)</label>
                <input
                  type="number"
                  name="calories_target"
                  value={formData.calories_target}
                  onChange={handleChange}
                  className="input"
                  placeholder="Leave blank for AI calculated target"
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
                    <span>Formulating Nutrition Plan...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Diet Plan</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="card min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="spinner w-20 h-20 border-4 border-t-emerald-500" />
                <Apple className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Calculating Macronutrients</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Evaluating caloric limits, glycemic index, meal balances, and micronutrient variety...
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
                    <Apple className="w-5 h-5 text-emerald-400" />
                    Personalized Diet Plan
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formData.duration_days}-Day Regimen • {formData.fitness_goal}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      copyText(plan);
                      toast("Diet plan copied to clipboard!", "success");
                    }}
                    className="btn-outline text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={() => downloadText(plan, `diet_plan_${Date.now()}.txt`)}
                    className="btn-outline text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={handleReset}
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
              <Utensils className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-base font-semibold text-gray-300 mb-1">
                No Plan Generated Yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                Configure your diet attributes on the left and tap &quot;Generate AI Diet Plan&quot; to review custom meals.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
