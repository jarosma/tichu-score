import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Oklch = [lightness: number, chroma: number, hue: number];
type Rgb = [red: number, green: number, blue: number];

// Read the declarations so this test measures the values shipped in index.css.
const stylesheet = readFileSync(
  resolve(process.cwd(), "src/index.css"),
  "utf8",
);

function cssBlock(selector: ":root" | ".dark"): string {
  const selectorPattern = selector === ".dark" ? "\\.dark" : ":root";
  const block = new RegExp(`${selectorPattern}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(
    stylesheet,
  );
  if (!block) throw new Error(`CSS-Block ${selector} nicht gefunden`);
  return block[1];
}

function cssToken(selector: ":root" | ".dark", name: string): Oklch {
  const declaration = new RegExp(`${name}:\\s*(oklch\\([^;]+\\))`).exec(
    cssBlock(selector),
  );
  if (!declaration) throw new Error(`CSS-Token ${name} nicht gefunden`);

  const values = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(
    declaration[1],
  );
  if (!values) throw new Error(`CSS-Token ${name} ist kein einfaches OKLCH`);
  return [Number(values[1]), Number(values[2]), Number(values[3])];
}

function toSrgb([lightness, chroma, hue]: Oklch): Rgb {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear: Rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return linear.map((value) => {
    const srgb =
      value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
    return Math.max(0, Math.min(1, srgb));
  }) as Rgb;
}

function relativeLuminance([red, green, blue]: Rgb): number {
  return [red, green, blue].reduce((sum, value, index) => {
    const linear =
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return sum + [0.2126, 0.7152, 0.0722][index] * linear;
  }, 0);
}

function contrastRatio(first: Rgb, second: Rgb): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

function blend(foreground: Rgb, background: Rgb, opacity: number): Rgb {
  return foreground.map(
    (value, index) => value * opacity + background[index] * (1 - opacity),
  ) as Rgb;
}

describe("Theme contrast", () => {
  it.each([
    [":root", "Light"],
    [".dark", "Dark"],
  ] as const)("measures readable %s theme tokens", (selector, theme) => {
    const background = toSrgb(cssToken(selector, "--background"));
    const foreground = toSrgb(cssToken(selector, "--foreground"));
    const card = toSrgb(cssToken(selector, "--card"));
    const primary = toSrgb(cssToken(selector, "--primary"));
    const primaryForeground = toSrgb(
      cssToken(selector, "--primary-foreground"),
    );
    const secondary = toSrgb(cssToken(selector, "--secondary"));
    const secondaryForeground = toSrgb(
      cssToken(selector, "--secondary-foreground"),
    );
    const mutedForeground = toSrgb(cssToken(selector, "--muted-foreground"));
    const ring = toSrgb(cssToken(selector, "--ring"));
    const destructive = toSrgb(cssToken(selector, "--destructive"));
    const white: Rgb = [1, 1, 1];

    expect(
      contrastRatio(foreground, background),
      `${theme} text`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(mutedForeground, background),
      `${theme} muted text`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(primary, background),
      `${theme} QR/Summary label`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(primary, card),
      `${theme} card label`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(primary, primaryForeground),
      `${theme} primary button`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(secondary, secondaryForeground),
      `${theme} secondary button`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(ring, background),
      `${theme} focus ring`,
    ).toBeGreaterThanOrEqual(3);

    const buttonBackground =
      selector === ".dark" ? blend(destructive, background, 0.6) : destructive;
    expect(
      contrastRatio(buttonBackground, white),
      `${theme} destructive button`,
    ).toBeGreaterThanOrEqual(4.5);
  });
});
