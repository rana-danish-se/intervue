"use client";

import { useAuthStore } from "@/store/authStore";
import { 
  Briefcase, 
  Code, 
  Brain, 
  TrendUp, 
  Lightbulb 
} from "@phosphor-icons/react";

export default function DashboardHome() {
  const { user } = useAuthStore();

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      {/* Header section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || "Alex"}
        </h1>
        <p className="text-white/60 text-lg">
          You're in the top 5% of candidates this week. Keep the momentum going.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-4">Total Interviews</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-bold text-[#A3E635]">24</h2>
            <span className="text-sm text-[#A3E635] mb-1 font-medium">+3 this week</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-4">Sessions Completed</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-bold text-[#A3E635]">86</h2>
            <span className="text-sm text-white/40 mb-1">12h total</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 relative overflow-hidden">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-4">Avg Confidence Score</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-bold text-[#A3E635]">92%</h2>
            <TrendUp className="w-6 h-6 text-[#A3E635] mb-2" weight="bold" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5">
          <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-4">Avg Knowledge Score</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-bold text-[#A3E635]">88%</h2>
            <span className="text-sm text-white/40 mb-1">Top Tier</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Your Interviews Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Your Interviews</h3>
              <button className="text-sm text-[#A3E635] font-medium hover:underline">View All &gt;</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 flex flex-col">
                <Briefcase weight="fill" className="w-8 h-8 text-[#A3E635] mb-4" />
                <h4 className="font-bold text-white text-lg mb-1">Senior Product<br/>Manager</h4>
                <p className="text-xs text-white/50 mb-6">Experience: 5+ years</p>
                <div className="flex items-center justify-between text-[11px] text-white/40 mb-6">
                  <div><span className="text-white">3</span> sessions</div>
                  <div>Last practiced: 2 days ago</div>
                </div>
                <button className="mt-auto w-full py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors">
                  Continue
                </button>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 flex flex-col">
                <Code weight="bold" className="w-8 h-8 text-[#A3E635] mb-4" />
                <h4 className="font-bold text-white text-lg mb-1">Senior Product<br/>Manager</h4>
                <p className="text-xs text-white/50 mb-6">Experience: 5+ years</p>
                <div className="flex items-center justify-between text-[11px] text-white/40 mb-6">
                  <div><span className="text-white">3</span> sessions</div>
                  <div>Last practiced: 2 days ago</div>
                </div>
                <button className="mt-auto w-full py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors">
                  Continue
                </button>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 flex flex-col">
                <Brain weight="fill" className="w-8 h-8 text-[#A3E635] mb-4" />
                <h4 className="font-bold text-white text-lg mb-1">Senior Product<br/>Manager</h4>
                <p className="text-xs text-white/50 mb-6">Experience: 5+ years</p>
                <div className="flex items-center justify-between text-[11px] text-white/40 mb-6">
                  <div><span className="text-white">3</span> sessions</div>
                  <div>Last practiced: 2 days ago</div>
                </div>
                <button className="mt-auto w-full py-3 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors">
                  Continue
                </button>
              </div>
            </div>
          </div>

          {/* Master Question Section */}
          <div className="p-8 rounded-2xl bg-[#111111] border border-white/5 relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10 max-w-lg">
              <h3 className="text-xl font-bold text-white mb-3">Master the 'Why Rovoxa?' Question</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Our AI detected a slight hesitation when you answer behavioral questions about career alignment. Try the new focus module.
              </p>
              <button className="px-6 py-2.5 border border-[#A3E635] text-[#A3E635] font-semibold rounded-lg hover:bg-[#A3E635]/10 transition-colors uppercase text-sm tracking-wider">
                Start Module
              </button>
            </div>
            <Lightbulb weight="fill" className="absolute -right-6 -bottom-10 w-48 h-48 text-white/[0.02]" />
          </div>

        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
          
          {/* Recent Activity Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              
              <div className="flex items-center gap-4 bg-[#111111] border border-white/5 p-4 rounded-xl">
                <div className="w-1.5 h-10 bg-[#A3E635] rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">System Design Interview</h4>
                  <p className="text-xs text-white/40 mt-1">Yesterday, 4:30 PM</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635] font-bold text-sm">
                  88%
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#111111] border border-white/5 p-4 rounded-xl">
                <div className="w-1.5 h-10 bg-white/20 rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">System Design Interview</h4>
                  <p className="text-xs text-white/40 mt-1">Oct 24, 2023</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 font-bold text-sm">
                  76%
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#111111] border border-white/5 p-4 rounded-xl">
                <div className="w-1.5 h-10 bg-[#A3E635] rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">System Design Interview</h4>
                  <p className="text-xs text-white/40 mt-1">Oct 22, 2023</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635] font-bold text-sm">
                  91%
                </div>
              </div>

            </div>
          </div>

          {/* Confidence Trend */}
          <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl relative overflow-hidden">
            <h4 className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-6">Confidence Trend</h4>
            
            <div className="h-40 flex items-end justify-between gap-2 mt-4">
              <div className="w-1/6 bg-white/10 h-[30%] rounded-t-sm"></div>
              <div className="w-1/6 bg-white/10 h-[45%] rounded-t-sm"></div>
              <div className="w-1/6 bg-white/10 h-[60%] rounded-t-sm"></div>
              <div className="w-1/6 bg-white/10 h-[50%] rounded-t-sm"></div>
              <div className="w-1/6 bg-[#A3E635] h-[90%] rounded-t-sm relative">
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#A3E635] text-black flex items-center justify-center rounded-xl shadow-lg cursor-pointer hover:bg-[#94d82d]">
                  <span className="text-2xl font-bold">+</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-[10px] text-white/30 font-semibold uppercase mt-4 pr-6">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
