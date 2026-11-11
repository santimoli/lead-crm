import styles from "./leads.module.css";

export default function SearchBar({ value, onChange }) {
  return (
    <input
      className={styles.search}
      placeholder="Search by name or email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
