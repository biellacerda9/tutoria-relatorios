export function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function findColumnIndex(
  headers: string[],
  matcher: (normalized: string, original: string) => boolean
): number {
  for (let i = 0; i < headers.length; i++) {
    if (matcher(normalizeHeader(headers[i]), headers[i])) return i;
  }
  return -1;
}

export function findAllColumnIndexes(
  headers: string[],
  matcher: (normalized: string, original: string) => boolean
): number[] {
  const result: number[] = [];
  headers.forEach((h, i) => {
    if (matcher(normalizeHeader(h), h)) result.push(i);
  });
  return result;
}

const DAY_BRACKET = /\[(.+?)\]\s*$/;

export function extractDay(header: string): string | null {
  const match = header.match(DAY_BRACKET);
  return match ? match[1].trim() : null;
}

export const DAY_ORDER = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
