export function formatCompletionDate(timestamp: string | undefined, locale: string): string | null {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale.startsWith('it') ? 'it' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
