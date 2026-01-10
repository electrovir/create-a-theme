import {defineShape} from 'object-shape-tester';

export const defaultPaletteEntries = [
    {
        levelKey: 5,
        /** APCA has a minimum contrast threshold of ~7.5 due to loClip. */
        whiteContrast: 7,
        chromaScale: 0.28,
    },
    {
        levelKey: 10,
        whiteContrast: 15,
        chromaScale: 0.6,
    },
    {
        levelKey: 20,
        whiteContrast: 25,
        chromaScale: 1,
    },
    {
        levelKey: 30,
        whiteContrast: 35,
        chromaScale: 1,
    },
    {
        levelKey: 40,
        whiteContrast: 45,
        chromaScale: 1,
    },
    {
        levelKey: 50,
        whiteContrast: 55,
        chromaScale: 1,
    },
    {
        levelKey: 60,
        whiteContrast: 65,
        chromaScale: 1,
    },
    {
        levelKey: 70,
        whiteContrast: 75,
        chromaScale: 1,
    },
    {
        levelKey: 80,
        whiteContrast: 85,
        chromaScale: 1,
    },
    {
        levelKey: 90,
        whiteContrast: 95,
        chromaScale: 1,
    },
    {
        levelKey: 100,
        whiteContrast: 104,
        chromaScale: 1,
    },
] satisfies PaletteEntry[];

export const paletteEntryShape = defineShape({
    levelKey: -1,
    whiteContrast: -1,
    chromaScale: -1,
});

/** @category Internal */
export type PaletteEntry = typeof paletteEntryShape.runtimeType;
