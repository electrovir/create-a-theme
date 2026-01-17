import {type BookPage, ElementBookApp} from 'element-book';
import {asyncProp, css, defineElement, html, listen, nothing, renderAsync} from 'element-vir';
import {createColorThemeBookPages} from 'theme-vir';
import {LoaderAnimated24Icon, ViraIcon} from 'vira';
import {generateColorThemeFromSwatchMap} from '../../data/generate-code.js';
import {initColors} from '../../data/init-colors.js';
import {createAppDbClient} from '../../data/local-db.client.js';
import {defaultPaletteEntries} from '../../data/palette-entry.js';
import {VirCreateTheme} from './vir-create-theme.element.js';
import {VirPaletteEditor} from './vir-palette-editor.element.js';

export const VirApp = defineElement()({
    tagName: 'vir-app',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            font-family: sans-serif;
            gap: 32px;
        }

        .palette-generator {
            padding: 32px;
            display: flex;
            font-family: sans-serif;
            gap: 16px;
        }

        .loading-icon {
            margin: 32px;
        }
    `,
    state() {
        const appDbClient = createAppDbClient();

        return {
            appDbClient,
            colorThemePages: [] as BookPage[],
            storedData: asyncProp({
                defaultValue: appDbClient.getAllValues().then((allValues) => {
                    allValues.paletteEntries?.sort((a, b) => a.levelKey - b.levelKey);

                    return allValues;
                }),
            }),
        };
    },
    render({state, updateState}) {
        return renderAsync(
            state.storedData,
            html`
                <${ViraIcon.assign({
                    icon: LoaderAnimated24Icon,
                })}
                    class="loading-icon"
                ></${ViraIcon}>
            `,
            (storedData) => {
                const paletteEntries = storedData.paletteEntries || defaultPaletteEntries;

                return html`
                    <section class="palette-generator">
                        ${storedData.showPaletteEditor
                            ? html`
                                  <${VirPaletteEditor.assign({
                                      paletteEntries,
                                  })}
                                      ${listen(
                                          VirPaletteEditor.events.paletteEntriesChange,
                                          (event) => {
                                              state.storedData.setValue({
                                                  ...storedData,
                                                  paletteEntries: event.detail,
                                              });

                                              void state.appDbClient.set.paletteEntries(
                                                  event.detail,
                                              );
                                          },
                                      )}
                                  ></${VirPaletteEditor}>
                              `
                            : nothing}
                        <${VirCreateTheme.assign({
                            paletteEntries,
                            colors: storedData.colors || initColors,
                        })}
                            ${listen(VirCreateTheme.events.colorsChange, async (event) => {
                                state.storedData.setValue({
                                    ...storedData,
                                    colors: event.detail,
                                });

                                await state.appDbClient.set.colors(event.detail);
                            })}
                            ${listen(VirCreateTheme.events.generateTheme, (event) => {
                                const {darkOverride, defaultLight} =
                                    generateColorThemeFromSwatchMap('vir', event.detail);

                                const colorThemePages = createColorThemeBookPages({
                                    theme: defaultLight,
                                    title: 'Theme',
                                    hideInverseColors: true,
                                    parent: undefined,
                                    overrides: [
                                        darkOverride,
                                    ],
                                    hideCopyCode: true,
                                });

                                updateState({
                                    colorThemePages,
                                });
                            })}
                            ${listen(VirCreateTheme.events.togglePaletteEditor, async () => {
                                const showPaletteEditor = !storedData.showPaletteEditor;

                                state.storedData.setValue({
                                    ...storedData,
                                    showPaletteEditor,
                                });

                                await state.appDbClient.set.showPaletteEditor(showPaletteEditor);
                            })}
                            ${listen(VirCreateTheme.events.reset, async () => {
                                const showPaletteEditor = !!storedData.showPaletteEditor;
                                state.storedData.setValue({
                                    showPaletteEditor,
                                });

                                await state.appDbClient.clear();
                                await state.appDbClient.set.showPaletteEditor(showPaletteEditor);
                            })}
                        ></${VirCreateTheme}>
                    </section>
                    ${state.colorThemePages.length
                        ? html`
                              <${ElementBookApp.assign({
                                  pages: state.colorThemePages,
                                  blockNavigation: true,
                              })}></${ElementBookApp}>
                          `
                        : nothing}
                `;
            },
        );
    },
});
