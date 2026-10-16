const staticSpanish = {
  'Reader Picker home': 'Inicio de Reader', 'Open settings': 'Abrir configuración', Settings: 'Configuración',
  'Pick something to finish.': 'Elige algo para terminar.',
  'Choose a reading window and get unfinished items that fit.': 'Elige tu tiempo disponible y encuentra lecturas pendientes que encajen.',
  'Picker options': 'Opciones de selección', 'Time left': 'Tiempo disponible', '5 minutes': '5 minutos', '10 minutes': '10 minutos',
  '15 minutes': '15 minutos', '20 minutes': '20 minutos', '30 minutes': '30 minutos', 'Any length': 'Cualquier duración', Custom: 'Personalizado',
  Options: 'Opciones', '1 option': '1 opción', '3 options': '3 opciones', '5 options': '5 opciones', 'Pick for me': 'Elegir por mí',
  'Custom minutes': 'Minutos personalizados', 'Custom count': 'Cantidad personalizada', 'CONTINUE READING': 'SEGUIR LEYENDO',
  'Last opened item': 'Última lectura abierta', 'Reader picks': 'Lecturas seleccionadas', 'Refresh Reader': 'Actualizar Reader',
  'Pick different items': 'Elegir otras lecturas', 'LOCAL SETTINGS': 'CONFIGURACIÓN LOCAL', 'Close settings': 'Cerrar configuración', Close: 'Cerrar',
  'Readwise access token': 'Token de acceso de Readwise', 'Paste token': 'Pega el token',
  'Kept in memory unless you choose to retain it for this browser session. It is never added to the URL.': 'Solo se mantiene en memoria salvo que lo guardes para esta sesión del navegador. Nunca se añade a la URL.',
  'Keep token until this browser session ends': 'Guardar el token hasta cerrar esta sesión del navegador',
  'Save token on this installed app': 'Guardar el token en esta aplicación instalada',
  'Kept in memory unless you choose to save it on this installed app. It is never added to the URL.': 'Solo se mantiene en memoria salvo que lo guardes en esta aplicación instalada. Nunca se añade a la URL.',
  'Locations, in priority order': 'Ubicaciones por orden de prioridad', Inbox: 'Entrada', Later: 'Más tarde', Shortlist: 'Selección',
  'Move up': 'Subir', 'Move down': 'Bajar', Progress: 'Progreso', 'Unread + started, excluding completed': 'Sin leer e iniciadas, sin las terminadas',
  'Started but not completed': 'Iniciadas y sin terminar', 'Unread only': 'Solo sin leer', 'Cache duration': 'Duración de la caché', '1 hour': '1 hora',
  'Maximum documents scanned per location': 'Máximo de documentos consultados por ubicación',
  'Higher values produce broader randomness but require more API requests.': 'Los valores mayores amplían la selección, pero requieren más solicitudes a la API.',
  'Picker behavior': 'Comportamiento de la selección', 'Update the URL when picking': 'Actualizar la URL al elegir',
  'The URL will contain the current options and run automatically when opened, so you can copy or bookmark it.': 'La URL incluirá estas opciones y se ejecutará al abrirla; puedes copiarla o guardarla.',
  'Open automatically when Options is 1': 'Abrir automáticamente al elegir una sola lectura', 'Remember the last item opened': 'Recordar la última lectura abierta',
  'Shows it again next time unless it has been archived or finished.': 'Se mostrará de nuevo salvo que se haya archivado o terminado.',
  'Selection policy': 'Método de selección', 'Started first': 'Primero las iniciadas', 'Uniform random': 'Aleatorio uniforme',
  'Include unknown durations within a time budget': 'Incluir duraciones desconocidas con un límite de tiempo', 'Test token': 'Probar token', Save: 'Guardar',
  'Forget token and cache': 'Olvidar token y caché', 'Clear all local data': 'Borrar los datos de Reader',
  'Reader preferences': 'Preferencias de Reader', 'Number of items (1–20)': 'Número de lecturas (1–20)',
  'Maximum remaining minutes (0 = any)': 'Máximo de minutos restantes (0 = sin límite)', 'Save Reader preferences': 'Guardar preferencias de Reader',
};
const en = {
  summary: 'Get {count} with {time}, prioritizing started items, then {locations}.', uniformSummary: 'Get {count} with {time}, choosing uniformly within the scanned pool.', oneItem: 'one item', options: '{count} options', window: '{minutes} minutes or less remaining', any: 'any amount of time remaining',
  left: '{count} min left', progress: '{count}% read', unread: 'Unread', unknown: 'Unknown duration', total: '{count} min total', open: 'Open in Reader ↗',
  inbox: 'Inbox', later: 'Later', shortlist: 'Shortlist', loading: 'Finding unfinished items…', found: '{count} items found.',
  fewer: '{count} of {requested} items found. Fewer matching items are available in the scanned pool.', empty: 'No matching unfinished items were found.',
  missingToken: 'Add your Readwise token in Settings.', saved: 'Settings saved.', preferencesSaved: 'Reader preferences saved.', paste: 'Paste a token first.',
  validToken: 'Token works.', invalidToken: 'Token not accepted ({status}).', forgotten: 'Token and cached documents removed.',
  conflict: 'Data changed in another view. Your draft has been kept.', rate: 'Readwise rate limit reached. Try again in {seconds} seconds.',
  failed: 'Readwise request failed ({status}).', network: 'Could not reach Readwise. Check the connection and browser access.',
  storage: 'Saving failed. The previous saved data has been kept.', aborted: 'Request canceled or timed out.',
};
const es = {
  summary: 'Elige {count} con {time}, priorizando las iniciadas y luego {locations}.', uniformSummary: 'Elige {count} con {time}, al azar entre las lecturas consultadas.', oneItem: 'una lectura', options: '{count} opciones', window: '{minutes} minutos restantes como máximo', any: 'cualquier duración restante',
  left: '{count} min restantes', progress: '{count}% leído', unread: 'Sin leer', unknown: 'Duración desconocida', total: '{count} min en total', open: 'Abrir en Reader ↗',
  inbox: 'Entrada', later: 'Más tarde', shortlist: 'Selección', loading: 'Buscando lecturas pendientes…', found: '{count} lecturas encontradas.',
  fewer: '{count} de {requested} lecturas encontradas. Hay menos coincidencias en el grupo consultado.', empty: 'No hay lecturas pendientes que coincidan.',
  missingToken: 'Añade tu token de Readwise en Configuración.', saved: 'Configuración guardada.', preferencesSaved: 'Preferencias de Reader guardadas.', paste: 'Pega primero un token.',
  validToken: 'El token funciona.', invalidToken: 'Token no aceptado ({status}).', forgotten: 'Token y documentos en caché eliminados.',
  conflict: 'Los datos cambiaron en otra vista. Se ha conservado tu borrador.', rate: 'Se alcanzó el límite de Readwise. Reintenta en {seconds} segundos.',
  failed: 'La solicitud a Readwise falló ({status}).', network: 'No se pudo contactar con Readwise. Comprueba la conexión y el acceso del navegador.',
  storage: 'No se pudo guardar. Se han conservado los datos guardados anteriores.', aborted: 'Solicitud cancelada o agotada.',
};
export function readerText(language, key, values = {}) {
  const dictionary = language === 'es' ? es : en;
  return (dictionary[key] ?? key).replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match));
}
export function translateMarkup(host, language) {
  if (language !== 'es') return;
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = node.textContent.trim();
    if (Object.hasOwn(staticSpanish, value)) node.textContent = node.textContent.replace(value, staticSpanish[value]);
  }
  for (const node of host.querySelectorAll('[aria-label], [placeholder]')) {
    for (const attribute of ['aria-label', 'placeholder']) {
      const value = node.getAttribute(attribute);
      if (Object.hasOwn(staticSpanish, value)) node.setAttribute(attribute, staticSpanish[value]);
    }
  }
}
export function readerError(language, error) {
  if (error.retryAfterSeconds) return readerText(language, 'rate', { seconds: error.retryAfterSeconds });
  if (error.status) return readerText(language, error.status === 401 ? 'invalidToken' : 'failed', { status: error.status });
  if (/changed|conflict/i.test(error.message)) return readerText(language, 'conflict');
  if (/quota|storage/i.test(error.message)) return readerText(language, 'storage');
  if (/Failed to fetch|NetworkError/i.test(error.message)) return readerText(language, 'network');
  if (/abort|time.*out/i.test(error.message)) return readerText(language, 'aborted');
  return error.message;
}
