import i18n, { SUPPORTED_LANGUAGES, t } from '../i18n';

type Dict = { [key: string]: unknown };

const flattenKeys = (value: unknown, prefix = ''): string[] => {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value as Dict).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? prefix + '.' + key : key)
  );
};

const reviewKeys = (language: string): string[] => {
  const review = (i18n.translations[language] as Dict).review;
  return flattenKeys(review).sort();
};

describe('review translations', () => {
  const languages = SUPPORTED_LANGUAGES.map((language) => language.code);

  afterEach(() => {
    i18n.locale = 'en';
  });

  it.each(languages)('has the same review keys in %s as in English', (language) => {
    expect(reviewKeys(language)).toEqual(reviewKeys('en'));
  });

  it.each(languages)('has no empty review strings in %s', (language) => {
    const review = (i18n.translations[language] as Dict).review;
    const values = flattenKeys(review).map((path) =>
      path.split('.').reduce<unknown>((node, key) => (node as Dict)[key], review)
    );

    expect(values.every((value) => typeof value === 'string' && value.length > 0)).toBe(true);
  });

  it('uses the singular form for a streak of one day', () => {
    i18n.locale = 'en';

    expect(t('review.streakDays', { count: 1 })).toBe('1 day');
  });

  it('uses the plural form for other streak lengths', () => {
    i18n.locale = 'en';

    expect(t('review.streakDays', { count: 5 })).toBe('5 days');
    expect(t('review.streakDays', { count: 0 })).toBe('0 days');
  });

  it.each([
    ['it', '1 giorno', '5 giorni'],
    ['de', '1 Tag', '5 Tage'],
    ['fr', '1 jour', '5 jours'],
    ['es', '1 día', '5 días'],
  ])('pluralises the streak in %s', (language, one, other) => {
    i18n.locale = language;

    expect(t('review.streakDays', { count: 1 })).toBe(one);
    expect(t('review.streakDays', { count: 5 })).toBe(other);
  });

  it.each(languages)('formats the hours value with the unit in %s', (language) => {
    i18n.locale = language;
    const unit = t('review.hoursUnit');

    expect(t('review.hoursValue', { completed: '2', scheduled: '4', unit })).toBe('2 / 4 ' + unit);
  });

  it('uses Std. as the German hours unit', () => {
    i18n.locale = 'de';

    expect(t('review.hoursUnit')).toBe('Std.');
  });
});
