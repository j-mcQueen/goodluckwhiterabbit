import { motion, Variants } from "framer-motion";

export default function MenuItem({
  animationVariants,
  index,
  children,
  className = "",
}: {
  animationVariants: Variants;
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.li
      variants={animationVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      custom={index}
      className={className}
    >
      {children}
    </motion.li>
  );
}
