import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -3, x: -1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="sketch-card relative p-6 transition-all duration-200 cursor-default bg-sketch-bg group"
        >
            {/* Yellow corner doodle accent */}
            <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-100 transition-opacity rotate-12">
                <div className="w-4 h-4 rounded-full bg-sketch-yellow border-2 border-sketch-charcoal shadow-sketch" />
            </div>

            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-sketch-charcoal-soft">
                        {title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-sketch-charcoal font-display">
                            {value}
                        </span>
                        {subtitle && (
                            <span className="text-[11px] font-bold text-sketch-teal-dark animate-bounce-soft">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>

                {icon && (
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-sketch-teal-dark/10 border-2 border-sketch-charcoal rounded-sketch shadow-sketch text-sketch-teal-dark group-hover:rotate-6 transition-transform">
                        {icon}
                    </div>
                )}
            </div>

            {/* Bottom squiggle line */}
            <div className="absolute bottom-3 left-6 right-6 h-1 bg-sketch-teal-dark/10 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full w-full bg-sketch-teal-dark/30"
                    style={{ 
                        borderRadius: '20px',
                        clipPath: 'polygon(0% 45%, 15% 35%, 30% 50%, 45% 40%, 60% 55%, 75% 45%, 90% 60%, 100% 50%, 100% 100%, 0% 100%)' 
                    }}
                />
            </div>
        </motion.div>
    );
}

