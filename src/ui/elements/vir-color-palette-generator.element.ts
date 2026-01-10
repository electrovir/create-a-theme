import {getObjectTypedEntries} from '@augment-vir/common';
import {Color, VirColorSwatch, calculateContrast} from '@electrovir/color';
import {css, defineElement, html} from 'element-vir';

const paletteEntries = {
    5: {
        /** APCA has a minimum contrast threshold of ~7.5 due to loClip. */
        whiteContrast: 7,
        chromaScale: 0.28,
    },
    10: {
        whiteContrast: 15,
        chromaScale: 0.6,
    },
    20: {
        whiteContrast: 25,
        chromaScale: 1,
    },
    30: {
        whiteContrast: 35,
        chromaScale: 1,
    },
    40: {
        whiteContrast: 45,
        chromaScale: 1,
    },
    50: {
        whiteContrast: 55,
        chromaScale: 1,
    },
    60: {
        whiteContrast: 65,
        chromaScale: 1,
    },
    70: {
        whiteContrast: 75,
        chromaScale: 1,
    },
    80: {
        whiteContrast: 85,
        chromaScale: 1,
    },
    90: {
        whiteContrast: 95,
        chromaScale: 1,
    },
    100: {
        whiteContrast: 103,
        chromaScale: 1,
    },
} satisfies Record<number, PaletteEntry>;

type PaletteEntry = {
    whiteContrast: number;
    chromaScale: number;
};

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

/**
 * Generates a full palette of colors at different darkness levels from a single input color.
 *
 * @category Internal
 */
export function generateColorPalette(inputColor: string) {
    const baseColor = new Color(inputColor);

    return getObjectTypedEntries(paletteEntries).map(
        ([
            level,
            paletteEntry,
        ]) => {
            const {hexString, contrast} = generateColorAtContrast(baseColor, paletteEntry);

            return {
                level,
                hexString,
                contrast,
            };
        },
    );
}

/**
 * An element that accepts a single color string input and generates a full palette of 10-90
 * darkness levels. Each level has roughly the same contrast level against white for that darkness
 * tier.
 *
 * @category Elements
 */
export const VirColorPaletteGenerator = defineElement<{
    /** The input color to generate a palette from. */
    color: string;
}>()({
    tagName: 'vir-color-palette-generator',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
        }

        .color-swatch {
            position: relative;

            & ${VirColorSwatch} {
                border: none;
                height: 60px;
                width: 60px;
            }

            & .labels {
                position: absolute;
                white-space: nowrap;
                top: 0;
                right: 100%;
                height: 100%;
                padding-right: 4px;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                justify-content: center;
                gap: 2px;
                font-size: 12px;
                font-family: monospace;
                color: #444;
            }
        }
    `,
    render({inputs}) {
        const palette = generateColorPalette(inputs.color);

        const swatches = palette.map((entry) => {
            return html`
                <div class="color-swatch">
                    <div class="labels">
                        <span>${entry.level}</span>
                        <span>${entry.hexString}</span>
                        <span>${entry.contrast} Lc</span>
                    </div>
                    <${VirColorSwatch.assign({
                        backgroundColor: entry.hexString,
                    })}></${VirColorSwatch}>
                </div>
            `;
        });

        return swatches;
    },
});
