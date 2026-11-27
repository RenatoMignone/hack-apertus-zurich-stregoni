/** Form fields with a floating label as in the real e-banking. */
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import styles from "./controls.module.css";

interface FieldProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, ...input }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`${styles.field} ${error ? styles.fieldError : ""}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <input className={styles.fieldInput} {...input} />
      {error && <span className={styles.errorText}>{error}</span>}
    </label>
  );
}

export function SelectField({
  label,
  error,
  children,
  ...select
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <label className={`${styles.field} ${error ? styles.fieldError : ""}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <select className={styles.fieldInput} {...select}>
        {children}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </label>
  );
}
