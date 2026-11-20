import React from "react";

// Seamless infinite marquee (two identical tracks). Pauses on hover; stops for reduced motion.
export const Marquee = ({ children, reverse = false, duration = 40, className = "" }) => (
  <div className={`group flex overflow-hidden [--gap:0.75rem] gap-[var(--gap)] ${className}`} style={{ "--duration": `${duration}s` }}>
    {[0, 1].map((i) => (
      <div
        key={i}
        aria-hidden={i === 1}
        className={`flex shrink-0 gap-[var(--gap)] animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
      >
        {children}
      </div>
    ))}
  </div>
);
