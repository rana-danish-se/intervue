"use client";

import Link from "next/link";
import { ArrowLeft, Info } from "@phosphor-icons/react";
import { useState } from "react";

export default function CreateInterview() {
  const [experience, setExperience] = useState('Mid');
  const [questions, setQuestions] = useState(5);

  return (
    <div className="p-8 max-w-3xl mx-auto pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/interviews" className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-white">Create Interview</h1>
      </div>

      {/* Main Form */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 mb-6">
        
        {/* Role */}
        <div className="mb-8">
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
            Role
          </label>
          <input 
            type="text" 
            placeholder="e.g. React Developer, Product Manager" 
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#A3E635]/50 focus:bg-white/5 transition-all placeholder:text-white/20"
          />
        </div>

        {/* Experience Level */}
        <div className="mb-8">
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
            Experience Level
          </label>
          <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden">
            <button 
              onClick={() => setExperience('Junior')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${experience === 'Junior' ? 'bg-[#A3E635] text-black' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              Junior
            </button>
            <button 
              onClick={() => setExperience('Mid')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${experience === 'Mid' ? 'bg-[#A3E635] text-black' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              Mid
            </button>
            <button 
              onClick={() => setExperience('Senior')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${experience === 'Senior' ? 'bg-[#A3E635] text-black' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              Senior
            </button>
          </div>
        </div>

        {/* Questions Per Session */}
        <div className="mb-8 relative">
          <div className="flex justify-between items-end mb-3">
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
              Questions Per Session
            </label>
            <span className="text-xl font-bold text-[#A3E635]">{questions}</span>
          </div>
          
          <div className="relative pt-1 pb-2">
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={questions}
              onChange={(e) => setQuestions(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#A3E635]"
            />
          </div>
          <p className="text-xs text-white/30 italic mt-1">Your plan allows max 10 questions</p>
        </div>

        {/* Paste JD */}
        <div className="mb-8 relative">
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
            Paste JD Here (Optional)
          </label>
          <div className="relative">
            <textarea 
              placeholder="Paste requirements, tech stack, or expectations..." 
              rows={4}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#A3E635]/50 focus:bg-white/5 transition-all placeholder:text-white/20 resize-none"
            ></textarea>
            <div className="absolute bottom-3 right-3 text-[10px] text-white/30">
              240/500
            </div>
          </div>
        </div>

        {/* What to improve */}
        <div className="mb-8 relative">
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
            What do you want to improve? (Optional)
          </label>
          <div className="relative">
            <textarea 
              placeholder="e.g. System design confidence, behavioral questions..." 
              rows={3}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#A3E635]/50 focus:bg-white/5 transition-all placeholder:text-white/20 resize-none"
            ></textarea>
            <div className="absolute bottom-3 right-3 text-[10px] text-white/30">
              80/200
            </div>
          </div>
        </div>

        <button className="w-full py-4 bg-[#A3E635] text-black font-semibold rounded-xl hover:bg-[#94d82d] transition-colors text-lg">
          Create Interview
        </button>

      </div>

      {/* Info Footer */}
      <div className="flex items-start gap-4 p-5 bg-[#111111] border border-white/5 rounded-xl border-dashed">
        <div className="w-5 h-5 mt-0.5 rounded-full bg-[#A3E635] flex items-center justify-center flex-shrink-0">
          <Info weight="bold" className="w-3 h-3 text-black" />
        </div>
        <p className="text-sm text-white/60 leading-relaxed">
          Our AI will generate a tailored interview experience based on the role and JD provided. You can preview the questions before starting the session.
        </p>
      </div>

    </div>
  );
}
