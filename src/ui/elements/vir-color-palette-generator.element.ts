import {Color, VirColorSwatch, calculateContrast} from '@electrovir/color';
import {css, defineElement, html} from 'element-vir';
import {type PaletteEntry} from '../../data/palette-entry.js';

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
export function generateColorPalette(
    inputColor: string,
    paletteEntries: ReadonlyArray<Readonly<PaletteEntry>>,
) {
    const baseColor = new Color(inputColor);

    return paletteEntries
        .map((paletteEntry) => {
            const {hexString, contrast} = generateColorAtContrast(baseColor, paletteEntry);

            return {
                levelKey: paletteEntry.levelKey,
                hexString,
                contrast,
            };
        })
        .sort((a, b) => a.levelKey - b.levelKey);
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
    /** The current palette entries to display and edit. */
    paletteEntries: ReadonlyArray<Readonly<PaletteEntry>>;
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
        const palette = generateColorPalette(inputs.color, inputs.paletteEntries);

        const swatches = palette.map((entry) => {
            return html`
                <div class="color-swatch">
                    <div class="labels">
                        <span>${entry.levelKey}</span>
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
