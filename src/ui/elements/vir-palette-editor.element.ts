import {checkWrap} from '@augment-vir/assert';
import {filterOutIndexes} from '@augment-vir/common';
import {extractEventTarget, waitForAnimationFrame} from '@augment-vir/web';
import {css, defineElement, defineElementEvent, html, listen} from 'element-vir';
import {noNativeFormStyles, ViraButton, viraFontCssVars} from 'vira';
import {type PaletteEntry} from '../../data/palette-entry.js';
import {VirDeleteButton} from './vir-delete-button.element.js';

/**
 * An element that allows the user to customize palette entries. Accepts the current palette entries
 * as input and emits an event when any entry is edited.
 *
 * @category Elements
 */
export const VirPaletteEditor = defineElement<{
    /** The current palette entries to display and edit. */
    paletteEntries: ReadonlyArray<Readonly<PaletteEntry>>;
}>()({
    tagName: 'vir-palette-editor',
    events: {
        paletteEntriesChange: defineElementEvent<PaletteEntry[]>(),
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
        }

        td {
            font-family: ${viraFontCssVars['vira-monospace'].value};
            font-size: 16px;
        }

        th {
            font-size: 12px;
        }

        td,
        th {
            padding: 0 8px;
        }

        button {
            ${noNativeFormStyles}
            cursor: pointer;
        }

        input {
            font: inherit;
            padding: 4px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
    `,
    render({inputs, dispatch, events}) {
        const rows = inputs.paletteEntries.map((paletteEntry, entryIndex) => {
            async function updateEntry(key: keyof PaletteEntry, event: Event) {
                const value = checkWrap.isNumber(
                    Number(extractEventTarget(event, HTMLInputElement).value),
                );

                if (value == undefined) {
                    return;
                }
                await waitForAnimationFrame();

                dispatch(
                    new events.paletteEntriesChange(
                        inputs.paletteEntries.map((innerEntry, innerIndex) => {
                            if (innerIndex === entryIndex) {
                                return {
                                    ...innerEntry,
                                    [key]: value,
                                };
                            } else {
                                return innerEntry;
                            }
                        }),
                    ),
                );
            }
            return html`
                <tr>
                    <td>
                        <input
                            type="number"
                            .value=${String(paletteEntry.levelKey)}
                            min="0"
                            max="1000"
                            step="1"
                            ${listen('input', async (event) => {
                                await updateEntry('levelKey', event);
                            })}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            .value=${String(paletteEntry.whiteContrast)}
                            min="0"
                            max="108"
                            step="1"
                            ${listen('input', async (event) => {
                                await updateEntry('whiteContrast', event);
                            })}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            .value=${String(paletteEntry.chromaScale)}
                            min="0"
                            max="1"
                            step="0.01"
                            ${listen('input', async (event) => {
                                await updateEntry('chromaScale', event);
                            })}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            .value=${String(paletteEntry.targetLightness)}
                            min="0"
                            max="1"
                            step="0.01"
                            ${listen('input', async (event) => {
                                await updateEntry('targetLightness', event);
                            })}
                        />
                    </td>
                    <td>
                        <${VirDeleteButton}
                            ${listen('click', () => {
                                dispatch(
                                    new events.paletteEntriesChange(
                                        filterOutIndexes(inputs.paletteEntries, [entryIndex]),
                                    ),
                                );
                            })}
                        ></${VirDeleteButton}>
                    </td>
                </tr>
            `;
        });

        return html`
            <table>
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>White Contrast</th>
                        <th>Chroma Scale</th>
                        <th>Target Lightness</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <${ViraButton.assign({
                text: 'Add Level',
            })}
                ${listen('click', () => {
                    dispatch(
                        new events.paletteEntriesChange([
                            ...inputs.paletteEntries,
                            {
                                chromaScale: 1,
                                levelKey: -1,
                                whiteContrast: 50,
                                targetLightness: 0,
                            },
                        ]),
                    );
                })}
            ></${ViraButton}>
        `;
    },
});
