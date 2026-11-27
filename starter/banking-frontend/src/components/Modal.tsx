import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./controls.module.css";

/** Dialog on a native <dialog> (focus trap and Escape for free), e.g. "New payment" or the widget catalog. */
export function Modal({
  title,
  open,
  onClose,
  children,
  footer,
  width = 720,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.modal} style={{ width }} onClose={onClose}>
      <header className={styles.modalHeader}>
        <h2>{title}</h2>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </header>
      <div className={styles.modalBody}>{open && children}</div>
      {footer && <footer className={styles.modalFooter}>{footer}</footer>}
    </dialog>
  );
}
