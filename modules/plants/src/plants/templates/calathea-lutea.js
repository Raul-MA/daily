export default {
  id: 'calathea-lutea',
  label: 'Cigar Calathea',
  species: 'Calathea lutea',
  difficulty: 4,
  notes: 'Calatea grande de hojas anchas con envés plateado y ceroso; puede alcanzar 3 m en condiciones tropicales. Necesita espacio, humedad y calor. El envés ceroso y el movimiento nocturno son normales. Los intervalos son recordatorios para revisar, no riegos obligatorios.',
  schedule: {
    wateringIntervalDays: 3,
    wateringSeasons: [{ startMonth: 10, endMonth: 2, intervalDays: 3 }, { startMonth: 3, endMonth: 9, intervalDays: 3 }],
    soilIntervalMonths: 24,
    fertilizerIntervalWeeks: 4,
    fertilizerSeasons: [{ startMonth: 3, endMonth: 8, intervalWeeks: 4 }, { startMonth: 9, endMonth: 2, intervalWeeks: null }],
  },
  guide: {
    water: 'Para interior en Puebla, con maceta de 15 × 15 cm y drenaje, revisa la tierra cada 3 días durante todo el año. Es una revisión provisional, no un riego obligatorio. Riega cuando la superficie empiece a secarse y debajo quede humedad ligera; no seques todo el cepellón. Vacía el plato y ajusta según la tierra. Registra los riegos necesarios durante 2–3 ciclos para ajustar el intervalo.',
    soil: 'Revisa cada 24 meses y trasplanta cuando la mata llene la maceta, en primavera o verano. La mezcla de tierra, compost y perlita debe retener humedad sin compactarse y drenar por los agujeros. Se puede propagar por división del rizoma.',
    fertilizer: 'Marzo a agosto, cada 4 semanas con fertilizante líquido equilibrado según etiqueta y crecimiento. Pausa en sep–feb. Si el sustrato ya contiene abono de liberación lenta, evita duplicar la alimentación.',
    light: 'Luz filtrada o semisombra; en interior busca luz indirecta brillante. A 2 m de una ventana la luz depende del tamaño, orientación y obstáculos; comprueba la luminosidad. Protege del sol intenso y deja espacio para las hojas.',
    humidity: 'Prefiere ambiente tropical húmedo y calor estable. Evita frío, corrientes y aire seco de calefacción. La guía general de calateas orienta el cultivo en maceta; observa la respuesta de esta especie grande.',
    alerts: ['Envés plateado y ceroso → rasgo normal; no intentes quitarlo', 'Hojas plegadas por la noche → movimiento normal', 'Bordes secos o enrollados → revisa humedad y riego', 'Manchas húmedas y tierra saturada → reduce exceso de agua y revisa drenaje', 'Punteado o telarañas → inspecciona ácaros y aísla si hay plaga'],
  },
};
