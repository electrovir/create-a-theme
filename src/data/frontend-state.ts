import {createLocalStorageClient} from './local-storage.client.js';

export function createFrontendState() {
    return {
        localStorageClient: createLocalStorageClient(),
    };
}

export type FrontendState = ReturnType<typeof createFrontendState>;
