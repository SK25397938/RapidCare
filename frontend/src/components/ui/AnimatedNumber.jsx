import { animate, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({ value, suffix = "", className = "" }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const controls = animate(previousValueRef.current, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });
    previousValueRef.current = value;

    return () => controls.stop();
  }, [value]);

  return <motion.span className={className}>{displayValue}{suffix}</motion.span>;
}
