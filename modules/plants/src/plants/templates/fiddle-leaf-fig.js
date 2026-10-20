export default {
  id: 'fiddle-leaf-fig',
  label: 'Fiddle-leaf Fig',
  species: 'Ficus lyrata',
  difficulty: 3,
  notes: 'Árbol de hojas grandes en forma de violín. Necesita mucha luz y condiciones estables. Limpia el polvo con un paño húmedo. La savia irrita y la planta es tóxica si se ingiere. Los recordatorios requieren comprobar la humedad antes de regar.',
  schedule: {
    wateringIntervalDays: 7,
    wateringSeasons: [{ startMonth: 10, endMonth: 2, intervalDays: 7 }, { startMonth: 3, endMonth: 9, intervalDays: 7 }],
    soilIntervalMonths: 30,
    fertilizerIntervalWeeks: 2,
    fertilizerSeasons: [{ startMonth: 3, endMonth: 8, intervalWeeks: 2 }, { startMonth: 9, endMonth: 2, intervalWeeks: null }],
  },
  guide: {
    water: 'Para interior en Puebla, revisa la tierra cada 7 días durante todo el año; no es un riego obligatorio. Espera a que los primeros 5 cm estén secos y la zona profunda de raíces ya no esté muy mojada; no esperes a secar toda la maceta. En una maceta de unos 60 cm de diámetro y 80 cm de alto, un medidor corto no comprueba el fondo. Una varilla larga de madera sin tratar, insertada suavemente sin forzar raíces, ayuda a comprobar la humedad a la profundidad que alcance: tierra húmeda adherida o madera húmeda indican que queda humedad. Comprueba varios puntos; es una orientación, no una medición exacta. Riega a fondo cuando corresponda, deja escurrir y vacía el plato. Registra los riegos necesarios durante 2–3 ciclos para ajustar el intervalo.',
    soil: 'Revisa raíces cada 30 meses. Plantado directamente en una maceta grande, puede conservar humedad mucho tiempo si las raíces ocupan solo parte del sustrato; los agujeros no garantizan que el interior se seque. La mezcla de tierra, compost y perlita debe drenar libremente. Trasplanta en primavera solo cuando las raíces llenen la maceta, subiendo un tamaño.',
    fertilizer: 'Marzo a agosto, cada 2 semanas durante crecimiento activo con fertilizante equilibrado a media dosis, si la etiqueta lo permite. Pausa en sep–feb o sin crecimiento. El exceso de abono puede provocar caída de hojas.',
    light: 'Necesita luz indirecta muy brillante. A 2 m de una ventana puede recibir poca luz, según tamaño, orientación y obstáculos. Si el lugar es tenue, acércalo gradualmente a la ventana protegiéndolo del sol intenso; todas las hojas necesitan luz.',
    humidity: 'Temperatura estable, idealmente 18–24°C, y humedad moderada superior al 40%. Evita salidas de aire, calefacción y corrientes frías. Aclimata gradualmente los cambios de ubicación.',
    alerts: ['Caída brusca de hojas → revisa cambios térmicos, luz y exceso o falta de agua', 'Manchas cafés → comprueba humedad, sol y raíces; no tienen una sola causa', 'Crecimiento débil y hojas separadas → aumenta luz indirecta', 'Savia al podar → usa guantes y evita contacto; mantén lejos de niños y mascotas'],
  },
};
