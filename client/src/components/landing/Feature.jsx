"use client";

import { motion } from "framer-motion";
import { Microphone, GitBranch, Briefcase, FileText, ChartBar } from "@phosphor-icons/react";

const features = [
  {
    icon: <Microphone weight="duotone" className="w-6 h-6 text-primary" />,
    title: "Voice-Based AI",
    description: "Talk out loud. The AI understands natural speech, pauses, and context, just like a human interviewer.",
  },
  {
    icon: <GitBranch weight="duotone" className="w-6 h-6 text-emerald-400" />,
    title: "Adaptive Follow-Ups",
    description: "Your answers dictate the next question. Give a shallow answer, and it will push you to go deeper.",
  },
  {
    icon: <Briefcase weight="duotone" className="w-6 h-6 text-blue-400" />,
    title: "Multi-Domain Support",
    description: "From Software Engineering to Sales and HR, select your precise domain and seniority level.",
  },
  {
    icon: <FileText weight="duotone" className="w-6 h-6 text-amber-400" />,
    title: "Resume-Aware",
    description: "Upload your resume and the AI will ask questions tailored to your actual experience and listed skills.",
  },
  {
    icon: <ChartBar weight="duotone" className="w-6 h-6 text-purple-400" />,
    title: "Debrief Reports",
    description: "Get a comprehensive breakdown of your performance, including tone analysis and suggested better answers.",
  },
];

export default function Feature() {
  return (
    <section id="features" className="py-14 relative overflow-hidden  border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4"
          >
            Capabilities
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            A technical platform built to simulate entirely dynamic conversations.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:bg-white/10 group ${
                index >= 3 ? "w-full md:w-[calc(50%-12px)] lg:w-[calc(40%-12px)]" : "w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]"
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/5 shadow flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
