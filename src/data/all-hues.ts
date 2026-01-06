/* eslint-disable sonarjs/pseudo-random */

/**
 * Converts HSL values to a hex color string.
 *
 * @param h Hue in degrees (0-360)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 */
function hslToHex(h: number, s: number, l: number): string {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r: number;
    let g: number;
    let b: number;

    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    const toHex = (value: number) =>
        Math.round((value + m) * 255)
            .toString(16)
            .padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Generates evenly spaced values within a range. */
function generateSteps(min: number, max: number, steps: number): number[] {
    if (steps <= 1) {
        return [(min + max) / 2];
    }
    const result: number[] = [];
    for (let i = 0; i < steps; i++) {
        result.push(min + (i / (steps - 1)) * (max - min));
    }
    return result;
}

/**
 * Calculates the number of variations needed for each dimension (hue, saturation, lightness) to
 * produce at least `count` colors while keeping the dimensions roughly balanced.
 */
function calculateDimensions(count: number): {
    hueCount: number;
    satCount: number;
    lightCount: number;
} {
    /**
     * We want hueCount * satCount * lightCount >= count. Aim for roughly equal distribution across
     * dimensions, with hue getting slightly more weight since it's the most perceptually distinct.
     */
    const cubeRoot = Math.cbrt(count);

    /** Give hue 1.5x weight compared to saturation and lightness. */
    const hueCount = Math.max(1, Math.ceil(cubeRoot * 1.3));
    const satCount = Math.max(1, Math.ceil(cubeRoot * 0.9));
    const lightCount = Math.max(1, Math.ceil(cubeRoot * 0.9));

    return {hueCount, satCount, lightCount};
}

/**
 * Generates an array of hex colors evenly spread across the hue spectrum with varying saturation
 * and lightness. Starts at red (0°) and ends at pink (~330°), avoiding the wrap back to red. The
 * number of variations for each dimension is dynamically calculated based on the requested count. A
 * small amount of randomness is added to each color for variety.
 *
 * @category Internal
 */
export function generateEvenlySpreadColors(count: number): string[] {
    const colors: string[] = [];

    /** End at 330° (pink) instead of 360° to avoid wrapping back to red. */
    const maxHue = 330;

    /** Calculate dimensions based on count. */
    const {hueCount, satCount, lightCount} = calculateDimensions(count);

    /** Generate evenly spaced values for each dimension. */
    const hues = generateSteps(0, maxHue, hueCount);
    const saturations = generateSteps(0.3, 1, satCount);
    const lightnessLevels = generateSteps(0.25, 0.75, lightCount);

    /** Random variation amounts. */
    const hueJitter = maxHue / hueCount / 3;
    const satJitter = 0.2;
    const lightJitter = 0.15;

    for (const hue of hues) {
        for (const saturation of saturations) {
            for (const lightness of lightnessLevels) {
                if (colors.length >= count) {
                    return colors;
                }

                /** Add random jitter to each dimension. */
                const jitteredHue = Math.max(
                    0,
                    Math.min(maxHue, hue + (Math.random() - 0.5) * 2 * hueJitter),
                );
                const jitteredSat = Math.max(
                    0.1,
                    Math.min(1, saturation + (Math.random() - 0.5) * 2 * satJitter),
                );
                const jitteredLight = Math.max(
                    0.15,
                    Math.min(0.85, lightness + (Math.random() - 0.5) * 2 * lightJitter),
                );

                colors.push(hslToHex(jitteredHue, jitteredSat, jitteredLight));
            }
        }
    }

    return colors;
}
