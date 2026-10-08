import { formatCompletionDate } from '../date';

describe('formatCompletionDate', () => {
  const timestamp = new Date(2026, 9, 8, 12, 0).toISOString();
  const expected = (locale: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
      new Date(timestamp)
    );

  it('returns null when the timestamp is undefined', () => {
    expect(formatCompletionDate(undefined, 'en')).toBeNull();
  });

  it('returns null when the timestamp is an empty string', () => {
    expect(formatCompletionDate('', 'en')).toBeNull();
  });

  it('returns null when the timestamp is not a valid date', () => {
    expect(formatCompletionDate('not-a-date', 'en')).toBeNull();
  });

  it('formats with English month names for a non-Italian locale', () => {
    expect(formatCompletionDate(timestamp, 'en-US')).toBe(expected('en'));
  });

  it('formats with Italian month names for an Italian locale', () => {
    expect(formatCompletionDate(timestamp, 'it-IT')).toBe(expected('it'));
  });

  it('treats any locale starting with "it" as Italian', () => {
    expect(formatCompletionDate(timestamp, 'it')).toBe(formatCompletionDate(timestamp, 'it-CH'));
  });

  it('falls back to English for an unsupported locale such as German', () => {
    expect(formatCompletionDate(timestamp, 'de')).toBe(formatCompletionDate(timestamp, 'en'));
  });

  it('produces different output for Italian and English', () => {
    expect(formatCompletionDate(timestamp, 'it')).not.toBe(formatCompletionDate(timestamp, 'en'));
  });
});
