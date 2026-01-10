import {filterOutIndexes} from '@augment-vir/common';
import {Color, VirColorPicker} from '@electrovir/color';
import {css, defineElement, html, listen} from 'element-vir';
import {noNativeFormStyles, ViraButton, ViraIcon, X24Icon} from 'vira';
import {type FrontendState} from '../../data/frontend-state.js';
import {createRandomColor} from '../../data/random-color.js';
import {VirColorPaletteGenerator} from './vir-color-palette-generator.element.js';

const initColors: string[] = [
    '#e53935', // Red
    '#ff9800', // Orange
    '#fdd835', // Yellow
    '#43a047', // Green
    '#00bcd4', // Cyan
    '#2196f3', // Blue
    '#9c27b0', // Violet
    '#aeb8bd', // Grey
];

export const VirCreateTheme = defineElement<{
    frontendState: Readonly<FrontendState>;
}>()({
    tagName: 'vir-create-theme',
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

                            & .remove-button {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 6px;
                                border-radius: 8px;

                                &:hover {
                                    background-color: #f0f0f0;
                                }
                            }
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
    state({inputs}) {
        return {
            startingColors:
                inputs.frontendState.localStorageClient.get.startingColors() || initColors,
        };
    },
    render({state, updateState, inputs}) {
        function updateColors(newColors: string[]) {
            updateState({
                startingColors: newColors,
            });

            inputs.frontendState.localStorageClient.set.startingColors(newColors);
        }

        const colorPickerTemplates = state.startingColors.map((color, index) => {
            return html`
                <section class="color-column">
                    <div class="color-picker-and-hex-wrapper">
                        <div class="color-picker-and-delete-button-wrapper">
                            <${VirColorPicker.assign({
                                color,
                            })}
                                ${listen(VirColorPicker.events.colorChange, (event) => {
                                    const newColors = state.startingColors.map(
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
                                <button
                                    class="remove-button"
                                    ${listen('click', () => {
                                        updateColors(
                                            filterOutIndexes(state.startingColors, [index]),
                                        );
                                    })}
                                >
                                    <${ViraIcon.assign({
                                        icon: X24Icon,
                                    })}></${ViraIcon}>
                                </button>
                            </div>
                        </div>
                        <span class="hex-label">${new Color(color).hexString}</span>
                    </div>
                    <${VirColorPaletteGenerator.assign({
                        color,
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
                                ...state.startingColors,
                                createRandomColor(),
                            ]);
                        })}
                    ></${ViraButton}>
                    <div class="small-button-wrapper">
                        <button
                            class="small-button"
                            ${listen('click', () => {
                                inputs.frontendState.localStorageClient.delete.startingColors();
                                updateState({
                                    startingColors: initColors,
                                });
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
