export function createRandomColor(): string {
    // eslint-disable-next-line sonarjs/pseudo-random
    const randomHex = Math.floor(Math.random() * 16_777_215)
        .toString(16)
        .padStart(6, '0');
    return `#${randomHex}`;
}
