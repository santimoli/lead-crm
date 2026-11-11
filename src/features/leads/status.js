export const leadStatuses = ["NEW", "CONTACTED", "QUALIFIED", "LOST"];

export function statusLabel(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
