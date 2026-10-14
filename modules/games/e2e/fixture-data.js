import { readFileSync } from 'node:fs';
export function fixtureData(filename, now) {
    const template = readFileSync(new URL(`fixtures/${filename}`, import.meta.url), 'utf8');
    return JSON.parse(template.replaceAll('"__NOW__"', JSON.stringify(now)));
}
