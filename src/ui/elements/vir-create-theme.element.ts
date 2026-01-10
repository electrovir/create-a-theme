import {filterOutIndexes} from '@augment-vir/common';
import {Color, VirColorPicker} from '@electrovir/color';
import {css, defineElement, defineElementEvent, html, listen} from 'element-vir';
import {noNativeFormStyles, ViraButton} from 'vira';
import {type PaletteEntry} from '../../data/palette-entry.js';
import {createRandomColor} from '../../data/random-color.js';
import {VirColorPaletteGenerator} from './vir-color-palette-generator.element.js';
import {VirDeleteButton} from './vir-delete-button.element.js';

export const VirCreateTheme = defineElement<{
    colors: ReadonlyArray<string>;
    /** The current palette entries to display and edit. */
    paletteEntries: ReadonlyArray<Readonly<PaletteEntry>>;
}>()({
    tagName: 'vir-create-theme',
    events: {
        colorsChange: defineElementEvent<string[]>(),
        togglePaletteEditor: defineElementEvent<void>(),
        reset: defineElementEvent<void>(),
    },
    styles: css`
        :host {
            display: flex;
            gap: 16px;
            align-items: flex-start;
        }

        button {
            ${noNativeFormStyles}
            cursor: pointer;
        }

        .color-pickers {
            display: flex;
            flex-wrap: wrap;
            gap: 64px;

            & .color-column {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;

                & .hex-label {
                    font-family: monospace;
                    font-size: 14px;
                    color: #444;
                }

                & .color-picker-and-hex-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1px;

                    & .color-picker-and-delete-button-wrapper {
                        display: flex;
                        position: relative;

                        & .remove-button-wrapper {
                            position: absolute;
                            top: 0;
                            left: 100%;
                            height: 100%;
                            padding-left: 2px;
                            display: flex;
                            align-items: center;
                        }
                    }
                }
            }
        }

        .button-height-wrapper {
            display: flex;
            position: relative;
            align-items: center;
            flex-shrink: 0;

            & .placeholder-picker {
                position: relative;
                width: 0;
                overflow: hidden;
                pointer-events: none;
                z-index: -1;
                visibility: hidden;
            }

            & .button-width-wrapper {
                position: relative;

                & .small-button-wrapper {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                    padding-top: 12px;

                    & .small-button {
                        opacity: 0.4;
                        background-color: #ddd;
                        padding: 4px 8px;
                        border-radius: 8px;
                        text-align: center;

                        &:hover {
                            opacity: 1;
                        }
                    }
                }
            }
        }
    `,
    render({inputs, dispatch, events}) {
        function updateColors(newColors: string[]) {
            dispatch(new events.colorsChange(newColors));
        }

        const colorPickerTemplates = inputs.colors.map((color, index) => {
            return html`
                <section class="color-column">
                    <div class="color-picker-and-hex-wrapper">
                        <div class="color-picker-and-delete-button-wrapper">
                            <${VirColorPicker.assign({
                                color,
                            })}
                                ${listen(VirColorPicker.events.colorChange, (event) => {
                                    const newColors = inputs.colors.map(
                                        (startingColor, innerIndex) => {
                                            if (innerIndex === index) {
                                                return event.detail;
                                            } else {
                                                return startingColor;
                                            }
                                        },
                                    );
                                    updateColors(newColors);
                                })}
                            ></${VirColorPicker}>
                            <div class="remove-button-wrapper">
                                <${VirDeleteButton}
                                    ${listen('click', () => {
                                        updateColors(filterOutIndexes(inputs.colors, [index]));
                                    })}
                                ></${VirDeleteButton}>
                            </div>
                        </div>
                        <span class="hex-label">${new Color(color).hexString}</span>
                    </div>
                    <${VirColorPaletteGenerator.assign({
                        color,
                        paletteEntries: inputs.paletteEntries,
                    })}></${VirColorPaletteGenerator}>
                </section>
            `;
        });

        return html`
            <div class="button-height-wrapper">
                <div class="button-width-wrapper">
                    <${ViraButton.assign({
                        text: 'Add color ＋',
                    })}
                        ${listen('click', () => {
                            updateColors([
                                ...inputs.colors,
                                createRandomColor(),
                            ]);
                        })}
                    ></${ViraButton}>
                    <div class="small-button-wrapper">
                        <button
                            class="small-button"
                            ${listen('click', () => {
                                dispatch(new events.togglePaletteEditor());
                            })}
                        >
                            Levels
                        </button>
                        <button
                            class="small-button"
                            ${listen('click', () => {
                                dispatch(new events.reset());
                            })}
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <${VirColorPicker.assign({
                    color: 'black',
                })}
                    class="placeholder-picker"
                ></${VirColorPicker}>
            </div>
            <div class="color-pickers">${colorPickerTemplates}</div>
        `;
    },
});
