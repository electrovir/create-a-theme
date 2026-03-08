import {LocalStorageClient} from '@electrovir/local-storage-client';
import {defineShape} from 'object-shape-tester';
import {paletteEntryShape} from './palette-entry.js';

export function createAppLocalStorageClient() {
    return new LocalStorageClient({
        colors: defineShape(['']),
        paletteEntries: defineShape([paletteEntryShape]),
        showPaletteEditor: defineShape(false),
    });
}

export type AppLocalStorageClient = ReturnType<typeof createAppLocalStorageClient>;
