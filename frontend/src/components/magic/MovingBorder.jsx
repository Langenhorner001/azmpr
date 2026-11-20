import React from "react";

// 21st.dev-style moving border: a rotating conic beam behind an opaque inner surface.
export const MovingBorder = ({
  children,
  className = "",
  innerClassName = "bg-white dark:bg-stone-950",
  radius = "rounded-3xl",
  thickness = "p-[1.5px]",
  duration = 6,
  color = "#f59e0b",
  color2 = "#f43f5e",
}) => (
  <div className={`relative overflow-hidden ${radius} ${thickness} ${className}`}>
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[250%] animate-border-spin motion-reduce:animate-none"
      style={{
        animationDuration: `${duration}s`,
        background: `conic-gradient(from 0deg, transparent 0deg 260deg, ${color} 320deg, ${color2} 360deg)`,
      }}
    />
    <div className={`relative ${radius} ${innerClassName}`}>{children}</div>
  </div>
);

export const Shine = () => (
  <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
    <span className="absolute inset-y-0 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine motion-reduce:hidden" />
  </span>
);
