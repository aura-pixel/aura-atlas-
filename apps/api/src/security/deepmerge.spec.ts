import merge from 'deepmerge';
describe('patched deepmerge prototype boundary', () => {
  it('does not poison the result while copying a target __proto__ property', () => {
    const malicious = JSON.parse('{"__proto__":{"polluted":true}}') as Record<
      string,
      unknown
    >;
    const result = merge(malicious, {});
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect((result as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
  it('handles null-prototype source and target without invoking a prototype setter', () => {
    const target = Object.create(null) as Record<string, unknown>;
    const source = JSON.parse('{"__proto__":{"polluted":true}}') as Record<
      string,
      unknown
    >;
    const result = merge(target, source);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect((result as Record<string, unknown>).polluted).toBeUndefined();
  });
  it('preserves normal nested config and array merging', () => {
    expect(
      merge({ a: { x: 1 }, list: [1] }, { a: { y: 2 }, list: [2] }),
    ).toEqual({ a: { x: 1, y: 2 }, list: [1, 2] });
  });
});
