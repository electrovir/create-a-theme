import {LocalDbClient} from 'local-db-client';
import {defineShape} from 'object-shape-tester';
import {paletteEntryShape} from './palette-entry.js';

export function createAppDbClient() {
    return new LocalDbClient({
        colors: defineShape(['']),
        paletteEntries: defineShape([paletteEntryShape]),
        showPaletteEditor: defineShape(false),
    });
}

export type AppDbClient = ReturnType<typeof createAppDbClient>;
