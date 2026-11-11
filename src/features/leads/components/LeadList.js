import { statusLabel } from "@/features/leads/status";
import { timeAgo } from "@/lib/date";
import styles from "./leads.module.css";

export default function LeadList({ leads, onEdit, onDelete }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Status</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className={lead.status === "LOST" ? styles.lostRow : undefined}
            >
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.company}</td>
              <td>
                <span
                  className={`${styles.status} ${styles[lead.status.toLowerCase()]}`}
                >
                  {statusLabel(lead.status)}
                </span>
              </td>
              <td title={new Date(lead.createdAt).toLocaleString("en-GB")}>
                {timeAgo(lead.createdAt)}
              </td>
              <td className={styles.rowActions}>
                <button onClick={() => onEdit(lead)}>Edit</button>
                <button
                  className={styles.danger}
                  onClick={() => onDelete(lead.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
