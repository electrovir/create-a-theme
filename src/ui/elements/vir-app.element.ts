import {css, defineElement, html} from 'element-vir';
import {createFrontendState} from '../../data/frontend-state.js';
import {VirCreateTheme} from './vir-create-theme.element.js';

export const VirApp = defineElement()({
    tagName: 'vir-app',
    styles: css`
        :host {
            display: flex;
            font-family: sans-serif;
            padding: 32px;
        }
    `,
    state() {
        return {
            frontendState: createFrontendState(),
        };
    },
    render({state}) {
        return html`
            <${VirCreateTheme.assign({
                frontendState: state.frontendState,
            })}></${VirCreateTheme}>
        `;
    },
});
