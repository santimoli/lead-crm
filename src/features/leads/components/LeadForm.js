import { leadStatuses, statusLabel } from "@/features/leads/status";
import styles from "./leads.module.css";

export default function LeadForm({
  form,
  fieldErrors,
  editing,
  saving,
  onChange,
  onSubmit,
  onCancel,
}) {
  let submitLabel = editing ? "Save" : "Add lead";
  if (saving) submitLabel = "Saving...";

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.field}>
        Name
        <input name="name" value={form.name} onChange={onChange} />
        {fieldErrors.name && (
          <span className={styles.fieldError}>{fieldErrors.name}</span>
        )}
      </label>

      <label className={styles.field}>
        Email
        <input name="email" value={form.email} onChange={onChange} />
        {fieldErrors.email && (
          <span className={styles.fieldError}>{fieldErrors.email}</span>
        )}
      </label>

      <label className={styles.field}>
        Company
        <input name="company" value={form.company} onChange={onChange} />
        {fieldErrors.company && (
          <span className={styles.fieldError}>{fieldErrors.company}</span>
        )}
      </label>

      <label className={styles.field}>
        Status
        <select name="status" value={form.status} onChange={onChange}>
          {leadStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.formActions}>
        <button type="submit" className="primary" disabled={saving}>
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
