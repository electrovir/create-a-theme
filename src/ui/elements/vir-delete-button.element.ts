import {css, defineElement, html} from 'element-vir';
import {noNativeFormStyles, viraAnimationDurations, ViraIcon, viraIconCssVars, X24Icon} from 'vira';

export const VirDeleteButton = defineElement()({
    tagName: 'vir-delete-button',
    styles: css`
        :host {
            display: flex;
            align-items: center;
        }

        button {
            ${noNativeFormStyles}
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border-radius: 8px;
            transition: ${viraAnimationDurations['vira-interaction-animation-duration'].value};

            &:hover {
                background-color: #f0f0f0;
                color: red;
                ${viraIconCssVars['vira-icon-stroke-width'].name}: 3px;
            }
        }
    `,
    render() {
        return html`
            <button>
                <${ViraIcon.assign({
                    icon: X24Icon,
                })}></${ViraIcon}>
            </button>
        `;
    },
});
