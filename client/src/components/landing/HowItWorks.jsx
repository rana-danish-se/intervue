"use client";

import { motion } from "framer-motion";
import { UserGear, Microphone, FileText } from "@phosphor-icons/react";

const steps = [
  {
    icon: <UserGear weight="duotone" className="w-8 h-8 text-primary" />,
    number: "1",
    title: "Choose your role",
    description: "Tell us what you're interviewing for. We tailor the difficulty and focus areas to your specific domain."
  },
  {
    icon: <Microphone weight="duotone" className="w-8 h-8 text-primary" />,
    number: "2",
    title: "Do a voice interview",
    description: "Talk to our AI via voice or text just like a real recruiter. It asks follow-ups, listens, and reacts in real-time."
  },
  {
    icon: <FileText weight="duotone" className="w-8 h-8 text-primary" />,
    number: "3",
    title: "Get your report",
    description: "Receive instant, detailed feedback on your tone, structure, and what you missed in technical answers."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4"
          >
            How it works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            A streamlined process designed to mirror the actual flow of a tech interview.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="absolute -top-4 -left-4 text-8xl font-black text-white/5 select-none -z-10 group-hover:text-primary/10 transition-colors">
                {step.number}
              </div>
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all shadow-xl shadow-black/50">
                {step.icon}
              </div>
              
              {/* Connecting line for desktop */}
              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white/10 to-transparent -z-0" />
              )}
              
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
