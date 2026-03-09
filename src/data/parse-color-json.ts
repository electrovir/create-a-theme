import {type SwatchMap} from './generate-code.js';
import {type GeneratedPaletteSwatch} from './generate-palette.js';
import {type PaletteEntry} from './palette-entry.js';

/**
 * A JSON object mapping color names to their level-keyed hex values.
 *
 * @category Internal
 */
export type ColorJson = Readonly<Record<string, Readonly<Record<string, string>>>>;

export type ParsedColorJson = {
    swatchMap: SwatchMap;
    paletteEntries: PaletteEntry[];
};

/**
 * Converts a JSON object of colors into a {@link ParsedColorJson}. Each top-level key is a color
 * name (e.g. `"Brand"`, `"Green"`) and each nested object maps level keys (e.g. `"100"`, `"500"`)
 * to hex strings.
 *
 * The middle level's hex value is used as the representative key in the returned {@link SwatchMap}.
 * Level keys are extracted from the first color entry and used to build {@link PaletteEntry}
 * objects.
 *
 * @category Internal
 */
export function parseColorJson(colorJson: ColorJson): ParsedColorJson {
    const swatchMap: SwatchMap = {};
    let paletteEntries: PaletteEntry[] = [];

    Object.entries(colorJson).forEach(
        ([
            ,
            levels,
        ]) => {
            const sortedLevelKeys = Object.keys(levels)
                .map(Number)
                .sort((a, b) => a - b);

            if (!paletteEntries.length && sortedLevelKeys.length) {
                paletteEntries = sortedLevelKeys.map((levelKey): PaletteEntry => {
                    return {
                        levelKey,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    };
                });
            }

            const swatches: GeneratedPaletteSwatch[] = sortedLevelKeys.map(
                (levelKey): GeneratedPaletteSwatch => {
                    return {
                        levelKey,
                        hexString: levels[String(levelKey)] || '',
                        contrast: 0,
                    };
                },
            );

            const middleIndex = Math.floor(sortedLevelKeys.length / 2);
            const representativeHex = levels[String(sortedLevelKeys[middleIndex])] || '';

            swatchMap[representativeHex] = swatches;
        },
    );

    return {
        swatchMap,
        paletteEntries,
    };
}
