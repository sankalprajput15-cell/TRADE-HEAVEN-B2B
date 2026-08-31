/**
 * Utility functions for rendering RFQ, Buy Lead, and Requirement dates as fresh relative times:
 * "Today", "1 day ago", "2 days ago", "This week", or "Just now".
 * Avoids showing stale calendar years or hardcoded future expiry dates.
 */

const FRESH_VARIANTS = [
  'Today',
  '1 day ago',
  '2 days ago',
  'This week',
  'Today',
  '1 day ago',
  'This week',
  'Just now'
];

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns a fresh relative date string ("Today", "1 day ago", "2 days ago", "This week")
 * for any RFQ, Buy Lead, or sourcing requirement.
 */
export function getFreshRfqDate(
  itemOrDate?: { id?: string; postedDate?: string; title?: string; productName?: string } | string | null,
  index = 0
): string {
  if (!itemOrDate) {
    return FRESH_VARIANTS[index % FRESH_VARIANTS.length];
  }

  let dateStr = '';
  let identifier = '';

  if (typeof itemOrDate === 'string') {
    dateStr = itemOrDate;
    identifier = itemOrDate;
  } else {
    dateStr = itemOrDate.postedDate || '';
    identifier = itemOrDate.id || itemOrDate.productName || itemOrDate.title || '';
  }

  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const now = new Date();
      const diffMs = now.getTime() - parsed.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return '1 day ago';
      } else if (diffDays === 2) {
        return '2 days ago';
      } else if (diffDays <= 7 && diffDays > 0) {
        return 'This week';
      }
    }
  }

  // Deterministic fallback based on identifier hash so older mock dates still display as fresh
  const hash = stringHash(identifier || `item-${index}`);
  const bucket = hash % 5;
  switch (bucket) {
    case 0:
      return 'Today';
    case 1:
      return '1 day ago';
    case 2:
      return '2 days ago';
    case 3:
      return 'This week';
    case 4:
    default:
      return 'Today';
  }
}

/**
 * Simple helper for requirement or buy offer lists
 */
export function formatRequirementDate(dateString?: string, identifier?: string): string {
  return getFreshRfqDate(identifier ? { id: identifier, postedDate: dateString } : dateString);
}
