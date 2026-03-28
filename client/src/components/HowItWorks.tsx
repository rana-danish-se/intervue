"use client";

import { motion } from "framer-motion";
import { UserPlus, Settings, Mic, Award } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-8 h-8 text-primary" />,
    title: "1. Create Your Profile",
    description: "Sign up and tell us about your target roles, experience level, and areas you want to improve."
  },
  {
    icon: <Settings className="w-8 h-8 text-primary" />,
    title: "2. Configure Interview",
    description: "Select the company, role, and difficulty level. Customize the interview length and focus areas."
  },
  {
    icon: <Mic className="w-8 h-8 text-primary" />,
    title: "3. Practice Live",
    description: "Engage in a realistic voice or text-based interview with our AI recruiter."
  },
  {
    icon: <Award className="w-8 h-8 text-primary" />,
    title: "4. Get Reviewed",
    description: "Receive a comprehensive performance report with actionable insights and improved answers."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white/5 relative border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4"
          >
            How Intervue Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Four simple steps to transform your interview anxiety into absolute confidence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all shadow-lg">
                {step.icon}
              </div>
              {/* Optional connecting line */}
              {index !== steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary/30 to-transparent -z-0" />
              )}
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
