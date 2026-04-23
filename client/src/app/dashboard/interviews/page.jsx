"use client";

import Link from "next/link";
import { Plus, CaretDown, Play, Eye, RocketLaunch, DotsThreeVertical } from "@phosphor-icons/react";

export default function MyInterviews() {
  const interviews = [
    {
      level: "SENIOR LEVEL",
      role: "Senior Product Manager",
      sessions: 12,
      lastPracticed: "2 days ago",
      score: 88,
    },
    {
      level: "MID LEVEL",
      role: "Software Engineer II",
      sessions: 8,
      lastPracticed: "5 hours ago",
      score: 75,
    },
    {
      level: "SENIOR LEVEL",
      role: "Head of Engineering",
      sessions: 4,
      lastPracticed: "1 week ago",
      score: 92,
    },
    {
      level: "ENTRY LEVEL",
      role: "Data Analyst",
      sessions: 18,
      lastPracticed: "1 month ago",
      score: 60,
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Interview History</h1>
          <p className="text-white/60 text-sm">
            Track your progress and refine your skills with AI-powered mock sessions.
          </p>
        </div>
        <Link 
          href="/dashboard/interviews/create"
          className="flex items-center gap-2 px-6 py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors whitespace-nowrap"
        >
          <Plus weight="bold" className="w-5 h-5" />
          Create New Interview
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-b border-white/10 py-6 mb-8">
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Filter by role</label>
            <div className="flex items-center justify-between bg-[#111111] border border-white/10 rounded-lg px-4 py-2 min-w-[200px] cursor-pointer hover:border-white/20 transition-colors">
              <span className="text-sm text-white/90">All Interview Roles</span>
              <CaretDown className="w-4 h-4 text-white/50" />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Status</label>
            <div className="flex items-center bg-[#111111] border border-white/10 rounded-lg p-1">
              <button className="px-4 py-1.5 rounded-md bg-white/10 text-white text-xs font-semibold">ALL</button>
              <button className="px-4 py-1.5 rounded-md text-white/50 hover:text-white text-xs font-semibold transition-colors">ACTIVE</button>
              <button className="px-4 py-1.5 rounded-md text-white/50 hover:text-white text-xs font-semibold transition-colors">COMPLETED</button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2 text-right">Sort by</label>
          <div className="flex items-center justify-between gap-3 text-sm text-white/90 cursor-pointer">
            Latest Practice <CaretDown className="w-4 h-4 text-white/50" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {interviews.map((interview, index) => (
          <div key={index} className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative">
            <button className="absolute top-6 right-6 text-white/40 hover:text-white">
              <DotsThreeVertical weight="bold" className="w-6 h-6" />
            </button>
            
            <div className="flex justify-between items-start mb-6 pr-8">
              <div>
                <span className="inline-block px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white/60 tracking-wider mb-3">
                  {interview.level}
                </span>
                <h3 className="text-xl font-bold text-white mb-4">{interview.role}</h3>
                
                <div className="space-y-2 text-sm text-white/50">
                  <p className="flex items-center gap-2">
                    <span className="w-4 flex justify-center text-white/30">↺</span> Total Sessions: {interview.sessions < 10 ? `0${interview.sessions}` : interview.sessions} sessions
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-4 flex justify-center text-white/30">📅</span> Last practiced: {interview.lastPracticed}
                  </p>
                </div>
              </div>
              
              {/* Circular Progress */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-[#A3E635]"
                    strokeDasharray={`${interview.score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white leading-none">{interview.score}%</span>
                  <span className="text-[8px] text-white/50 font-bold tracking-widest mt-1">AVG SCORE</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button className="flex-1 py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors flex items-center justify-center gap-2">
                <Play weight="fill" className="w-4 h-4" /> Start Session
              </button>
              <button className="flex-1 py-3 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                <Eye weight="bold" className="w-4 h-4" /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Banner */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-10 text-center relative overflow-hidden">
        <RocketLaunch weight="fill" className="w-12 h-12 text-[#A3E635] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Ready for a new challenge?</h2>
        <p className="text-white/60 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          Create a tailored interview experience for any role. Our AI analyzes your speech patterns and industry knowledge in real-time.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard/interviews/create" className="px-8 py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors">
            Launch Custom Session
          </Link>
          <button className="px-8 py-3 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors">
            Browse Templates
          </button>
        </div>
      </div>

    </div>
  );
}
