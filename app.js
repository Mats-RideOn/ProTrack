/* ═══════════════════════════════════════════════════════════════
   ProTrack — app.js  v6.0
   ─ Betrouwbare wachtwoord-hash (stabiele string-gebaseerde hash)
   ─ Voormiddagsnack toegevoegd
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const DEFAULT_PROTEIN_TARGET = 110;
const DEFAULT_KCAL_TARGET    = 2000;

const MEAL_DEFAULTS = [
  { id: 'breakfast',       emoji: '🌅', name: 'Ontbijt',          defaultTarget: 22 },
  { id: 'morning_snack',   emoji: '🍌', name: 'Voormiddagsnack',  defaultTarget: 8  },
  { id: 'lunch',           emoji: '☀️',  name: 'Lunch',            defaultTarget: 28 },
  { id: 'afternoon_snack', emoji: '🍎', name: 'Namiddagsnack',    defaultTarget: 10 },
  { id: 'dinner',          emoji: '🌙', name: 'Avondmaal',        defaultTarget: 32 },
  { id: 'evening_snack',   emoji: '🌃', name: 'Avondsnack',       defaultTarget: 10 },
];

const DEFAULT_HERBA_PRODUCTS = [
  { name: 'Formula 1 Shake (afgeroomde melk)', protein: 17, kcal: 220 },
  { name: 'Formula 1 Shake (water)',           protein: 9,  kcal: 90  },
  { name: 'Protein Drink Mix (PDM)',           protein: 15, kcal: 70  },
  { name: 'Personalised Protein Powder',       protein: 5,  kcal: 25  },
  { name: 'Herbalife 24 Rebuild Strength',     protein: 24, kcal: 150 },
  { name: 'Protein Bar Deluxe',                protein: 10, kcal: 140 },
  { name: 'NouriFusion Protein Shake',         protein: 18, kcal: 190 },
];

// ─────────────────────────────────────────────────────────────────
// FOOD LIBRARY
// priority: welke maaltijdslots dit item BOVENAAN toont
// Alle items zijn voor alle slots beschikbaar; priority bepaalt volgorde
// ─────────────────────────────────────────────────────────────────
const FOOD_LIBRARY = [
  // EIEREN & ZUIVEL
  { name: '1 ei (groot)',                  protein: 6,  kcal: 72,  serving: '1 ei',           priority: ['breakfast','morning_snack','afternoon_snack','evening_snack'] },
  { name: '2 eieren',                     protein: 12, kcal: 144, serving: '2 eieren',        priority: ['breakfast','afternoon_snack'] },
  { name: '3 eieren',                     protein: 18, kcal: 216, serving: '3 eieren',        priority: ['breakfast'] },
  { name: 'Eiwitten (3)',                 protein: 11, kcal: 51,  serving: '3 eiwitten',      priority: ['breakfast','evening_snack'] },
  { name: 'Griekse yogurt 0% (100g)',     protein: 10, kcal: 57,  serving: '100g',            priority: ['breakfast','morning_snack','afternoon_snack','evening_snack'] },
  { name: 'Griekse yogurt 0% (200g)',     protein: 20, kcal: 114, serving: '200g pot',        priority: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Skyr (100g)',                  protein: 11, kcal: 65,  serving: '100g',            priority: ['breakfast','morning_snack','afternoon_snack','evening_snack'] },
  { name: 'Skyr (150g)',                  protein: 17, kcal: 98,  serving: '150g',            priority: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Kwark naturel (100g)',         protein: 12, kcal: 67,  serving: '100g',            priority: ['breakfast','morning_snack','afternoon_snack','evening_snack'] },
  { name: 'Kwark naturel (150g)',         protein: 18, kcal: 101, serving: '150g',            priority: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Hüttenkäse (100g)',           protein: 11, kcal: 98,  serving: '100g',            priority: ['breakfast','morning_snack','afternoon_snack','evening_snack'] },
  { name: 'Hüttenkäse (200g)',           protein: 22, kcal: 196, serving: '200g',            priority: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Halfvolle melk (200ml)',       protein: 7,  kcal: 92,  serving: '200ml',           priority: ['breakfast'] },
  { name: 'Cheddar snede (40g)',          protein: 10, kcal: 161, serving: '40g',             priority: ['breakfast','lunch'] },
  { name: 'Mozzarella (50g)',             protein: 11, kcal: 140, serving: '50g',             priority: ['lunch','dinner'] },
  { name: 'Mozzarella (100g)',            protein: 22, kcal: 280, serving: '100g',            priority: ['lunch','dinner'] },
  { name: 'Feta kaas (50g)',              protein: 7,  kcal: 133, serving: '50g',             priority: ['lunch','dinner'] },
  { name: 'Ricotta (100g)',               protein: 11, kcal: 174, serving: '100g',            priority: ['dinner'] },
  { name: 'String kaas stick',           protein: 7,  kcal: 80,  serving: '28g',             priority: ['morning_snack','afternoon_snack','evening_snack'] },
  { name: 'Babybel light (1)',            protein: 6,  kcal: 41,  serving: '20g rondje',      priority: ['afternoon_snack','evening_snack'] },
  // PROTEÏNE POEDERS
  { name: 'Whey proteïne (1 scoop)',      protein: 24, kcal: 130, serving: '1 scoop ~30g',    priority: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Caseïne proteïne (1 scoop)',   protein: 24, kcal: 120, serving: '1 scoop ~30g',    priority: ['breakfast','evening_snack'] },
  { name: 'Erwten proteïne (1 scoop)',    protein: 21, kcal: 100, serving: '1 scoop ~25g',    priority: ['breakfast','afternoon_snack'] },
  // ONTBIJT-SPECIFIEK
  { name: 'Havermout droog (40g)',        protein: 5,  kcal: 150, serving: '40g',             priority: ['breakfast'] },
  { name: 'Havermout droog (60g)',        protein: 7,  kcal: 225, serving: '60g',             priority: ['breakfast'] },
  { name: 'Volkoren brood (1 snede)',     protein: 4,  kcal: 110, serving: '40g snede',       priority: ['breakfast','lunch'] },
  { name: 'Roggebrood (1 snede)',         protein: 3,  kcal: 80,  serving: '35g snede',       priority: ['breakfast','lunch'] },
  { name: 'Pindakaas (2 el)',             protein: 7,  kcal: 188, serving: '32g',             priority: ['breakfast','afternoon_snack'] },
  { name: 'Amandelboter (2 el)',          protein: 7,  kcal: 196, serving: '32g',             priority: ['breakfast','afternoon_snack'] },
  // GEVOGELTE
  { name: 'Kipfilet (100g)',              protein: 31, kcal: 165, serving: '100g gegrild',    priority: ['lunch','dinner'] },
  { name: 'Kipfilet (150g)',              protein: 47, kcal: 248, serving: '150g gegrild',    priority: ['lunch','dinner'] },
  { name: 'Kipfilet (200g)',              protein: 62, kcal: 330, serving: '200g gegrild',    priority: ['dinner'] },
  { name: 'Kippendij (100g)',             protein: 26, kcal: 209, serving: '100g gegrild',    priority: ['lunch','dinner'] },
  { name: 'Kippendij (150g)',             protein: 39, kcal: 314, serving: '150g gegrild',    priority: ['dinner'] },
  { name: 'Kalkoenfilet (100g)',          protein: 29, kcal: 135, serving: '100g gegrild',    priority: ['lunch','dinner'] },
  { name: 'Kalkoenreepjes deli (100g)',   protein: 18, kcal: 90,  serving: '100g',            priority: ['lunch','breakfast'] },
  { name: 'Kalkoengehakt (100g)',         protein: 27, kcal: 160, serving: '100g gebakken',   priority: ['dinner'] },
  { name: 'Kalkoengehakt (150g)',         protein: 41, kcal: 240, serving: '150g gebakken',   priority: ['dinner'] },
  // ROOD VLEES
  { name: 'Rundergehakt mager (100g)',    protein: 26, kcal: 218, serving: '100g gebakken',   priority: ['dinner'] },
  { name: 'Rundergehakt mager (150g)',    protein: 39, kcal: 327, serving: '150g gebakken',   priority: ['dinner'] },
  { name: 'Biefstuk (100g)',              protein: 27, kcal: 207, serving: '100g gebakken',   priority: ['dinner'] },
  { name: 'Varkenslende (100g)',          protein: 26, kcal: 185, serving: '100g gebakken',   priority: ['dinner'] },
  { name: 'Varkenslende (150g)',          protein: 39, kcal: 278, serving: '150g gebakken',   priority: ['dinner'] },
  { name: 'Hesp gesneden (100g)',         protein: 17, kcal: 115, serving: '100g',            priority: ['lunch','breakfast'] },
  { name: 'Spek (2 reepjes)',             protein: 12, kcal: 138, serving: '40g gebakken',    priority: ['breakfast'] },
  { name: 'Beef jerky (50g)',             protein: 17, kcal: 132, serving: '50g',             priority: ['morning_snack','afternoon_snack','evening_snack'] },
  { name: 'Beef jerky (100g)',            protein: 33, kcal: 264, serving: '100g',            priority: ['afternoon_snack','evening_snack'] },
  // VIS & ZEEVRUCHTEN
  { name: 'Gerookte zalm (50g)',          protein: 13, kcal: 83,  serving: '50g',             priority: ['breakfast','lunch','evening_snack'] },
  { name: 'Gerookte zalm (100g)',         protein: 25, kcal: 165, serving: '100g',            priority: ['breakfast','lunch'] },
  { name: 'Zalm filet (100g)',            protein: 25, kcal: 208, serving: '100g gegaard',    priority: ['lunch','dinner'] },
  { name: 'Zalm filet (150g)',            protein: 38, kcal: 312, serving: '150g gegaard',    priority: ['dinner'] },
  { name: 'Tonijn blik (100g)',           protein: 25, kcal: 116, serving: '100g uitgelekt',  priority: ['lunch','afternoon_snack'] },
  { name: 'Tonijn steak (150g)',          protein: 36, kcal: 175, serving: '150g gegaard',    priority: ['lunch','dinner'] },
  { name: 'Kabeljau filet (150g)',        protein: 35, kcal: 158, serving: '150g gebakken',   priority: ['dinner'] },
  { name: 'Schelvis (150g)',              protein: 33, kcal: 150, serving: '150g gebakken',   priority: ['dinner'] },
  { name: 'Garnalen (100g)',              protein: 24, kcal: 99,  serving: '100g gekookt',    priority: ['lunch','dinner'] },
  { name: 'Garnalen (150g)',              protein: 36, kcal: 149, serving: '150g gekookt',    priority: ['dinner'] },
  { name: 'Sardines blik (100g)',         protein: 25, kcal: 208, serving: '100g',            priority: ['lunch'] },
  { name: 'Makreel blik (100g)',          protein: 19, kcal: 305, serving: '100g',            priority: ['lunch'] },
  { name: 'Mosselen (100g)',              protein: 24, kcal: 172, serving: '100g gekookt',    priority: ['dinner'] },
  // PLANTAARDIG
  { name: 'Linzen gekookt (100g)',        protein: 9,  kcal: 116, serving: '100g',            priority: ['lunch','dinner'] },
  { name: 'Linzen gekookt (200g)',        protein: 18, kcal: 232, serving: '200g',            priority: ['lunch','dinner'] },
  { name: 'Kikkererwten (100g)',          protein: 9,  kcal: 164, serving: '100g gekookt',    priority: ['lunch','dinner'] },
  { name: 'Kikkererwten (200g)',          protein: 18, kcal: 328, serving: '200g gekookt',    priority: ['lunch','dinner'] },
  { name: 'Zwarte bonen (100g)',          protein: 9,  kcal: 132, serving: '100g gekookt',    priority: ['lunch','dinner'] },
  { name: 'Tofu stevig (100g)',           protein: 17, kcal: 144, serving: '100g',            priority: ['lunch','dinner'] },
  { name: 'Tofu stevig (200g)',           protein: 34, kcal: 288, serving: '200g',            priority: ['dinner'] },
  { name: 'Tempeh (100g)',                protein: 19, kcal: 193, serving: '100g',            priority: ['dinner'] },
  { name: 'Seitan (100g)',                protein: 25, kcal: 165, serving: '100g',            priority: ['dinner'] },
  { name: 'Edamame (100g)',               protein: 11, kcal: 121, serving: '100g gekookt',    priority: ['afternoon_snack','evening_snack','lunch'] },
  { name: 'Hummus (100g)',                protein: 5,  kcal: 166, serving: '100g',            priority: ['lunch','afternoon_snack'] },
  // NOTEN & ZADEN
  { name: 'Amandelen (30g)',              protein: 6,  kcal: 164, serving: '30g',             priority: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Pompoenpitten (30g)',          protein: 9,  kcal: 163, serving: '30g',             priority: ['breakfast','afternoon_snack'] },
  { name: 'Hennepzaden (30g)',            protein: 10, kcal: 170, serving: '30g',             priority: ['breakfast'] },
  { name: 'Chiazaden (20g)',              protein: 3,  kcal: 97,  serving: '20g',             priority: ['breakfast'] },
  // KOOLHYDRATEN
  { name: 'Quinoa gekookt (100g)',        protein: 4,  kcal: 120, serving: '100g',            priority: ['lunch','dinner'] },
  { name: 'Bruine rijst (100g)',          protein: 3,  kcal: 111, serving: '100g gekookt',    priority: ['lunch','dinner'] },
  { name: 'Bruine rijst (150g)',          protein: 5,  kcal: 167, serving: '150g gekookt',    priority: ['lunch','dinner'] },
  { name: 'Pasta gekookt (100g)',         protein: 5,  kcal: 158, serving: '100g',            priority: ['lunch','dinner'] },
  { name: 'Pasta gekookt (150g)',         protein: 8,  kcal: 237, serving: '150g',            priority: ['lunch','dinner'] },
  { name: 'Volkorenwrap (groot)',         protein: 5,  kcal: 170, serving: '1 groot wrap',    priority: ['lunch'] },
  { name: 'Zoete aardappel (150g)',       protein: 2,  kcal: 155, serving: '150g gebakken',   priority: ['dinner'] },
  { name: 'Nieuwe aardappelen (150g)',    protein: 3,  kcal: 117, serving: '150g gekookt',    priority: ['dinner'] },
  // SNACKS
  { name: 'Proteïnereep',                protein: 20, kcal: 220, serving: '~60g reep',        priority: ['afternoon_snack','evening_snack'] },
  { name: 'Proteïne yoghurtdrank',        protein: 20, kcal: 160, serving: '330ml fles',      priority: ['afternoon_snack','evening_snack'] },
  { name: 'Rijstwafel (2)',              protein: 2,  kcal: 70,  serving: '2 wafels',        priority: ['afternoon_snack'] },
  { name: 'Havermoutkoekjes (3)',         protein: 3,  kcal: 138, serving: '3 koekjes',       priority: ['afternoon_snack'] },
];

// Suggesties per slot
const SUGGESTION_POOL = {
  breakfast: [
    { label: '3 roerei + 200g Griekse yogurt',                    protein: 38, kcal: 424 },
    { label: 'Overnight oats + whey + bosvruchten',               protein: 29, kcal: 410 },
    { label: '3-ei omelet met hesp & cheddar',                    protein: 32, kcal: 380 },
    { label: 'Hüttenkäse op 2 volkoren toast + tomaat',           protein: 21, kcal: 318 },
    { label: 'Gerookte zalm + 2 gepocheerde eieren + roggebrood', protein: 38, kcal: 460 },
    { label: 'Proteïne pannenkoeken (haver + ei + banaan)',        protein: 22, kcal: 340 },
    { label: 'Skyr parfait met granola & bessen',                  protein: 23, kcal: 380 },
    { label: 'Kwark (150g) + bessen + 1 scoop whey',              protein: 33, kcal: 260 },
    { label: 'Griekse yogurt (200g) + hennepzaden + honing',      protein: 23, kcal: 310 },
    { label: 'Proteïnesmoothie (whey + melk + haver + banaan)',   protein: 34, kcal: 420 },
    { label: 'Skyr (200g) + 2 el PB + bananenschijfjes',         protein: 28, kcal: 410 },
    { label: 'Hüttenkäse pannenkoekjes (2 eieren + haver)',       protein: 28, kcal: 380 },
    { label: '2 gekookte eieren + roggebrood + gerookte zalm',    protein: 30, kcal: 360 },
    { label: 'Griekse yogurt + proteïnegranola + bessen',         protein: 26, kcal: 390 },
    { label: 'Overnight caseïne haver met chia & bessen',         protein: 32, kcal: 450 },
  ],
  morning_snack: [
    { label: 'Skyr (150g) + handvol bosvruchten',                  protein: 17, kcal: 120 },
    { label: 'Kwark (100g) + granola + bessen',                    protein: 16, kcal: 195 },
    { label: '1 gekookt ei + 1 snede roggebrood',                  protein: 9,  kcal: 152 },
    { label: 'Griekse yogurt (100g) + amandelen (15g)',            protein: 13, kcal: 164 },
    { label: 'Hüttenkäse (100g) + appel',                         protein: 11, kcal: 147 },
    { label: 'Whey shake (1/2 scoop) + 150ml melk',               protein: 16, kcal: 115 },
    { label: 'Pindakaas (1 el) + 1 rijstwafel',                   protein: 5,  kcal: 128 },
    { label: '2 Babybel light + druiven',                          protein: 12, kcal: 121 },
    { label: 'Proteïnereepje (mini)',                              protein: 10, kcal: 120 },
    { label: 'Amandelen (20g) + 1 stuk fruit',                    protein: 4,  kcal: 153 },
    { label: 'Skyr (100g) + 1 el honing',                         protein: 11, kcal: 95  },
    { label: '1 hardgekookt ei + cherrytomaatjes',                 protein: 6,  kcal: 82  },
    { label: 'Hüttenkäse (150g) + komkommer + paprika',           protein: 17, kcal: 120 },
  ],
  lunch: [
    { label: 'Gegrilde kipfilet + quinoa + geroosterde groenten', protein: 52, kcal: 490 },
    { label: 'Tonijn nicoise salade met eieren & olijven',        protein: 38, kcal: 380 },
    { label: 'Zalm & avocado bruine rijstkom',                    protein: 42, kcal: 530 },
    { label: 'Kipwrap met hummus, feta & salade',                 protein: 39, kcal: 480 },
    { label: 'Rundergehakt & linzensoep + volkoren broodje',      protein: 34, kcal: 520 },
    { label: 'Garnalenroerbak met bruine rijst & sesam',          protein: 36, kcal: 400 },
    { label: 'Griekse kipkom: rijst, feta, olijven, tzatziki',   protein: 44, kcal: 560 },
    { label: 'Linzen & fetasalade met zachtgekookt ei',           protein: 24, kcal: 360 },
    { label: 'Tofu poke bowl met edamame & sesamdressing',        protein: 32, kcal: 420 },
    { label: 'Tonijn & kikkererwten in volkoren wrap',            protein: 35, kcal: 470 },
    { label: 'Hüttenkäse & groente flatbread',                   protein: 26, kcal: 390 },
    { label: 'Kip Caesar salade (lichte dressing)',               protein: 44, kcal: 460 },
    { label: 'Kalkoengehakt bolognese + pasta',                   protein: 40, kcal: 550 },
    { label: 'Sardines & tomaat op volkoren toast',               protein: 28, kcal: 340 },
  ],
  afternoon_snack: [
    { label: '200g hüttenkäse + komkommersticks',                 protein: 22, kcal: 196 },
    { label: 'Proteïnereep + zwarte koffie',                      protein: 20, kcal: 220 },
    { label: '150g Griekse yogurt + 30g amandelen',               protein: 21, kcal: 310 },
    { label: '2 hardgekookte eieren + cherrytomaatjes',           protein: 12, kcal: 150 },
    { label: 'Whey shake met 200ml halfvolle melk',               protein: 31, kcal: 230 },
    { label: 'Skyr (150g) + handvol bosvruchten',                 protein: 17, kcal: 120 },
    { label: '100g edamame + snufje zeezout',                     protein: 11, kcal: 121 },
    { label: 'Tonijn (65g) + havermoutkoekjes',                   protein: 15, kcal: 200 },
    { label: 'Kwark (100g) + bessen + honing',                    protein: 12, kcal: 140 },
    { label: '3 Babybel + handvol druiven',                       protein: 18, kcal: 210 },
    { label: 'Proteïne yoghurtdrank',                             protein: 20, kcal: 160 },
    { label: 'Beef jerky (50g)',                                   protein: 17, kcal: 132 },
    { label: 'Caseïne shake (langzaam verteerbaar)',               protein: 24, kcal: 120 },
  ],
  dinner: [
    { label: 'Kippendij + zoete aardappel + broccoli',           protein: 48, kcal: 580 },
    { label: 'Zalm met linzen & gestoofde spinazie',              protein: 48, kcal: 600 },
    { label: 'Rundergehakt roerbak met bruine rijst & paprika',   protein: 50, kcal: 620 },
    { label: 'Kalkoengehakt chili met kidneybonen & rijst',       protein: 54, kcal: 540 },
    { label: 'Garnalenpasta met knoflook, chili & courgette',     protein: 40, kcal: 520 },
    { label: 'Kabeljau + quinoa + geroosterde paprika & pesto',   protein: 48, kcal: 480 },
    { label: 'Kip & kikkererwten curry met bruine rijst',         protein: 50, kcal: 640 },
    { label: 'Varkenslende + nieuwe aardappelen + sperziebonen',  protein: 52, kcal: 580 },
    { label: 'Tempeh & groenteroerbak met noedels',               protein: 38, kcal: 510 },
    { label: 'Kalkoenburger + zoete aardappelfrietjes + slaw',    protein: 44, kcal: 620 },
    { label: 'Gevulde kipfilet met ricotta & spinazie',           protein: 48, kcal: 510 },
    { label: 'Zalm teriyaki + bruine rijst + roergebakken groenten', protein: 46, kcal: 590 },
    { label: 'Kalkoen moussaka + Griekse salade',                 protein: 44, kcal: 560 },
  ],
  evening_snack: [
    { label: '200g hüttenkäse + gemengde bessen',                 protein: 22, kcal: 210 },
    { label: '150g Griekse yogurt + 1 el PB',                     protein: 17, kcal: 240 },
    { label: '1 scoop caseïne shake + 200ml melk',                protein: 31, kcal: 200 },
    { label: '2 hardgekookte eieren',                              protein: 12, kcal: 144 },
    { label: 'Kwark (150g) + bessen + druppel honing',            protein: 18, kcal: 150 },
    { label: 'Skyr (150g) + 30g amandelen',                       protein: 22, kcal: 270 },
    { label: 'Gerookte zalm (50g) + komkommer',                   protein: 13, kcal: 83  },
    { label: 'Beef jerky (50g)',                                   protein: 17, kcal: 132 },
    { label: 'Proteïnereep',                                       protein: 20, kcal: 220 },
    { label: '200g hüttenkäse op 2 rijstwafels',                  protein: 24, kcal: 260 },
    { label: '1 scoop whey + 150ml melk + ijs (geblend)',         protein: 28, kcal: 185 },
  ],
};

const PLAN_MEALS = {
  breakfast: [
    { name: 'Proteïne Havermout',       ingredients: 'Haver (60g) + whey + bessen + amandelboter',              protein: 32, kcal: 430 },
    { name: 'Groot Ei Ontbijt',         ingredients: '3 roerei + 200g Griekse yogurt + volkoren toast',          protein: 38, kcal: 480 },
    { name: 'Gerookte Zalm Bord',       ingredients: 'Gerookte zalm (100g) + 2 gepocheerde eieren + roggebrood', protein: 38, kcal: 460 },
    { name: 'Kwarkkom',                 ingredients: 'Kwark (150g) + bessen + hennepzaden + honing',             protein: 28, kcal: 290 },
    { name: 'Hüttenkäse Toast',         ingredients: 'Hüttenkäse (150g) + volkoren toast (x2) + tomaat',        protein: 24, kcal: 360 },
    { name: 'Skyr Parfait',             ingredients: 'Skyr (200g) + krokante granola + amandelen + banaan',      protein: 24, kcal: 420 },
    { name: 'Kalkoenspek Omelet',       ingredients: '3 eieren + kalkoenspek (2) + cheddar + spinazie',          protein: 38, kcal: 440 },
    { name: 'Proteïne Smoothie',        ingredients: 'Whey (1 scoop) + 200ml melk + banaan + 40g haver',        protein: 35, kcal: 450 },
    { name: 'CC Pannenkoekjes',         ingredients: 'Hüttenkäse (100g) + 2 eieren + 40g haver (gebakken)',     protein: 28, kcal: 380 },
    { name: 'Overnight Caseïne Haver',  ingredients: 'Caseïne (1 scoop) + 60g haver + melk + chiazaden',        protein: 32, kcal: 450 },
  ],
  morning_snack: [
    { name: 'Skyr & Bessen',         ingredients: 'Skyr (150g) + gemengde bosvruchten + 1 el granola',         protein: 18, kcal: 165 },
    { name: 'Kwark Pot',             ingredients: 'Kwark (100g) + stukjes fruit + druppel honing',             protein: 12, kcal: 130 },
    { name: 'Ei & Toast',            ingredients: '1 hardgekookt ei + 1 snede roggebrood + tomaat',             protein: 9,  kcal: 152 },
    { name: 'Griekse Yogurt Mix',    ingredients: 'Griekse yogurt (100g) + 15g amandelen + appel',             protein: 13, kcal: 210 },
    { name: 'Mini Whey Shake',       ingredients: 'Whey (1/2 scoop) + 150ml melk',                            protein: 16, kcal: 115 },
    { name: 'Noten & Fruit',         ingredients: '25g gemengde noten + 1 stuk fruit naar keuze',              protein: 5,  kcal: 195 },
    { name: 'Hüttenkäse Snack',     ingredients: 'Hüttenkäse (150g) + komkommer + 2 rijstwafels',             protein: 17, kcal: 195 },
    { name: 'Proteïnereepje',        ingredients: 'Mini proteïnereep (10g+ proteïne)',                         protein: 10, kcal: 120 },
  ],
  lunch: [
    { name: 'Kip Quinoakom',            ingredients: 'Kipfilet (150g) + quinoa (100g) + geroosterde groenten',  protein: 52, kcal: 555 },
    { name: 'Tonijn Salé Wrap',         ingredients: 'Tonijn (130g) + kikkererwten + volkoren wrap + salade',    protein: 38, kcal: 470 },
    { name: 'Zalm Rijstkom',            ingredients: 'Zalm (150g) + bruine rijst + avocado + komkommer',         protein: 42, kcal: 560 },
    { name: 'Kalkoen Eiwitwrap',        ingredients: 'Kalkoenreepjes (120g) + mozzarella + spinazie + wrap',     protein: 40, kcal: 490 },
    { name: 'Runder Linzensoep',        ingredients: 'Rundergehakt (100g) + linzen (150g) + groenten + broodje', protein: 42, kcal: 580 },
    { name: 'Griekse Kipkom',           ingredients: 'Kip (150g) + quinoa + feta + olijven + tzatziki',          protein: 46, kcal: 570 },
    { name: 'Tofu Poke Bowl',           ingredients: 'Tofu (200g) + bruine rijst + edamame + sesamdressing',     protein: 34, kcal: 440 },
    { name: 'Garnalenroerbak',          ingredients: 'Garnalen (150g) + bruine rijst + broccoli + soja-gember',  protein: 38, kcal: 410 },
    { name: 'Biefstuk Bord',            ingredients: 'Biefstreepjes (150g) + zoete aardappel + groene salade',   protein: 42, kcal: 520 },
    { name: 'Makreelkom',               ingredients: 'Gerookte makreel (150g) + nieuwe aardappelen + komkommer', protein: 32, kcal: 490 },
  ],
  afternoon_snack: [
    { name: 'Hüttenkäse Pot',          ingredients: 'Hüttenkäse (200g) + komkommer + cherrytomaatjes',          protein: 22, kcal: 196 },
    { name: 'Proteïne Shake',          ingredients: 'Whey proteïne (1 scoop) + 200ml halfvolle melk',            protein: 31, kcal: 220 },
    { name: 'Yogurt & Noten Mix',      ingredients: 'Griekse yogurt (150g) + 30g amandelen + bessen',            protein: 21, kcal: 310 },
    { name: 'Ei & Tomaat',             ingredients: '2 hardgekookte eieren + cherrytomaatjes + hot sauce',        protein: 12, kcal: 154 },
    { name: 'Skyr Pot',                ingredients: 'Skyr (150g) + bessen + hennepzaden',                        protein: 19, kcal: 145 },
    { name: 'Proteïnereep',            ingredients: 'Eiwitreep (20g+ proteïne)',                                  protein: 20, kcal: 220 },
    { name: 'Beef Jerky & Babybel',    ingredients: 'Beef jerky (50g) + 2 Babybel light',                        protein: 23, kcal: 215 },
    { name: 'Caseïne Shake',           ingredients: 'Caseïne (1 scoop) + 200ml water of melk',                   protein: 24, kcal: 130 },
  ],
  dinner: [
    { name: 'Kip & Zoete Aardappel',   ingredients: 'Kipfilet (200g) + zoete aardappel (150g) + broccoli',      protein: 50, kcal: 590 },
    { name: 'Zalm & Linzen',           ingredients: 'Zalmfilet (150g) + linzen (200g) + spinazie + citroen',     protein: 50, kcal: 620 },
    { name: 'Runder Roerbak',          ingredients: 'Rundergehakt mager (150g) + bruine rijst + paprika',        protein: 52, kcal: 640 },
    { name: 'Kalkoen Chili',           ingredients: 'Kalkoengehakt (200g) + kidneybonen + tomaten + rijst',      protein: 54, kcal: 550 },
    { name: 'Kabeljau & Quinoa',       ingredients: 'Kabeljau (200g) + quinoa + geroosterde paprika',             protein: 48, kcal: 490 },
    { name: 'Kip Curry',               ingredients: 'Kip (200g) + kikkererwten + lichte kokossaus + rijst',      protein: 50, kcal: 650 },
    { name: 'Varkens Lende Bord',      ingredients: 'Varkenslende (200g) + nieuwe aardappelen + sperziebonen',   protein: 52, kcal: 580 },
    { name: 'Garnalenpasta',           ingredients: 'Garnalen (150g) + pasta (100g) + courgette + knoflook',     protein: 40, kcal: 520 },
    { name: 'Kalkoen Moussaka',        ingredients: 'Kalkoengehakt (150g) + aubergine + tomatensaus + feta',     protein: 44, kcal: 520 },
    { name: 'Zalm Teriyaki',           ingredients: 'Zalm (150g) + bruine rijst + pak choi & broccoli',          protein: 46, kcal: 570 },
  ],
  evening_snack: [
    { name: 'Hüttenkäse & Bessen',    ingredients: 'Hüttenkäse (200g) + gemengde bessen',                       protein: 22, kcal: 210 },
    { name: 'Caseïne Shake',          ingredients: 'Caseïne proteïne (1 scoop) + 200ml melk',                    protein: 30, kcal: 210 },
    { name: 'Griekse Yogurt & PB',    ingredients: 'Griekse yogurt (150g) + pindakaas (1 el) + banaan',          protein: 18, kcal: 290 },
    { name: 'Kwark & Honing',         ingredients: 'Kwark (150g) + bessen + druppel honing',                     protein: 18, kcal: 150 },
    { name: 'Gekookte Eieren',        ingredients: '2 hardgekookte eieren + zout & peper',                       protein: 12, kcal: 144 },
    { name: 'Skyr & Amandelen',       ingredients: 'Skyr (150g) + 30g amandelen',                                protein: 23, kcal: 270 },
    { name: 'Whey Shake',             ingredients: 'Whey (1 scoop) + 150ml melk + ijs',                          protein: 28, kcal: 185 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
var activeUserId      = null;
var currentMealId     = null;
var currentPlan       = null;
var suggestionOffsets = {};
var viewingDate       = null;  // null = vandaag; anders 'YYYY-MM-DD' van verleden

// Food modal portiemultiplier
var portionMultiplier = 1;

// ═══════════════════════════════════════════════════════════════
// LOCALSTORAGE HELPERS
// ═══════════════════════════════════════════════════════════════
function hashPassword(pw) {
  // btoa is ingebouwd in elke browser, 100% deterministisch, geen overflow mogelijk.
  // Data staat lokaal op het toestel — btoa is voldoende voor privacy.
  try { return btoa(unescape(encodeURIComponent(pw.trim()))); }
  catch(e) { return btoa(pw.trim()); }
}
// Legacy hashes — voor migratie van accounts aangemaakt vóór v6
function hashPasswordLegacy(pw) {
  // v5 hash poging (djb2 met overflow)
  var h = 5381;
  for (var i = 0; i < pw.length; i++) {
    var h32 = h | 0;
    h = (((h32 << 5) + h32 + pw.charCodeAt(i)) >>> 0);
  }
  return h.toString(16);
}
function hashPasswordLegacy2(pw) {
  // v6-beta hash (modulo versie) — kort-levende versie
  var h = 5381;
  for (var i = 0; i < pw.length; i++) { h = (h * 33 + pw.charCodeAt(i)) % 4294967296; }
  var h2 = 0;
  for (var j = pw.length-1; j >= 0; j--) { h2 = (h2 * 31 + pw.charCodeAt(j)) % 4294967296; }
  return h.toString(16).padStart(8,'0') + h2.toString(16).padStart(8,'0');
}

function getUserByEmail(email) {
  var ids = getAllUserIds();
  for (var i=0;i<ids.length;i++){var p=loadProfile(ids[i]);if(p&&p.email&&p.email.toLowerCase()===email.toLowerCase())return{uid:ids[i],profile:p};}
  return null;
}
function getAllUserIds()     { return JSON.parse(localStorage.getItem('protrack_users')||'[]'); }
function saveAllUserIds(ids) { localStorage.setItem('protrack_users',JSON.stringify(ids)); }
function loadProfile(uid)    { return JSON.parse(localStorage.getItem('protrack_profile_'+uid)||'null'); }
function saveProfile(uid,p)  { localStorage.setItem('protrack_profile_'+uid,JSON.stringify(p)); }
function todayKey()          { return new Date().toISOString().slice(0,10); }
function dateKey(daysAgo)    { var d=new Date(); d.setDate(d.getDate()-daysAgo); return d.toISOString().slice(0,10); }

function loadLogForDate(dateStr) {
  return JSON.parse(localStorage.getItem('protrack_log_'+activeUserId+'_'+dateStr)||'null')||{meals:{},healthKcal:0};
}
function loadTodayLog()      { return loadLogForDate(todayKey()); }
function saveTodayLog(log)   { localStorage.setItem('protrack_log_'+activeUserId+'_'+todayKey(),JSON.stringify(log)); }

// Verwijder logs ouder dan 7 dagen bij elke login
function pruneOldLogs() {
  var cutoff = dateKey(7);
  Object.keys(localStorage).forEach(function(k){
    var m = k.match(/^protrack_log_.+_(\d{4}-\d{2}-\d{2})$/);
    if (m && m[1] < cutoff) localStorage.removeItem(k);
  });
}

function loadHistory(days) {
  var profile = loadProfile(activeUserId);
  var target  = profile ? (profile.proteinTarget||DEFAULT_PROTEIN_TARGET) : DEFAULT_PROTEIN_TARGET;
  var result  = [];
  for (var i=days;i>=1;i--) {
    var ds  = dateKey(i);
    var log = loadLogForDate(ds);
    var tot = getTotalProtein(log);
    var d   = new Date(); d.setDate(d.getDate()-i);
    result.push({ dateStr:ds, dayLabel:d.toLocaleDateString('nl-BE',{weekday:'short'}), date:d.toLocaleDateString('nl-BE',{day:'numeric',month:'short'}), total:tot, target:target, hit:tot>=target });
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// CALCULATIONS
// ═══════════════════════════════════════════════════════════════
function getTotalProtein(log)   { return Object.values(log.meals||{}).flat().reduce(function(s,i){return s+(i.protein||0);},0); }
function getTotalFoodKcal(log)  { return Object.values(log.meals||{}).flat().reduce(function(s,i){return s+(i.kcal||0);},0); }
function getMealProtein(log,mid){ return (log.meals[mid]||[]).reduce(function(s,i){return s+(i.protein||0);},0); }
function getMealKcal(log,mid)   { return (log.meals[mid]||[]).reduce(function(s,i){return s+(i.kcal||0);},0); }
function getEffectiveTarget(profile,log) {
  return profile&&profile.proteinTarget ? profile.proteinTarget : DEFAULT_PROTEIN_TARGET;
}
function getMealTarget(mealDef,total) { return Math.round(mealDef.defaultTarget/DEFAULT_PROTEIN_TARGET*total); }
function calcBMI(w,h) {
  if(!w||!h) return null;
  var bmi=w/((h/100)*(h/100));
  var cat=bmi<18.5?'Ondergewicht':bmi<25?'Normaal':bmi<30?'Overgewicht':'Zwaarlijvig';
  return bmi.toFixed(1)+' — '+cat;
}

// ═══════════════════════════════════════════════════════════════
// SHUFFLE / SEED
// ═══════════════════════════════════════════════════════════════
function seededRand(seed){var s=seed;return function(){s=(s*1664525+1013904223)&0xffffffff;return (s>>>0)/0x100000000;};}
function seededShuffle(arr,seed){var a=arr.slice(),rand=seededRand(seed);for(var i=a.length-1;i>0;i--){var j=Math.floor(rand()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function shuffle(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function todaySeed(){return parseInt(todayKey().replace(/-/g,''),10);}
function getDailySuggestions(mealId){
  var pool=SUGGESTION_POOL[mealId]||[];
  var offset=suggestionOffsets[mealId]||0;
  var seed=todaySeed()+mealId.length*997+offset*10007;
  return seededShuffle(pool,seed).slice(0,4);
}

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════
function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
var toastTimer=null;
function showToast(msg,dur){dur=dur||2500;var el=document.getElementById('toast');el.textContent=msg;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.add('hidden');},dur);}
function showScreen(id){document.querySelectorAll('.screen').forEach(function(s){s.classList.add('hidden');s.classList.remove('active');});var t=document.getElementById('screen-'+id);t.classList.remove('hidden');t.classList.add('active');window.scrollTo(0,0);}
function isViewingHistory(){ return viewingDate && viewingDate !== todayKey(); }

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════
function showAuthError(id,msg){var el=document.getElementById(id);if(el){el.textContent=msg;el.classList.remove('hidden');}}
function hideAuthError(id){var el=document.getElementById(id);if(el)el.classList.add('hidden');}

document.getElementById('tabLogin').addEventListener('click',function(){
  document.getElementById('tabLogin').classList.add('auth-tab-active');
  document.getElementById('tabRegister').classList.remove('auth-tab-active');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  hideAuthError('loginError');
});
document.getElementById('tabRegister').addEventListener('click',function(){
  document.getElementById('tabRegister').classList.add('auth-tab-active');
  document.getElementById('tabLogin').classList.remove('auth-tab-active');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  hideAuthError('registerError');
});

document.getElementById('btnLogin').addEventListener('click',function(){
  hideAuthError('loginError');
  var email=document.getElementById('loginEmail').value.trim().toLowerCase();
  var pw   =document.getElementById('loginPw').value.trim(); // trim voorkomt spatieproblemen
  if(!email||!pw){showAuthError('loginError','Vul e-mail en wachtwoord in.');return;}

  // Laad alle users rechtstreeks uit localStorage — geen cache
  var rawIds = localStorage.getItem('protrack_users');
  var ids = rawIds ? JSON.parse(rawIds) : [];
  console.log('[Login] protrack_users raw:', rawIds);
  console.log('[Login] ids:', ids);

  // Zoek account op e-mail
  var found = null;
  for (var i = 0; i < ids.length; i++) {
    var rawP = localStorage.getItem('protrack_profile_' + ids[i]);
    if (!rawP) { console.log('[Login] geen profiel voor uid:', ids[i]); continue; }
    var p = JSON.parse(rawP);
    console.log('[Login] check uid:', ids[i], 'email:', p.email, 'vs input:', email);
    if (p.email && p.email.toLowerCase() === email) {
      found = { uid: ids[i], profile: p };
      break;
    }
  }

  if (!found) {
    var knownEmails = ids.map(function(id){
      var raw=localStorage.getItem('protrack_profile_'+id);
      return raw ? JSON.parse(raw).email : null;
    }).filter(Boolean);
    console.log('[Login] Bekende e-mails:', knownEmails);
    if (ids.length === 0) {
      showAuthError('loginError','Geen accounts gevonden. Maak eerst een account aan via "Registreren".');
    } else {
      showAuthError('loginError','Geen account gevonden. Bekende e-mails in console (F12).');
    }
    return;
  }

  // Controleer wachtwoord — probeer nieuw én oud hash-formaat
  var storedHash = found.profile.pwHash || '';
  var newHash    = hashPassword(pw);
  var legacyHash = hashPasswordLegacy(pw);

  console.log('[Login] stored:', storedHash, 'new:', newHash, 'legacy:', legacyHash);

  if (storedHash === newHash) {
    loginAs(found.uid);
  } else if (storedHash === legacyHash || storedHash === hashPasswordLegacy2(pw)) {
    // Migreer oud hash-formaat naar btoa
    found.profile.pwHash = newHash;
    saveProfile(found.uid, found.profile);
    console.log('[Login] hash gemigreerd voor', found.uid);
    loginAs(found.uid);
  } else if (!storedHash) {
    // Geen hash — accepteer en sla btoa op
    found.profile.pwHash = newHash;
    saveProfile(found.uid, found.profile);
    loginAs(found.uid);
  } else {
    console.log('[Login] hash mismatch. stored:', storedHash, 'new:', newHash, 'legacy:', legacyHash);
    showAuthError('loginError','Verkeerd wachtwoord. Probeer opnieuw.');
  }
});

document.getElementById('btnRegister').addEventListener('click',function(){
  hideAuthError('registerError');
  var name=document.getElementById('regName').value.trim();
  var email=document.getElementById('regEmail').value.trim().toLowerCase();
  var pw=document.getElementById('regPw').value.trim();
  var pw2=document.getElementById('regPw2').value.trim();
  if(!name){showAuthError('registerError','Vul je naam in.');return;}
  if(!email||!email.includes('@')){showAuthError('registerError','Vul een geldig emailadres in.');return;}
  if(!pw||pw.length<4){showAuthError('registerError','Wachtwoord moet minstens 4 tekens zijn.');return;}
  if(pw!==pw2){showAuthError('registerError','Wachtwoorden komen niet overeen.');return;}
  if(getUserByEmail(email)){showAuthError('registerError','Er bestaat al een account met dit emailadres.');return;}
  var uid=genId();
  var profile={
    name:name, email:email, pwHash:hashPassword(pw),
    age:parseInt(document.getElementById('regAge').value)||null,
    weight:parseFloat(document.getElementById('regWeight').value)||null,
    height:parseFloat(document.getElementById('regHeight').value)||null,
    proteinTarget:parseInt(document.getElementById('regProtein').value)||DEFAULT_PROTEIN_TARGET,
    calTarget:parseInt(document.getElementById('regKcal').value)||null,
    herba:DEFAULT_HERBA_PRODUCTS.slice(), myFoods:[], createdAt:new Date().toISOString()
  };
  // Sla profiel op EERST, dan pas de id-lijst — zodat getUserByEmail het altijd vindt
  saveProfile(uid, profile);
  var ids = JSON.parse(localStorage.getItem('protrack_users')||'[]');
  if (ids.indexOf(uid) === -1) ids.push(uid);
  localStorage.setItem('protrack_users', JSON.stringify(ids));
  // Verifieer opslag
  var verify = localStorage.getItem('protrack_profile_'+uid);
  console.log('[Register] uid:', uid, 'email:', email, 'profile saved:', !!verify, 'ids:', ids);
  showToast('Welkom, '+name+'! 🎉');loginAs(uid);
});

['regWeight','regHeight'].forEach(function(id){document.getElementById(id).addEventListener('input',function(){var w=parseFloat(document.getElementById('regWeight').value);var h=parseFloat(document.getElementById('regHeight').value);var el=document.getElementById('regBMI');if(el)el.textContent=calcBMI(w,h)||'—';});});

function loginAs(uid){
  activeUserId=uid;
  localStorage.setItem('protrack_active_user',uid);
  suggestionOffsets={};
  viewingDate=null;
  pruneOldLogs();
  renderDashboard();
  showScreen('dash');
}
function logout(){activeUserId=null;localStorage.removeItem('protrack_active_user');viewingDate=null;showScreen('auth');}

// Hulp bij inlogproblemen
document.getElementById('btnShowReset').addEventListener('click', function() {
  var rawIds = localStorage.getItem('protrack_users');
  var ids = rawIds ? JSON.parse(rawIds) : [];
  var info = 'Accounts in dit apparaat: ' + ids.length + '\n';
  ids.forEach(function(id) {
    var raw = localStorage.getItem('protrack_profile_' + id);
    if (raw) {
      var p = JSON.parse(raw);
      info += '• ' + (p.email || '?') + ' (' + (p.name || '?') + ')\n';
    }
  });
  if (ids.length === 0) info += '(geen accounts gevonden)\n';
  info += '\nWil je alle data wissen en opnieuw beginnen?';
  if (confirm(info)) {
    Object.keys(localStorage).filter(function(k){return k.startsWith('protrack_');}).forEach(function(k){localStorage.removeItem(k);});
    alert('Data gewist. Je kan nu een nieuw account aanmaken.');
    location.reload();
  }
});

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function renderDashboard() {
  var profile=loadProfile(activeUserId); if(!profile) return;
  var dateStr = viewingDate || todayKey();
  var log = loadLogForDate(dateStr);
  var isHistory = isViewingHistory();

  var initials=(profile.name||'?').slice(0,2).toUpperCase();
  document.getElementById('avatarBtn').textContent=initials;
  document.getElementById('topBarName').textContent=profile.name;

  // Datum tonen — met pijlen voor navigatie
  if (isHistory) {
    document.getElementById('topBarDate').innerHTML =
      '<span class="date-nav-btn" id="btnDatePrev">&#8592;</span> '+
      new Date(dateStr+'T12:00').toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'long'})+
      ' <span class="date-nav-btn" id="btnDateNext">&#8594;</span>';
  } else {
    document.getElementById('topBarDate').innerHTML =
      '<span class="date-nav-btn" id="btnDatePrev">&#8592;</span> '+
      new Date().toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'long'})+
      ' <span class="date-nav-btn history-today" id="btnDateNext" style="opacity:0.3;pointer-events:none">&#8594;</span>';
  }
  // Nav events
  var prevBtn=document.getElementById('btnDatePrev');
  var nextBtn=document.getElementById('btnDateNext');
  if(prevBtn) prevBtn.addEventListener('click',navigateDateBack);
  if(nextBtn&&!isHistory) nextBtn.style.pointerEvents='none';
  if(nextBtn&&isHistory) nextBtn.addEventListener('click',navigateDateForward);

  var effectiveTarget=getEffectiveTarget(profile,log);
  var totalProtein=getTotalProtein(log);
  var totalFoodKcal=getTotalFoodKcal(log);
  var kcalTarget=profile.calTarget||DEFAULT_KCAL_TARGET;
  var protPct=Math.min(totalProtein/effectiveTarget,1);
  var kcalPct=Math.min(totalFoodKcal/kcalTarget,1);
  var remaining=Math.max(effectiveTarget-totalProtein,0);
  var circ=326.7;

  var arcEl=document.getElementById('ringArc');
  arcEl.style.strokeDashoffset=circ-protPct*circ;
  arcEl.style.stroke=protPct>=1?'var(--green-light)':protPct>=0.6?'var(--green)':'var(--orange)';
  document.getElementById('ringNum').textContent=Math.round(totalProtein);
  var kcalArcEl=document.getElementById('kcalArc');
  kcalArcEl.style.strokeDashoffset=circ-kcalPct*circ;
  document.getElementById('kcalRingNum').textContent=totalFoodKcal;
  document.getElementById('statConsumed').textContent=Math.round(totalProtein)+'g';
  document.getElementById('statTarget').textContent=effectiveTarget+'g';
  document.getElementById('statRemain').textContent=Math.round(remaining)+'g';
  document.getElementById('statKcal').textContent=totalFoodKcal;
  document.getElementById('bigBarFill').style.width=Math.round(protPct*100)+'%';
  document.getElementById('bigBarPct').textContent=Math.round(protPct*100)+'%';
  var msgEl=document.getElementById('dynamicMsg');
  if(isHistory){msgEl.textContent='📅 Geschiedenis — enkel weergave.';msgEl.style.color='var(--text2)';}
  else if(protPct>=1){msgEl.textContent='🎉 Doel gehaald! Je hebt '+Math.round(totalProtein)+'g bereikt vandaag.';msgEl.style.color='var(--green-light)';}
  else{msgEl.textContent='Nog '+Math.round(remaining)+'g om je doel van '+effectiveTarget+'g te bereiken.';msgEl.style.color='var(--text2)';}

  // Toon/verberg auto plan knop bij geschiedenis
  document.getElementById('autoPlanSection').style.display=isHistory?'none':'';
  document.getElementById('btnResetDay').style.display=isHistory?'none':'';

  renderMealSlots(log,profile,effectiveTarget);
  renderSummary(log,profile,effectiveTarget,totalProtein,totalFoodKcal);
  renderHistory(totalProtein,effectiveTarget);
}

function navigateDateBack() {
  var current = viewingDate || todayKey();
  var d = new Date(current+'T12:00'); d.setDate(d.getDate()-1);
  var ds = d.toISOString().slice(0,10);
  if (ds < dateKey(6)) return; // max 7 dagen
  viewingDate = ds;
  renderDashboard();
}
function navigateDateForward() {
  if (!isViewingHistory()) return;
  var current = viewingDate;
  var d = new Date(current+'T12:00'); d.setDate(d.getDate()+1);
  var ds = d.toISOString().slice(0,10);
  if (ds > todayKey()) { viewingDate=null; } else { viewingDate=ds; }
  renderDashboard();
}

// ═══════════════════════════════════════════════════════════════
// MEAL SLOTS
// ═══════════════════════════════════════════════════════════════
function renderMealSlots(log,profile,effectiveTarget) {
  var container=document.getElementById('mealSlots');
  var openSlots={};
  container.querySelectorAll('.meal-slot.open').forEach(function(el){openSlots[el.id]=true;});
  container.innerHTML='';
  var readOnly=isViewingHistory();

  var allProteins=MEAL_DEFAULTS.map(function(m){return getMealProtein(log,m.id);});
  var maxProtein=Math.max.apply(null,allProteins);

  MEAL_DEFAULTS.forEach(function(meal){
    var mealTarget=getMealTarget(meal,effectiveTarget);
    var mealActual=getMealProtein(log,meal.id);
    var mealKcal=getMealKcal(log,meal.id);
    var mealPct=Math.min(mealActual/mealTarget,1);
    var items=log.meals[meal.id]||[];
    var isComplete=mealActual>=mealTarget;
    var isTopMeal=mealActual>0&&mealActual===maxProtein;

    var slot=document.createElement('div');
    slot.className='meal-slot'+(isComplete?' complete':'')+(isTopMeal?' top-meal':'')+(readOnly?' read-only':'');
    slot.id='slot_'+meal.id;
    if(openSlots['slot_'+meal.id]) slot.classList.add('open');

    var itemsHtml='';
    if(items.length){
      itemsHtml='<div class="logged-items">';
      items.forEach(function(item,idx){
        itemsHtml+='<div class="log-item">'+
          '<span class="log-item-dot"></span>'+
          '<span class="log-item-name">'+escHtml(item.name)+(item.qty&&item.qty>1?' <span class="item-qty">×'+item.qty+'</span>':'')+' </span>'+
          '<span class="log-item-macros">'+
            '<span class="log-item-g">'+item.protein+'g</span>'+
            (item.kcal?'<span class="log-item-kcal">'+item.kcal+' kcal</span>':'')+
          '</span>'+
          (!readOnly?'<button class="log-item-del" data-meal="'+meal.id+'" data-idx="'+idx+'">✕</button>':'')+
          '</div>';
      });
      itemsHtml+='</div>';
    } else {
      itemsHtml='<p class="empty-slot-msg">'+(readOnly?'Niets gelogd op deze dag.':'Nog niets gelogd')+'</p>';
    }

    var suggestions=getDailySuggestions(meal.id);
    var chipsHtml=suggestions.map(function(s){
      return '<button class="suggestion-chip" data-meal="'+meal.id+'" data-name="'+escHtml(s.label)+'" data-protein="'+s.protein+'" data-kcal="'+s.kcal+'">'+
        '<span class="sug-label">'+escHtml(s.label)+'</span>'+
        '<span class="sug-macros">~'+s.protein+'g · '+s.kcal+'kcal</span>'+
        '</button>';
    }).join('');

    var barColor=isComplete?'var(--green-light)':'var(--green)';

    var bodyHtml=readOnly
      ? itemsHtml
      : itemsHtml+
        '<div class="suggestion-row">'+
          '<div class="suggestion-header">'+
            '<span class="suggestion-label">💡 Ideeën</span>'+
            '<button class="sug-refresh-btn" data-meal="'+meal.id+'">↻</button>'+
          '</div>'+
          '<div class="suggestion-chips">'+chipsHtml+'</div>'+
        '</div>'+
        '<button class="add-food-btn" data-meal="'+meal.id+'"><span class="add-food-icon">＋</span> Voedsel toevoegen</button>';

    slot.innerHTML=
      '<div class="meal-header" data-meal="'+meal.id+'" role="button" tabindex="0">'+
        '<div class="meal-icon-wrap"><span class="meal-emoji">'+meal.emoji+'</span>'+(isTopMeal?'<span class="top-badge">⭐</span>':'')+' </div>'+
        '<div class="meal-title-block">'+
          '<div class="meal-name">'+meal.name+'</div>'+
          '<div class="meal-sub">'+
            '<span class="meal-sub-prot">'+Math.round(mealActual)+'g / '+mealTarget+'g proteïne</span>'+
            (mealKcal>0?'<span class="meal-sub-kcal"> · '+mealKcal+' kcal</span>':'')+
            (isComplete?'<span class="meal-sub-done"> ✅</span>':'')+
          '</div>'+
        '</div>'+
        '<div class="meal-progress-mini">'+
          '<span class="meal-g-mini">'+Math.round(mealActual)+'g</span>'+
          '<div class="meal-mini-bar"><div class="meal-mini-fill" style="width:'+Math.round(mealPct*100)+'%;background:'+barColor+'"></div></div>'+
        '</div>'+
        '<span class="meal-chevron">▼</span>'+
      '</div>'+
      '<div class="meal-body">'+bodyHtml+'</div>';

    container.appendChild(slot);
  });

  // Events
  container.querySelectorAll('.meal-header').forEach(function(hdr){
    hdr.addEventListener('click',function(){var sl=hdr.closest('.meal-slot'),isOpen=sl.classList.contains('open');container.querySelectorAll('.meal-slot.open').forEach(function(s){s.classList.remove('open');});if(!isOpen)sl.classList.add('open');});
  });
  if(!readOnly){
    container.querySelectorAll('.log-item-del').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();deleteFoodItem(btn.dataset.meal,parseInt(btn.dataset.idx));});});
    container.querySelectorAll('.suggestion-chip').forEach(function(chip){chip.addEventListener('click',function(e){e.stopPropagation();addFoodItem(chip.dataset.meal,chip.dataset.name,parseFloat(chip.dataset.protein),parseFloat(chip.dataset.kcal));});});
    container.querySelectorAll('.add-food-btn').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();openFoodModal(btn.dataset.meal);});});
    container.querySelectorAll('.sug-refresh-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();var mid=btn.dataset.meal;
        suggestionOffsets[mid]=(suggestionOffsets[mid]||0)+1;
        var log=loadTodayLog(),profile=loadProfile(activeUserId);
        renderMealSlots(log,profile,getEffectiveTarget(profile,log));
        setTimeout(function(){var s=document.getElementById('slot_'+mid);if(s)s.classList.add('open');},20);
        showToast('Nieuwe suggesties geladen ✨');
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// FOOD LOG MUTATIONS
// ═══════════════════════════════════════════════════════════════
function addFoodItem(mealId,name,proteinPer,kcalPer,qty) {
  qty=qty||1; kcalPer=kcalPer||0;
  var totalP=Math.round(proteinPer*qty*10)/10;
  var totalK=Math.round(kcalPer*qty)||0;
  var log=loadTodayLog();
  if(!log.meals[mealId]) log.meals[mealId]=[];
  log.meals[mealId].push({name:name,protein:totalP,kcal:totalK,qty:qty});
  saveTodayLog(log); renderDashboard();
  setTimeout(function(){var s=document.getElementById('slot_'+mealId);if(s&&!s.classList.contains('open'))s.classList.add('open');},30);
  var label=qty>1?qty+'× '+name:name;
  showToast('Toegevoegd: '+label+' (+'+totalP+'g proteïne'+(totalK?', '+totalK+' kcal':'')+')');
}
function deleteFoodItem(mealId,idx){
  var log=loadTodayLog(),item=(log.meals[mealId]||[])[idx];if(!item)return;
  log.meals[mealId].splice(idx,1);saveTodayLog(log);renderDashboard();
  setTimeout(function(){var s=document.getElementById('slot_'+mealId);if(s&&!s.classList.contains('open'))s.classList.add('open');},30);
  showToast('Verwijderd: '+item.name);
}

// ═══════════════════════════════════════════════════════════════
// FOOD MODAL — gesorteerd per maaltijdtype, portie multiplier
// ═══════════════════════════════════════════════════════════════
var currentFoodForModal = null; // { name, protein, kcal } van geselecteerd item (voor qty modal)

// Sorteer: items met maaltijdtype in priority bovenaan, rest daarna
function getSortedFoodsForMeal(mealId, searchQuery) {
  var profile = loadProfile(activeUserId);
  var myFoods = (profile&&profile.myFoods)||[];
  // Voeg eigen foods toe met priority=all
  var combined = FOOD_LIBRARY.concat(myFoods.map(function(f){return Object.assign({},f,{priority:['all'],isCustom:true});}));

  var q = searchQuery ? searchQuery.toLowerCase().trim() : '';
  if (q) {
    combined = combined.filter(function(f){return f.name.toLowerCase().indexOf(q)!==-1;});
    return combined; // bij zoeken geen prioriteit-sortering
  }

  var primary = [], secondary = [];
  combined.forEach(function(f){
    var prio = f.priority || [];
    if (prio.indexOf(mealId)!==-1 || prio.indexOf('all')!==-1) primary.push(f);
    else secondary.push(f);
  });
  return primary.concat(secondary);
}

function openFoodModal(mealId) {
  currentMealId=mealId; portionMultiplier=1;
  var def=MEAL_DEFAULTS.filter(function(m){return m.id===mealId;})[0];
  document.getElementById('modalMealName').textContent='Toevoegen aan '+(def?def.name:'maaltijd');
  document.getElementById('manualFoodName').value='';
  document.getElementById('manualFoodProtein').value='';
  document.getElementById('manualFoodCal').value='';
  document.getElementById('manualPreview').innerHTML='';
  document.getElementById('manualValidation').classList.add('hidden');
  document.getElementById('foodSearch').value='';
  renderFoodGrid('');
  renderHerbaGrid();
  switchModalTab('library');
  document.getElementById('foodModal').classList.remove('hidden');
}
function closeFoodModal(){document.getElementById('foodModal').classList.add('hidden');closePortion();}
document.getElementById('btnCloseModal').addEventListener('click',closeFoodModal);
document.getElementById('foodModal').addEventListener('click',function(e){if(e.target===document.getElementById('foodModal'))closeFoodModal();});

document.querySelectorAll('.mtab').forEach(function(tab){tab.addEventListener('click',function(){switchModalTab(tab.dataset.tab);});});
function switchModalTab(tabId){
  document.querySelectorAll('.mtab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('.modal-tab-pane').forEach(function(p){p.classList.add('hidden');p.classList.remove('active');});
  document.querySelector('.mtab[data-tab="'+tabId+'"]').classList.add('active');
  var pane=document.getElementById('tab'+tabId.charAt(0).toUpperCase()+tabId.slice(1));
  pane.classList.remove('hidden');pane.classList.add('active');
  if(tabId==='manual') document.getElementById('manualFoodName').focus();
}

document.getElementById('foodSearch').addEventListener('input',function(){renderFoodGrid(this.value);});

function renderFoodGrid(q) {
  var foods = getSortedFoodsForMeal(currentMealId, q);
  var grid  = document.getElementById('foodGrid');
  if (!foods.length){grid.innerHTML='<p class="grid-empty">Geen resultaten.</p>';return;}

  // Groepeer: eerste groep = logisch voor dit slot (of search), tweede = overige (bij niet-zoeken)
  var q2 = q ? q.toLowerCase().trim() : '';
  var html = '';
  if (!q2) {
    var profile=loadProfile(activeUserId);
    var myFoods=(profile&&profile.myFoods)||[];
    var combined=FOOD_LIBRARY.concat(myFoods.map(function(f){return Object.assign({},f,{priority:['all'],isCustom:true});}));
    var primary=[], secondary=[];
    combined.forEach(function(f){var p=f.priority||[];(p.indexOf(currentMealId)!==-1||p.indexOf('all')!==-1?primary:secondary).push(f);});
    if(primary.length){
      html+='<div class="food-section-label">⭐ Aanbevolen voor dit moment</div>';
      html+=primary.map(function(f){return foodChipHtml(f);}).join('');
    }
    if(secondary.length){
      html+='<div class="food-section-label">Alle voedingsmiddelen</div>';
      html+=secondary.map(function(f){return foodChipHtml(f);}).join('');
    }
  } else {
    html=foods.map(function(f){return foodChipHtml(f);}).join('');
  }
  grid.innerHTML=html;
  grid.querySelectorAll('.food-chip').forEach(function(chip){
    chip.addEventListener('click',function(){
      openPortionPicker(chip.dataset.name,parseFloat(chip.dataset.protein),parseFloat(chip.dataset.kcal));
    });
  });
}

function foodChipHtml(f){
  return '<button class="food-chip'+(f.isCustom?' food-chip-custom':'')+'" data-name="'+escHtml(f.name)+'" data-protein="'+f.protein+'" data-kcal="'+f.kcal+'">'+
    '<span class="food-chip-name">'+escHtml(f.name)+(f.isCustom?' <span class="custom-badge">Eigen</span>':'')+' </span>'+
    '<span class="food-chip-macros"><span class="food-chip-g">'+f.protein+'g</span><span class="food-chip-kcal">'+f.kcal+' kcal</span></span>'+
    '<span class="food-chip-serving">'+f.serving+'</span></button>';
}

function renderHerbaGrid(){
  var profile=loadProfile(activeUserId),herba=(profile&&profile.herba)?profile.herba:[];
  var grid=document.getElementById('herbaGrid'),hint=document.getElementById('herbaModalHint');
  if(!herba.length){grid.innerHTML='';hint.classList.remove('hidden');return;}
  hint.classList.add('hidden');
  grid.innerHTML=herba.map(function(h){
    return '<button class="food-chip food-chip-herba" data-name="'+escHtml(h.name)+'" data-protein="'+h.protein+'" data-kcal="'+(h.kcal||0)+'">'+
      '<span class="food-chip-name">'+escHtml(h.name)+'</span>'+
      '<span class="food-chip-macros"><span class="food-chip-g herba-g">'+h.protein+'g</span>'+(h.kcal?'<span class="food-chip-kcal">'+h.kcal+' kcal</span>':'')+' </span>'+
      '<span class="food-chip-serving">Herbalife</span></button>';
  }).join('');
  grid.querySelectorAll('.food-chip').forEach(function(chip){
    chip.addEventListener('click',function(){openPortionPicker(chip.dataset.name,parseFloat(chip.dataset.protein),parseFloat(chip.dataset.kcal));});
  });
}

// ── PORTIE MULTIPLIER ────────────────────────────────────────────
function openPortionPicker(name, proteinPer, kcalPer) {
  currentFoodForModal={name:name,protein:proteinPer,kcal:kcalPer};
  portionMultiplier=1;
  document.getElementById('portionFoodName').textContent=name;
  updatePortionDisplay();
  document.getElementById('portionPicker').classList.remove('hidden');
}
function closePortion(){document.getElementById('portionPicker').classList.add('hidden');}
function updatePortionDisplay(){
  var f=currentFoodForModal; if(!f) return;
  var totalP=Math.round(f.protein*portionMultiplier*10)/10;
  var totalK=Math.round(f.kcal*portionMultiplier);
  document.getElementById('portionQtyDisplay').textContent=portionMultiplier+'×';
  document.getElementById('portionTotals').textContent=totalP+'g proteïne · '+totalK+' kcal';
  document.getElementById('btnPortionMinus').disabled=(portionMultiplier<=1);
  document.getElementById('btnPortionPlus').disabled=(portionMultiplier>=10);
}
document.getElementById('btnPortionMinus').addEventListener('click',function(){if(portionMultiplier>1){portionMultiplier--;updatePortionDisplay();}});
document.getElementById('btnPortionPlus').addEventListener('click',function(){if(portionMultiplier<10){portionMultiplier++;updatePortionDisplay();}});
document.getElementById('btnPortionConfirm').addEventListener('click',function(){
  if(!currentFoodForModal) return;
  addFoodItem(currentMealId,currentFoodForModal.name,currentFoodForModal.protein,currentFoodForModal.kcal,portionMultiplier);
  closePortion(); closeFoodModal();
});
document.getElementById('btnPortionCancel').addEventListener('click',closePortion);

// ── MANUAL ENTRY ─────────────────────────────────────────────────
function updateManualPreview(){
  var name=document.getElementById('manualFoodName').value.trim();
  var protein=parseFloat(document.getElementById('manualFoodProtein').value);
  var kcal=parseFloat(document.getElementById('manualFoodCal').value)||0;
  var prev=document.getElementById('manualPreview');
  if(name&&!isNaN(protein)&&protein>0){
    prev.innerHTML='<div class="preview-card"><div class="preview-name">'+escHtml(name)+'</div>'+
      '<div class="preview-macros"><span class="preview-protein">'+protein+'g proteïne</span>'+(kcal>0?'<span class="preview-kcal">'+kcal+' kcal</span>':'')+' </div></div>';
  }else{prev.innerHTML='';}
}
['manualFoodName','manualFoodProtein','manualFoodCal'].forEach(function(id){document.getElementById(id).addEventListener('input',updateManualPreview);});

document.getElementById('btnAddManual').addEventListener('click',function(){
  var name=document.getElementById('manualFoodName').value.trim();
  var protein=parseFloat(document.getElementById('manualFoodProtein').value);
  var kcal=parseFloat(document.getElementById('manualFoodCal').value)||0;
  var validEl=document.getElementById('manualValidation');
  if(!name){showValErr(validEl,'Voer een naam in.');document.getElementById('manualFoodName').focus();return;}
  if(isNaN(protein)||protein<=0){showValErr(validEl,'Voer proteïne groter dan 0 in.');document.getElementById('manualFoodProtein').focus();return;}
  if(!isNaN(kcal)&&kcal<0){showValErr(validEl,'Calorieën kunnen niet negatief zijn.');return;}
  validEl.classList.add('hidden');

  // Optioneel: opslaan in eigen bibliotheek
  var saveToLib=document.getElementById('chkSaveToLib').checked;
  if(saveToLib){
    var profile=loadProfile(activeUserId)||{};
    if(!profile.myFoods)profile.myFoods=[];
    var serving=document.getElementById('manualFoodServing').value.trim()||'1 portie';
    profile.myFoods.push({name:name,protein:protein,kcal:kcal,serving:serving});
    saveProfile(activeUserId,profile);
    showToast(name+' opgeslagen in jouw bibliotheek 📚');
  }
  addFoodItem(currentMealId,name,protein,kcal,1);
  closeFoodModal();
});
function showValErr(el,msg){el.textContent='⚠ '+msg;el.classList.remove('hidden');el.scrollIntoView({behavior:'smooth',block:'nearest'});}

// ═══════════════════════════════════════════════════════════════
// RESET DAY
// ═══════════════════════════════════════════════════════════════
document.getElementById('btnResetDay').addEventListener('click',function(){
  if(!confirm('Alle logs van vandaag wissen?')) return;
  localStorage.removeItem('protrack_log_'+activeUserId+'_'+todayKey());
  renderDashboard(); showToast('Log van vandaag gewist 🔄');
});

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════
function renderSummary(log,profile,effectiveTarget,totalProtein,totalFoodKcal){
  var remaining=Math.max(effectiveTarget-totalProtein,0);
  var pct=Math.min(totalProtein/effectiveTarget,1);
  var kcalTarget=profile.calTarget||DEFAULT_KCAL_TARGET;
  var kcalLeft=Math.max(kcalTarget-totalFoodKcal,0);
  document.getElementById('summaryGrid').innerHTML=
    '<div class="summary-cell"><span class="summary-cell-val green">'+Math.round(totalProtein)+'g</span><span class="summary-cell-lbl">Proteïne gegeten</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val">'+effectiveTarget+'g</span><span class="summary-cell-lbl">Proteïne doel</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val orange">'+Math.round(remaining)+'g</span><span class="summary-cell-lbl">Proteïne resterend</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val kcal-val">'+totalFoodKcal+'</span><span class="summary-cell-lbl">Kcal gelogd</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val">'+kcalTarget+'</span><span class="summary-cell-lbl">Kcal doel</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val '+(kcalLeft>0?'orange':'green')+'">'+kcalLeft+'</span><span class="summary-cell-lbl">Kcal resterend</span></div>';
  var msgEl=document.getElementById('summaryMsg');
  if(pct>=1){msgEl.className='summary-msg success';msgEl.textContent='🏆 Uitstekend! Je hebt je doel bereikt!';}
  else if(pct>=0.85){msgEl.className='summary-msg warning';msgEl.textContent='💪 Bijna! Nog '+Math.round(remaining)+'g te gaan!';}
  else if(pct>=0.5){msgEl.className='summary-msg warning';msgEl.textContent='🔥 Je bent '+Math.round(remaining)+'g van je doel. Blijf gaan!';}
  else{msgEl.className='summary-msg neutral';msgEl.textContent='📋 Log je maaltijden om '+effectiveTarget+'g te bereiken.';}
}

// ═══════════════════════════════════════════════════════════════
// HISTORY CHART — klikbaar voor datum-navigatie
// ═══════════════════════════════════════════════════════════════
function renderHistory(todayTotal,effectiveTarget){
  var history=loadHistory(6);
  var days=history.concat([{dateStr:todayKey(),dayLabel:'Vandaag',total:todayTotal,target:effectiveTarget,hit:todayTotal>=effectiveTarget}]);
  var maxVal=Math.max.apply(null,days.map(function(d){return d.total;}).concat([effectiveTarget,1]));
  var html=days.map(function(d){
    var h=Math.max(Math.round((d.total/maxVal)*80),d.total>0?3:0);
    var isActive=(viewingDate===d.dateStr)||(d.dateStr===todayKey()&&!viewingDate);
    var cls=(d.dateStr===todayKey()&&!viewingDate)?'today':d.hit?'hit':'miss';
    return '<div class="chart-col'+(isActive?' chart-col-active':'')+'" data-date="'+d.dateStr+'" style="cursor:pointer">'+
      '<div class="chart-bar-wrap"><div class="chart-bar '+cls+'" style="height:'+h+'px"></div></div>'+
      '<span class="chart-g">'+(d.total>0?Math.round(d.total):'—')+'</span>'+
      '<span class="'+(d.dateStr===todayKey()?'chart-today-lbl':'chart-day')+'">'+d.dayLabel+'</span></div>';
  }).join('');
  document.getElementById('historyChart').innerHTML=html;
  document.querySelectorAll('.chart-col').forEach(function(col){
    col.addEventListener('click',function(){
      var ds=col.dataset.date;
      if(ds===todayKey()){viewingDate=null;}else{viewingDate=ds;}
      renderDashboard();
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// AUTO PLAN
// ═══════════════════════════════════════════════════════════════
document.getElementById('btnAutoPlan').addEventListener('click',openPlanModal);
function openPlanModal(){
  var profile=loadProfile(activeUserId),log=loadTodayLog();
  var target=getEffectiveTarget(profile,log);
  if(!currentPlan){currentPlan={};MEAL_DEFAULTS.forEach(function(meal){currentPlan[meal.id]=shuffle(PLAN_MEALS[meal.id]||[])[0];});}
  renderPlanModal(target);
  document.getElementById('planModal').classList.remove('hidden');
}
function renderPlanModal(target){
  if(!target){var profile=loadProfile(activeUserId),log=loadTodayLog();target=getEffectiveTarget(profile,log);}
  var planTotal=MEAL_DEFAULTS.reduce(function(s,m){return s+(currentPlan[m.id]?currentPlan[m.id].protein:0);},0);
  document.getElementById('planModalSub').textContent='Geschat totaal: '+planTotal+'g proteïne · doel: '+target+'g';
  document.getElementById('planCards').innerHTML=MEAL_DEFAULTS.map(function(meal){
    var selected=currentPlan[meal.id];
    var pool=PLAN_MEALS[meal.id]||[];
    var isLogged=selected&&isPlanMealLogged(meal.id,selected);
    var optionsHtml=pool.map(function(m,idx){
      var isSel=selected&&selected.name===m.name;
      return '<button class="plan-option '+(isSel?'plan-option-selected':'')+'" data-meal="'+meal.id+'" data-idx="'+idx+'">'+
        '<div class="plan-option-top"><span class="plan-option-name">'+escHtml(m.name)+'</span><span class="plan-option-macros">'+m.protein+'g · '+m.kcal+'kcal</span></div>'+
        '<div class="plan-option-ingredients">'+escHtml(m.ingredients)+'</div>'+
        (isSel?'<span class="plan-option-check">✓</span>':'')+
        '</button>';
    }).join('');
    return '<div class="plan-slot-block" id="planslot_'+meal.id+'">'+
      '<div class="plan-slot-header">'+
        '<span class="plan-slot-emoji">'+meal.emoji+'</span>'+
        '<span class="plan-slot-name">'+meal.name+'</span>'+
        (selected?'<span class="plan-slot-macros">'+selected.protein+'g · '+selected.kcal+' kcal</span>':'')+
        (isLogged?'<span class="plan-slot-logged-badge">✓ Gelogd</span>':(selected?'<button class="plan-log-btn" data-meal="'+meal.id+'">Log</button>':''))+
      '</div>'+
      '<div class="plan-options-list">'+optionsHtml+'</div>'+
    '</div>';
  }).join('');
  document.getElementById('planCards').querySelectorAll('.plan-option').forEach(function(btn){
    btn.addEventListener('click',function(){var mid=btn.dataset.meal;currentPlan[mid]=PLAN_MEALS[mid][parseInt(btn.dataset.idx)];renderPlanModal();});
  });
  document.getElementById('planCards').querySelectorAll('.plan-log-btn').forEach(function(btn){
    btn.addEventListener('click',function(e){e.stopPropagation();var mid=btn.dataset.meal,m=currentPlan[mid];if(!m)return;logPlanMeal(mid,m);renderPlanModal();});
  });
}
function isPlanMealLogged(mealId,m){if(!m)return false;var log=loadTodayLog();return(log.meals[mealId]||[]).some(function(i){return i.name===m.name;});}
function logPlanMeal(mealId,m){var log=loadTodayLog();if(!log.meals[mealId])log.meals[mealId]=[];if(log.meals[mealId].some(function(i){return i.name===m.name;})){showToast('Al gelogd: '+m.name);return;}log.meals[mealId].push({name:m.name,protein:m.protein,kcal:m.kcal});saveTodayLog(log);renderDashboard();showToast(m.name+' gelogd ✅');}
document.getElementById('btnRegeneratePlan').addEventListener('click',function(){currentPlan=null;openPlanModal();});
document.getElementById('btnClosePlanModal').addEventListener('click',function(){document.getElementById('planModal').classList.add('hidden');});
document.getElementById('planModal').addEventListener('click',function(e){if(e.target===document.getElementById('planModal'))document.getElementById('planModal').classList.add('hidden');});
document.getElementById('btnLogAllPlan').addEventListener('click',function(){if(!currentPlan)return;var logged=0;MEAL_DEFAULTS.forEach(function(meal){var m=currentPlan[meal.id];if(m){logPlanMeal(meal.id,m);logged++;}});document.getElementById('planModal').classList.add('hidden');renderDashboard();showToast('Alle '+logged+' maaltijden gelogd! 🎉',3000);});

// ═══════════════════════════════════════════════════════════════
// PROFIEL
// ═══════════════════════════════════════════════════════════════
document.getElementById('btnOpenProfile').addEventListener('click',function(){loadProfileForm();showScreen('profile');});
document.getElementById('avatarBtn').addEventListener('click',function(){if(confirm('Uitloggen?'))logout();});
document.getElementById('btnBackFromProfile').addEventListener('click',function(){showScreen('dash');renderDashboard();});

function loadProfileForm(){
  var p=loadProfile(activeUserId);if(!p)return;
  document.getElementById('profName').value=p.name||'';
  document.getElementById('profEmail').value=p.email||'';
  document.getElementById('profAge').value=p.age||'';
  document.getElementById('profWeight').value=p.weight||'';
  document.getElementById('profHeight').value=p.height||'';
  document.getElementById('profProteinTarget').value=p.proteinTarget||DEFAULT_PROTEIN_TARGET;
  document.getElementById('profCalTarget').value=p.calTarget||'';
  document.getElementById('profPwNew').value='';
  document.getElementById('profPwCurrent').value='';
  updateProfBMI();
  renderHerbaProfileList();
  renderMyFoodsList();
}
function updateProfBMI(){var w=parseFloat(document.getElementById('profWeight').value);var h=parseFloat(document.getElementById('profHeight').value);document.getElementById('profBMI').textContent=calcBMI(w,h)||'—';}
['profWeight','profHeight'].forEach(function(id){document.getElementById(id).addEventListener('input',updateProfBMI);});

document.getElementById('btnSaveProfile').addEventListener('click',function(){
  var p=loadProfile(activeUserId)||{};
  p.name=document.getElementById('profName').value.trim();
  p.age=parseInt(document.getElementById('profAge').value)||null;
  p.weight=parseFloat(document.getElementById('profWeight').value)||null;
  p.height=parseFloat(document.getElementById('profHeight').value)||null;
  p.proteinTarget=parseInt(document.getElementById('profProteinTarget').value)||DEFAULT_PROTEIN_TARGET;
  p.calTarget=parseInt(document.getElementById('profCalTarget').value)||null;
  var currentPw=document.getElementById('profPwCurrent').value;
  var newPw=document.getElementById('profPwNew').value;
  if(newPw){
    if(!currentPw){showToast('Vul je huidige wachtwoord in om te wijzigen');return;}
    if(p.pwHash!==hashPassword(currentPw)){showToast('Huidig wachtwoord is onjuist');return;}
    if(newPw.length<4){showToast('Nieuw wachtwoord moet minstens 4 tekens zijn');return;}
    p.pwHash=hashPassword(newPw);showToast('Profiel & wachtwoord opgeslagen ✅');
  }else{showToast('Profiel opgeslagen ✅');}
  saveProfile(activeUserId,p);
});

// Herbalife
function renderHerbaProfileList(){
  var profile=loadProfile(activeUserId),herba=(profile&&profile.herba)?profile.herba:[];
  var list=document.getElementById('herbaList');
  if(!herba.length){list.innerHTML='<p class="helper-text">Nog geen producten.</p>';return;}
  list.innerHTML=herba.map(function(h,i){
    return '<div class="herba-item"><div class="herba-item-info"><span class="herba-item-name">'+escHtml(h.name)+'</span><span class="herba-item-macros"><span class="herba-item-g">'+h.protein+'g</span>'+(h.kcal?' · '+h.kcal+' kcal':'')+' </span></div>'+
      '<button class="herba-item-del" data-idx="'+i+'">✕</button></div>';
  }).join('');
  list.querySelectorAll('.herba-item-del').forEach(function(btn){btn.addEventListener('click',function(){var p=loadProfile(activeUserId);p.herba.splice(parseInt(btn.dataset.idx),1);saveProfile(activeUserId,p);renderHerbaProfileList();showToast('Product verwijderd');});});
}
document.getElementById('btnAddHerba').addEventListener('click',function(){
  var name=document.getElementById('herbaName').value.trim();
  var protein=parseFloat(document.getElementById('herbaProtein').value);
  var kcal=parseFloat(document.getElementById('herbaKcal').value)||0;
  if(!name){showToast('Voer een productnaam in');return;}
  if(!protein||protein<=0){showToast('Voer proteïne > 0 in');return;}
  var p=loadProfile(activeUserId)||{};if(!p.herba)p.herba=[];
  p.herba.push({name:name,protein:protein,kcal:kcal});saveProfile(activeUserId,p);
  document.getElementById('herbaName').value='';document.getElementById('herbaProtein').value='';document.getElementById('herbaKcal').value='';
  renderHerbaProfileList();showToast('Toegevoegd: '+name+' ✅');
});

// Eigen voedingsmiddelen bibliotheek
function renderMyFoodsList(){
  var profile=loadProfile(activeUserId),myFoods=(profile&&profile.myFoods)||[];
  var list=document.getElementById('myFoodsList');
  if(!myFoods.length){list.innerHTML='<p class="helper-text">Nog geen eigen voedingsmiddelen. Voeg er hieronder een toe, of sla op vanuit "Manueel invoeren" in het dagscherm.</p>';return;}
  list.innerHTML=myFoods.map(function(f,i){
    return '<div class="herba-item"><div class="herba-item-info">'+
      '<span class="herba-item-name">'+escHtml(f.name)+'</span>'+
      '<span class="herba-item-macros">'+f.protein+'g proteïne'+(f.kcal?' · '+f.kcal+' kcal':'')+' · '+escHtml(f.serving||'1 portie')+'</span>'+
      '</div><button class="herba-item-del" data-idx="'+i+'">✕</button></div>';
  }).join('');
  list.querySelectorAll('.herba-item-del').forEach(function(btn){
    btn.addEventListener('click',function(){var p=loadProfile(activeUserId);p.myFoods.splice(parseInt(btn.dataset.idx),1);saveProfile(activeUserId,p);renderMyFoodsList();showToast('Verwijderd uit jouw bibliotheek');});
  });
}
document.getElementById('btnAddMyFood').addEventListener('click',function(){
  var name=document.getElementById('myFoodName').value.trim();
  var protein=parseFloat(document.getElementById('myFoodProtein').value);
  var kcal=parseFloat(document.getElementById('myFoodKcal').value)||0;
  var serving=document.getElementById('myFoodServing').value.trim()||'1 portie';
  if(!name){showToast('Voer een naam in');return;}
  if(!protein||protein<=0){showToast('Voer proteïne > 0 in');return;}
  var p=loadProfile(activeUserId)||{};if(!p.myFoods)p.myFoods=[];
  p.myFoods.push({name:name,protein:protein,kcal:kcal,serving:serving});
  saveProfile(activeUserId,p);
  document.getElementById('myFoodName').value='';document.getElementById('myFoodProtein').value='';document.getElementById('myFoodKcal').value='';document.getElementById('myFoodServing').value='';
  renderMyFoodsList();showToast('Toegevoegd aan jouw bibliotheek 📚');
});

document.getElementById('btnDeleteProfile').addEventListener('click',function(){
  if(!confirm('Profiel verwijderen? Alle data wordt permanent gewist.'))return;
  localStorage.removeItem('protrack_profile_'+activeUserId);
  Object.keys(localStorage).filter(function(k){return k.indexOf('protrack_log_'+activeUserId)===0;}).forEach(function(k){localStorage.removeItem(k);});
  var ids=getAllUserIds().filter(function(id){return id!==activeUserId;});saveAllUserIds(ids);
  localStorage.removeItem('protrack_active_user');activeUserId=null;
  showToast('Profiel verwijderd');showScreen('auth');
});
document.getElementById('btnLogout').addEventListener('click',function(){if(confirm('Uitloggen?'))logout();});

// ═══════════════════════════════════════════════════════════════
// SERVICE WORKER
// ═══════════════════════════════════════════════════════════════
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('service-worker.js').then(function(){console.log('[ProTrack] SW ok');}).catch(function(e){console.warn('[ProTrack] SW fail',e);});});}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
function init(){
  var remembered=localStorage.getItem('protrack_active_user');
  var ids=getAllUserIds();
  if(remembered&&ids.indexOf(remembered)!==-1){activeUserId=remembered;pruneOldLogs();renderDashboard();showScreen('dash');}
  else{showScreen('auth');}
}
init();
