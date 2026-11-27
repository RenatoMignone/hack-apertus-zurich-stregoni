import type { ButtonHTMLAttributes } from "react";
import styles from "./controls.module.css";

type Variant = "primary" | "secondary" | "link";

/** Primary = filled petrol (e.g. "Execute"), secondary = outlined ("Send message"), link = text only ("Edit"). */
export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${styles.button} ${styles[variant]} ${className ?? ""}`} {...props} />;
}
