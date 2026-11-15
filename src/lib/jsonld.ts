const BACKSLASH = String.fromCharCode(92);

/**
 * Serialise structured data for a <script type="application/ld+json"> tag.
 * Every "<" is written as its JSON unicode escape, so no value can close
 * the script tag early.
 */
export function jsonLd(data: object): string {
  return JSON.stringify(data).replaceAll("<", `${BACKSLASH}u003c`);
}
