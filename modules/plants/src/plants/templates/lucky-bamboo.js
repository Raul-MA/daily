export default {
  "id": "lucky-bamboo",
  "label": "Lucky Bamboo (en tierra)",
  "species": "Dracaena sanderiana",
  "difficulty": 3,
  "notes": "Puede crecer en tierra húmeda o en agua sin cloro. Esta plantilla programa cuidados para una planta en tierra; si la cultivas en agua, cambia el agua semanalmente y usa los recordatorios de riego para registrar ese cambio. Tóxica para mascotas.",
  "schedule": {
    "wateringIntervalDays": 10,
    "wateringSeasons": [
      {
        "startMonth": 10,
        "endMonth": 2,
        "intervalDays": 14
      },
      {
        "startMonth": 3,
        "endMonth": 9,
        "intervalDays": 10
      }
    ],
    "soilIntervalMonths": 24,
    "fertilizerIntervalWeeks": 4,
    "fertilizerSeasons": [
      {
        "startMonth": 3,
        "endMonth": 8,
        "intervalWeeks": 4
      },
      {
        "startMonth": 9,
        "endMonth": 2,
        "intervalWeeks": null
      }
    ]
  },
  "guide": {
    "water": "Esta plantilla asume cultivo en tierra: mantenla moderadamente húmeda, revisando cada 2 semanas en época fresca y cada 7–10 días en época cálida. Si está en agua, cambia toda el agua semanalmente, usa agua sin cloro y mantén cubiertas las raíces, no los tallos. El agua filtrada o reposada puede servir según la química local.",
    "soil": "En tierra, cambia el sustrato cada 2 años o cuando las raíces llenen la maceta; usa una mezcla rica pero drenante. Si está en agua, la tarea equivalente es limpiar mensualmente el recipiente y las piedras.",
    "fertilizer": "En tierra, aplica fertilizante para interior a un cuarto de dosis una vez al mes durante el crecimiento. En agua necesita muchísimo menos: usa solo un producto apto para hidroponía, muy diluido y según su etiqueta.",
    "light": "Luz indirecta media a baja. Nunca sol directo — le quema los tallos y los amarillea. En luz muy baja sobrevive pero crece muy lento.",
    "humidity": "Prefiere calor, humedad moderada y ausencia de corrientes frías. Mantenla por encima de 15°C para crecimiento saludable. Las puntas cafés pueden deberse a aire seco, sales, químicos del agua o riego irregular.",
    "alerts": [
      "Tallo amarillo → revisa exceso de agua o fertilizante, agua de mala calidad, frío y sol directo",
      "Manchas cafés secas → posible quemadura por sol o acumulación de sales",
      "Raíces cafés, blandas u olor desagradable → limpia el recipiente o revisa pudrición en tierra",
      "Algas en el recipiente → demasiada luz sobre el agua o limpieza insuficiente"
    ]
  }
};
