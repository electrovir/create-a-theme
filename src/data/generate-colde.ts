import {arrayToObject, mapObjectValues, stringify} from '@augment-vir/common';
import {type GeneratedPaletteSwatch} from './generate-palette.js';

export type SwatchMap = Record<string, GeneratedPaletteSwatch[]>;

export function generateCode(generatedPalette: Readonly<SwatchMap>): string {
    const colorEntries = mapObjectValues(generatedPalette, (key, generatedSwatches) => {
        return arrayToObject(
            generatedSwatches.toSorted((a, b) => a.levelKey - b.levelKey),
            (swatch) => {
                return {
                    key: swatch.levelKey,
                    value: swatch.hexString,
                };
            },
        );
    });

    return `export const colorPalette = ${stringify(colorEntries, 4)};`;
}
