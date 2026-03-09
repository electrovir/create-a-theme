import {assertWrap} from '@augment-vir/assert';
import {filterObject, filterOutIndexes, sortObject} from '@augment-vir/common';
import {extractEventTarget} from '@augment-vir/web';
import {Color, VirColorPicker} from '@electrovir/color';
import {css, defineElement, defineElementEvent, html, listen} from 'element-vir';
import {ViraButton, ViraColorVariant, ViraEmphasis, ViraInput, ViraSize} from 'vira';
import {generateCode, type SwatchMap} from '../../data/generate-code.js';
import {type PaletteEntry} from '../../data/palette-entry.js';
import {parseColorJson, type ParsedColorJson} from '../../data/parse-color-json.js';
import {createRandomColor} from '../../data/random-color.js';
import {VirColorPaletteGenerator} from './vir-color-palette-generator.element.js';
import {VirDeleteButton} from './vir-delete-button.element.js';

export const VirCreateTheme = defineElement<{
    colors: ReadonlyArray<string>;
    /** The current palette entries to display and edit. */
    paletteEntries: ReadonlyArray<Readonly<PaletteEntry>>;
}>()({
    tagName: 'vir-create-theme',
    state() {
        return {
            latestGeneratedPalette: {} as Readonly<SwatchMap>,
            pastedSwatchMap: undefined as Readonly<SwatchMap> | undefined,
        };
    },
    events: {
        colorsChange: defineElementEvent<string[]>(),
        togglePaletteEditor: defineElementEvent<void>(),
        reset: defineElementEvent<void>(),
        generateTheme: defineElementEvent<Readonly<SwatchMap>>(),
        jsonPaste: defineElementEvent<ParsedColorJson>(),
    },
    styles: css`
        :host {
            display: flex;
            gap: 32px;
            align-items: flex-start;
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

        ${ViraInput} {
            text-align: center;
            width: 80px;
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
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                    padding-top: 12px;
                }
            }

            &.pasted {
                & .placeholder-picker {
                    display: none;
                }

                & .button-width-wrapper .small-button-wrapper {
                    position: static;
                    padding-top: 0;
                }
            }
        }
    `,
    render({inputs, dispatch, events, state, updateState}) {
        function updateColors(newColors: string[]) {
            dispatch(new events.colorsChange(newColors));
        }

        /** Remove keyed colors that aren't in use anymore. */
        const filteredLatestGeneration = filterObject(state.latestGeneratedPalette, (key) => {
            return inputs.colors.includes(key);
        }) as typeof state.latestGeneratedPalette;

        if (
            Object.keys(filteredLatestGeneration).length !==
            Object.keys(state.latestGeneratedPalette).length
        ) {
            updateState({
                latestGeneratedPalette: filteredLatestGeneration,
            });
        }

        const hasPastedTheme = state.pastedSwatchMap != undefined;

        const colorPickerTemplates = inputs.colors.map((color, index) => {
            return html`
                <section class="color-column">
                    ${hasPastedTheme
                        ? ''
                        : html`
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
                                                  updateColors(
                                                      filterOutIndexes(inputs.colors, [index]),
                                                  );
                                              })}
                                          ></${VirDeleteButton}>
                                      </div>
                                  </div>
                                  <span class="hex-label">${new Color(color).hexString}</span>
                              </div>
                          `}
                    <${VirColorPaletteGenerator.assign({
                        color,
                        paletteEntries: inputs.paletteEntries,
                        precomputedPalette: state.pastedSwatchMap?.[color],
                    })}
                        ${listen(VirColorPaletteGenerator.events.paletteCreate, (event) => {
                            const newGeneration = {
                                ...state.latestGeneratedPalette,
                                [color]: event.detail,
                            };

                            updateState({
                                latestGeneratedPalette: sortObject(newGeneration, (a, b) => {
                                    return (
                                        inputs.colors.indexOf(String(a.key)) -
                                        inputs.colors.indexOf(String(b.key))
                                    );
                                }),
                            });
                        })}
                    ></${VirColorPaletteGenerator}>
                </section>
            `;
        });

        return html`
            <div class="button-height-wrapper ${hasPastedTheme ? 'pasted' : ''}">
                <div class="button-width-wrapper">
                    ${hasPastedTheme
                        ? ''
                        : html`
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
                          `}
                    <div class="small-button-wrapper">
                        <${ViraButton.assign({
                            text: 'Generate Theme',
                            buttonEmphasis: ViraEmphasis.Subtle,
                            colorVariant: ViraColorVariant.Neutral,
                            buttonSize: ViraSize.Small,
                        })}
                            ${listen('click', () => {
                                dispatch(new events.generateTheme(state.latestGeneratedPalette));
                            })}
                        ></${ViraButton}>
                        <${ViraButton.assign({
                            text: 'Copy Code',
                            buttonEmphasis: ViraEmphasis.Subtle,
                            colorVariant: ViraColorVariant.Neutral,
                            buttonSize: ViraSize.Small,
                        })}
                            ${listen('click', async () => {
                                const code = generateCode('vir', state.latestGeneratedPalette);
                                try {
                                    await globalThis.navigator.clipboard.writeText(code);
                                } catch (error) {
                                    console.error(error);
                                    console.info(code);
                                }
                            })}
                        ></${ViraButton}>
                        <${ViraButton.assign({
                            text: 'Levels',
                            buttonEmphasis: ViraEmphasis.Subtle,
                            colorVariant: ViraColorVariant.Neutral,
                            buttonSize: ViraSize.Small,
                        })}
                            ${listen('click', () => {
                                dispatch(new events.togglePaletteEditor());
                            })}
                        ></${ViraButton}>
                        <${ViraButton.assign({
                            text: 'Reset',
                            buttonEmphasis: ViraEmphasis.Subtle,
                            colorVariant: ViraColorVariant.Danger,
                            buttonSize: ViraSize.Small,
                        })}
                            ${listen('click', () => {
                                dispatch(new events.reset());
                            })}
                        ></${ViraButton}>
                        <${ViraInput.assign({
                            value: '',
                            placeholder: 'Paste',
                        })}
                            ${listen(ViraInput.events.valueChange, (event) => {
                                const rawJson = event.detail;
                                if (!rawJson) {
                                    return;
                                }

                                const parsed = parseColorJson(JSON.parse(rawJson));
                                updateState({
                                    pastedSwatchMap: parsed.swatchMap,
                                    latestGeneratedPalette: parsed.swatchMap,
                                });
                                dispatch(new events.jsonPaste(parsed));
                                const element = extractEventTarget(event, ViraInput);
                                assertWrap.instanceOf(
                                    element.shadowRoot.querySelector('input'),
                                    HTMLInputElement,
                                ).value = '';
                            })}
                        ></${ViraInput}>
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
