import { leadStatuses, statusLabel } from "@/features/leads/status";
import styles from "./leads.module.css";

export default function StatusSidebar({ stats, status, onChange }) {
  return (
    <nav className={styles.sidebar}>
      <button
        className={status === "" ? styles.active : undefined}
        onClick={() => onChange("")}
      >
        All leads
        <span className={styles.count}>{stats?.total}</span>
      </button>

      {leadStatuses.map((s) => (
        <button
          key={s}
          className={status === s ? styles.active : undefined}
          onClick={() => onChange(s)}
        >
          <span className={`${styles.status} ${styles[s.toLowerCase()]}`}>
            {statusLabel(s)}
          </span>
          <span className={styles.count}>{stats?.byStatus[s]}</span>
        </button>
      ))}
    </nav>
  );
}
