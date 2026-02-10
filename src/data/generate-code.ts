import {mapObjectValues, stringify, typedObjectFromEntries} from '@augment-vir/common';
import {Color} from '@electrovir/color';
import {
    defineCssVars,
    type CssVarDefinitions,
    type CssVarName,
    type CssVarsSetup,
} from 'lit-css-vars';
import {buildColorTheme, generateThemeCode} from 'theme-vir';
import {type GeneratedPaletteSwatch} from './generate-palette.js';

export type SwatchMap = Record<
    /** Original color string. */
    string,
    GeneratedPaletteSwatch[]
>;

export function generateCode(cssVarPrefix: string, generatedPalette: Readonly<SwatchMap>): string {
    const cssVarsInit = mapObjectValues(
        generatePaletteCssVars('vir', generatedPalette),
        (key, value) => {
            return value.default;
        },
    );

    const imports = [
        "import {defineCssVars} from 'lit-css-vars';",
        "import {defineColorTheme, defineColorThemeOverride} from 'theme-vir';",
    ];

    const colorPaletteVarName = `${cssVarPrefix}ColorPalette`;
    const paletteVarsCode = `export const ${colorPaletteVarName} = defineCssVars(${stringify(cssVarsInit, 4)});`;

    const {darkOverride, defaultLight} = generateColorThemeFromSwatchMap(
        cssVarPrefix,
        generatedPalette,
    );

    console.log(darkOverride);

    const themeCode = generateThemeCode(defaultLight, {
        paletteVarName: colorPaletteVarName,
        overrides: [darkOverride],
    });

    return [
        imports.join('\n'),
        '',
        paletteVarsCode,
        '',
        themeCode,
    ].join('\n');
}

export function generatePaletteCssVars(
    cssVarPrefix: string,
    generatedPalette: Readonly<SwatchMap>,
) {
    const cssVarEntries: [CssVarName, string][] = Object.entries(generatedPalette).flatMap(
        ([
            originalColorString,
            generatedSwatches,
        ]) => {
            const originalColor = new Color(originalColorString);
            const originalColorKey = originalColor.getClosestNamedColor().toLowerCase();

            return generatedSwatches
                .toSorted((a, b) => a.levelKey - b.levelKey)
                .map((generatedSwatch): [CssVarName, string] => {
                    const newKey =
                        `${cssVarPrefix.toLowerCase()}-${originalColorKey}-${generatedSwatch.levelKey}` as CssVarName;

                    return [
                        newKey,
                        generatedSwatch.hexString,
                    ];
                });
        },
    );

    const cssVarsObject: CssVarsSetup = typedObjectFromEntries(cssVarEntries);

    /**
     * `as` casts needed because `defineCssVars` specifically blocks vague CSS var names, which
     * we're intentionally using here.
     */
    return defineCssVars(cssVarsObject as any) as unknown as CssVarDefinitions<CssVarsSetup>;
}

export function generateColorThemeFromSwatchMap(
    cssVarPrefix: string,
    generatedPalette: Readonly<SwatchMap>,
) {
    const paletteVars = generatePaletteCssVars(cssVarPrefix, generatedPalette);

    console.log(paletteVars);

    return buildColorTheme(paletteVars);
}
