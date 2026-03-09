import {defineShape} from 'object-shape-tester';

/**
 * Light levels (100–200) use targetLightness because APCA has a minimum contrast threshold of ~7.5
 * due to loClip, making it impossible to produce very light tints via contrast targeting. Levels
 * 250+ use whiteContrast for contrast-based generation.
 */
export const defaultPaletteEntries = [
    {
        levelKey: 100,
        whiteContrast: 0,
        chromaScale: 0.08,
        targetLightness: 0.98,
    },
    {
        levelKey: 150,
        whiteContrast: 0,
        chromaScale: 0.12,
        targetLightness: 0.97,
    },
    {
        levelKey: 200,
        whiteContrast: 0,
        chromaScale: 0.18,
        targetLightness: 0.955,
    },
    {
        levelKey: 250,
        whiteContrast: 10,
        chromaScale: 0.3,
        targetLightness: 0,
    },
    {
        levelKey: 300,
        whiteContrast: 15,
        chromaScale: 0.4,
        targetLightness: 0,
    },
    {
        levelKey: 350,
        whiteContrast: 20,
        chromaScale: 0.55,
        targetLightness: 0,
    },
    {
        levelKey: 400,
        whiteContrast: 25,
        chromaScale: 0.7,
        targetLightness: 0,
    },
    {
        levelKey: 450,
        whiteContrast: 30,
        chromaScale: 0.85,
        targetLightness: 0,
    },
    {
        levelKey: 500,
        whiteContrast: 35,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 550,
        whiteContrast: 45,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 600,
        whiteContrast: 55,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 650,
        whiteContrast: 65,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 700,
        whiteContrast: 75,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 750,
        whiteContrast: 80,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 800,
        whiteContrast: 85,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 850,
        whiteContrast: 90,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 900,
        whiteContrast: 95,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 950,
        whiteContrast: 97,
        chromaScale: 1,
        targetLightness: 0,
    },
    {
        levelKey: 1000,
        whiteContrast: 100,
        chromaScale: 1,
        targetLightness: 0,
    },
] satisfies PaletteEntry[];

export const paletteEntryShape = defineShape({
    levelKey: -1,
    whiteContrast: -1,
    chromaScale: -1,
    /**
     * When greater than 0, the generator uses this oklch lightness directly instead of searching
     * for a lightness that produces the target whiteContrast. This is needed for very light colors
     * that fall below APCA's loClip threshold (~Lc 7.3).
     */
    targetLightness: 0,
});

/** @category Internal */
export type PaletteEntry = typeof paletteEntryShape.runtimeType;
