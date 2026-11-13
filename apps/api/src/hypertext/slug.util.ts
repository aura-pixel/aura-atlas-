export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function academicSlug(
  name: string,
  abbreviation?: string | null,
): string {
  return slugify(abbreviation ?? '') || slugify(name) || 'academia';
}
