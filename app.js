/* ═══════════════════════════════════════════════════════════════
   ProTrack — app.js  v4.0
   ─ Email + wachtwoord login (per profiel, localStorage)
   ─ Auto Plan: kies per maaltijdslot uit alle opties (swipe/klik)
   ─ Suggestions: ↻ refresh knop per slot, geen "daily refresh" tekst
   ─ Food library gefilterd per maaltijdtype (ontbijt ≠ diner)
   ═══════════════════════════════════════════════════════════════ */

'use strict';

const PROTEIN_KCAL_RATIO     = 0.1;
const DEFAULT_PROTEIN_TARGET = 110;
const DEFAULT_KCAL_TARGET    = 2000;

const MEAL_DEFAULTS = [
  { id: 'breakfast',       emoji: '🌅', name: 'Ontbijt',          defaultTarget: 25 },
  { id: 'lunch',           emoji: '☀️',  name: 'Lunch',            defaultTarget: 30 },
  { id: 'afternoon_snack', emoji: '🍎', name: 'Namiddagsnack',    defaultTarget: 10 },
  { id: 'dinner',          emoji: '🌙', name: 'Avondmaal',        defaultTarget: 35 },
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
// FOOD LIBRARY — per maaltijdtype getagged
// tags: array van meal-id's waarvoor dit item logisch is
// 'all' = alle slots
// ─────────────────────────────────────────────────────────────────
const FOOD_LIBRARY = [
  // ── ONTBIJT items ──
  { name: '1 ei (groot)',                  protein: 6,  kcal: 72,  serving: '1 ei',            tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: '2 eieren',                     protein: 12, kcal: 144, serving: '2 eieren',         tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: '3 eieren',                     protein: 18, kcal: 216, serving: '3 eieren',         tags: ['breakfast'] },
  { name: 'Eiwitten (3)',                 protein: 11, kcal: 51,  serving: '3 eiwitten',       tags: ['breakfast','evening_snack'] },
  { name: 'Gerookte zalm (50g)',          protein: 13, kcal: 83,  serving: '50g',              tags: ['breakfast','lunch','evening_snack'] },
  { name: 'Gerookte zalm (100g)',         protein: 25, kcal: 165, serving: '100g',             tags: ['breakfast','lunch'] },
  { name: 'Griekse yogurt 0% (100g)',     protein: 10, kcal: 57,  serving: '100g',             tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Griekse yogurt 0% (200g)',     protein: 20, kcal: 114, serving: '200g pot',         tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Griekse yogurt vol (100g)',    protein: 10, kcal: 97,  serving: '100g',             tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Skyr (100g)',                  protein: 11, kcal: 65,  serving: '100g',             tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Skyr (150g)',                  protein: 17, kcal: 98,  serving: '150g',             tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Kwark naturel (100g)',         protein: 12, kcal: 67,  serving: '100g',             tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Kwark naturel (150g)',         protein: 18, kcal: 101, serving: '150g',             tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Hüttenkäse (100g)',           protein: 11, kcal: 98,  serving: '100g',             tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Hüttenkäse (200g)',           protein: 22, kcal: 196, serving: '200g',             tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Halfvolle melk (200ml)',       protein: 7,  kcal: 92,  serving: '200ml',            tags: ['breakfast'] },
  { name: 'Havermout droog (40g)',        protein: 5,  kcal: 150, serving: '40g',              tags: ['breakfast'] },
  { name: 'Havermout droog (60g)',        protein: 7,  kcal: 225, serving: '60g',              tags: ['breakfast'] },
  { name: 'Volkoren brood (1 snede)',     protein: 4,  kcal: 110, serving: '40g snede',        tags: ['breakfast','lunch'] },
  { name: 'Roggebrood (1 snede)',         protein: 3,  kcal: 80,  serving: '35g snede',        tags: ['breakfast','lunch'] },
  { name: 'Whey proteïne (1 scoop)',      protein: 24, kcal: 130, serving: '1 scoop ~30g',     tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Caseïne proteïne (1 scoop)',   protein: 24, kcal: 120, serving: '1 scoop ~30g',     tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Pindakaas (2 el)',             protein: 7,  kcal: 188, serving: '32g',              tags: ['breakfast','afternoon_snack'] },
  { name: 'Amandelboter (2 el)',          protein: 7,  kcal: 196, serving: '32g',              tags: ['breakfast','afternoon_snack'] },
  { name: 'Amandelen (30g)',              protein: 6,  kcal: 164, serving: '30g',              tags: ['breakfast','afternoon_snack','evening_snack'] },
  { name: 'Hennepzaden (30g)',            protein: 10, kcal: 170, serving: '30g',              tags: ['breakfast'] },
  { name: 'Chiazaden (20g)',              protein: 3,  kcal: 97,  serving: '20g',              tags: ['breakfast'] },
  { name: 'Pompoenpitten (30g)',          protein: 9,  kcal: 163, serving: '30g',              tags: ['breakfast','afternoon_snack'] },
  { name: 'Proteïnereep',                protein: 20, kcal: 220, serving: '~60g reep',         tags: ['afternoon_snack','evening_snack'] },
  { name: 'String kaas stick',           protein: 7,  kcal: 80,  serving: '28g',              tags: ['afternoon_snack','evening_snack'] },
  { name: 'Babybel light (1)',            protein: 6,  kcal: 41,  serving: '20g rondje',       tags: ['afternoon_snack','evening_snack'] },
  { name: 'Rijstwafel (2)',              protein: 2,  kcal: 70,  serving: '2 wafels',         tags: ['afternoon_snack'] },
  { name: 'Havermoutkoekjes (3)',         protein: 3,  kcal: 138, serving: '3 koekjes',        tags: ['afternoon_snack'] },
  { name: 'Beef jerky (50g)',             protein: 17, kcal: 132, serving: '50g',              tags: ['afternoon_snack','evening_snack'] },
  { name: 'Beef jerky (100g)',            protein: 33, kcal: 264, serving: '100g',             tags: ['afternoon_snack','evening_snack'] },
  { name: 'Edamame (100g)',               protein: 11, kcal: 121, serving: '100g gekookt',     tags: ['afternoon_snack','evening_snack'] },
  { name: 'Proteïne yoghurtdrank',        protein: 20, kcal: 160, serving: '330ml fles',       tags: ['afternoon_snack','evening_snack'] },
  // ── LUNCH items ──
  { name: 'Kipfilet (100g)',              protein: 31, kcal: 165, serving: '100g gegrild',     tags: ['lunch','dinner'] },
  { name: 'Kipfilet (150g)',              protein: 47, kcal: 248, serving: '150g gegrild',     tags: ['lunch','dinner'] },
  { name: 'Kippendij (100g)',             protein: 26, kcal: 209, serving: '100g gegrild',     tags: ['lunch','dinner'] },
  { name: 'Kalkoenfilet (100g)',          protein: 29, kcal: 135, serving: '100g gegrild',     tags: ['lunch','dinner'] },
  { name: 'Kalkoenreepjes (deli, 100g)', protein: 18, kcal: 90,  serving: '100g',             tags: ['lunch'] },
  { name: 'Hesp gesneden (100g)',         protein: 17, kcal: 115, serving: '100g',             tags: ['lunch'] },
  { name: 'Tonijn blik (100g)',           protein: 25, kcal: 116, serving: '100g uitgelekt',   tags: ['lunch','afternoon_snack'] },
  { name: 'Tonijn steak (150g)',          protein: 36, kcal: 175, serving: '150g gegaard',     tags: ['lunch','dinner'] },
  { name: 'Zalm filet (100g)',            protein: 25, kcal: 208, serving: '100g gegaard',     tags: ['lunch','dinner'] },
  { name: 'Zalm filet (150g)',            protein: 38, kcal: 312, serving: '150g gegaard',     tags: ['lunch','dinner'] },
  { name: 'Sardines blik (100g)',         protein: 25, kcal: 208, serving: '100g',             tags: ['lunch'] },
  { name: 'Makreel blik (100g)',          protein: 19, kcal: 305, serving: '100g',             tags: ['lunch'] },
  { name: 'Garnalen (100g)',              protein: 24, kcal: 99,  serving: '100g gekookt',     tags: ['lunch','dinner'] },
  { name: 'Garnalen (150g)',              protein: 36, kcal: 149, serving: '150g gekookt',     tags: ['lunch','dinner'] },
  { name: 'Cheddar snede (40g)',          protein: 10, kcal: 161, serving: '40g',              tags: ['lunch','breakfast'] },
  { name: 'Mozzarella (50g)',             protein: 11, kcal: 140, serving: '50g',              tags: ['lunch','dinner'] },
  { name: 'Mozzarella (100g)',            protein: 22, kcal: 280, serving: '100g',             tags: ['lunch','dinner'] },
  { name: 'Feta kaas (50g)',              protein: 7,  kcal: 133, serving: '50g',              tags: ['lunch','dinner'] },
  { name: 'Hummus (100g)',                protein: 5,  kcal: 166, serving: '100g',             tags: ['lunch','afternoon_snack'] },
  { name: 'Linzen gekookt (100g)',        protein: 9,  kcal: 116, serving: '100g',             tags: ['lunch','dinner'] },
  { name: 'Linzen gekookt (200g)',        protein: 18, kcal: 232, serving: '200g',             tags: ['lunch','dinner'] },
  { name: 'Kikkererwten (100g)',          protein: 9,  kcal: 164, serving: '100g gekookt',     tags: ['lunch','dinner'] },
  { name: 'Kikkererwten (200g)',          protein: 18, kcal: 328, serving: '200g gekookt',     tags: ['lunch','dinner'] },
  { name: 'Zwarte bonen (100g)',          protein: 9,  kcal: 132, serving: '100g gekookt',     tags: ['lunch','dinner'] },
  { name: 'Tofu stevig (100g)',           protein: 17, kcal: 144, serving: '100g',             tags: ['lunch','dinner'] },
  { name: 'Tofu stevig (200g)',           protein: 34, kcal: 288, serving: '200g',             tags: ['lunch','dinner'] },
  { name: 'Quinoa gekookt (100g)',        protein: 4,  kcal: 120, serving: '100g',             tags: ['lunch','dinner'] },
  { name: 'Quinoa gekookt (150g)',        protein: 6,  kcal: 180, serving: '150g',             tags: ['lunch','dinner'] },
  { name: 'Bruine rijst (100g)',          protein: 3,  kcal: 111, serving: '100g gekookt',     tags: ['lunch','dinner'] },
  { name: 'Bruine rijst (150g)',          protein: 5,  kcal: 167, serving: '150g gekookt',     tags: ['lunch','dinner'] },
  { name: 'Volkorenwrap (groot)',         protein: 5,  kcal: 170, serving: '1 groot wrap',     tags: ['lunch'] },
  { name: 'Volkoren pitta (1)',           protein: 5,  kcal: 145, serving: '1 pitta',          tags: ['lunch'] },
  { name: 'Pasta gekookt (100g)',         protein: 5,  kcal: 158, serving: '100g',             tags: ['lunch','dinner'] },
  { name: 'Pasta gekookt (150g)',         protein: 8,  kcal: 237, serving: '150g',             tags: ['lunch','dinner'] },
  // ── DINER items ──
  { name: 'Kipfilet (200g)',              protein: 62, kcal: 330, serving: '200g gegrild',     tags: ['dinner'] },
  { name: 'Kalkoengehakt (100g)',         protein: 27, kcal: 160, serving: '100g gebakken',    tags: ['dinner'] },
  { name: 'Kalkoengehakt (150g)',         protein: 41, kcal: 240, serving: '150g gebakken',    tags: ['dinner'] },
  { name: 'Rundergehakt mager (100g)',    protein: 26, kcal: 218, serving: '100g gebakken',    tags: ['dinner'] },
  { name: 'Rundergehakt mager (150g)',    protein: 39, kcal: 327, serving: '150g gebakken',    tags: ['dinner'] },
  { name: 'Biefstuk (100g)',              protein: 27, kcal: 207, serving: '100g gebakken',    tags: ['dinner'] },
  { name: 'Varkenslende (150g)',          protein: 39, kcal: 278, serving: '150g gebakken',    tags: ['dinner'] },
  { name: 'Spek (2 reepjes)',             protein: 12, kcal: 138, serving: '40g gebakken',     tags: ['breakfast','dinner'] },
  { name: 'Kabeljau filet (150g)',        protein: 35, kcal: 158, serving: '150g gebakken',    tags: ['dinner'] },
  { name: 'Schelvis (150g)',              protein: 33, kcal: 150, serving: '150g gebakken',    tags: ['dinner'] },
  { name: 'Mosselen (100g)',              protein: 24, kcal: 172, serving: '100g gekookt',     tags: ['dinner'] },
  { name: 'Tempeh (100g)',                protein: 19, kcal: 193, serving: '100g',             tags: ['dinner'] },
  { name: 'Seitan (100g)',                protein: 25, kcal: 165, serving: '100g',             tags: ['dinner'] },
  { name: 'Sojahack droog (50g)',         protein: 26, kcal: 148, serving: '50g droog',        tags: ['dinner'] },
  { name: 'Zoete aardappel (150g)',       protein: 2,  kcal: 155, serving: '150g gebakken',    tags: ['dinner'] },
  { name: 'Nieuwe aardappelen (150g)',    protein: 3,  kcal: 117, serving: '150g gekookt',     tags: ['dinner'] },
  { name: 'Parmezaan (30g)',              protein: 10, kcal: 129, serving: '30g geraspt',      tags: ['lunch','dinner'] },
  { name: 'Ricotta (100g)',               protein: 11, kcal: 174, serving: '100g',             tags: ['dinner'] },
  { name: 'Erwten proteïnepoeder (1sc)', protein: 21, kcal: 100, serving: '1 scoop 25g',      tags: ['dinner','lunch'] },
];

// ─────────────────────────────────────────────────────────────────
// SUGGESTION POOL per slot
// ─────────────────────────────────────────────────────────────────
const SUGGESTION_POOL = {
  breakfast: [
    { label: '3 roerei + 200g Griekse yogurt',                   protein: 38, kcal: 424 },
    { label: 'Overnight oats + whey proteïne + bosvruchten',     protein: 29, kcal: 410 },
    { label: '3-ei omelet met hesp & cheddar',                   protein: 32, kcal: 380 },
    { label: 'Hüttenkäse op 2 sneden volkoren + tomaat',         protein: 21, kcal: 318 },
    { label: 'Gerookte zalm + 2 gepocheerde eieren + roggebrood',protein: 38, kcal: 460 },
    { label: 'Proteïne pannenkoeken (haver + ei + banaan)',       protein: 22, kcal: 340 },
    { label: 'Skyr parfait met granola, amandelen & bessen',     protein: 23, kcal: 380 },
    { label: 'Kalkoenspek + 3 eieren + volkoren toast',          protein: 34, kcal: 430 },
    { label: 'Kwark (150g) + bessen + 1 scoop whey',             protein: 33, kcal: 260 },
    { label: '200g Griekse yogurt + hennepzaden + honing + banaan',protein:23,kcal: 310 },
    { label: 'Ei & spinaziewrap met feta kaas',                  protein: 24, kcal: 360 },
    { label: 'Proteïnesmoothie (whey + melk + haver + banaan)',  protein: 34, kcal: 420 },
    { label: 'Gerookte zalm + roerei op zuurdesem',              protein: 32, kcal: 420 },
    { label: '3-ei groenteomelet (paprika, spinazie, kaas)',     protein: 24, kcal: 310 },
    { label: 'Skyr (200g) + 2 el PB + bananenschijfjes',        protein: 28, kcal: 410 },
    { label: 'High-protein overnight oats (caseïne + haver + melk)',protein:32,kcal:450},
    { label: 'Hüttenkäse pannenkoekjes (2 eieren + 100g CC + haver)',protein:28,kcal:380},
    { label: '2 gekookte eieren + roggebrood + gerookte zalm',   protein: 30, kcal: 360 },
    { label: 'Proteïnekom: kwark + granola + kiwi + chiazaden', protein: 22, kcal: 340 },
    { label: 'Griekse yogurt + proteïnegranola + gemengde bessen',protein:26, kcal: 390 },
  ],
  lunch: [
    { label: 'Gegrilde kipfilet + quinoa + geroosterde groenten',protein: 52, kcal: 490 },
    { label: 'Tonijn nicoise salade met eieren & olijven',       protein: 38, kcal: 380 },
    { label: 'Zalm & avocado bruine rijstkom',                   protein: 42, kcal: 530 },
    { label: 'Kipwrap met hummus, feta & salade',                protein: 39, kcal: 480 },
    { label: 'Rundergehakt & linzensoep + volkoren broodje',     protein: 34, kcal: 520 },
    { label: 'Kalkoen & mozzarella caprese salade + pasta',      protein: 36, kcal: 490 },
    { label: 'Garnalenroerbak met bruine rijst & sesam',         protein: 36, kcal: 400 },
    { label: 'Griekse kipkom: rijst, feta, olijven, tzatziki',  protein: 44, kcal: 560 },
    { label: 'Linzen & fetasalade met zachtgekookt ei',          protein: 24, kcal: 360 },
    { label: 'Tofu poke bowl met edamame & sesamdressing',       protein: 32, kcal: 420 },
    { label: 'Tonijn & kikkererwten salade in volkoren wrap',    protein: 35, kcal: 470 },
    { label: 'Hüttenkäse & groente flatbread',                  protein: 26, kcal: 390 },
    { label: 'Kip Caesar salade (lichte dressing)',              protein: 44, kcal: 460 },
    { label: 'Biefstreepjes + zoete aardappel + broccoli',       protein: 42, kcal: 540 },
    { label: 'Garnalen & avocado salade op roggebrood',          protein: 30, kcal: 400 },
    { label: 'Kalkoengehakt bolognese + pasta',                  protein: 40, kcal: 550 },
    { label: 'Gerookte makreel + nieuwe aardappelen + salade',   protein: 30, kcal: 470 },
    { label: 'Kikkererwten & spinaziecurry met bruine rijst',    protein: 22, kcal: 490 },
    { label: 'Kip & avocado rijstvellen rolletjes',              protein: 28, kcal: 360 },
    { label: 'Sardines & tomaat op volkoren toast (open bro)',   protein: 28, kcal: 340 },
  ],
  afternoon_snack: [
    { label: '200g hüttenkäse + komkommersticks',                protein: 22, kcal: 196 },
    { label: 'Proteïnereep + zwarte koffie',                     protein: 20, kcal: 220 },
    { label: '150g Griekse yogurt + 30g amandelen',              protein: 21, kcal: 310 },
    { label: '2 hardgekookte eieren + cherrytomaatjes',          protein: 12, kcal: 150 },
    { label: 'Whey shake met 200ml halfvolle melk',              protein: 31, kcal: 230 },
    { label: 'Skyr (150g) + handvol bosvruchten',                protein: 17, kcal: 120 },
    { label: '100g edamame + snufje zeezout',                    protein: 11, kcal: 121 },
    { label: '2 rijstwafels + pindakaas + bananenschijfjes',     protein: 8,  kcal: 250 },
    { label: '2x string kaas + appelschijfjes',                  protein: 14, kcal: 190 },
    { label: 'Tonijn (65g uitgelekt) + havermoutkoekjes',        protein: 15, kcal: 200 },
    { label: 'Kwark (100g) + bessen + honing',                   protein: 12, kcal: 140 },
    { label: '3 Babybel + handvol druiven',                      protein: 18, kcal: 210 },
    { label: '1 gekookt ei + gerookte zalm (30g)',               protein: 13, kcal: 110 },
    { label: 'Proteïne yoghurtdrank',                            protein: 20, kcal: 160 },
    { label: 'Beef jerky (50g)',                                  protein: 17, kcal: 132 },
    { label: 'Pompoenpitten (30g) + 2 rijstwafels + hummus',     protein: 12, kcal: 280 },
    { label: '30g amandelen + 1 string kaas',                    protein: 13, kcal: 244 },
    { label: 'Caseïne shake (langzaam verteerbaar)',              protein: 24, kcal: 120 },
  ],
  dinner: [
    { label: 'Kippendij + zoete aardappel + tenderstem broccoli',protein:48, kcal: 580 },
    { label: 'Zalm met linzen & gestoofde spinazie',              protein:48, kcal: 600 },
    { label: 'Rundergehakt roerbak met bruine rijst & paprika',   protein:50, kcal: 620 },
    { label: 'Kalkoengehakt chili met kidneybonen & rijst',       protein:54, kcal: 540 },
    { label: 'Garnalenpasta met knoflook, chili & courgette',     protein:40, kcal: 520 },
    { label: 'Kabeljau + quinoa + geroosterde paprika & pesto',   protein:48, kcal: 480 },
    { label: 'Kip & kikkererwten curry met bruine rijst',         protein:50, kcal: 640 },
    { label: 'Varkenslende + nieuwe aardappelen + sperziebonen',  protein:52, kcal: 580 },
    { label: 'Tempeh & groenteroerbak met noedels',               protein:38, kcal: 510 },
    { label: 'Gegrilde schelvis + quinoa + tenderstem broccoli',  protein:50, kcal: 490 },
    { label: 'Kalkoenburger + zoete aardappelfrietjes + slaw',    protein:44, kcal: 620 },
    { label: 'Seitan "steak" + puree van zoete aardappel + boerenkool',protein:52,kcal:560},
    { label: 'Gevulde kipfilet met ricotta & spinazie',           protein:48, kcal: 510 },
    { label: 'Rundertaco\'s (maïstortilla, salsa, avocado)',      protein:40, kcal: 600 },
    { label: 'Zalm teriyaki + bruine rijst + roergebakken groenten',protein:46,kcal:590},
    { label: 'Mosselen in tomatensaus + knapperig brood',         protein:30, kcal: 430 },
    { label: 'Kalkoen moussaka + Griekse salade',                 protein:44, kcal: 560 },
    { label: 'Tofu & broccoli groene curry met jasmijnrijst',     protein:30, kcal: 520 },
    { label: 'Varkensmager + linzendhal + volkoren flatbread',    protein:42, kcal: 560 },
    { label: 'Garnalen & zoete aardappelkroketten + salade',      protein:32, kcal: 490 },
  ],
  evening_snack: [
    { label: '200g hüttenkäse + gemengde bessen',                protein: 22, kcal: 210 },
    { label: '150g Griekse yogurt + 1 el PB',                    protein: 17, kcal: 240 },
    { label: '1 scoop caseïne shake + 200ml melk',               protein: 31, kcal: 200 },
    { label: '2 hardgekookte eieren',                             protein: 12, kcal: 144 },
    { label: 'Kwark (150g) + bessen + druppel honing',           protein: 18, kcal: 150 },
    { label: 'Skyr (150g) + 30g amandelen',                      protein: 22, kcal: 270 },
    { label: 'Gerookte zalm (50g) + komkommer',                  protein: 13, kcal: 83  },
    { label: 'Beef jerky (50g)',                                  protein: 17, kcal: 132 },
    { label: 'Proteïnereep',                                      protein: 20, kcal: 220 },
    { label: '200g vetarme hüttenkäse op 2 rijstwafels',         protein: 24, kcal: 260 },
    { label: '2 Babybel + handvol pompoenpitten',                 protein: 15, kcal: 215 },
    { label: 'Proteïne yoghurtdrank',                             protein: 20, kcal: 160 },
    { label: '1 scoop whey + 150ml melk + ijs (geblend)',        protein: 28, kcal: 185 },
    { label: '3 eiwitten roerei + cherrytomaatjes',               protein: 11, kcal: 65  },
    { label: '100g edamame (gezouten)',                           protein: 11, kcal: 121 },
  ],
};

// ─────────────────────────────────────────────────────────────────
// AUTO PLAN MEALS
// ─────────────────────────────────────────────────────────────────
const PLAN_MEALS = {
  breakfast: [
    { name: 'Proteïne Havermout',      ingredients: 'Haver (60g) + whey + bessen + amandelboter',             protein: 32, kcal: 430 },
    { name: 'Groot Ei Ontbijt',        ingredients: '3 roerei + 200g Griekse yogurt + volkoren toast',         protein: 38, kcal: 480 },
    { name: 'Gerookte Zalm Bord',      ingredients: 'Gerookte zalm (100g) + 2 gepocheerde eieren + roggebrood',protein: 38, kcal: 460 },
    { name: 'Kwarkkom',                ingredients: 'Kwark (150g) + bessen + hennepzaden + honing',            protein: 28, kcal: 290 },
    { name: 'Hüttenkäse Toast',        ingredients: 'Hüttenkäse (150g) + volkoren toast (x2) + tomaat',       protein: 24, kcal: 360 },
    { name: 'Skyr Parfait',            ingredients: 'Skyr (200g) + krokante granola + amandelen + banaan',     protein: 24, kcal: 420 },
    { name: 'Kalkoenspek Omelet',      ingredients: '3 eieren + kalkoenspek (2) + cheddar + spinazie',         protein: 38, kcal: 440 },
    { name: 'Proteïne Smoothie',       ingredients: 'Whey (1 scoop) + 200ml melk + banaan + 40g haver',       protein: 35, kcal: 450 },
    { name: 'CC Pannenkoekjes',        ingredients: 'Hüttenkäse (100g) + 2 eieren + 40g haver (gebakken)',    protein: 28, kcal: 380 },
    { name: 'Overnight Caseïne Haver', ingredients: 'Caseïne (1 scoop) + 60g haver + melk + chiazaden (nacht)',protein:32, kcal: 450 },
  ],
  lunch: [
    { name: 'Kip Quinoakom',           ingredients: 'Kipfilet (150g) + quinoa (100g) + geroosterde groenten + pesto', protein: 52, kcal: 555 },
    { name: 'Tonijn Salé Wrap',        ingredients: 'Tonijn (130g) + kikkererwten + volkoren wrap + salade',    protein: 38, kcal: 470 },
    { name: 'Zalm Rijstkom',           ingredients: 'Zalm (150g) + bruine rijst (100g) + avocado + komkommer', protein: 42, kcal: 560 },
    { name: 'Kalkoen Eiwitwrap',       ingredients: 'Kalkoenreepjes (120g) + mozzarella + spinazie + groot wrap',protein:40, kcal: 490 },
    { name: 'Runder Linzensoep',       ingredients: 'Rundergehakt (100g) + linzen (150g) + groenten + broodje', protein: 42, kcal: 580 },
    { name: 'Griekse Kipkom',          ingredients: 'Kip (150g) + quinoa + feta + olijven + tzatziki',         protein: 46, kcal: 570 },
    { name: 'Tofu Poke Bowl',          ingredients: 'Stevig tofu (200g) + bruine rijst + edamame + sesamdressing',protein:34,kcal:440},
    { name: 'Garnalenroerbak',         ingredients: 'Garnalen (150g) + bruine rijst + broccoli + soja-gembersaus',protein:38,kcal:410},
    { name: 'Biefstuk Bord',           ingredients: 'Biefstreepjes (150g) + zoete aardappel + groene salade',  protein: 42, kcal: 520 },
    { name: 'Gerookte Makreelkom',     ingredients: 'Gerookte makreel (150g) + nieuwe aardappelen + komkommer', protein: 32, kcal: 490 },
  ],
  afternoon_snack: [
    { name: 'Hüttenkäse Pot',         ingredients: 'Hüttenkäse (200g) + komkommer + cherrytomaatjes',         protein: 22, kcal: 196 },
    { name: 'Proteïne Shake',         ingredients: 'Whey proteïne (1 scoop) + 200ml halfvolle melk',           protein: 31, kcal: 220 },
    { name: 'Yogurt & Noten Mix',     ingredients: 'Griekse yogurt (150g) + 30g amandelen + bessen',           protein: 21, kcal: 310 },
    { name: 'Ei & Tomaat',            ingredients: '2 hardgekookte eieren + cherrytomaatjes + hot sauce',       protein: 12, kcal: 154 },
    { name: 'Skyr Pot',               ingredients: 'Skyr (150g) + bessen + hennepzaden',                       protein: 19, kcal: 145 },
    { name: 'Proteïnereep',           ingredients: 'Eiwitreep (20g+ proteïne)',                                 protein: 20, kcal: 220 },
    { name: 'Beef Jerky & Babybel',   ingredients: 'Beef jerky (50g) + 2 Babybel light',                       protein: 23, kcal: 215 },
    { name: 'Caseïne Shake',          ingredients: 'Caseïne (1 scoop) + 200ml water of melk',                  protein: 24, kcal: 130 },
  ],
  dinner: [
    { name: 'Kip & Zoete Aardappel',  ingredients: 'Kipfilet (200g) + zoete aardappel (150g) + broccoli',     protein: 50, kcal: 590 },
    { name: 'Zalm & Linzen',          ingredients: 'Zalmfilet (150g) + linzen (200g) + spinazie + citroen',    protein: 50, kcal: 620 },
    { name: 'Runder Roerbak',         ingredients: 'Rundergehakt mager (150g) + bruine rijst + paprika + soja',protein:52, kcal: 640 },
    { name: 'Kalkoen Chili',          ingredients: 'Kalkoengehakt (200g) + kidneybonen + tomaten + rijst',     protein: 54, kcal: 550 },
    { name: 'Kabeljau & Quinoa',      ingredients: 'Kabeljau (200g) + quinoa (100g) + geroosterde paprika',    protein: 48, kcal: 490 },
    { name: 'Kip Curry',              ingredients: 'Kip (200g) + kikkererwten + lichte kokossaus + rijst',     protein: 50, kcal: 650 },
    { name: 'Varkens Lende Bord',     ingredients: 'Varkenslende (200g) + nieuwe aardappelen + sperziebonen', protein: 52, kcal: 580 },
    { name: 'Garnalenpasta',          ingredients: 'Garnalen (150g) + pasta (100g) + courgette + knoflook',    protein: 40, kcal: 520 },
    { name: 'Kalkoen Moussaka',       ingredients: 'Kalkoengehakt (150g) + aubergine + tomatensaus + feta',    protein: 44, kcal: 520 },
    { name: 'Zalm Teriyaki',          ingredients: 'Zalm (150g) + bruine rijst + geroerbakte pak choi & broccoli',protein:46,kcal:570},
  ],
  evening_snack: [
    { name: 'Hüttenkäse & Bessen',   ingredients: 'Hüttenkäse (200g) + gemengde bessen',                      protein: 22, kcal: 210 },
    { name: 'Caseïne Shake',         ingredients: 'Caseïne proteïne (1 scoop) + 200ml melk — langzaam',        protein: 30, kcal: 210 },
    { name: 'Griekse Yogurt & PB',   ingredients: 'Griekse yogurt (150g) + pindakaas (1 el) + banaan',         protein: 18, kcal: 290 },
    { name: 'Kwark & Honing',        ingredients: 'Kwark (150g) + bessen + druppel honing',                    protein: 18, kcal: 150 },
    { name: 'Gekookte Eieren',       ingredients: '2 hardgekookte eieren + zout & peper',                      protein: 12, kcal: 144 },
    { name: 'Skyr & Amandelen',      ingredients: 'Skyr (150g) + 30g amandelen',                               protein: 23, kcal: 270 },
    { name: 'Whey Shake',            ingredients: 'Whey (1 scoop) + 150ml melk + ijs',                         protein: 28, kcal: 185 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
var activeUserId      = null;
var currentMealId     = null;
var currentPlan       = null;          // { breakfast: meal, lunch: meal, ... }
var planSelections    = {};            // user-chosen meals in plan modal
var suggestionOffsets = {};            // per-slot refresh counter

// ═══════════════════════════════════════════════════════════════
// AUTH — email + wachtwoord, puur localStorage
// Wachtwoord wordt gehashed (simpele hash — geen server nodig)
// ═══════════════════════════════════════════════════════════════
function hashPassword(pw) {
  // djb2-achtige hash — voldoende voor privacy tussen gezinsleden op één apparaat
  var h = 5381;
  for (var i = 0; i < pw.length; i++) {
    h = ((h << 5) + h) + pw.charCodeAt(i);
    h = h & h;
  }
  return (h >>> 0).toString(16);
}

function getUserByEmail(email) {
  var ids = getAllUserIds();
  for (var i = 0; i < ids.length; i++) {
    var p = loadProfile(ids[i]);
    if (p && p.email && p.email.toLowerCase() === email.toLowerCase()) return { uid: ids[i], profile: p };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// LOCALSTORAGE HELPERS
// ═══════════════════════════════════════════════════════════════
function getAllUserIds()     { return JSON.parse(localStorage.getItem('protrack_users') || '[]'); }
function saveAllUserIds(ids) { localStorage.setItem('protrack_users', JSON.stringify(ids)); }
function loadProfile(uid)    { return JSON.parse(localStorage.getItem('protrack_profile_' + uid) || 'null'); }
function saveProfile(uid, p) { localStorage.setItem('protrack_profile_' + uid, JSON.stringify(p)); }
function todayKey()          { return new Date().toISOString().slice(0, 10); }
function loadTodayLog() {
  return JSON.parse(localStorage.getItem('protrack_log_' + activeUserId + '_' + todayKey()) || 'null') || { meals: {}, healthKcal: 0 };
}
function saveTodayLog(log) {
  localStorage.setItem('protrack_log_' + activeUserId + '_' + todayKey(), JSON.stringify(log));
}
function loadHistory(days) {
  var profile = loadProfile(activeUserId);
  var target  = profile ? (profile.proteinTarget || DEFAULT_PROTEIN_TARGET) : DEFAULT_PROTEIN_TARGET;
  var result  = [];
  for (var i = days; i >= 1; i--) {
    var d = new Date(); d.setDate(d.getDate() - i);
    var ds  = d.toISOString().slice(0, 10);
    var log = JSON.parse(localStorage.getItem('protrack_log_' + activeUserId + '_' + ds) || 'null');
    var tot = log ? getTotalProtein(log) : 0;
    result.push({ dayLabel: d.toLocaleDateString('nl-BE', { weekday: 'short' }), total: tot, target: target, hit: tot >= target });
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// CALCULATION HELPERS
// ═══════════════════════════════════════════════════════════════
function getTotalProtein(log)  { return Object.values(log.meals||{}).flat().reduce(function(s,i){return s+(i.protein||0);},0); }
function getTotalFoodKcal(log) { return Object.values(log.meals||{}).flat().reduce(function(s,i){return s+(i.kcal||0);},0); }
function getMealProtein(log,mid){ return (log.meals[mid]||[]).reduce(function(s,i){return s+(i.protein||0);},0); }
function getMealKcal(log,mid)   { return (log.meals[mid]||[]).reduce(function(s,i){return s+(i.kcal||0);},0); }
function getEffectiveTarget(profile,log) {
  var base = profile && profile.proteinTarget ? profile.proteinTarget : DEFAULT_PROTEIN_TARGET;
  var hkcal = log && log.healthKcal ? log.healthKcal : 0;
  return hkcal > 0 ? Math.round(hkcal * PROTEIN_KCAL_RATIO) : base;
}
function getMealTarget(mealDef, effectiveTotal) {
  return Math.round(mealDef.defaultTarget / DEFAULT_PROTEIN_TARGET * effectiveTotal);
}
function calcBMI(w, h) {
  if (!w || !h) return null;
  var bmi = w / ((h/100)*(h/100));
  var cat = bmi<18.5?'Ondergewicht':bmi<25?'Normaal':bmi<30?'Overgewicht':'Zwaarlijvig';
  return bmi.toFixed(1) + ' — ' + cat;
}

// ═══════════════════════════════════════════════════════════════
// SHUFFLE HELPERS
// ═══════════════════════════════════════════════════════════════
function seededRand(seed) {
  var s = seed;
  return function() { s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0x100000000; };
}
function seededShuffle(arr, seed) {
  var a=arr.slice(), rand=seededRand(seed);
  for(var i=a.length-1;i>0;i--){var j=Math.floor(rand()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}
function shuffle(arr) {
  var a=arr.slice();
  for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}
function todaySeed() { return parseInt(todayKey().replace(/-/g,''),10); }

function getDailySuggestions(mealId) {
  var pool   = SUGGESTION_POOL[mealId] || [];
  var offset = suggestionOffsets[mealId] || 0;
  var seed   = todaySeed() + mealId.length * 997 + offset * 10007;
  return seededShuffle(pool, seed).slice(0, 4);
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════
function genId()  { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
var toastTimer = null;
function showToast(msg, dur) {
  dur = dur||2500;
  var el=document.getElementById('toast');
  el.textContent=msg; el.classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){el.classList.add('hidden');},dur);
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s){s.classList.add('hidden');s.classList.remove('active');});
  var t=document.getElementById('screen-'+id);
  t.classList.remove('hidden'); t.classList.add('active'); window.scrollTo(0,0);
}

// ═══════════════════════════════════════════════════════════════
// AUTH SCREENS — Login & Registratie
// ═══════════════════════════════════════════════════════════════
function showAuthError(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}
function hideAuthError(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// Tab wisselen tussen login en registratie
document.getElementById('tabLogin').addEventListener('click', function() {
  document.getElementById('tabLogin').classList.add('auth-tab-active');
  document.getElementById('tabRegister').classList.remove('auth-tab-active');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
});
document.getElementById('tabRegister').addEventListener('click', function() {
  document.getElementById('tabRegister').classList.add('auth-tab-active');
  document.getElementById('tabLogin').classList.remove('auth-tab-active');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
});

// LOGIN
document.getElementById('btnLogin').addEventListener('click', function() {
  hideAuthError('loginError');
  var email = document.getElementById('loginEmail').value.trim().toLowerCase();
  var pw    = document.getElementById('loginPw').value;
  if (!email || !pw) { showAuthError('loginError','Vul email en wachtwoord in.'); return; }

  var found = getUserByEmail(email);
  if (!found) { showAuthError('loginError','Geen account gevonden met dit email.'); return; }
  if (found.profile.pwHash !== hashPassword(pw)) {
    showAuthError('loginError','Verkeerd wachtwoord. Probeer opnieuw.'); return;
  }
  loginAs(found.uid);
});

// REGISTRATIE
document.getElementById('btnRegister').addEventListener('click', function() {
  hideAuthError('registerError');
  var name   = document.getElementById('regName').value.trim();
  var email  = document.getElementById('regEmail').value.trim().toLowerCase();
  var pw     = document.getElementById('regPw').value;
  var pw2    = document.getElementById('regPw2').value;

  if (!name)  { showAuthError('registerError','Vul je naam in.'); return; }
  if (!email || !email.includes('@')) { showAuthError('registerError','Vul een geldig emailadres in.'); return; }
  if (!pw || pw.length < 4) { showAuthError('registerError','Wachtwoord moet minstens 4 tekens zijn.'); return; }
  if (pw !== pw2) { showAuthError('registerError','Wachtwoorden komen niet overeen.'); return; }
  if (getUserByEmail(email)) { showAuthError('registerError','Er bestaat al een account met dit emailadres.'); return; }

  var uid = genId();
  var profile = {
    name:          name,
    email:         email,
    pwHash:        hashPassword(pw),
    age:           parseInt(document.getElementById('regAge').value) || null,
    weight:        parseFloat(document.getElementById('regWeight').value) || null,
    height:        parseFloat(document.getElementById('regHeight').value) || null,
    proteinTarget: parseInt(document.getElementById('regProtein').value) || DEFAULT_PROTEIN_TARGET,
    calTarget:     parseInt(document.getElementById('regKcal').value) || null,
    herba:         DEFAULT_HERBA_PRODUCTS.slice(),
    createdAt:     new Date().toISOString(),
  };
  // auto BMI
  var ids = getAllUserIds(); ids.push(uid); saveAllUserIds(ids);
  saveProfile(uid, profile);
  showToast('Welkom, ' + name + '! 🎉');
  loginAs(uid);
});

// BMI auto-berekening in registratieformulier
['regWeight','regHeight'].forEach(function(id) {
  document.getElementById(id).addEventListener('input', function() {
    var w = parseFloat(document.getElementById('regWeight').value);
    var h = parseFloat(document.getElementById('regHeight').value);
    var bmiEl = document.getElementById('regBMI');
    if (bmiEl) bmiEl.textContent = calcBMI(w,h) || '—';
  });
});

function loginAs(uid) {
  activeUserId = uid;
  localStorage.setItem('protrack_active_user', uid);
  suggestionOffsets = {};
  renderDashboard();
  showScreen('dash');
}

function logout() {
  activeUserId = null;
  localStorage.removeItem('protrack_active_user');
  showScreen('auth');
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function renderDashboard() {
  var profile = loadProfile(activeUserId); if (!profile) return;
  var log = loadTodayLog();
  var initials = (profile.name||'?').slice(0,2).toUpperCase();
  document.getElementById('avatarBtn').textContent = initials;
  document.getElementById('topBarName').textContent = profile.name;
  document.getElementById('topBarDate').textContent = new Date().toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'short'});
  document.getElementById('healthKcal').value = log.healthKcal || '';

  var effectiveTarget = getEffectiveTarget(profile, log);
  var totalProtein    = getTotalProtein(log);
  var totalFoodKcal   = getTotalFoodKcal(log);
  var kcalTarget      = profile.calTarget || DEFAULT_KCAL_TARGET;
  var protPct         = Math.min(totalProtein / effectiveTarget, 1);
  var kcalPct         = Math.min(totalFoodKcal / kcalTarget, 1);
  var remaining       = Math.max(effectiveTarget - totalProtein, 0);

  var circ = 326.7;
  var arcEl = document.getElementById('ringArc');
  arcEl.style.strokeDashoffset = circ - protPct * circ;
  arcEl.style.stroke = protPct>=1?'var(--green-light)':protPct>=0.6?'var(--green)':'var(--orange)';
  document.getElementById('ringNum').textContent = Math.round(totalProtein);

  var kcalArcEl = document.getElementById('kcalArc');
  kcalArcEl.style.strokeDashoffset = circ - kcalPct * circ;
  document.getElementById('kcalRingNum').textContent = totalFoodKcal;

  document.getElementById('statConsumed').textContent = Math.round(totalProtein)+'g';
  document.getElementById('statTarget').textContent   = effectiveTarget+'g';
  document.getElementById('statRemain').textContent   = Math.round(remaining)+'g';
  document.getElementById('statKcal').textContent     = totalFoodKcal;
  document.getElementById('bigBarFill').style.width   = Math.round(protPct*100)+'%';
  document.getElementById('bigBarPct').textContent    = Math.round(protPct*100)+'%';

  var msgEl = document.getElementById('dynamicMsg');
  if (protPct >= 1) { msgEl.textContent='🎉 Doel gehaald! Je hebt '+Math.round(totalProtein)+'g bereikt vandaag.'; msgEl.style.color='var(--green-light)'; }
  else { msgEl.textContent='Nog '+Math.round(remaining)+'g om je doel van '+effectiveTarget+'g te bereiken.'; msgEl.style.color='var(--text2)'; }

  renderMealSlots(log, profile, effectiveTarget);
  renderSummary(log, profile, effectiveTarget, totalProtein, totalFoodKcal);
  renderHistory(totalProtein, effectiveTarget);
}

// ═══════════════════════════════════════════════════════════════
// MEAL SLOTS
// ═══════════════════════════════════════════════════════════════
function renderMealSlots(log, profile, effectiveTarget) {
  var container = document.getElementById('mealSlots');
  var openSlots = {};
  container.querySelectorAll('.meal-slot.open').forEach(function(el){ openSlots[el.id]=true; });
  container.innerHTML = '';

  var allProteins = MEAL_DEFAULTS.map(function(m){ return getMealProtein(log,m.id); });
  var maxProtein  = Math.max.apply(null, allProteins);

  MEAL_DEFAULTS.forEach(function(meal) {
    var mealTarget = getMealTarget(meal, effectiveTarget);
    var mealActual = getMealProtein(log, meal.id);
    var mealKcal   = getMealKcal(log, meal.id);
    var mealPct    = Math.min(mealActual / mealTarget, 1);
    var items      = log.meals[meal.id] || [];
    var isComplete = mealActual >= mealTarget;
    var isTopMeal  = mealActual > 0 && mealActual === maxProtein;

    var slot = document.createElement('div');
    slot.className = 'meal-slot' + (isComplete?' complete':'') + (isTopMeal?' top-meal':'');
    slot.id = 'slot_' + meal.id;
    if (openSlots['slot_' + meal.id]) slot.classList.add('open');

    var itemsHtml = '';
    if (items.length) {
      itemsHtml = '<div class="logged-items">';
      items.forEach(function(item, idx) {
        itemsHtml += '<div class="log-item">'+
          '<span class="log-item-dot"></span>'+
          '<span class="log-item-name">'+escHtml(item.name)+'</span>'+
          '<span class="log-item-macros">'+
            '<span class="log-item-g">'+item.protein+'g</span>'+
            (item.kcal?'<span class="log-item-kcal">'+item.kcal+' kcal</span>':'')+
          '</span>'+
          '<button class="log-item-del" data-meal="'+meal.id+'" data-idx="'+idx+'">✕</button>'+
          '</div>';
      });
      itemsHtml += '</div>';
    } else {
      itemsHtml = '<p class="empty-slot-msg">Nog niets gelogd</p>';
    }

    var suggestions = getDailySuggestions(meal.id);
    var chipsHtml = suggestions.map(function(s) {
      return '<button class="suggestion-chip"'+
        ' data-meal="'+meal.id+'"'+
        ' data-name="'+escHtml(s.label)+'"'+
        ' data-protein="'+s.protein+'"'+
        ' data-kcal="'+s.kcal+'">'+
        '<span class="sug-label">'+escHtml(s.label)+'</span>'+
        '<span class="sug-macros">~'+s.protein+'g · '+s.kcal+'kcal</span>'+
        '</button>';
    }).join('');

    var barColor = isComplete ? 'var(--green-light)' : 'var(--green)';

    slot.innerHTML =
      '<div class="meal-header" data-meal="'+meal.id+'" role="button" tabindex="0">'+
        '<div class="meal-icon-wrap">'+
          '<span class="meal-emoji">'+meal.emoji+'</span>'+
          (isTopMeal?'<span class="top-badge">⭐</span>':'')+
        '</div>'+
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
          '<div class="meal-mini-bar">'+
            '<div class="meal-mini-fill" style="width:'+Math.round(mealPct*100)+'%;background:'+barColor+'"></div>'+
          '</div>'+
        '</div>'+
        '<span class="meal-chevron">▼</span>'+
      '</div>'+
      '<div class="meal-body">'+
        itemsHtml+
        '<div class="suggestion-row">'+
          '<div class="suggestion-header">'+
            '<span class="suggestion-label">💡 Ideeën</span>'+
            '<button class="sug-refresh-btn" data-meal="'+meal.id+'" title="Andere suggesties">↻</button>'+
          '</div>'+
          '<div class="suggestion-chips">'+chipsHtml+'</div>'+
        '</div>'+
        '<button class="add-food-btn" data-meal="'+meal.id+'">'+
          '<span class="add-food-icon">＋</span> Voedsel / maaltijd toevoegen'+
        '</button>'+
      '</div>';

    container.appendChild(slot);
  });

  // Events
  container.querySelectorAll('.meal-header').forEach(function(hdr) {
    hdr.addEventListener('click', function() {
      var sl=hdr.closest('.meal-slot'), isOpen=sl.classList.contains('open');
      container.querySelectorAll('.meal-slot.open').forEach(function(s){s.classList.remove('open');});
      if (!isOpen) sl.classList.add('open');
    });
  });
  container.querySelectorAll('.log-item-del').forEach(function(btn) {
    btn.addEventListener('click', function(e) { e.stopPropagation(); deleteFoodItem(btn.dataset.meal, parseInt(btn.dataset.idx)); });
  });
  container.querySelectorAll('.suggestion-chip').forEach(function(chip) {
    chip.addEventListener('click', function(e) {
      e.stopPropagation();
      addFoodItem(chip.dataset.meal, chip.dataset.name, parseFloat(chip.dataset.protein), parseFloat(chip.dataset.kcal));
    });
  });
  container.querySelectorAll('.add-food-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) { e.stopPropagation(); openFoodModal(btn.dataset.meal); });
  });
  container.querySelectorAll('.sug-refresh-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var mid = btn.dataset.meal;
      suggestionOffsets[mid] = (suggestionOffsets[mid]||0) + 1;
      var log = loadTodayLog(), profile = loadProfile(activeUserId);
      renderMealSlots(log, profile, getEffectiveTarget(profile, log));
      setTimeout(function(){ var s=document.getElementById('slot_'+mid); if(s) s.classList.add('open'); }, 20);
      showToast('Nieuwe suggesties geladen ✨');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// FOOD LOG MUTATIONS
// ═══════════════════════════════════════════════════════════════
function addFoodItem(mealId, name, protein, kcal) {
  kcal = kcal || 0;
  var log = loadTodayLog();
  if (!log.meals[mealId]) log.meals[mealId] = [];
  log.meals[mealId].push({ name: name, protein: Math.round(protein*10)/10, kcal: Math.round(kcal)||0 });
  saveTodayLog(log); renderDashboard();
  setTimeout(function(){ var s=document.getElementById('slot_'+mealId); if(s&&!s.classList.contains('open'))s.classList.add('open'); }, 30);
  showToast('Toegevoegd: '+name+' (+'+protein+'g proteïne'+(kcal?', '+kcal+' kcal':'')+')');
}
function deleteFoodItem(mealId, idx) {
  var log = loadTodayLog(), item = (log.meals[mealId]||[])[idx]; if (!item) return;
  log.meals[mealId].splice(idx,1);
  saveTodayLog(log); renderDashboard();
  setTimeout(function(){ var s=document.getElementById('slot_'+mealId); if(s&&!s.classList.contains('open'))s.classList.add('open'); }, 30);
  showToast('Verwijderd: '+item.name);
}

// ═══════════════════════════════════════════════════════════════
// FOOD MODAL — gefilterd op maaltijdtype
// ═══════════════════════════════════════════════════════════════
var filteredFoods = FOOD_LIBRARY.slice();

function getFoodsForMeal(mealId) {
  return FOOD_LIBRARY.filter(function(f) {
    return !f.tags || f.tags.indexOf(mealId) !== -1 || f.tags.indexOf('all') !== -1;
  });
}

function openFoodModal(mealId) {
  currentMealId = mealId;
  var def = MEAL_DEFAULTS.filter(function(m){ return m.id===mealId; })[0];
  document.getElementById('modalMealName').textContent = 'Toevoegen aan ' + (def ? def.name : 'maaltijd');
  document.getElementById('manualFoodName').value    = '';
  document.getElementById('manualFoodProtein').value = '';
  document.getElementById('manualFoodCal').value     = '';
  document.getElementById('manualPreview').innerHTML  = '';
  document.getElementById('manualValidation').classList.add('hidden');
  document.getElementById('foodSearch').value = '';
  filteredFoods = getFoodsForMeal(mealId);
  renderFoodGrid(); renderHerbaGrid();
  switchModalTab('library');
  document.getElementById('foodModal').classList.remove('hidden');
}
function closeFoodModal() { document.getElementById('foodModal').classList.add('hidden'); }
document.getElementById('btnCloseModal').addEventListener('click', closeFoodModal);
document.getElementById('foodModal').addEventListener('click', function(e){ if(e.target===document.getElementById('foodModal'))closeFoodModal(); });

document.querySelectorAll('.mtab').forEach(function(tab){ tab.addEventListener('click', function(){ switchModalTab(tab.dataset.tab); }); });
function switchModalTab(tabId) {
  document.querySelectorAll('.mtab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('.modal-tab-pane').forEach(function(p){p.classList.add('hidden');p.classList.remove('active');});
  document.querySelector('.mtab[data-tab="'+tabId+'"]').classList.add('active');
  var pane = document.getElementById('tab'+tabId.charAt(0).toUpperCase()+tabId.slice(1));
  pane.classList.remove('hidden'); pane.classList.add('active');
  if (tabId==='manual') document.getElementById('manualFoodName').focus();
}

document.getElementById('foodSearch').addEventListener('input', function() {
  var q = this.value.toLowerCase().trim();
  var base = getFoodsForMeal(currentMealId);
  filteredFoods = q ? base.filter(function(f){ return f.name.toLowerCase().indexOf(q)!==-1; }) : base;
  renderFoodGrid();
});

function renderFoodGrid() {
  var grid = document.getElementById('foodGrid');
  if (!filteredFoods.length) { grid.innerHTML='<p class="grid-empty">Geen resultaten gevonden.</p>'; return; }
  grid.innerHTML = filteredFoods.map(function(f) {
    return '<button class="food-chip" data-name="'+escHtml(f.name)+'" data-protein="'+f.protein+'" data-kcal="'+f.kcal+'">'+
      '<span class="food-chip-name">'+escHtml(f.name)+'</span>'+
      '<span class="food-chip-macros"><span class="food-chip-g">'+f.protein+'g</span><span class="food-chip-kcal">'+f.kcal+' kcal</span></span>'+
      '<span class="food-chip-serving">'+f.serving+'</span></button>';
  }).join('');
  grid.querySelectorAll('.food-chip').forEach(function(chip){
    chip.addEventListener('click', function(){ addFoodItem(currentMealId, chip.dataset.name, parseFloat(chip.dataset.protein), parseFloat(chip.dataset.kcal)); closeFoodModal(); });
  });
}

function renderHerbaGrid() {
  var profile=loadProfile(activeUserId), herba=(profile&&profile.herba)?profile.herba:[];
  var grid=document.getElementById('herbaGrid'), hint=document.getElementById('herbaModalHint');
  if (!herba.length) { grid.innerHTML=''; hint.classList.remove('hidden'); return; }
  hint.classList.add('hidden');
  grid.innerHTML = herba.map(function(h) {
    return '<button class="food-chip food-chip-herba" data-name="'+escHtml(h.name)+'" data-protein="'+h.protein+'" data-kcal="'+(h.kcal||0)+'">'+
      '<span class="food-chip-name">'+escHtml(h.name)+'</span>'+
      '<span class="food-chip-macros"><span class="food-chip-g herba-g">'+h.protein+'g</span>'+(h.kcal?'<span class="food-chip-kcal">'+h.kcal+' kcal</span>':'')+' </span>'+
      '<span class="food-chip-serving">Herbalife</span></button>';
  }).join('');
  grid.querySelectorAll('.food-chip').forEach(function(chip){
    chip.addEventListener('click', function(){ addFoodItem(currentMealId, chip.dataset.name, parseFloat(chip.dataset.protein), parseFloat(chip.dataset.kcal)); closeFoodModal(); });
  });
}

// Manual entry
function updateManualPreview() {
  var name=document.getElementById('manualFoodName').value.trim();
  var protein=parseFloat(document.getElementById('manualFoodProtein').value);
  var kcal=parseFloat(document.getElementById('manualFoodCal').value)||0;
  var preview=document.getElementById('manualPreview');
  if (name && !isNaN(protein) && protein>0) {
    preview.innerHTML='<div class="preview-card"><div class="preview-name">'+escHtml(name)+'</div>'+
      '<div class="preview-macros"><span class="preview-protein">'+protein+'g proteïne</span>'+(kcal>0?'<span class="preview-kcal">'+kcal+' kcal</span>':'')+
      '</div></div>';
  } else { preview.innerHTML=''; }
}
['manualFoodName','manualFoodProtein','manualFoodCal'].forEach(function(id){ document.getElementById(id).addEventListener('input', updateManualPreview); });

document.getElementById('btnAddManual').addEventListener('click', function() {
  var name=document.getElementById('manualFoodName').value.trim();
  var protein=parseFloat(document.getElementById('manualFoodProtein').value);
  var kcal=parseFloat(document.getElementById('manualFoodCal').value)||0;
  var validEl=document.getElementById('manualValidation');
  if (!name) { showValErr(validEl,'Voer een naam in voor het gerecht.'); document.getElementById('manualFoodName').focus(); return; }
  if (isNaN(protein)||protein<=0) { showValErr(validEl,'Voer proteïne in gram in (groter dan 0).'); document.getElementById('manualFoodProtein').focus(); return; }
  if (!isNaN(kcal)&&kcal<0) { showValErr(validEl,'Calorieën kunnen niet negatief zijn.'); return; }
  validEl.classList.add('hidden');
  addFoodItem(currentMealId, name, protein, kcal); closeFoodModal();
});
function showValErr(el,msg){ el.textContent='⚠ '+msg; el.classList.remove('hidden'); el.scrollIntoView({behavior:'smooth',block:'nearest'}); }

// ═══════════════════════════════════════════════════════════════
// APPLE HEALTH + RESET
// ═══════════════════════════════════════════════════════════════
document.getElementById('healthKcal').addEventListener('change', function() {
  var val=parseFloat(this.value)||0;
  var log=loadTodayLog(); log.healthKcal=val; saveTodayLog(log);
  if (val>0) showToast('Apple Health: '+val+' kcal → doel = '+Math.round(val*PROTEIN_KCAL_RATIO)+'g proteïne');
  renderDashboard();
});
document.getElementById('btnResetDay').addEventListener('click', function() {
  if (!confirm('Alle logs van vandaag wissen? Geschiedenis blijft bewaard.')) return;
  localStorage.removeItem('protrack_log_'+activeUserId+'_'+todayKey());
  renderDashboard(); showToast('Log van vandaag gewist 🔄');
});

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════
function renderSummary(log, profile, effectiveTarget, totalProtein, totalFoodKcal) {
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
  if(pct>=1){msgEl.className='summary-msg success';msgEl.textContent='🏆 Uitstekend! Je hebt je doel van '+effectiveTarget+'g proteïne bereikt!';}
  else if(pct>=0.85){msgEl.className='summary-msg warning';msgEl.textContent='💪 Bijna! Nog '+Math.round(remaining)+'g te gaan!';}
  else if(pct>=0.5){msgEl.className='summary-msg warning';msgEl.textContent='🔥 Je bent '+Math.round(remaining)+'g van je doel. Blijf gaan!';}
  else{msgEl.className='summary-msg neutral';msgEl.textContent='📋 Log je maaltijden om '+effectiveTarget+'g te bereiken. Je kan het!';}
}

// ═══════════════════════════════════════════════════════════════
// HISTORY CHART
// ═══════════════════════════════════════════════════════════════
function renderHistory(todayTotal, effectiveTarget) {
  var history=loadHistory(6);
  var days=history.concat([{dayLabel:'Vandaag',total:todayTotal,target:effectiveTarget,hit:todayTotal>=effectiveTarget}]);
  var maxVal=Math.max.apply(null,days.map(function(d){return d.total;}).concat([effectiveTarget,1]));
  document.getElementById('historyChart').innerHTML=days.map(function(d){
    var h=Math.max(Math.round((d.total/maxVal)*80),d.total>0?3:0);
    var cls=d.dayLabel==='Vandaag'?'today':d.hit?'hit':'miss';
    return '<div class="chart-col">'+
      '<div class="chart-bar-wrap"><div class="chart-bar '+cls+'" style="height:'+h+'px"></div></div>'+
      '<span class="chart-g">'+(d.total>0?Math.round(d.total):'—')+'</span>'+
      '<span class="'+(d.dayLabel==='Vandaag'?'chart-today-lbl':'chart-day')+'">'+d.dayLabel+'</span></div>';
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// AUTO PLAN — kies per slot, regenereer per slot, log individueel
// ═══════════════════════════════════════════════════════════════
document.getElementById('btnAutoPlan').addEventListener('click', openPlanModal);

function openPlanModal() {
  var profile = loadProfile(activeUserId), log = loadTodayLog();
  var target  = getEffectiveTarget(profile, log);

  // Initialiseer keuzes met random selectie
  if (!currentPlan) {
    currentPlan = {};
    MEAL_DEFAULTS.forEach(function(meal) {
      currentPlan[meal.id] = shuffle(PLAN_MEALS[meal.id] || [])[0];
    });
  }

  renderPlanModal(target);
  document.getElementById('planModal').classList.remove('hidden');
}

function renderPlanModal(target) {
  if (!target) {
    var profile = loadProfile(activeUserId), log = loadTodayLog();
    target = getEffectiveTarget(profile, log);
  }
  var planTotal = MEAL_DEFAULTS.reduce(function(s,m){ return s + (currentPlan[m.id] ? currentPlan[m.id].protein : 0); }, 0);
  document.getElementById('planModalSub').textContent = 'Geschat totaal: '+planTotal+'g proteïne · doel: '+target+'g';

  document.getElementById('planCards').innerHTML = MEAL_DEFAULTS.map(function(meal) {
    var selected = currentPlan[meal.id];
    var pool     = PLAN_MEALS[meal.id] || [];
    var isLogged = selected && isPlanMealLogged(meal.id, selected);

    // Opties lijst voor dit slot
    var optionsHtml = pool.map(function(m, idx) {
      var isSelected = selected && selected.name === m.name;
      return '<button class="plan-option '+(isSelected?'plan-option-selected':'')+'" data-meal="'+meal.id+'" data-idx="'+idx+'">'+
        '<div class="plan-option-top">'+
          '<span class="plan-option-name">'+escHtml(m.name)+'</span>'+
          '<span class="plan-option-macros">'+m.protein+'g · '+m.kcal+'kcal</span>'+
        '</div>'+
        '<div class="plan-option-ingredients">'+escHtml(m.ingredients)+'</div>'+
        (isSelected?'<span class="plan-option-check">✓</span>':'')+
        '</button>';
    }).join('');

    return '<div class="plan-slot-block" id="planslot_'+meal.id+'">'+
      '<div class="plan-slot-header">'+
        '<span class="plan-slot-emoji">'+meal.emoji+'</span>'+
        '<span class="plan-slot-name">'+meal.name+'</span>'+
        (selected?'<span class="plan-slot-macros">'+selected.protein+'g · '+selected.kcal+' kcal</span>':'')+
        (isLogged?'<span class="plan-slot-logged-badge">✓ Gelogd</span>':
          (selected?'<button class="plan-log-btn" data-meal="'+meal.id+'">Log</button>':''))+
      '</div>'+
      '<div class="plan-options-list">'+optionsHtml+'</div>'+
    '</div>';
  }).join('');

  // Klikken op een optie = selecteren voor dat slot
  document.getElementById('planCards').querySelectorAll('.plan-option').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var mid  = btn.dataset.meal;
      var idx  = parseInt(btn.dataset.idx);
      currentPlan[mid] = PLAN_MEALS[mid][idx];
      renderPlanModal();
    });
  });

  // Log per-slot knop
  document.getElementById('planCards').querySelectorAll('.plan-log-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var mid = btn.dataset.meal, m = currentPlan[mid]; if (!m) return;
      logPlanMeal(mid, m);
      renderPlanModal();
    });
  });
}

function isPlanMealLogged(mealId, m) {
  if (!m) return false;
  var log = loadTodayLog();
  return (log.meals[mealId]||[]).some(function(i){ return i.name===m.name; });
}

function logPlanMeal(mealId, m) {
  var log = loadTodayLog();
  if (!log.meals[mealId]) log.meals[mealId] = [];
  if (log.meals[mealId].some(function(i){ return i.name===m.name; })) { showToast('Al gelogd: '+m.name); return; }
  log.meals[mealId].push({ name: m.name, protein: m.protein, kcal: m.kcal });
  saveTodayLog(log); renderDashboard();
  showToast(m.name+' gelogd ✅');
}

document.getElementById('btnRegeneratePlan').addEventListener('click', function() {
  currentPlan = null;
  openPlanModal();
});
document.getElementById('btnClosePlanModal').addEventListener('click', function(){ document.getElementById('planModal').classList.add('hidden'); });
document.getElementById('planModal').addEventListener('click', function(e){ if(e.target===document.getElementById('planModal')) document.getElementById('planModal').classList.add('hidden'); });

document.getElementById('btnLogAllPlan').addEventListener('click', function() {
  if (!currentPlan) return;
  var logged = 0;
  MEAL_DEFAULTS.forEach(function(meal){ var m=currentPlan[meal.id]; if(m){ logPlanMeal(meal.id,m); logged++; } });
  document.getElementById('planModal').classList.add('hidden');
  renderDashboard();
  showToast('Alle '+logged+' maaltijden gelogd! 🎉', 3000);
});

// ═══════════════════════════════════════════════════════════════
// PROFIEL SCHERM
// ═══════════════════════════════════════════════════════════════
document.getElementById('btnOpenProfile').addEventListener('click', function(){ loadProfileForm(); showScreen('profile'); });
document.getElementById('avatarBtn').addEventListener('click', function(){ if(confirm('Uitloggen?')) logout(); });
document.getElementById('btnBackFromProfile').addEventListener('click', function(){ showScreen('dash'); renderDashboard(); });

function loadProfileForm() {
  var p = loadProfile(activeUserId); if (!p) return;
  document.getElementById('profName').value          = p.name || '';
  document.getElementById('profEmail').value         = p.email || '';
  document.getElementById('profAge').value           = p.age || '';
  document.getElementById('profWeight').value        = p.weight || '';
  document.getElementById('profHeight').value        = p.height || '';
  document.getElementById('profProteinTarget').value = p.proteinTarget || DEFAULT_PROTEIN_TARGET;
  document.getElementById('profCalTarget').value     = p.calTarget || '';
  document.getElementById('profPwNew').value         = '';
  document.getElementById('profPwCurrent').value     = '';
  updateProfBMI(); renderHerbaProfileList();
}
function updateProfBMI() {
  var w=parseFloat(document.getElementById('profWeight').value);
  var h=parseFloat(document.getElementById('profHeight').value);
  document.getElementById('profBMI').textContent = calcBMI(w,h)||'—';
}
['profWeight','profHeight'].forEach(function(id){ document.getElementById(id).addEventListener('input', updateProfBMI); });

document.getElementById('btnSaveProfile').addEventListener('click', function() {
  var p = loadProfile(activeUserId)||{};
  p.name          = document.getElementById('profName').value.trim();
  p.age           = parseInt(document.getElementById('profAge').value)||null;
  p.weight        = parseFloat(document.getElementById('profWeight').value)||null;
  p.height        = parseFloat(document.getElementById('profHeight').value)||null;
  p.proteinTarget = parseInt(document.getElementById('profProteinTarget').value)||DEFAULT_PROTEIN_TARGET;
  p.calTarget     = parseInt(document.getElementById('profCalTarget').value)||null;

  // Wachtwoord wijzigen
  var currentPw = document.getElementById('profPwCurrent').value;
  var newPw     = document.getElementById('profPwNew').value;
  if (newPw) {
    if (!currentPw) { showToast('Vul je huidige wachtwoord in om te wijzigen'); return; }
    if (p.pwHash !== hashPassword(currentPw)) { showToast('Huidig wachtwoord is onjuist'); return; }
    if (newPw.length < 4) { showToast('Nieuw wachtwoord moet minstens 4 tekens zijn'); return; }
    p.pwHash = hashPassword(newPw);
    showToast('Profiel & wachtwoord opgeslagen ✅');
  } else {
    showToast('Profiel opgeslagen ✅');
  }
  saveProfile(activeUserId, p);
});

function renderHerbaProfileList() {
  var profile=loadProfile(activeUserId), herba=(profile&&profile.herba)?profile.herba:[];
  var list=document.getElementById('herbaList');
  if (!herba.length) { list.innerHTML='<p class="helper-text">Nog geen producten. Voeg er hieronder een toe.</p>'; return; }
  list.innerHTML = herba.map(function(h,i) {
    return '<div class="herba-item">'+
      '<div class="herba-item-info">'+
        '<span class="herba-item-name">'+escHtml(h.name)+'</span>'+
        '<span class="herba-item-macros"><span class="herba-item-g">'+h.protein+'g proteïne</span>'+(h.kcal?' · <span class="herba-item-kcal">'+h.kcal+' kcal</span>':'')+' </span>'+
      '</div>'+
      '<button class="herba-item-del" data-idx="'+i+'">✕</button></div>';
  }).join('');
  list.querySelectorAll('.herba-item-del').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var p=loadProfile(activeUserId); p.herba.splice(parseInt(btn.dataset.idx),1);
      saveProfile(activeUserId,p); renderHerbaProfileList(); showToast('Product verwijderd');
    });
  });
}
document.getElementById('btnAddHerba').addEventListener('click', function() {
  var name=document.getElementById('herbaName').value.trim();
  var protein=parseFloat(document.getElementById('herbaProtein').value);
  var kcal=parseFloat(document.getElementById('herbaKcal').value)||0;
  if (!name) { showToast('Voer een productnaam in'); return; }
  if (!protein||protein<=0) { showToast('Voer proteïne in gram in (> 0)'); return; }
  var p=loadProfile(activeUserId)||{}; if(!p.herba)p.herba=[];
  p.herba.push({name:name,protein:protein,kcal:kcal}); saveProfile(activeUserId,p);
  document.getElementById('herbaName').value='';
  document.getElementById('herbaProtein').value='';
  document.getElementById('herbaKcal').value='';
  renderHerbaProfileList(); showToast('Toegevoegd: '+name+' ✅');
});
document.getElementById('btnDeleteProfile').addEventListener('click', function() {
  if (!confirm('Profiel verwijderen? Alle data wordt permanent gewist.')) return;
  localStorage.removeItem('protrack_profile_'+activeUserId);
  Object.keys(localStorage).filter(function(k){return k.indexOf('protrack_log_'+activeUserId)===0;}).forEach(function(k){localStorage.removeItem(k);});
  var ids=getAllUserIds().filter(function(id){return id!==activeUserId;}); saveAllUserIds(ids);
  localStorage.removeItem('protrack_active_user'); activeUserId=null;
  showToast('Profiel verwijderd'); showScreen('auth');
});
document.getElementById('btnLogout').addEventListener('click', function(){ if(confirm('Uitloggen?')) logout(); });

// ═══════════════════════════════════════════════════════════════
// SERVICE WORKER
// ═══════════════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js')
      .then(function(){ console.log('[ProTrack] SW registered'); })
      .catch(function(e){ console.warn('[ProTrack] SW failed:',e); });
  });
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
function init() {
  var remembered = localStorage.getItem('protrack_active_user');
  var ids = getAllUserIds();
  if (remembered && ids.indexOf(remembered) !== -1) {
    activeUserId = remembered;
    renderDashboard();
    showScreen('dash');
  } else {
    showScreen('auth');
  }
}
init();
