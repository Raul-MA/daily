export default {
  id: 'maranta',
  label: 'Maranta Prayer Plant',
  species: 'Maranta leuconeura',
  difficulty: 4,
  notes: 'Sus hojas se elevan por la noche: es un movimiento normal. Necesita humedad ambiental alta, calor estable y sustrato ligeramente húmedo. Los recordatorios indican cuándo revisar la tierra; no obligan a regar.',
  schedule: {
    wateringIntervalDays: 3,
    wateringSeasons: [{ startMonth: 10, endMonth: 2, intervalDays: 3 }, { startMonth: 3, endMonth: 9, intervalDays: 3 }],
    soilIntervalMonths: 18,
    fertilizerIntervalWeeks: 4,
    fertilizerSeasons: [{ startMonth: 3, endMonth: 8, intervalWeeks: 4 }, { startMonth: 9, endMonth: 2, intervalWeeks: null }],
  },
  guide: {
    water: 'Para interior en Puebla, con maceta de 15 × 15 cm y drenaje, revisa la tierra cada 3 días durante todo el año. Es una revisión provisional, no un riego obligatorio. Riega cuando la superficie empiece a secarse y debajo quede humedad ligera; no seques todo el cepellón. Usa agua templada de lluvia o de baja mineralización y vacía el plato. Registra los riegos necesarios durante 2–3 ciclos para ajustar el intervalo.',
    soil: 'Revisa raíces cada 18 meses; trasplanta en primavera si llenan la maceta. La mezcla de tierra, compost y perlita debe retener humedad ligera sin compactarse y drenar libremente. No cambies toda la tierra por calendario si las raíces están sanas y tienen espacio.',
    fertilizer: 'Marzo a agosto, cada 4 semanas mientras crezca, con fertilizante líquido para interior según la etiqueta. Pausa en sep–feb y si no hay crecimiento. Evita abonar tierra seca o una planta estresada.',
    light: 'Luz indirecta brillante o media, sin sol intenso. A 2 m de una ventana la luz depende del tamaño, orientación y obstáculos; comprueba que el lugar sea luminoso. Una cortina puede filtrar una ventana soleada.',
    humidity: 'Busca humedad superior al 50% y calor estable, idealmente 18–24°C. Evita corrientes y calefacción directa. Comprueba con higrómetro; un humidificador resulta más eficaz que pulverizar ocasionalmente.',
    alerts: ['Hojas elevadas por la noche → movimiento normal', 'Bordes secos o hojas enrolladas → revisa humedad, tierra seca y sales antes de regar', 'Hojas amarillas con tierra mojada → revisa drenaje y raíces', 'Punteado y telarañas finas → inspecciona ácaros; masas algodonosas → cochinilla'],
  },
};
