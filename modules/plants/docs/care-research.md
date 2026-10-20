# Plant care research

## Problem

The three additions researched on 2026-10-20 need the same offline EN/ES notes, five care sections, warning signs and editable schedule defaults as the thirteen original templates. “Maranta Prayer Plant” is interpreted as *Maranta leuconeura*; “clathea lutea” and “ficus lirata” are normalized to *Calathea lutea* and *Ficus lyrata*. Cultivars were not specified.

## How It Works

Spanish data lives in `../src/plants/templates/`; English overlays live in `../src/plants/translations/`. The catalogue and `localized.js` register all sixteen. Selecting a template fills a draft; it does not create personal plant records automatically.

| Template | Main findings | Sources |
| --- | --- | --- |
| Maranta | Filtered light, consistently moist but draining mix, high humidity; leaf lifting at night is normal. Check moisture, dry air and salts before treating brown edges. Repot when crowded. | [RHS species profile](https://www.rhs.org.uk/plants/119598/maranta-leuconeura/details), [NYBG prayer plant guide](https://libguides.nybg.org/prayerplant) |
| Calathea lutea | Large rhizomatous tropical plant, potentially 3 m tall; silvery wax beneath leaves and nightly folding are normal. Shade/filtered light and abundant moisture suit it; container drainage remains essential. | [NParks species profile](https://www.nparks.gov.sg/florafaunaweb/flora/1/7/1751), [Kew accepted name and habitat](https://powo.science.kew.org/taxon/60458866-2) |
| Ficus lyrata | Very bright filtered indoor light; let the upper soil dry before watering. Stable warmth, drainage and clean leaves matter. Leaf drop and brown spots have multiple causes. Irritating sap; harmful if ingested. | [NYBG fiddle-leaf fig guide](https://libguides.nybg.org/fiddleleaffig), [NC State Extension species profile](https://plants.ces.ncsu.edu/plants/ficus-lyrata/) |

The [RHS calathea guide](https://www.rhs.org.uk/plants/calathea/growing-guide) supplies general container soil, feeding and troubleshooting guidance for Calathea lutea where the species sources lack those details. This is an extrapolation from calatheas grown as houseplants, not species-specific experimental evidence. Kew still accepts *Calathea lutea*; it is not relabelled as a Goeppertia.

| Template ID | Provisional soil check, all year | Root/soil review | Feed during active growth Mar–Aug |
| --- | --- | --- | --- |
| `maranta` | 3 days | 18 months | 4 weeks |
| `calathea-lutea` | 3 days | 24 months | 4 weeks |
| `fiddle-leaf-fig` | 7 days | 30 months | 2 weeks, half strength if label permits |

These numbers are authored starting defaults, not watering frequencies established by the sources. Difficulty scores (4, 4, 3) are editorial ratings on the existing five-point scale. Soil intervals mean inspect roots and mix; healthy plants do not require automatic soil replacement. Repot when needed. Water only after checking actual moisture; reduce frequency when light or growth falls. Inspect more frequently during hot, dry conditions.

The user subsequently supplied Puebla, Puebla; indoors with indirect light, approximately 2 m from the window; soil/compost/perlite mix; drainage holes in all pots; Maranta and Calathea pots approximately 15 cm across and tall; Ficus planted directly in a pot approximately 60 cm across and 80 cm tall. The updated 3/3/7-day reminders replace the earlier 5/8, 5/8 and 10/14-day seasonal estimates. Both seasonal fields now hold the same provisional check interval. Record actual necessary watering dates over 2–3 cycles before tuning them.

For the small pots, water when the surface begins drying while soil beneath remains lightly moist. For Ficus, let the top approximately 5 cm dry and confirm the deeper root area is no longer very wet; the entire pot does not need to become completely dry. Its large soil volume may retain moisture if roots occupy only part of it. At 2 m, brightness depends on the window and obstructions; move Ficus gradually closer if the position is dim. Guides explain these conditions in EN/ES. Soil/feeding intervals and saved records are unchanged.

The user's short moisture meter cannot establish bottom moisture in the large pot. A long untreated wooden dowel provides an approximate deeper check: adhering damp soil or damp-looking wood suggests moisture. Insert gently without forcing through roots, check multiple positions, and interpret only the depth actually reached. This method follows [University of Maryland Extension's indoor overwatering guidance](https://dev.extension.umd.edu/resource/overwatered-indoor-plants); it does not provide an exact moisture measurement. The [Illinois Extension watering guide](https://extension.illinois.edu/houseplants/watering) also cautions that meter probes may be unreliable. The user has not measured indoor temperature/humidity; [Puebla outdoor climate averages](https://en.climate-data.org/america-del-norte/mexico/puebla/puebla-de-zaragoza-2857/) do not establish the room's conditions.

## Gotchas

- The existing form expresses Northern Hemisphere watering seasons as Mar–Sep/Oct–Feb and fertilizer seasons as Mar–Aug/Sep–Feb. Equal provisional water-check intervals retain that contract without inventing validated seasonal watering frequencies. Climate, indoor light and actual growth take precedence.
- Feeding sources differ: RHS recommends monthly Maranta feeding, while NYBG recommends fortnightly during growth. The Maranta default uses RHS monthly guidance. RHS general calathea feeding is Apr–Sep; the app's Mar–Aug window is a disclosed seasonal adaptation. Skip feeding outside active growth and follow product directions.
- Localized unit coverage checks all sixteen guides, translated numeric figures and identical schedules while retaining the original thirteen-template assertion on its original subset. Existing browser coverage also selects all three additions and checks populated schedules. Red acceptance evidence: `reports/plants-new-guides-red.txt`; final module evidence: `reports/plants-new-guides-verification.txt`.
- Initial browser attempts had timeouts loading an existing import input and an existing plant heading (`reports/plants-new-guides-browser-initial.txt`, `reports/plants-new-guides-browser-rebuild.txt`). A concurrent build could interrupt static asset loading; the final run leaves build output stable. A separate sandbox attempt could not bind localhost and was rerun with approved test-server permission. No test assertions or timeouts were weakened.
- The thirteen original Spanish templates and saved user data remain unchanged. These new templates extend the catalogue only. Full release and physical-device acceptance are outside this research update.
- Puebla update acceptance was recorded before data changes in `reports/plants-puebla-guidance-red.txt`; both languages must retain matching numeric guidance, both watering seasons must use the agreed check interval, and the mounted form must populate both values. Final module evidence: `reports/plants-puebla-guidance-verification.txt`.
