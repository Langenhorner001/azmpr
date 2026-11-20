import React from "react";

// Cursor-following radial glow (21st.dev spotlight card).
export const SpotlightCard = ({
  as: Tag = "div",
  children,
  className = "",
  innerClassName = "",
  color = "rgba(245,158,11,0.16)",
  ...rest
}) => {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
  };
  return (
    <Tag onMouseMove={onMove} className={`group/spot relative overflow-hidden ${className}`} {...rest}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: `radial-gradient(300px circle at var(--sx, 50%) var(--sy, 50%), ${color}, transparent 70%)` }}
      />
      <div className={`relative ${innerClassName}`}>{children}</div>
    </Tag>
  );
};
