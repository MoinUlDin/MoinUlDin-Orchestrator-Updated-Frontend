// helpers.ts

export function truncString(string: string, num = 18) {
  if (!string || string.length <= num) return string;

  return `${string.slice(0, num)}...`;
}
