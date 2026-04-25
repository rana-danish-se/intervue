"use client";

import Link from "next/link";
import { ArrowLeft, Info, CircleNotch } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { interviewService } from "@/services/interview.service";
import { useInterviewStore } from "@/store/interviewStore";
import { useToastStore } from "@/store/toastStore";

// ─── Constants ─────────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
  { label: "Junior", value: "junior" },
  { label: "Mid",    value: "mid"    },
  { label: "Senior", value: "senior" },
];

const JD_MAX    = 500;
const GOAL_MAX  = 200;
const ROLE_MAX  = 50;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CreateInterview() {
  const router = useRouter();
  const addInterview = useInterviewStore((state) => state.addInterview);
  const showToast    = useToastStore((state) => state.showToast);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [role,            setRole]            = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [jobDescription,  setJobDescription]  = useState("");
  const [goal,            setGoal]            = useState("");
  const [sessionCount,    setSessionCount]    = useState(3);

  // ── Submission state ─────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors,  setFieldErrors]  = useState({});

  // ── Client-side validation ───────────────────────────────────────────────────
  function validate() {
    const errors = {};
    if (!role.trim())               errors.role = "Role is required.";
    else if (role.trim().length > ROLE_MAX)
                                    errors.role = `Role cannot exceed ${ROLE_MAX} characters.`;
    if (jobDescription.length > JD_MAX)
                                    errors.jobDescription = `Cannot exceed ${JD_MAX} characters.`;
    if (goal.length > GOAL_MAX)     errors.goal = `Cannot exceed ${GOAL_MAX} characters.`;
    return errors;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const payload = {
      role: role.trim(),
      experienceLevel,
      sessionCount,
      ...(jobDescription.trim() && { jobDescription: jobDescription.trim() }),
      ...(goal.trim()           && { goal: goal.trim() }),
    };

    try {
      setIsSubmitting(true);
      const data = await interviewService.createInterview(payload);
      addInterview(data.interview);
      showToast("Interview created successfully!", "success");
      router.push(`/dashboard/interviews/${data.interview._id}`);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create interview. Please try again.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-3xl mx-auto pb-24">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/interviews"
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Interview</h1>
          <p className="text-white/50 text-sm mt-1">
            Set up a tailored AI-powered mock session.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 mb-6 space-y-8">

          {/* ── Role ─────────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
              Role <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. React Developer, Product Manager"
              maxLength={ROLE_MAX}
              className={`w-full bg-white/[0.03] border rounded-lg py-3.5 px-4 text-sm text-white
                focus:outline-none focus:bg-white/5 transition-all placeholder:text-white/20
                ${fieldErrors.role
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-white/10 focus:border-[#A3E635]/50"
                }`}
            />
            <div className="flex justify-between mt-1.5">
              {fieldErrors.role
                ? <p className="text-xs text-red-400">{fieldErrors.role}</p>
                : <span />
              }
              <p className="text-[11px] text-white/25 ml-auto">{role.length}/{ROLE_MAX}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ── Experience Level ─────────────────────────────────────────────── */}
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
                Experience Level <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden">
                {EXPERIENCE_LEVELS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setExperienceLevel(value)}
                    className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-r border-white/10 last:border-r-0 ${
                      experienceLevel === value
                        ? "bg-[#A3E635] text-black"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Session Count ─────────────────────────────────────────────── */}
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
                Number of Sessions <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSessionCount(num)}
                    className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-r border-white/10 last:border-r-0 ${
                      sessionCount === num
                        ? "bg-[#A3E635] text-black"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Job Description ──────────────────────────────────────────────── */}
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
              Paste Job Description&nbsp;
              <span className="text-white/30 normal-case tracking-normal font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste requirements, tech stack, or expectations..."
                rows={4}
                maxLength={JD_MAX}
                className={`w-full bg-white/[0.03] border rounded-lg py-3.5 px-4 text-sm text-white
                  focus:outline-none focus:bg-white/5 transition-all placeholder:text-white/20 resize-none
                  ${fieldErrors.jobDescription
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-white/10 focus:border-[#A3E635]/50"
                  }`}
              />
              <div
                className={`absolute bottom-3 right-3 text-[10px] ${
                  jobDescription.length >= JD_MAX ? "text-red-400" : "text-white/30"
                }`}
              >
                {jobDescription.length}/{JD_MAX}
              </div>
            </div>
            {fieldErrors.jobDescription && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.jobDescription}</p>
            )}
          </div>

          {/* ── Goal ─────────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
              What do you want to improve?&nbsp;
              <span className="text-white/30 normal-case tracking-normal font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. System design confidence, behavioral questions..."
                rows={3}
                maxLength={GOAL_MAX}
                className={`w-full bg-white/[0.03] border rounded-lg py-3.5 px-4 text-sm text-white
                  focus:outline-none focus:bg-white/5 transition-all placeholder:text-white/20 resize-none
                  ${fieldErrors.goal
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-white/10 focus:border-[#A3E635]/50"
                  }`}
              />
              <div
                className={`absolute bottom-3 right-3 text-[10px] ${
                  goal.length >= GOAL_MAX ? "text-red-400" : "text-white/30"
                }`}
              >
                {goal.length}/{GOAL_MAX}
              </div>
            </div>
            {fieldErrors.goal && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.goal}</p>
            )}
          </div>

          {/* ── Submit ───────────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#A3E635] text-black font-semibold rounded-xl
              hover:bg-[#94d82d] transition-colors text-[15px] disabled:opacity-60
              disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                Creating Interview…
              </>
            ) : (
              "Create Interview"
            )}
          </button>
        </div>
      </form>

      {/* Info footer */}
      <div className="flex items-start gap-4 p-5 bg-[#111111] border border-white/5 border-dashed rounded-xl">
        <div className="w-5 h-5 mt-0.5 rounded-full bg-[#A3E635] flex items-center justify-center flex-shrink-0">
          <Info weight="bold" className="w-3 h-3 text-black" />
        </div>
        <p className="text-sm text-white/60 leading-relaxed">
          Our AI will generate a tailored interview experience based on the role and JD provided.
          You can preview the questions before starting the session.
        </p>
      </div>
    </div>
  );
}
