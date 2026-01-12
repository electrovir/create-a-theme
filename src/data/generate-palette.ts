import {Color, calculateContrast} from '@electrovir/color';
import {type PaletteEntry} from './palette-entry.js';

/**
 * Generates a color with the specified lightness that maintains the hue.
 *
 * @category Internal
 */
function generateColorAtContrast(
    baseColor: Readonly<Color>,
    {chromaScale, whiteContrast}: Readonly<PaletteEntry>,
) {
    const color = new Color(baseColor.hexString);
    const baseHue = color.oklch.h;
    const baseChroma = color.oklch.c;

    const targetChroma = baseChroma * chromaScale;

    /** Binary search to find the lightness value that produces the target contrast against white. */
    let minLightness = 0;
    let maxLightness = 1;
    let bestMatch = {
        hexString: color.hexString,
        contrast: 0,
        lightness: color.oklch.l,
    };

    for (let iteration = 0; iteration < 20; iteration++) {
        const midLightness = (minLightness + maxLightness) / 2;

        /**
         * Start with the target chroma. The Color class will handle gamut mapping when we read back
         * the hex value.
         */
        color.set({
            oklch: {
                l: midLightness,
                c: targetChroma,
                h: baseHue,
            },
        });

        /**
         * Re-parse the hex to get the gamut-mapped color, then try to boost chroma while staying in
         * gamut (but not exceeding our target chroma).
         */
        const gamutMappedColor = new Color(color.hexString);
        const currentChroma = gamutMappedColor.oklch.c;

        /** Try to find a higher chroma that still produces the same hex (still in gamut). */
        let bestChroma = currentChroma;
        for (let testChroma = currentChroma; testChroma <= targetChroma; testChroma += 0.005) {
            color.set({
                oklch: {
                    l: midLightness,
                    c: testChroma,
                    h: baseHue,
                },
            });
            const testHex = color.hexString;
            const verifyColor = new Color(testHex);

            /** If the color round-trips cleanly, it's in gamut. */
            if (Math.abs(verifyColor.oklch.c - testChroma) < 0.02) {
                bestChroma = testChroma;
            } else {
                break;
            }
        }

        color.set({
            oklch: {
                l: midLightness,
                c: bestChroma,
                h: baseHue,
            },
        });

        const contrast = calculateContrast({
            foreground: color.hexString,
            background: 'white',
        });

        const actualContrast = Math.abs(contrast.contrast);

        if (
            Math.abs(actualContrast - whiteContrast) < Math.abs(bestMatch.contrast - whiteContrast)
        ) {
            bestMatch = {
                hexString: color.hexString,
                contrast: actualContrast,
                lightness: midLightness,
            };
        }

        if (actualContrast < whiteContrast) {
            /** Need darker color (lower lightness in oklch produces higher contrast against white). */
            maxLightness = midLightness;
        } else {
            /** Need lighter color. */
            minLightness = midLightness;
        }
    }

    return {
        hexString: bestMatch.hexString,
        contrast: Math.abs(
            calculateContrast({
                foreground: bestMatch.hexString,
                background: 'white',
            }).contrast,
        ),
    };
}

export type GeneratedPaletteSwatch = {
    levelKey: number;
    hexString: string;
    contrast: number;
};

/**
 * Generates a full palette of colors at different darkness levels from a single input color.
 *
 * @category Internal
 */
export function generateColorPalette(
    inputColor: string,
    paletteEntries: ReadonlyArray<Readonly<PaletteEntry>>,
): GeneratedPaletteSwatch[] {
    const baseColor = new Color(inputColor);

    return paletteEntries
        .map((paletteEntry): GeneratedPaletteSwatch => {
            const {hexString, contrast} = generateColorAtContrast(baseColor, paletteEntry);

            return {
                levelKey: paletteEntry.levelKey,
                hexString,
                contrast,
            };
        })
        .sort((a, b) => a.levelKey - b.levelKey);
}
