import { leadStatuses, statusLabel } from "@/features/leads/status";
import { timeAgo } from "@/lib/date";
import styles from "./leads.module.css";

export default function StatusSidebar({ stats, status, onChange }) {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.statuses}>
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

      {stats?.recent.length > 0 && (
        <section className={styles.recent}>
          <h2>Recently added</h2>
          <ul>
            {stats.recent.map((lead) => (
              <li key={lead.id}>
                {lead.name}
                <span className={styles.count}>{timeAgo(lead.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
