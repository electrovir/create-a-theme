import {VirColorSwatch} from '@electrovir/color';
import {css, defineElement, defineElementEvent, html} from 'element-vir';
import {generateColorPalette, type GeneratedPaletteSwatch} from '../../data/generate-palette.js';
import {type PaletteEntry} from '../../data/palette-entry.js';

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
    /** When provided, these swatches are displayed directly instead of running the generator. */
    precomputedPalette: GeneratedPaletteSwatch[] | undefined;
}>()({
    tagName: 'vir-color-palette-generator',
    events: {
        paletteCreate: defineElementEvent<GeneratedPaletteSwatch[]>(),
    },
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
    render({inputs, dispatch, events}) {
        const palette =
            inputs.precomputedPalette || generateColorPalette(inputs.color, inputs.paletteEntries);

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
        dispatch(new events.paletteCreate(palette));

        return swatches;
    },
});
