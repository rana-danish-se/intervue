"use client";

import { motion } from "framer-motion";
import { WarningCircle, FileMinus, BookOpen } from "@phosphor-icons/react";

const problems = [
  {
    icon: <BookOpen weight="duotone" className="w-8 h-8 text-rose-400" />,
    title: "Static question banks",
    description: "Memorizing endless lists doesn't prepare you for conversational pivots.",
  },
  {
    icon: <WarningCircle weight="duotone" className="w-8 h-8 text-amber-400" />,
    title: "Zero realistic practice",
    description: "Talking to a mirror won't recreate the pressure of a real technical interview.",
  },
  {
    icon: <FileMinus weight="duotone" className="w-8 h-8 text-orange-400" />,
    title: "No actionable feedback",
    description: "Getting rejected without knowing exactly where you went wrong hurts.",
  },
];

export default function ProblemStatement() {
  return (
    <section className="py-14 relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4"
          >
            Why traditional prep fails
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            The hardest part of an interview isn&apos;t what you know — it&apos;s how you communicate it under pressure.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors"
            >
              <div className="p-4 rounded-full bg-black/50 border border-white/5 mb-6 shadow-xl">
                {problem.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                {problem.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Role: Problem Statement Landing Section
 * What it has: This is a pure UI component with no functions. It maps over the static `problems` array to render 3 animated cards highlighting why traditional interview prep fails (static question banks, zero realistic practice, no actionable feedback).
 * Where it is being used: Rendered inside `pages/Home.jsx` after the `Hero` section.
 */
