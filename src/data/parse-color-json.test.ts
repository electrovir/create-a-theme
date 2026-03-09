import {describe, itCases} from '@augment-vir/test';
import {type SwatchMap} from './generate-code.js';
import {type PaletteEntry} from './palette-entry.js';
import {parseColorJson, type ColorJson, type ParsedColorJson} from './parse-color-json.js';

describe(parseColorJson.name, () => {
    itCases(parseColorJson, [
        {
            it: 'handles an empty object',
            input: {},
            expect: {
                swatchMap: {},
                paletteEntries: [],
            } satisfies ParsedColorJson,
        },
        {
            it: 'parses a single color with one level',
            input: {
                Red: {
                    '500': '#EC221F',
                },
            } satisfies ColorJson,
            expect: {
                swatchMap: {
                    '#EC221F': [
                        {
                            levelKey: 500,
                            hexString: '#EC221F',
                            contrast: 0,
                        },
                    ],
                } satisfies SwatchMap,
                paletteEntries: [
                    {
                        levelKey: 500,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                ] satisfies PaletteEntry[],
            } satisfies ParsedColorJson,
        },
        {
            it: 'parses a color with multiple levels in order',
            input: {
                Green: {
                    '100': '#EBFFEE',
                    '500': '#14AE5C',
                    '1000': '#062D1B',
                },
            } satisfies ColorJson,
            expect: {
                swatchMap: {
                    '#14AE5C': [
                        {
                            levelKey: 100,
                            hexString: '#EBFFEE',
                            contrast: 0,
                        },
                        {
                            levelKey: 500,
                            hexString: '#14AE5C',
                            contrast: 0,
                        },
                        {
                            levelKey: 1000,
                            hexString: '#062D1B',
                            contrast: 0,
                        },
                    ],
                } satisfies SwatchMap,
                paletteEntries: [
                    {
                        levelKey: 100,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 500,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 1000,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                ] satisfies PaletteEntry[],
            } satisfies ParsedColorJson,
        },
        {
            it: 'sorts level keys numerically',
            input: {
                Blue: {
                    '1000': '#15253F',
                    '100': '#F1F6FD',
                    '500': '#3F81EA',
                },
            } satisfies ColorJson,
            expect: {
                swatchMap: {
                    '#3F81EA': [
                        {
                            levelKey: 100,
                            hexString: '#F1F6FD',
                            contrast: 0,
                        },
                        {
                            levelKey: 500,
                            hexString: '#3F81EA',
                            contrast: 0,
                        },
                        {
                            levelKey: 1000,
                            hexString: '#15253F',
                            contrast: 0,
                        },
                    ],
                } satisfies SwatchMap,
                paletteEntries: [
                    {
                        levelKey: 100,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 500,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 1000,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                ] satisfies PaletteEntry[],
            } satisfies ParsedColorJson,
        },
        {
            it: 'parses multiple colors',
            input: {
                Black: {
                    '100': '#0C0C0D',
                    '500': '#0C0C0D',
                },
                White: {
                    '100': '#FFFFFF',
                    '500': '#FFFFFF',
                },
            } satisfies ColorJson,
            expect: {
                swatchMap: {
                    '#0C0C0D': [
                        {
                            levelKey: 100,
                            hexString: '#0C0C0D',
                            contrast: 0,
                        },
                        {
                            levelKey: 500,
                            hexString: '#0C0C0D',
                            contrast: 0,
                        },
                    ],
                    '#FFFFFF': [
                        {
                            levelKey: 100,
                            hexString: '#FFFFFF',
                            contrast: 0,
                        },
                        {
                            levelKey: 500,
                            hexString: '#FFFFFF',
                            contrast: 0,
                        },
                    ],
                } satisfies SwatchMap,
                paletteEntries: [
                    {
                        levelKey: 100,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 500,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                ] satisfies PaletteEntry[],
            } satisfies ParsedColorJson,
        },
        {
            it: 'picks the middle level as the representative key',
            input: {
                Brand: {
                    '100': '#F5F5F5',
                    '200': '#E6E6E6',
                    '300': '#D9D9D9',
                    '400': '#B3B3B3',
                    '500': '#757575',
                    '600': '#444444',
                    '700': '#383838',
                    '800': '#2C2C2C',
                    '900': '#1E1E1E',
                    '1000': '#111111',
                },
            } satisfies ColorJson,
            expect: {
                swatchMap: {
                    '#444444': [
                        {
                            levelKey: 100,
                            hexString: '#F5F5F5',
                            contrast: 0,
                        },
                        {
                            levelKey: 200,
                            hexString: '#E6E6E6',
                            contrast: 0,
                        },
                        {
                            levelKey: 300,
                            hexString: '#D9D9D9',
                            contrast: 0,
                        },
                        {
                            levelKey: 400,
                            hexString: '#B3B3B3',
                            contrast: 0,
                        },
                        {
                            levelKey: 500,
                            hexString: '#757575',
                            contrast: 0,
                        },
                        {
                            levelKey: 600,
                            hexString: '#444444',
                            contrast: 0,
                        },
                        {
                            levelKey: 700,
                            hexString: '#383838',
                            contrast: 0,
                        },
                        {
                            levelKey: 800,
                            hexString: '#2C2C2C',
                            contrast: 0,
                        },
                        {
                            levelKey: 900,
                            hexString: '#1E1E1E',
                            contrast: 0,
                        },
                        {
                            levelKey: 1000,
                            hexString: '#111111',
                            contrast: 0,
                        },
                    ],
                } satisfies SwatchMap,
                paletteEntries: [
                    {
                        levelKey: 100,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 200,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 300,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 400,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 500,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 600,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 700,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 800,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 900,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                    {
                        levelKey: 1000,
                        whiteContrast: 0,
                        chromaScale: 0,
                        targetLightness: 0,
                    },
                ] satisfies PaletteEntry[],
            } satisfies ParsedColorJson,
        },
    ]);
});
