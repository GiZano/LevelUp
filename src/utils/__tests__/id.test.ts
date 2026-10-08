import { generateId } from '../id';

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'fixed-uuid') }));

describe('generateId', () => {
  it('returns the UUID provided by expo-crypto', () => {
    expect(generateId()).toBe('fixed-uuid');
  });
});
