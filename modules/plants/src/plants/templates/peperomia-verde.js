export default {
  id: 'peperomia-verde',
  label: 'Green Peperomia / Baby Rubber Plant',
  species: 'Peperomia obtusifolia',
  difficulty: 2,
  notes: 'Identificación provisional de «peperomia verde»: Peperomia obtusifolia, de hojas gruesas, lisas, ovaladas y brillantes. Confirma la etiqueta si las hojas son distintas. Las espigas delgadas son flores normales. Los recordatorios indican cuándo comprobar humedad, no un riego obligatorio.',
  schedule: {
    wateringIntervalDays: 7,
    wateringSeasons: [{ startMonth: 10, endMonth: 2, intervalDays: 10 }, { startMonth: 3, endMonth: 9, intervalDays: 7 }],
    soilIntervalMonths: 24,
    fertilizerIntervalWeeks: 2,
    fertilizerSeasons: [{ startMonth: 3, endMonth: 8, intervalWeeks: 2 }, { startMonth: 9, endMonth: 2, intervalWeeks: null }],
  },
  guide: {
    water: 'Para interior en Puebla: época fresca (oct–feb), revisa cada 10 días; época cálida (mar–sep), cada 7 días. Son revisiones provisionales, no riegos obligatorios. En primavera cálida y seca comprueba antes si seca rápido; durante las lluvias y días nublados puede tardar más en secarse, aunque sea verano. La lluvia exterior no riega una maceta dentro de casa. Deja secar parcialmente el sustrato entre riegos, comprobando con el dedo bajo la superficie. Si sigue húmedo, espera; evita tanto el encharcamiento como la sequedad extrema prolongada. Cuando corresponda, riega a fondo, deja escurrir y vacía el plato o cubremaceta. Con menos luz o crecimiento necesitará menos agua. Registra los riegos necesarios durante 2–3 ciclos para ajustar la revisión al tamaño de maceta y al ambiente.',
    soil: 'Revisa raíces y sustrato cada 24 meses; no cambies tierra por calendario. Usa mezcla aireada para plantas de interior con perlita o corteza y una maceta con agujeros, apenas mayor que el cepellón. Trasplanta en primavera si las raíces llenan la maceta; demasiado sustrato sin raíces permanece húmedo. Si usas tierra, compost y perlita, comprueba que no se compacte ni retenga agua demasiado tiempo.',
    fertilizer: 'Marzo a agosto, cada 2 semanas solo durante crecimiento activo, con fertilizante líquido a media dosis si la etiqueta lo permite. Pausa en sep–feb o sin crecimiento. En Puebla, aprovecha el crecimiento de primavera y verano; la lluvia exterior por sí sola no justifica abonar. La ventana es un valor editable del formulario; ajusta al crecimiento real y no abones una planta estresada.',
    light: 'Luz indirecta brillante; protege del sol intenso que puede quemar las hojas. La forma verde tolera menos luz, pero crecerá más despacio. Si está a 2 m de una ventana en interior en Puebla, comprueba la luminosidad real: distancia, orientación y obstáculos importan. Acércala gradualmente si el crecimiento se alarga o debilita.',
    humidity: 'Suele adaptarse a la humedad normal del hogar; no requiere el ambiente constantemente húmedo de una calatea. Busca calor estable, aproximadamente 18–30°C, evitando corrientes frías y calefacción directa. En las noches frescas de Puebla, aléjala del vidrio frío y de ventanas abiertas; en época seca revisa la humedad real del cuarto antes de añadir humidificación.',
    alerts: ['Hojas amarillas o caída con tierra mojada → revisa exceso de agua, drenaje y raíces', 'Tallos blandos o colapso → comprueba posible pudrición antes de añadir agua', 'Hojas quemadas o crecimiento alargado → revisa sol intenso o falta de luz', 'Masas algodonosas, telarañas finas o mosquitas blancas → inspecciona cochinillas, ácaros y mosca blanca'],
  },
};
