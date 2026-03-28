"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Target, Zap, Shield, BarChart, Users } from "lucide-react";

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6 text-primary" />,
    title: "AI-Powered Interviews",
    description: "Experience realistic interview scenarios with our advanced AI tailored to your target role."
  },
  {
    icon: <Target className="w-6 h-6 text-primary" />,
    title: "Role-Specific Questions",
    description: "Get asked questions that actually matter for the specific position you are applying for."
  },
  {
    icon: <BarChart className="w-6 h-6 text-primary" />,
    title: "Instant Analytics",
    description: "Receive immediate, actionable feedback on your performance, tone, and technical accuracy."
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Real-time Feedback",
    description: "Our AI analyzes your responses in real-time to help you adjust your strategy on the fly."
  },
  {
    icon: <Shield className="w-6 h-6 text-primary" />,
    title: "Safe Practice Environment",
    description: "Make mistakes here, not in the real interview. Build confidence in a stress-free setting."
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: "Peer Benchmarking",
    description: "See how your interview skills stack up against other candidates in your field."
  }
];

export default function Feature() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4"
          >
            Supercharge Your Preparation
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Everything you need to ace your next technical or behavioral interview, powered by cutting-edge AI.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:bg-white/10 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/30 transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
