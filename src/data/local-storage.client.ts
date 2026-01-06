import {LocalStorageClient} from '@electrovir/local-storage-client';
import {defineShape} from 'object-shape-tester';

const localStorageShapes = {
    startingColors: defineShape(['']),
};

export function createLocalStorageClient() {
    return new LocalStorageClient(localStorageShapes);
}
