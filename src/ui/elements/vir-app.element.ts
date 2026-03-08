import {type BookPage, ElementBookApp} from 'element-book';
import {css, defineElement, html, listen, nothing} from 'element-vir';
import {createColorThemeBookPages} from 'theme-vir';
import {generateColorThemeFromSwatchMap} from '../../data/generate-code.js';
import {initColors} from '../../data/init-colors.js';
import {
    type AppLocalStorageClient,
    createAppLocalStorageClient,
} from '../../data/local-storage.client.js';
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
    `,
    state() {
        const appLocalStorageClient = createAppLocalStorageClient();

        return {
            appDbClient: appLocalStorageClient,
            colorThemePages: [] as BookPage[],
            storedData: getStoredData(appLocalStorageClient),
        };
    },
    render({state, updateState}) {
        const storedData = state.storedData;
        const paletteEntries = storedData.paletteEntries || defaultPaletteEntries;

        return html`
            <section class="palette-generator">
                ${storedData.showPaletteEditor
                    ? html`
                          <${VirPaletteEditor.assign({
                              paletteEntries,
                          })}
                              ${listen(VirPaletteEditor.events.paletteEntriesChange, (event) => {
                                  state.appDbClient.set.paletteEntries(event.detail);
                                  updateState({
                                      storedData: getStoredData(state.appDbClient),
                                  });
                              })}
                          ></${VirPaletteEditor}>
                      `
                    : nothing}
                <${VirCreateTheme.assign({
                    paletteEntries,
                    colors: storedData.colors || initColors,
                })}
                    ${listen(VirCreateTheme.events.colorsChange, (event) => {
                        state.appDbClient.set.colors(event.detail);
                        updateState({
                            storedData: getStoredData(state.appDbClient),
                        });
                    })}
                    ${listen(VirCreateTheme.events.generateTheme, (event) => {
                        const {darkOverride, defaultLight} = generateColorThemeFromSwatchMap(
                            'vir',
                            event.detail,
                        );

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
                    ${listen(VirCreateTheme.events.togglePaletteEditor, () => {
                        state.appDbClient.set.showPaletteEditor(!storedData.showPaletteEditor);
                        updateState({
                            storedData: getStoredData(state.appDbClient),
                        });
                    })}
                    ${listen(VirCreateTheme.events.reset, () => {
                        const showPaletteEditor = !!storedData.showPaletteEditor;
                        state.appDbClient.clear();
                        state.appDbClient.set.showPaletteEditor(showPaletteEditor);
                        updateState({
                            storedData: getStoredData(state.appDbClient),
                        });
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
});

function getStoredData(appDbClient: AppLocalStorageClient) {
    const allValues = appDbClient.getAllValues();
    allValues.paletteEntries?.sort((a, b) => a.levelKey - b.levelKey);
    return allValues;
}
