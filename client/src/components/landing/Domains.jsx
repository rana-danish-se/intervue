"use client";

import { motion } from "framer-motion";
import { Code, Users, ChartLineUp, Briefcase, Headphones } from "@phosphor-icons/react";

const domains = [
  { name: "Software Engineering", icon: <Code weight="duotone" className="w-5 h-5" /> },
  { name: "Human Resources", icon: <Users weight="duotone" className="w-5 h-5" /> },
  { name: "Sales & Marketing", icon: <ChartLineUp weight="duotone" className="w-5 h-5" /> },
  { name: "Management", icon: <Briefcase weight="duotone" className="w-5 h-5" /> },
  { name: "Call Center", icon: <Headphones weight="duotone" className="w-5 h-5" /> },
];

export default function Domains() {
  return (
    <section className="py-20 relative bg-black/50 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-10">
          Supported Interview Domains
        </p>

        {/* Marquee or Flex Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12">
          {domains.map((domain, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
            >
              <div className="text-primary/70">{domain.icon}</div>
              <span className="font-semibold tracking-tight whitespace-nowrap">{domain.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
