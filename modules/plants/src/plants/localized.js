import { PLANT_TEMPLATES } from './plant-templates.js';
import sabila from './translations/sabila.js';
import castIron from './translations/cast-iron.js';
import zz from './translations/zz-plant.js';
import snake from './translations/snake-plant.js';
import pothos from './translations/pothos.js';
import evergreen from './translations/chinese-evergreen.js';
import dracaena from './translations/dracaena.js';
import brasil from './translations/palo-de-brasil.js';
import rubber from './translations/rubber-plant.js';
import bamboo from './translations/lucky-bamboo.js';
import monstera from './translations/monstera.js';
import peace from './translations/peace-lily.js';
import xanadu from './translations/xanadu.js';
import maranta from './translations/maranta.js';
import calatheaLutea from './translations/calathea-lutea.js';
import fiddleLeafFig from './translations/fiddle-leaf-fig.js';

const english = { sabila, 'cast-iron': castIron, 'zz-plant': zz, 'snake-plant': snake, pothos, 'chinese-evergreen': evergreen, dracaena, 'palo-de-brasil': brasil, 'rubber-plant': rubber, 'lucky-bamboo': bamboo, monstera, 'peace-lily': peace, xanadu, maranta, 'calathea-lutea': calatheaLutea, 'fiddle-leaf-fig': fiddleLeafFig };
const spanish = { sabila: 'Sábila / Aloe vera', 'cast-iron': 'Aspidistra', 'zz-plant': 'Planta ZZ', 'snake-plant': 'Lengua de suegra', pothos: 'Pothos', 'chinese-evergreen': 'Aglaonema', dracaena: 'Drácena', 'palo-de-brasil': 'Palo de Brasil', 'rubber-plant': 'Árbol del caucho', 'lucky-bamboo': 'Bambú de la suerte (en tierra)', monstera: 'Monstera', 'peace-lily': 'Lirio de la paz', xanadu: 'Xanadu', maranta: 'Maranta / Planta de la oración', 'calathea-lutea': 'Calatea lutea / Bijao', 'fiddle-leaf-fig': 'Ficus lyrata / Higuera de hoja de violín' };
export function plantTemplates(language = 'es') {
  return PLANT_TEMPLATES.map(template => {
    const content = language === 'en' ? english[template.id] : { label: spanish[template.id] };
    return structuredClone({ ...template, ...content });
  });
}
