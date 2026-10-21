async function importFile(page, value) {
  await page.locator('#whatsapp-import-file').setInputFiles({ name: 'visual-draft.json', mimeType: 'application/json', buffer: Buffer.from(value) });
}

function backupStates(root) {
  const backup = JSON.stringify({ app: 'daily-whatsapp', schemaVersion: 1, data: root.modules.whatsapp.data });
  return [
    { name: 'import-preview', prepare: async page => { await importFile(page, backup); await page.locator('#whatsapp-import-preview').waitFor(); } },
    { name: 'import-recovery-ready', prepare: async page => {
      await importFile(page, backup); await page.locator('#whatsapp-import-preview').waitFor();
      await page.locator('#whatsapp-import-recovery').click();
    } },
    { name: 'invalid-import', prepare: async page => {
      await importFile(page, 'invalid');
      await page.waitForFunction(() => document.querySelector('#whatsapp-import-status')?.textContent.length > 0);
    } },
  ].map(view => ({ ...view, root, url: '/daily/#/whatsapp/settings' }));
}

export function whatsappStates(fixture) {
  const valid = structuredClone(fixture.active);
  valid.modules.whatsapp.data.draft = { recipient: 'Weekend walking group', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: '10:30', message: 'Shall we meet at the park entrance at ten?\nBring a bottle of water and something for lunch.' };
  const empty = structuredClone(valid); empty.modules.whatsapp.data.draft = null;
  const spanish = structuredClone(valid); spanish.preferences.language = 'es';
  spanish.modules.whatsapp.data.draft.recipient = 'Amigos del grupo de excursiones del fin de semana';
  spanish.modules.whatsapp.data.draft.message = '¿Nos vemos en la entrada del parque a las diez?\nTraed agua y algo para comer. '.repeat(5);
  const composer = '/daily/#/whatsapp';
  return [
    { name: 'empty', root: empty, url: composer },
    { name: 'valid', root: valid, url: composer },
    { name: 'manual-copy', root: valid, url: composer, scroll: 'bottom', prepare: async page => {
      await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: () => Promise.reject(new Error('Synthetic clipboard denial')) }));
      await page.locator('#copy').click(); await page.locator('#manual-copy').waitFor();
    } },
    ...backupStates(valid),
    { name: 'spanish-composer', root: spanish, url: composer },
    { name: 'spanish-settings', root: spanish, url: '/daily/#/whatsapp/settings' },
    { name: 'dark-composer', root: valid, url: composer, colorScheme: 'dark' },
    { name: 'dark-settings', root: valid, url: '/daily/#/whatsapp/settings', colorScheme: 'dark' },
  ];
}
