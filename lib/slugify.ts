export function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // spaces & symbols → -
    .replace(/^-+|-+$/g, '');     // clean edges
}