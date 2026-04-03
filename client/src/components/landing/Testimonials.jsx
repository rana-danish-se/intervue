"use client";

import { motion } from "framer-motion";
import { Quotes } from "@phosphor-icons/react";

const testimonials = [
  {
    quote: "The realism of the voice interruptions actually caught me off guard. It exposed my habit of rambling during behavioral questions.",
    author: "Beta Tester",
    role: "Senior Full Stack Dev",
  },
  {
    quote: "I've tried generic GPT prompts, but the debrief report here is next level. Finding out exactly which system design components I missed was eye-opening.",
    author: "Beta Tester",
    role: "Backend Engineer",
  },
  {
    quote: "Finally, a practice tool that doesn't feel like a static quiz. The adaptive follow-ups pushed me to my absolute limit.",
    author: "Beta Tester",
    role: "Product Manager",
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 relative overflow-hidden  border-t border-white/5">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] -z-10 rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4"
          >
            Early feedback
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 bg-white/5 inline-block mx-auto"
          >
            From our private beta testers
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all flex flex-col relative group"
            >
              <Quotes weight="fill" className="absolute top-6 right-6 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
              <p className="text-white/80 leading-relaxed mb-8 flex-1 italic text-lg relative z-10">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="pt-6 border-t border-white/10 mt-auto">
                <div className="font-semibold text-white tracking-tight">{testimonial.author}</div>
                <div className="text-sm text-primary">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Role: Testimonials Landing Section
 * What it has: This is a pure UI component with no functions. It maps over the static `testimonials` array to render 3 animated quote cards from beta testers.
 * Where it is being used: Rendered inside `pages/Home.jsx` after `Domains`.
 */
