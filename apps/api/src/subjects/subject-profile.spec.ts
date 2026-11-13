import { applySubjectProfile } from './subject-profile';

describe('individual subject appearance', () => {
  const base = {
    id: 'subject',
    name: 'Anatomía',
    abbreviation: 'ANA',
    description: 'Base',
    color: '#112233',
    logoUrl: '/base.webp',
  };
  it('applies only the supplied teacher overrides without changing the base', () => {
    const before = { ...base };
    const effective = applySubjectProfile(base, {
      name: null,
      abbreviation: null,
      description: null,
      color: '#445566',
      logoUrl: null,
    });
    expect(effective).toEqual({ ...base, color: '#445566' });
    expect(base).toEqual(before);
    expect(applySubjectProfile(base, null)).toEqual(before);
  });
  it('preserves an intentionally empty description and abbreviation', () => {
    expect(
      applySubjectProfile(base, {
        name: null,
        abbreviation: '',
        description: '',
        color: null,
        logoUrl: null,
      }),
    ).toMatchObject({ abbreviation: '', description: '', name: base.name });
  });
});
