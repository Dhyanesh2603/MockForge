import React from "react";
import { motion } from "framer-motion";

/**
 * MotionIcon component wraps Lucide icons with smooth framer-motion animations
 */
export const MotionIcon = ({
  icon: Icon,
  animate = "hover",
  size = 18,
  color,
  className = "",
  style = {},
  ...props
}) => {
  if (!Icon) return null;

  const presets = {
    hover: {
      whileHover: { scale: 1.2, rotate: 6 },
      whileTap: { scale: 0.9 },
    },
    pulse: {
      animate: { scale: [1, 1.15, 1] },
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
    },
    bounce: {
      animate: { y: [0, -4, 0] },
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
    spin: {
      animate: { rotate: 360 },
      transition: { repeat: Infinity, duration: 8, ease: "linear" },
    },
    shake: {
      animate: { rotate: [-8, 8, -8, 8, 0] },
      transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
    },
    none: {},
  };

  const selectedPreset = presets[animate] || presets.hover;

  return (
    <motion.span
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "middle",
        ...style,
      }}
      {...selectedPreset}
    >
      <Icon size={size} color={color} {...props} />
    </motion.span>
  );
};

export default MotionIcon;
