/* ═══════════════════════════════════════════════════════════════
   ProTrack — app.js  v3.0
   Changes in v3:
   ─ PIN login per profile (optional 4-digit code, stored hashed)
   ─ Auto Plan: per-meal Log buttons (not bulk accept only)
   ─ Suggestions: no "daily refresh" label text; manual refresh ↻ button
   ─ Massively expanded food & suggestion library
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ── Config ────────────────────────────────────────────────────────
const PROTEIN_KCAL_RATIO    = 0.1;
const DEFAULT_PROTEIN_TARGET = 110;
const DEFAULT_KCAL_TARGET    = 2000;

// ── Meal slots ────────────────────────────────────────────────────
const MEAL_DEFAULTS = [
  { id: 'breakfast',       emoji: '🌅', name: 'Breakfast',       defaultTarget: 25 },
  { id: 'lunch',           emoji: '☀️',  name: 'Lunch',           defaultTarget: 30 },
  { id: 'afternoon_snack', emoji: '🍎', name: 'Afternoon Snack', defaultTarget: 10 },
  { id: 'dinner',          emoji: '🌙', name: 'Dinner',          defaultTarget: 35 },
  { id: 'evening_snack',   emoji: '🌃', name: 'Evening Snack',   defaultTarget: 10 },
];

// ── Default Herbalife products ────────────────────────────────────
const DEFAULT_HERBA_PRODUCTS = [
  { name: 'Formula 1 Shake (skimmed milk)', protein: 17, kcal: 220 },
  { name: 'Formula 1 Shake (water)',         protein: 9,  kcal: 90  },
  { name: 'Protein Drink Mix (PDM)',          protein: 15, kcal: 70  },
  { name: 'Personalised Protein Powder',     protein: 5,  kcal: 25  },
  { name: 'Herbalife 24 Rebuild Strength',   protein: 24, kcal: 150 },
  { name: 'Protein Bar Deluxe',              protein: 10, kcal: 140 },
  { name: 'NouriFusion Protein Shake',       protein: 18, kcal: 190 },
  { name: 'Herbal Aloe Concentrate',         protein: 0,  kcal: 15  },
];

// ── Food library (greatly expanded) ──────────────────────────────
const FOOD_LIBRARY = [
  // Poultry
  { name: 'Chicken breast (100g)',       protein: 31, kcal: 165, serving: '100g cooked' },
  { name: 'Chicken breast (150g)',       protein: 47, kcal: 248, serving: '150g cooked' },
  { name: 'Chicken thigh (100g)',        protein: 26, kcal: 209, serving: '100g cooked' },
  { name: 'Chicken thigh (150g)',        protein: 39, kcal: 314, serving: '150g cooked' },
  { name: 'Chicken drumstick',           protein: 22, kcal: 172, serving: '1 drumstick' },
  { name: 'Chicken strips (breaded)',    protein: 20, kcal: 280, serving: '100g' },
  { name: 'Turkey breast (100g)',        protein: 29, kcal: 135, serving: '100g cooked' },
  { name: 'Turkey mince (100g)',         protein: 27, kcal: 160, serving: '100g cooked' },
  { name: 'Turkey slices (deli)',        protein: 18, kcal: 90,  serving: '100g' },
  // Red meat
  { name: 'Beef mince lean (100g)',      protein: 26, kcal: 218, serving: '100g cooked' },
  { name: 'Beef mince lean (150g)',      protein: 39, kcal: 327, serving: '150g cooked' },
  { name: 'Beef steak (sirloin)',        protein: 27, kcal: 207, serving: '100g cooked' },
  { name: 'Beef stir-fry strips',       protein: 26, kcal: 185, serving: '100g cooked' },
  { name: 'Pork loin (100g)',            protein: 26, kcal: 185, serving: '100g cooked' },
  { name: 'Pork mince',                  protein: 25, kcal: 195, serving: '100g cooked' },
  { name: 'Ham (sliced, 100g)',          protein: 17, kcal: 115, serving: '100g' },
  { name: 'Bacon (2 rashers)',           protein: 12, kcal: 138, serving: '40g cooked' },
  { name: 'Salami (30g)',                protein: 6,  kcal: 130, serving: '30g' },
  // Fish & seafood
  { name: 'Tuna (canned, 100g)',         protein: 25, kcal: 116, serving: '100g drained' },
  { name: 'Tuna steak (150g)',           protein: 36, kcal: 175, serving: '150g cooked' },
  { name: 'Salmon fillet (100g)',        protein: 25, kcal: 208, serving: '100g cooked' },
  { name: 'Salmon fillet (150g)',        protein: 38, kcal: 312, serving: '150g cooked' },
  { name: 'Smoked salmon (50g)',         protein: 13, kcal: 83,  serving: '50g' },
  { name: 'Smoked salmon (100g)',        protein: 25, kcal: 165, serving: '100g' },
  { name: 'Cod fillet (150g)',           protein: 35, kcal: 158, serving: '150g cooked' },
  { name: 'Haddock (150g)',              protein: 33, kcal: 150, serving: '150g cooked' },
  { name: 'Sardines canned (100g)',      protein: 25, kcal: 208, serving: '100g' },
  { name: 'Mackerel canned (100g)',      protein: 19, kcal: 305, serving: '100g' },
  { name: 'Prawns (100g)',               protein: 24, kcal: 99,  serving: '100g cooked' },
  { name: 'Prawns (150g)',               protein: 36, kcal: 149, serving: '150g cooked' },
  { name: 'Mussels (100g)',              protein: 24, kcal: 172, serving: '100g cooked' },
  { name: 'Crab (canned, 100g)',         protein: 19, kcal: 97,  serving: '100g' },
  { name: 'Scallops (100g)',             protein: 17, kcal: 111, serving: '100g cooked' },
  { name: 'Fish fingers (x3)',           protein: 10, kcal: 180, serving: '3 fingers' },
  // Eggs & dairy
  { name: '1 large egg',                protein: 6,  kcal: 72,  serving: '1 egg' },
  { name: '2 large eggs',               protein: 12, kcal: 144, serving: '2 eggs' },
  { name: '3 large eggs',               protein: 18, kcal: 216, serving: '3 eggs' },
  { name: 'Egg whites (3)',             protein: 11, kcal: 51,  serving: '3 whites (~100ml)' },
  { name: 'Greek yogurt 0% fat (100g)', protein: 10, kcal: 57,  serving: '100g' },
  { name: 'Greek yogurt 0% fat (200g)', protein: 20, kcal: 114, serving: '200g pot' },
  { name: 'Greek yogurt full fat (100g)',protein:10, kcal: 97,  serving: '100g' },
  { name: 'Skyr (100g)',                protein: 11, kcal: 65,  serving: '100g' },
  { name: 'Skyr (150g)',                protein: 17, kcal: 98,  serving: '150g' },
  { name: 'Quark plain (100g)',         protein: 12, kcal: 67,  serving: '100g' },
  { name: 'Quark plain (150g)',         protein: 18, kcal: 101, serving: '150g' },
  { name: 'Cottage cheese (100g)',      protein: 11, kcal: 98,  serving: '100g' },
  { name: 'Cottage cheese (200g)',      protein: 22, kcal: 196, serving: '200g' },
  { name: 'Milk semi-skimmed (200ml)', protein: 7,  kcal: 92,  serving: '200ml' },
  { name: 'Milk full fat (200ml)',      protein: 7,  kcal: 122, serving: '200ml' },
  { name: 'Cheddar (40g slice)',        protein: 10, kcal: 161, serving: '40g' },
  { name: 'Cheddar (100g)',             protein: 25, kcal: 402, serving: '100g' },
  { name: 'Mozzarella (100g)',          protein: 22, kcal: 280, serving: '100g' },
  { name: 'Mozzarella (50g)',           protein: 11, kcal: 140, serving: '50g' },
  { name: 'Feta cheese (50g)',          protein: 7,  kcal: 133, serving: '50g' },
  { name: 'Parmesan (30g)',             protein: 10, kcal: 129, serving: '30g grated' },
  { name: 'Ricotta (100g)',             protein: 11, kcal: 174, serving: '100g' },
  { name: 'Whey protein (1 scoop)',     protein: 24, kcal: 130, serving: '1 scoop ~30g' },
  { name: 'Casein protein (1 scoop)',   protein: 24, kcal: 120, serving: '1 scoop ~30g' },
  { name: 'High-protein yogurt drink', protein: 20, kcal: 160, serving: '330ml bottle' },
  // Plant protein
  { name: 'Lentils cooked (100g)',      protein: 9,  kcal: 116, serving: '100g' },
  { name: 'Lentils cooked (200g)',      protein: 18, kcal: 232, serving: '200g' },
  { name: 'Chickpeas cooked (100g)',    protein: 9,  kcal: 164, serving: '100g' },
  { name: 'Chickpeas cooked (200g)',    protein: 18, kcal: 328, serving: '200g' },
  { name: 'Black beans (100g)',         protein: 9,  kcal: 132, serving: '100g cooked' },
  { name: 'Kidney beans (100g)',        protein: 8,  kcal: 127, serving: '100g cooked' },
  { name: 'Edamame shelled (100g)',     protein: 11, kcal: 121, serving: '100g cooked' },
  { name: 'Tofu firm (100g)',           protein: 17, kcal: 144, serving: '100g' },
  { name: 'Tofu firm (200g)',           protein: 34, kcal: 288, serving: '200g' },
  { name: 'Tempeh (100g)',              protein: 19, kcal: 193, serving: '100g' },
  { name: 'Seitan (100g)',              protein: 25, kcal: 165, serving: '100g' },
  { name: 'Pea protein (1 scoop)',      protein: 21, kcal: 100, serving: '1 scoop 25g' },
  { name: 'Soya mince dry (50g)',       protein: 26, kcal: 148, serving: '50g dry' },
  // Nuts, seeds & spreads
  { name: 'Peanut butter (2 tbsp)',     protein: 7,  kcal: 188, serving: '32g' },
  { name: 'Almond butter (2 tbsp)',     protein: 7,  kcal: 196, serving: '32g' },
  { name: 'Almonds (30g)',              protein: 6,  kcal: 164, serving: '30g' },
  { name: 'Pumpkin seeds (30g)',        protein: 9,  kcal: 163, serving: '30g' },
  { name: 'Hemp seeds (30g)',           protein: 10, kcal: 170, serving: '30g' },
  { name: 'Sunflower seeds (30g)',      protein: 6,  kcal: 165, serving: '30g' },
  { name: 'Chia seeds (20g)',           protein: 3,  kcal: 97,  serving: '20g' },
  // Grains & carbs
  { name: 'Oats dry (40g)',             protein: 5,  kcal: 150, serving: '40g' },
  { name: 'Oats dry (60g)',             protein: 7,  kcal: 225, serving: '60g' },
  { name: 'Quinoa cooked (100g)',       protein: 4,  kcal: 120, serving: '100g' },
  { name: 'Quinoa cooked (150g)',       protein: 6,  kcal: 180, serving: '150g' },
  { name: 'Brown rice cooked (100g)',   protein: 3,  kcal: 111, serving: '100g' },
  { name: 'Brown rice cooked (150g)',   protein: 5,  kcal: 167, serving: '150g' },
  { name: 'Wholegrain bread (1 slice)', protein: 4,  kcal: 110, serving: '40g slice' },
  { name: 'Rye bread (1 slice)',        protein: 3,  kcal: 80,  serving: '35g slice' },
  { name: 'Pasta cooked (100g)',        protein: 5,  kcal: 158, serving: '100g' },
  { name: 'Pasta cooked (150g)',        protein: 8,  kcal: 237, serving: '150g' },
  { name: 'Wholegrain wrap (large)',    protein: 5,  kcal: 170, serving: '1 large wrap' },
  { name: 'Pitta wholegrain (1)',       protein: 5,  kcal: 145, serving: '1 pitta' },
  { name: 'Sweet potato (150g)',        protein: 2,  kcal: 155, serving: '150g cooked' },
  { name: 'New potatoes (150g)',        protein: 3,  kcal: 117, serving: '150g cooked' },
  // Snacks & convenience
  { name: 'Protein bar (high protein)', protein: 20, kcal: 220, serving: '~60g bar' },
  { name: 'Beef jerky (100g)',          protein: 33, kcal: 264, serving: '100g' },
  { name: 'Hummus (100g)',              protein: 5,  kcal: 166, serving: '100g' },
  { name: 'String cheese stick',       protein: 7,  kcal: 80,  serving: '28g' },
  { name: 'Babybel light (1)',          protein: 6,  kcal: 41,  serving: '20g round' },
  { name: 'Rice cakes (2)',             protein: 2,  kcal: 70,  serving: '2 cakes' },
  { name: 'Oatcakes (3)',               protein: 3,  kcal: 138, serving: '3 oatcakes' },
];

// ── Suggestion pool (greatly expanded) ───────────────────────────
// Each slot has 18+ options so rotation always feels fresh.
const SUGGESTION_POOL = {
  breakfast: [
    { label: '3 scrambled eggs + 200g Greek yogurt',               protein: 38, kcal: 424 },
    { label: 'Overnight oats + whey protein + blueberries',        protein: 29, kcal: 410 },
    { label: '3-egg omelette with ham & cheddar',                  protein: 32, kcal: 380 },
    { label: 'Cottage cheese on 2 wholegrain toast + tomatoes',    protein: 21, kcal: 318 },
    { label: 'Smoked salmon + 2 poached eggs + rye bread',         protein: 38, kcal: 460 },
    { label: 'Protein pancakes (oats + egg + banana)',             protein: 22, kcal: 340 },
    { label: 'Skyr parfait with granola, almonds & berries',       protein: 23, kcal: 380 },
    { label: 'Turkey bacon + 3 eggs + wholegrain toast',           protein: 34, kcal: 430 },
    { label: 'Quark (150g) + berries + 1 scoop whey',             protein: 33, kcal: 260 },
    { label: '200g Greek yogurt + hemp seeds + honey + banana',    protein: 23, kcal: 310 },
    { label: 'Egg & spinach wrap with feta cheese',                protein: 24, kcal: 360 },
    { label: 'Banana protein smoothie (whey + milk + oats)',       protein: 34, kcal: 420 },
    { label: 'Smoked salmon + scrambled eggs on sourdough',        protein: 32, kcal: 420 },
    { label: '3-egg veggie omelette (peppers, spinach, cheese)',   protein: 24, kcal: 310 },
    { label: 'Skyr (200g) + 2 tbsp PB + banana slices',           protein: 28, kcal: 410 },
    { label: 'High-protein overnight oats (casein + oats + milk)', protein: 32, kcal: 450 },
    { label: 'Cottage cheese pancakes (2 eggs + 100g CC + oats)', protein: 28, kcal: 380 },
    { label: '2 boiled eggs + rye bread + smoked salmon',          protein: 30, kcal: 360 },
    { label: 'Protein bowl: quark + granola + kiwi + chia seeds', protein: 22, kcal: 340 },
    { label: 'Greek yogurt + protein granola + mixed berries',     protein: 26, kcal: 390 },
  ],
  lunch: [
    { label: 'Grilled chicken breast + quinoa + roasted veg',     protein: 52, kcal: 490 },
    { label: 'Tuna nicoise salad with eggs & olives',              protein: 38, kcal: 380 },
    { label: 'Salmon & avocado brown rice bowl',                   protein: 42, kcal: 530 },
    { label: 'Chicken wrap with hummus, feta & salad',             protein: 39, kcal: 480 },
    { label: 'Beef mince & lentil soup + wholegrain roll',         protein: 34, kcal: 520 },
    { label: 'Turkey & mozzarella caprese salad + pasta',          protein: 36, kcal: 490 },
    { label: 'Prawn stir-fry with brown rice & sesame',            protein: 36, kcal: 400 },
    { label: 'Greek chicken bowl: rice, feta, olives, tzatziki',  protein: 44, kcal: 560 },
    { label: 'Lentil & feta salad with soft-boiled egg',          protein: 24, kcal: 360 },
    { label: 'Tofu poke bowl with edamame & sesame dressing',     protein: 32, kcal: 420 },
    { label: 'Tuna & chickpea salad in wholegrain wrap',           protein: 35, kcal: 470 },
    { label: 'Cottage cheese & veggie flatbread',                  protein: 26, kcal: 390 },
    { label: 'Chicken Caesar salad (light dressing)',              protein: 44, kcal: 460 },
    { label: 'Beef steak strips + sweet potato + broccoli',        protein: 42, kcal: 540 },
    { label: 'Prawn & avocado salad on rye bread',                 protein: 30, kcal: 400 },
    { label: 'Turkey mince bolognese + pasta',                     protein: 40, kcal: 550 },
    { label: 'Smoked mackerel + new potatoes + salad',             protein: 30, kcal: 470 },
    { label: 'Chickpea & spinach curry with brown rice',           protein: 22, kcal: 490 },
    { label: 'Chicken & avocado rice paper rolls',                 protein: 28, kcal: 360 },
    { label: 'Sardine & tomato wholegrain toast (open sandwich)', protein: 28, kcal: 340 },
  ],
  afternoon_snack: [
    { label: '200g cottage cheese + cucumber sticks',              protein: 22, kcal: 196 },
    { label: 'Protein bar + black coffee',                         protein: 20, kcal: 220 },
    { label: '150g Greek yogurt + 30g almonds',                    protein: 21, kcal: 310 },
    { label: '2 hard-boiled eggs + cherry tomatoes',               protein: 12, kcal: 150 },
    { label: 'Whey shake with 200ml semi-skimmed milk',            protein: 31, kcal: 230 },
    { label: 'Skyr (150g) + handful blueberries',                  protein: 17, kcal: 120 },
    { label: '100g edamame + pinch of sea salt',                   protein: 11, kcal: 121 },
    { label: '2 rice cakes + peanut butter + banana slices',       protein: 8,  kcal: 250 },
    { label: 'String cheese x2 + apple slices',                   protein: 14, kcal: 190 },
    { label: 'Tuna (65g drained) + oatcakes',                     protein: 15, kcal: 200 },
    { label: 'Quark (100g) + berries + honey',                     protein: 12, kcal: 140 },
    { label: '3 Babybel + handful of grapes',                      protein: 18, kcal: 210 },
    { label: '1 boiled egg + smoked salmon (30g)',                 protein: 13, kcal: 110 },
    { label: 'High-protein yogurt drink',                          protein: 20, kcal: 160 },
    { label: 'Beef jerky (50g)',                                   protein: 17, kcal: 132 },
    { label: 'Pumpkin seeds (30g) + 2 rice cakes + hummus',       protein: 12, kcal: 280 },
    { label: '30g almonds + 1 string cheese',                      protein: 13, kcal: 244 },
    { label: 'Casein shake (slow-digesting)',                      protein: 24, kcal: 120 },
  ],
  dinner: [
    { label: 'Chicken thigh + sweet potato + tenderstem broccoli', protein: 48, kcal: 580 },
    { label: 'Salmon with lentils & wilted spinach',               protein: 48, kcal: 600 },
    { label: 'Beef mince stir-fry with brown rice & peppers',      protein: 50, kcal: 620 },
    { label: 'Turkey mince chilli with kidney beans & rice',       protein: 54, kcal: 540 },
    { label: 'Prawn pasta with garlic, chilli & courgette',        protein: 40, kcal: 520 },
    { label: 'Cod fillet + quinoa + roasted peppers & pesto',      protein: 48, kcal: 480 },
    { label: 'Chicken & chickpea curry with brown rice',           protein: 50, kcal: 640 },
    { label: 'Pork loin + roasted new potatoes + green beans',     protein: 52, kcal: 580 },
    { label: 'Tempeh & vegetable stir-fry with noodles',           protein: 38, kcal: 510 },
    { label: 'Baked haddock + quinoa + tenderstem broccoli',       protein: 50, kcal: 490 },
    { label: 'Turkey burger + sweet potato fries + coleslaw',      protein: 44, kcal: 620 },
    { label: 'Seitan steak + mashed sweet potato + kale chips',   protein: 52, kcal: 560 },
    { label: 'Chicken breast stuffed with ricotta & spinach',      protein: 48, kcal: 510 },
    { label: 'Beef mince tacos (corn tortillas, salsa, avocado)',  protein: 40, kcal: 600 },
    { label: 'Salmon teriyaki + brown rice + stir-fried greens',  protein: 46, kcal: 590 },
    { label: 'Mussels in tomato sauce + crusty bread',             protein: 30, kcal: 430 },
    { label: 'Turkey mince moussaka + Greek salad',                protein: 44, kcal: 560 },
    { label: 'Tofu & broccoli green curry with jasmine rice',     protein: 30, kcal: 520 },
    { label: 'Lean pork mince + lentil dhal + flatbread',         protein: 42, kcal: 560 },
    { label: 'Prawn & sweet potato fishcakes + salad',             protein: 32, kcal: 490 },
  ],
  evening_snack: [
    { label: '200g cottage cheese + mixed berries',                protein: 22, kcal: 210 },
    { label: '150g Greek yogurt + 1 tbsp PB',                     protein: 17, kcal: 240 },
    { label: '1 scoop casein shake + 200ml milk',                  protein: 31, kcal: 200 },
    { label: '2 hard-boiled eggs',                                 protein: 12, kcal: 144 },
    { label: 'Quark (150g) + berries + drizzle honey',             protein: 18, kcal: 150 },
    { label: 'Skyr (150g) + 30g almonds',                         protein: 22, kcal: 270 },
    { label: 'Smoked salmon (50g) + cucumber slices',              protein: 13, kcal: 83  },
    { label: 'Beef jerky (50g)',                                   protein: 17, kcal: 132 },
    { label: 'Protein bar',                                        protein: 20, kcal: 220 },
    { label: '200g low-fat cottage cheese on 2 rice cakes',        protein: 24, kcal: 260 },
    { label: '2 Babybel + handful pumpkin seeds',                  protein: 15, kcal: 215 },
    { label: 'High-protein yogurt drink',                          protein: 20, kcal: 160 },
    { label: '1 scoop whey + 150ml milk + ice (blended)',          protein: 28, kcal: 185 },
    { label: '3 egg whites scrambled + cherry tomatoes',           protein: 11, kcal: 65  },
    { label: '100g edamame (salted)',                              protein: 11, kcal: 121 },
  ],
};

// ── Auto Plan meals ───────────────────────────────────────────────
const PLAN_MEALS = {
  breakfast: [
    { name: 'Protein Oats Bowl',        ingredients: 'Oats (60g) + whey protein + berries + almond butter',         protein: 32, kcal: 430 },
    { name: 'Big Egg Breakfast',        ingredients: '3 scrambled eggs + 200g Greek yogurt + wholegrain toast',     protein: 38, kcal: 480 },
    { name: 'Smoked Salmon Plate',      ingredients: 'Smoked salmon (100g) + 2 poached eggs + rye bread',           protein: 38, kcal: 460 },
    { name: 'Quark Protein Bowl',       ingredients: 'Quark (150g) + berries + hemp seeds + honey',                 protein: 28, kcal: 290 },
    { name: 'Cottage Cheese Toast',     ingredients: 'Cottage cheese (150g) + wholegrain toast (x2) + tomatoes',    protein: 24, kcal: 360 },
    { name: 'Skyr Parfait',             ingredients: 'Skyr (200g) + low-sugar granola + almonds + banana',          protein: 24, kcal: 420 },
    { name: 'Turkey Bacon Omelette',    ingredients: '3 eggs + turkey bacon (2 rashers) + cheddar + spinach',       protein: 38, kcal: 440 },
    { name: 'Protein Smoothie',         ingredients: 'Whey (1 scoop) + 200ml milk + banana + 40g oats (blended)',   protein: 35, kcal: 450 },
    { name: 'CC Pancakes',              ingredients: 'Cottage cheese (100g) + 2 eggs + 40g oats (pan-fried)',       protein: 28, kcal: 380 },
    { name: 'Overnight Casein Oats',    ingredients: 'Casein (1 scoop) + 60g oats + milk + chia seeds overnight',  protein: 32, kcal: 450 },
  ],
  lunch: [
    { name: 'Chicken Quinoa Bowl',      ingredients: 'Chicken breast (150g) + quinoa (100g) + roasted veg + pesto',protein: 52, kcal: 555 },
    { name: 'Tuna Salad Wrap',          ingredients: 'Tuna (130g) + chickpeas + wholegrain wrap + salad',           protein: 38, kcal: 470 },
    { name: 'Salmon Rice Bowl',         ingredients: 'Salmon (150g) + brown rice (100g) + avocado + cucumber',      protein: 42, kcal: 560 },
    { name: 'Turkey Protein Wrap',      ingredients: 'Turkey slices (120g) + mozzarella + spinach + large wrap',    protein: 40, kcal: 490 },
    { name: 'Beef Lentil Soup',         ingredients: 'Beef mince (100g) + lentils (150g) + veg + wholegrain roll',  protein: 42, kcal: 580 },
    { name: 'Greek Chicken Bowl',       ingredients: 'Chicken (150g) + quinoa + feta + olives + tzatziki',          protein: 46, kcal: 570 },
    { name: 'Tofu Poke Bowl',           ingredients: 'Firm tofu (200g) + brown rice + edamame + sesame dressing',  protein: 34, kcal: 440 },
    { name: 'Prawn Stir-Fry',           ingredients: 'Prawns (150g) + brown rice + broccoli + soy-ginger sauce',   protein: 38, kcal: 410 },
    { name: 'Beef Steak Plate',         ingredients: 'Beef stir-fry strips (150g) + sweet potato + green salad',   protein: 42, kcal: 520 },
    { name: 'Smoked Mackerel Bowl',     ingredients: 'Smoked mackerel (150g) + new potatoes + cucumber + capers',  protein: 32, kcal: 490 },
  ],
  afternoon_snack: [
    { name: 'Cottage Cheese Pot',       ingredients: 'Cottage cheese (200g) + cucumber + cherry tomatoes',          protein: 22, kcal: 196 },
    { name: 'Protein Shake',            ingredients: 'Whey protein (1 scoop) + 200ml semi-skimmed milk',            protein: 31, kcal: 220 },
    { name: 'Yogurt & Nut Mix',         ingredients: 'Greek yogurt (150g) + 30g almonds + berries',                 protein: 21, kcal: 310 },
    { name: 'Egg & Tomato',             ingredients: '2 hard-boiled eggs + cherry tomatoes + hot sauce',            protein: 12, kcal: 154 },
    { name: 'Skyr Pot',                 ingredients: 'Skyr (150g) + berries + hemp seeds',                          protein: 19, kcal: 145 },
    { name: 'Protein Bar',              ingredients: 'High-protein bar (20g+ protein)',                              protein: 20, kcal: 220 },
    { name: 'Beef Jerky & Babybel',     ingredients: 'Beef jerky (50g) + 2 Babybel light',                         protein: 23, kcal: 215 },
    { name: 'Casein Shake',             ingredients: 'Casein (1 scoop) + 200ml water or milk',                      protein: 24, kcal: 130 },
  ],
  dinner: [
    { name: 'Chicken & Sweet Potato',   ingredients: 'Chicken breast (200g) + sweet potato (150g) + broccoli',     protein: 50, kcal: 590 },
    { name: 'Salmon & Lentils',         ingredients: 'Salmon fillet (150g) + lentils (200g) + spinach + lemon',    protein: 50, kcal: 620 },
    { name: 'Beef Mince Stir-Fry',     ingredients: 'Lean beef mince (150g) + brown rice + peppers + soy sauce',  protein: 52, kcal: 640 },
    { name: 'Turkey Chilli',            ingredients: 'Turkey mince (200g) + kidney beans + tomatoes + rice',        protein: 54, kcal: 550 },
    { name: 'Cod & Quinoa',             ingredients: 'Cod fillet (200g) + quinoa (100g) + roasted peppers',         protein: 48, kcal: 490 },
    { name: 'Chicken Curry',            ingredients: 'Chicken (200g) + chickpeas + coconut-light sauce + rice',     protein: 50, kcal: 650 },
    { name: 'Pork Loin Plate',          ingredients: 'Pork loin (200g) + new potatoes + green beans + mustard',    protein: 52, kcal: 580 },
    { name: 'Prawn Pasta',              ingredients: 'Prawns (150g) + pasta (100g) + courgette + garlic + chilli', protein: 40, kcal: 520 },
    { name: 'Turkey Moussaka',          ingredients: 'Turkey mince (150g) + aubergine + tomato sauce + feta',      protein: 44, kcal: 520 },
    { name: 'Salmon Teriyaki',          ingredients: 'Salmon (150g) + brown rice + stir-fried pak choi & broccoli',protein: 46, kcal: 570 },
  ],
  evening_snack: [
    { name: 'Cottage Cheese & Berries', ingredients: 'Cottage cheese (200g) + mixed berries',                      protein: 22, kcal: 210 },
    { name: 'Casein Shake',             ingredients: 'Casein protein (1 scoop) + 200ml milk — slow-digesting',     protein: 30, kcal: 210 },
    { name: 'Greek Yogurt & PB',        ingredients: 'Greek yogurt (150g) + peanut butter (1 tbsp) + banana',      protein: 18, kcal: 290 },
    { name: 'Quark & Honey',            ingredients: 'Quark (150g) + berries + drizzle honey',                     protein: 18, kcal: 150 },
    { name: 'Boiled Eggs',              ingredients: '2 hard-boiled eggs + salt & pepper',                         protein: 12, kcal: 144 },
    { name: 'Skyr & Almonds',           ingredients: 'Skyr (150g) + 30g almonds',                                  protein: 23, kcal: 270 },
    { name: 'Protein Shake',            ingredients: 'Whey (1 scoop) + 150ml milk + ice',                          protein: 28, kcal: 185 },
  ],
};

// ── State ─────────────────────────────────────────────────────────
var activeUserId    = null;
var currentMealId  = null;
var currentPlan    = null;
var pinTargetUid   = null;  // uid waiting for PIN entry
var pinBuffer      = '';    // digits typed so far

// Per-slot suggestion offset (bumped when user clicks refresh)
var suggestionOffsets = {};

// ── localStorage helpers ──────────────────────────────────────────
function getAllUserIds()           { return JSON.parse(localStorage.getItem('protrack_users') || '[]'); }
function saveAllUserIds(ids)       { localStorage.setItem('protrack_users', JSON.stringify(ids)); }
function loadProfile(uid)          { return JSON.parse(localStorage.getItem('protrack_profile_' + uid) || 'null'); }
function saveProfile(uid, p)       { localStorage.setItem('protrack_profile_' + uid, JSON.stringify(p)); }
function todayKey()                { return new Date().toISOString().slice(0, 10); }

function loadTodayLog() {
  return JSON.parse(localStorage.getItem('protrack_log_' + activeUserId + '_' + todayKey()) || 'null')
    || { meals: {}, healthKcal: 0 };
}
function saveTodayLog(log) {
  localStorage.setItem('protrack_log_' + activeUserId + '_' + todayKey(), JSON.stringify(log));
}

function loadHistory(days) {
  var profile = loadProfile(activeUserId);
  var target  = profile ? (profile.proteinTarget || DEFAULT_PROTEIN_TARGET) : DEFAULT_PROTEIN_TARGET;
  var result  = [];
  for (var i = days; i >= 1; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var ds  = d.toISOString().slice(0, 10);
    var log = JSON.parse(localStorage.getItem('protrack_log_' + activeUserId + '_' + ds) || 'null');
    var tot = log ? getTotalProtein(log) : 0;
    result.push({ dayLabel: d.toLocaleDateString('en-GB', { weekday: 'short' }), total: tot, target: target, hit: tot >= target });
  }
  return result;
}

// ── Calculation helpers ───────────────────────────────────────────
function getTotalProtein(log) {
  return Object.values(log.meals || {}).flat().reduce(function(s,i){ return s+(i.protein||0); }, 0);
}
function getTotalFoodKcal(log) {
  return Object.values(log.meals || {}).flat().reduce(function(s,i){ return s+(i.kcal||0); }, 0);
}
function getMealProtein(log, mid) {
  return (log.meals[mid]||[]).reduce(function(s,i){ return s+(i.protein||0); }, 0);
}
function getMealKcal(log, mid) {
  return (log.meals[mid]||[]).reduce(function(s,i){ return s+(i.kcal||0); }, 0);
}
function getEffectiveTarget(profile, log) {
  var base  = profile && profile.proteinTarget ? profile.proteinTarget : DEFAULT_PROTEIN_TARGET;
  var hkcal = log && log.healthKcal ? log.healthKcal : 0;
  return hkcal > 0 ? Math.round(hkcal * PROTEIN_KCAL_RATIO) : base;
}
function getMealTarget(mealDef, effectiveTotal) {
  return Math.round(mealDef.defaultTarget / DEFAULT_PROTEIN_TARGET * effectiveTotal);
}
function calcBMI(w, h) {
  if (!w||!h) return null;
  var bmi = w / ((h/100)*(h/100));
  var cat = bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese';
  return bmi.toFixed(1)+' — '+cat;
}

// ── PIN helpers ───────────────────────────────────────────────────
// Simple hash: rotate each char code and XOR — enough for a 4-digit PIN.
// Not cryptographic, but sufficient for casual privacy between family members.
function hashPin(pin) {
  var h = 5381;
  for (var i=0; i<pin.length; i++) {
    h = ((h<<5)+h)+pin.charCodeAt(i);
    h = h & h; // convert to 32bit int
  }
  return h.toString(16);
}

function profileHasPin(profile) {
  return !!(profile && profile.pinHash && profile.pinHash !== '');
}

function checkPin(profile, enteredPin) {
  if (!profileHasPin(profile)) return true; // no PIN set = always pass
  return profile.pinHash === hashPin(enteredPin);
}

// ── Shuffle helpers ───────────────────────────────────────────────
function seededRand(seed) {
  var s = seed;
  return function() {
    s = (s*1664525+1013904223)&0xffffffff;
    return (s>>>0)/0x100000000;
  };
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

// Return 4 suggestions for a slot. Offset lets user refresh to next 4.
function getDailySuggestions(mealId) {
  var pool   = SUGGESTION_POOL[mealId]||[];
  var offset = suggestionOffsets[mealId]||0;
  var seed   = todaySeed() + mealId.length*997 + offset*10007;
  var shuffled = seededShuffle(pool, seed);
  return shuffled.slice(0,4);
}

// ── Utilities ─────────────────────────────────────────────────────
function genId() { return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
var toastTimer=null;
function showToast(msg,dur){
  dur=dur||2500; var el=document.getElementById('toast');
  el.textContent=msg; el.classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){el.classList.add('hidden');},dur);
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s){s.classList.add('hidden');s.classList.remove('active');});
  var t=document.getElementById('screen-'+id);
  t.classList.remove('hidden'); t.classList.add('active'); window.scrollTo(0,0);
}

// ═══════════════════════════════════════════════════════════════
// ACCOUNT SCREEN + PIN LOGIC
// ═══════════════════════════════════════════════════════════════
function renderAccountScreen() {
  var ids  = getAllUserIds();
  var list = document.getElementById('accountList');
  list.innerHTML='';
  if (!ids.length) {
    list.innerHTML='<p class="account-list-empty">No profiles yet — create one below!</p>';
  } else {
    ids.forEach(function(uid){
      var p=loadProfile(uid); if(!p) return;
      var btn=document.createElement('button');
      btn.className='account-card';
      btn.innerHTML=
        '<div class="account-avatar">'+escHtml((p.name||'?').slice(0,2).toUpperCase())+'</div>'+
        '<div class="account-card-info">'+
          '<div class="account-card-name">'+escHtml(p.name||'Unnamed')+'</div>'+
          '<div class="account-card-meta">Target: '+(p.proteinTarget||DEFAULT_PROTEIN_TARGET)+'g protein'+
            (p.calTarget?' · '+p.calTarget+' kcal':'')+
            (profileHasPin(p)?' · 🔒':'')+'</div>'+
        '</div>'+
        '<span class="account-card-arrow">›</span>';
      btn.addEventListener('click', function(){ attemptLogin(uid); });
      list.appendChild(btn);
    });
  }
  // Hide PIN overlay when showing account list
  document.getElementById('pinOverlay').classList.add('hidden');
  showScreen('account');
}

// Attempt login: if no PIN → direct, if PIN → show keypad
function attemptLogin(uid) {
  var p = loadProfile(uid);
  if (!profileHasPin(p)) {
    loginAs(uid);
  } else {
    pinTargetUid = uid;
    pinBuffer    = '';
    document.getElementById('pinAvatar').textContent = (p.name||'?').slice(0,2).toUpperCase();
    document.getElementById('pinName').textContent   = p.name||'Profile';
    document.getElementById('pinError').classList.add('hidden');
    updatePinDots();
    document.getElementById('pinOverlay').classList.remove('hidden');
  }
}

function updatePinDots() {
  var dots = document.querySelectorAll('.pin-dot');
  dots.forEach(function(d,i){
    d.classList.toggle('filled', i < pinBuffer.length);
  });
}

// PIN keypad event listeners
document.querySelectorAll('.pin-key[data-val]').forEach(function(btn){
  btn.addEventListener('click', function(){
    if (pinBuffer.length >= 4) return;
    pinBuffer += btn.dataset.val;
    updatePinDots();
    if (pinBuffer.length === 4) {
      // Auto-check after 4th digit
      setTimeout(function(){
        var p = loadProfile(pinTargetUid);
        if (checkPin(p, pinBuffer)) {
          document.getElementById('pinOverlay').classList.add('hidden');
          loginAs(pinTargetUid);
        } else {
          document.getElementById('pinError').classList.remove('hidden');
          pinBuffer = '';
          updatePinDots();
        }
      }, 120);
    }
  });
});

document.getElementById('btnPinDel').addEventListener('click', function(){
  pinBuffer = pinBuffer.slice(0,-1);
  updatePinDots();
  document.getElementById('pinError').classList.add('hidden');
});

document.getElementById('btnPinCancel').addEventListener('click', function(){
  document.getElementById('pinOverlay').classList.add('hidden');
  pinTargetUid = null; pinBuffer = '';
});

function loginAs(uid) {
  activeUserId = uid;
  localStorage.setItem('protrack_active_user', uid);
  suggestionOffsets = {};
  renderDashboard();
  showScreen('dash');
}

// New account form
document.getElementById('btnNewAccount').addEventListener('click', function(){
  document.getElementById('newAccountForm').classList.remove('hidden');
  document.getElementById('btnNewAccount').classList.add('hidden');
  document.getElementById('newName').focus();
});
document.getElementById('btnCancelNew').addEventListener('click', function(){
  document.getElementById('newAccountForm').classList.add('hidden');
  document.getElementById('btnNewAccount').classList.remove('hidden');
});
['newWeight','newHeight'].forEach(function(id){
  document.getElementById(id).addEventListener('input',function(){
    var w=parseFloat(document.getElementById('newWeight').value);
    var h=parseFloat(document.getElementById('newHeight').value);
    document.getElementById('newBMI').textContent=calcBMI(w,h)||'—';
  });
});
document.getElementById('btnSaveNew').addEventListener('click', function(){
  var name = document.getElementById('newName').value.trim();
  if (!name) { showToast('Please enter your name'); return; }

  var pin  = document.getElementById('newPin').value.trim();
  if (pin && (!/^\d{4}$/.test(pin))) {
    showToast('PIN must be exactly 4 digits'); return;
  }

  var uid = genId();
  var profile = {
    name:          name,
    age:           parseInt(document.getElementById('newAge').value)||null,
    weight:        parseFloat(document.getElementById('newWeight').value)||null,
    height:        parseFloat(document.getElementById('newHeight').value)||null,
    proteinTarget: parseInt(document.getElementById('newProteinTarget').value)||DEFAULT_PROTEIN_TARGET,
    calTarget:     parseInt(document.getElementById('newCalTarget').value)||null,
    pinHash:       pin ? hashPin(pin) : '',
    herba:         DEFAULT_HERBA_PRODUCTS.slice(),
    createdAt:     new Date().toISOString(),
  };
  saveProfile(uid, profile);
  var ids=getAllUserIds(); ids.push(uid); saveAllUserIds(ids);
  showToast('Welcome, '+name+'! 🎉');
  loginAs(uid);
});

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function renderDashboard() {
  var profile=loadProfile(activeUserId); if(!profile) return;
  var log=loadTodayLog();
  var initials=(profile.name||'?').slice(0,2).toUpperCase();
  document.getElementById('avatarBtn').textContent=initials;
  document.getElementById('topBarName').textContent=profile.name;
  document.getElementById('topBarDate').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'});
  document.getElementById('healthKcal').value=log.healthKcal||'';

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
  if(protPct>=1){ msgEl.textContent='🎉 Goal smashed! You\'ve hit '+Math.round(totalProtein)+'g today.'; msgEl.style.color='var(--green-light)'; }
  else { msgEl.textContent=Math.round(remaining)+'g more to reach your '+effectiveTarget+'g goal.'; msgEl.style.color='var(--text2)'; }

  renderMealSlots(log,profile,effectiveTarget);
  renderSummary(log,profile,effectiveTarget,totalProtein,totalFoodKcal);
  renderHistory(totalProtein,effectiveTarget);
}

// ═══════════════════════════════════════════════════════════════
// MEAL SLOTS — suggestions with refresh button, no "daily refresh" text
// ═══════════════════════════════════════════════════════════════
function renderMealSlots(log,profile,effectiveTarget) {
  var container=document.getElementById('mealSlots');
  var openSlots={};
  container.querySelectorAll('.meal-slot.open').forEach(function(el){ openSlots[el.id]=true; });
  container.innerHTML='';

  var allProteins=MEAL_DEFAULTS.map(function(m){ return getMealProtein(log,m.id); });
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
    slot.className='meal-slot'+(isComplete?' complete':'')+(isTopMeal?' top-meal':'');
    slot.id='slot_'+meal.id;
    if(openSlots['slot_'+meal.id]) slot.classList.add('open');

    // Logged items
    var itemsHtml='';
    if(items.length){
      itemsHtml='<div class="logged-items">';
      items.forEach(function(item,idx){
        itemsHtml+='<div class="log-item">'+
          '<span class="log-item-dot"></span>'+
          '<span class="log-item-name">'+escHtml(item.name)+'</span>'+
          '<span class="log-item-macros">'+
            '<span class="log-item-g">'+item.protein+'g</span>'+
            (item.kcal?'<span class="log-item-kcal">'+item.kcal+' kcal</span>':'')+
          '</span>'+
          '<button class="log-item-del" data-meal="'+meal.id+'" data-idx="'+idx+'">✕</button>'+
          '</div>';
      });
      itemsHtml+='</div>';
    } else {
      itemsHtml='<p class="empty-slot-msg">Nothing logged yet</p>';
    }

    // Suggestions — no label text; refresh button (↻) to cycle
    var suggestions=getDailySuggestions(meal.id);
    var chipsHtml=suggestions.map(function(s){
      return '<button class="suggestion-chip"'+
        ' data-meal="'+meal.id+'"'+
        ' data-name="'+escHtml(s.label)+'"'+
        ' data-protein="'+s.protein+'"'+
        ' data-kcal="'+s.kcal+'">' +
        '<span class="sug-label">'+escHtml(s.label)+'</span>'+
        '<span class="sug-macros">~'+s.protein+'g · '+s.kcal+'kcal</span>'+
        '</button>';
    }).join('');

    var barColor=isComplete?'var(--green-light)':'var(--green)';

    slot.innerHTML=
      '<div class="meal-header" data-meal="'+meal.id+'" role="button" tabindex="0">'+
        '<div class="meal-icon-wrap">'+
          '<span class="meal-emoji">'+meal.emoji+'</span>'+
          (isTopMeal?'<span class="top-badge" title="Most protein today">⭐</span>':'')+
        '</div>'+
        '<div class="meal-title-block">'+
          '<div class="meal-name">'+meal.name+'</div>'+
          '<div class="meal-sub">'+
            '<span class="meal-sub-prot">'+Math.round(mealActual)+'g / '+mealTarget+'g protein</span>'+
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
            '<span class="suggestion-label">💡 Ideas</span>'+
            '<button class="sug-refresh-btn" data-meal="'+meal.id+'" title="Get different suggestions">↻</button>'+
          '</div>'+
          '<div class="suggestion-chips">'+chipsHtml+'</div>'+
        '</div>'+
        '<button class="add-food-btn" data-meal="'+meal.id+'">'+
          '<span class="add-food-icon">＋</span> Add Food / Meal'+
        '</button>'+
      '</div>';

    container.appendChild(slot);
  });

  // Events
  container.querySelectorAll('.meal-header').forEach(function(hdr){
    hdr.addEventListener('click', function(){
      var slot=hdr.closest('.meal-slot'), isOpen=slot.classList.contains('open');
      container.querySelectorAll('.meal-slot.open').forEach(function(s){s.classList.remove('open');});
      if(!isOpen) slot.classList.add('open');
    });
  });
  container.querySelectorAll('.log-item-del').forEach(function(btn){
    btn.addEventListener('click', function(e){ e.stopPropagation(); deleteFoodItem(btn.dataset.meal,parseInt(btn.dataset.idx)); });
  });
  container.querySelectorAll('.suggestion-chip').forEach(function(chip){
    chip.addEventListener('click', function(e){
      e.stopPropagation();
      addFoodItem(chip.dataset.meal,chip.dataset.name,parseFloat(chip.dataset.protein),parseFloat(chip.dataset.kcal));
    });
  });
  container.querySelectorAll('.add-food-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){ e.stopPropagation(); openFoodModal(btn.dataset.meal); });
  });

  // Suggestion refresh button — increments offset and re-renders
  container.querySelectorAll('.sug-refresh-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var mid=btn.dataset.meal;
      suggestionOffsets[mid]=(suggestionOffsets[mid]||0)+1;
      var log=loadTodayLog(), profile=loadProfile(activeUserId);
      var et=getEffectiveTarget(profile,log);
      renderMealSlots(log,profile,et);
      // Re-open the slot
      setTimeout(function(){
        var slot=document.getElementById('slot_'+mid);
        if(slot) slot.classList.add('open');
      },20);
      showToast('New suggestions loaded ✨');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// FOOD LOG MUTATIONS
// ═══════════════════════════════════════════════════════════════
function addFoodItem(mealId,name,protein,kcal){
  kcal=kcal||0;
  var log=loadTodayLog();
  if(!log.meals[mealId]) log.meals[mealId]=[];
  log.meals[mealId].push({name:name,protein:Math.round(protein*10)/10,kcal:Math.round(kcal)||0});
  saveTodayLog(log); renderDashboard();
  setTimeout(function(){var s=document.getElementById('slot_'+mealId);if(s&&!s.classList.contains('open'))s.classList.add('open');},30);
  showToast('Added: '+name+' (+'+protein+'g protein'+(kcal?', '+kcal+' kcal':'')+')');
}

function deleteFoodItem(mealId,idx){
  var log=loadTodayLog(), item=(log.meals[mealId]||[])[idx]; if(!item) return;
  log.meals[mealId].splice(idx,1);
  saveTodayLog(log); renderDashboard();
  setTimeout(function(){var s=document.getElementById('slot_'+mealId);if(s&&!s.classList.contains('open'))s.classList.add('open');},30);
  showToast('Removed: '+item.name);
}

// ═══════════════════════════════════════════════════════════════
// FOOD MODAL
// ═══════════════════════════════════════════════════════════════
var filteredFoods=FOOD_LIBRARY.slice();

function openFoodModal(mealId){
  currentMealId=mealId;
  var def=MEAL_DEFAULTS.filter(function(m){return m.id===mealId;})[0];
  document.getElementById('modalMealName').textContent='Add to '+(def?def.name:'Meal');
  document.getElementById('manualFoodName').value='';
  document.getElementById('manualFoodProtein').value='';
  document.getElementById('manualFoodCal').value='';
  document.getElementById('manualPreview').innerHTML='';
  document.getElementById('manualValidation').classList.add('hidden');
  document.getElementById('foodSearch').value='';
  filteredFoods=FOOD_LIBRARY.slice();
  renderFoodGrid(); renderHerbaGrid();
  switchModalTab('library');
  document.getElementById('foodModal').classList.remove('hidden');
}
function closeFoodModal(){ document.getElementById('foodModal').classList.add('hidden'); }
document.getElementById('btnCloseModal').addEventListener('click',closeFoodModal);
document.getElementById('foodModal').addEventListener('click',function(e){if(e.target===document.getElementById('foodModal'))closeFoodModal();});

document.querySelectorAll('.mtab').forEach(function(tab){tab.addEventListener('click',function(){switchModalTab(tab.dataset.tab);});});
function switchModalTab(tabId){
  document.querySelectorAll('.mtab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('.modal-tab-pane').forEach(function(p){p.classList.add('hidden');p.classList.remove('active');});
  document.querySelector('.mtab[data-tab="'+tabId+'"]').classList.add('active');
  var pane=document.getElementById('tab'+tabId.charAt(0).toUpperCase()+tabId.slice(1));
  pane.classList.remove('hidden'); pane.classList.add('active');
  if(tabId==='manual') document.getElementById('manualFoodName').focus();
}

document.getElementById('foodSearch').addEventListener('input',function(){
  var q=this.value.toLowerCase().trim();
  filteredFoods=q?FOOD_LIBRARY.filter(function(f){return f.name.toLowerCase().indexOf(q)!==-1;}):FOOD_LIBRARY.slice();
  renderFoodGrid();
});

function renderFoodGrid(){
  var grid=document.getElementById('foodGrid');
  if(!filteredFoods.length){grid.innerHTML='<p class="grid-empty">No foods match.</p>';return;}
  grid.innerHTML=filteredFoods.map(function(f){
    return '<button class="food-chip" data-name="'+escHtml(f.name)+'" data-protein="'+f.protein+'" data-kcal="'+f.kcal+'">'+
      '<span class="food-chip-name">'+escHtml(f.name)+'</span>'+
      '<span class="food-chip-macros"><span class="food-chip-g">'+f.protein+'g</span><span class="food-chip-kcal">'+f.kcal+' kcal</span></span>'+
      '<span class="food-chip-serving">'+f.serving+'</span></button>';
  }).join('');
  grid.querySelectorAll('.food-chip').forEach(function(chip){
    chip.addEventListener('click',function(){addFoodItem(currentMealId,chip.dataset.name,parseFloat(chip.dataset.protein),parseFloat(chip.dataset.kcal));closeFoodModal();});
  });
}

function renderHerbaGrid(){
  var profile=loadProfile(activeUserId), herba=(profile&&profile.herba)?profile.herba:[];
  var grid=document.getElementById('herbaGrid'), hint=document.getElementById('herbaModalHint');
  if(!herba.length){grid.innerHTML='';hint.classList.remove('hidden');return;}
  hint.classList.add('hidden');
  grid.innerHTML=herba.map(function(h){
    return '<button class="food-chip food-chip-herba" data-name="'+escHtml(h.name)+'" data-protein="'+h.protein+'" data-kcal="'+(h.kcal||0)+'">'+
      '<span class="food-chip-name">'+escHtml(h.name)+'</span>'+
      '<span class="food-chip-macros"><span class="food-chip-g herba-g">'+h.protein+'g</span>'+(h.kcal?'<span class="food-chip-kcal">'+h.kcal+' kcal</span>':'')+' </span>'+
      '<span class="food-chip-serving">Herbalife</span></button>';
  }).join('');
  grid.querySelectorAll('.food-chip').forEach(function(chip){
    chip.addEventListener('click',function(){addFoodItem(currentMealId,chip.dataset.name,parseFloat(chip.dataset.protein),parseFloat(chip.dataset.kcal));closeFoodModal();});
  });
}

// Manual entry with live preview
function updateManualPreview(){
  var name=document.getElementById('manualFoodName').value.trim();
  var protein=parseFloat(document.getElementById('manualFoodProtein').value);
  var kcal=parseFloat(document.getElementById('manualFoodCal').value)||0;
  var preview=document.getElementById('manualPreview');
  if(name&&!isNaN(protein)&&protein>0){
    preview.innerHTML='<div class="preview-card"><div class="preview-name">'+escHtml(name)+'</div>'+
      '<div class="preview-macros"><span class="preview-protein">'+protein+'g protein</span>'+(kcal>0?'<span class="preview-kcal">'+kcal+' kcal</span>':'')+
      '</div></div>';
  } else {preview.innerHTML='';}
}
['manualFoodName','manualFoodProtein','manualFoodCal'].forEach(function(id){document.getElementById(id).addEventListener('input',updateManualPreview);});

document.getElementById('btnAddManual').addEventListener('click',function(){
  var name=document.getElementById('manualFoodName').value.trim();
  var protein=parseFloat(document.getElementById('manualFoodProtein').value);
  var kcal=parseFloat(document.getElementById('manualFoodCal').value)||0;
  var validEl=document.getElementById('manualValidation');
  if(!name){showValErr(validEl,'Please enter a food or meal name.');document.getElementById('manualFoodName').focus();return;}
  if(isNaN(protein)||protein<=0){showValErr(validEl,'Please enter protein grams greater than 0.');document.getElementById('manualFoodProtein').focus();return;}
  if(!isNaN(kcal)&&kcal<0){showValErr(validEl,'Calories cannot be negative.');document.getElementById('manualFoodCal').focus();return;}
  validEl.classList.add('hidden');
  addFoodItem(currentMealId,name,protein,kcal); closeFoodModal();
});
function showValErr(el,msg){el.textContent='⚠ '+msg;el.classList.remove('hidden');el.scrollIntoView({behavior:'smooth',block:'nearest'});}

// ═══════════════════════════════════════════════════════════════
// APPLE HEALTH + RESET
// ═══════════════════════════════════════════════════════════════
document.getElementById('healthKcal').addEventListener('change',function(){
  var val=parseFloat(this.value)||0;
  var log=loadTodayLog(); log.healthKcal=val; saveTodayLog(log);
  if(val>0) showToast('Apple Health: '+val+' kcal → protein target set to '+Math.round(val*PROTEIN_KCAL_RATIO)+'g');
  renderDashboard();
});
document.getElementById('btnResetDay').addEventListener('click',function(){
  if(!confirm('Reset all food logs for today? History is kept.')) return;
  localStorage.removeItem('protrack_log_'+activeUserId+'_'+todayKey());
  renderDashboard(); showToast('Today\'s log cleared 🔄');
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
    '<div class="summary-cell"><span class="summary-cell-val green">'+Math.round(totalProtein)+'g</span><span class="summary-cell-lbl">Protein eaten</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val">'+effectiveTarget+'g</span><span class="summary-cell-lbl">Protein target</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val orange">'+Math.round(remaining)+'g</span><span class="summary-cell-lbl">Protein left</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val kcal-val">'+totalFoodKcal+'</span><span class="summary-cell-lbl">Calories logged</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val">'+kcalTarget+'</span><span class="summary-cell-lbl">Calorie target</span></div>'+
    '<div class="summary-cell"><span class="summary-cell-val '+(kcalLeft>0?'orange':'green')+'">'+kcalLeft+'</span><span class="summary-cell-lbl">Calories left</span></div>';

  var msgEl=document.getElementById('summaryMsg');
  if(pct>=1){msgEl.className='summary-msg success';msgEl.textContent='🏆 Excellent! You\'ve hit your '+effectiveTarget+'g protein goal today!';}
  else if(pct>=0.85){msgEl.className='summary-msg warning';msgEl.textContent='💪 Almost there — just '+Math.round(remaining)+'g more to go!';}
  else if(pct>=0.5){msgEl.className='summary-msg warning';msgEl.textContent='🔥 You\'re '+Math.round(remaining)+'g away. Keep it up!';}
  else{msgEl.className='summary-msg neutral';msgEl.textContent='📋 Log your meals to hit '+effectiveTarget+'g protein. You\'ve got this!';}
}

// ═══════════════════════════════════════════════════════════════
// HISTORY CHART
// ═══════════════════════════════════════════════════════════════
function renderHistory(todayTotal,effectiveTarget){
  var history=loadHistory(6);
  var days=history.concat([{dayLabel:'Today',total:todayTotal,target:effectiveTarget,hit:todayTotal>=effectiveTarget}]);
  var maxVal=Math.max.apply(null,days.map(function(d){return d.total;}).concat([effectiveTarget,1]));
  document.getElementById('historyChart').innerHTML=days.map(function(d){
    var h=Math.max(Math.round((d.total/maxVal)*80),d.total>0?3:0);
    var cls=d.dayLabel==='Today'?'today':d.hit?'hit':'miss';
    return '<div class="chart-col">'+
      '<div class="chart-bar-wrap"><div class="chart-bar '+cls+'" style="height:'+h+'px"></div></div>'+
      '<span class="chart-g">'+(d.total>0?Math.round(d.total):'—')+'</span>'+
      '<span class="'+(d.dayLabel==='Today'?'chart-today-lbl':'chart-day')+'">'+d.dayLabel+'</span></div>';
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// AUTO PLAN — per-meal Log buttons + Log All
// ═══════════════════════════════════════════════════════════════
document.getElementById('btnAutoPlan').addEventListener('click', generateAndShowPlan);

function generateAndShowPlan(){
  var profile=loadProfile(activeUserId), log=loadTodayLog();
  var target=getEffectiveTarget(profile,log);

  var plan={};
  MEAL_DEFAULTS.forEach(function(meal){ plan[meal.id]=shuffle(PLAN_MEALS[meal.id]||[])[0]; });

  var planTotal=Object.keys(plan).reduce(function(s,k){return s+(plan[k]?plan[k].protein:0);},0);
  if(planTotal<target*0.85){
    plan.dinner=[...PLAN_MEALS.dinner].sort(function(a,b){return b.protein-a.protein;})[0];
    planTotal=Object.keys(plan).reduce(function(s,k){return s+(plan[k]?plan[k].protein:0);},0);
  }
  currentPlan=plan;

  document.getElementById('planModalSub').textContent=
    'Estimated total: '+planTotal+'g protein · targeting '+target+'g';

  // Render cards with individual Log buttons
  document.getElementById('planCards').innerHTML=MEAL_DEFAULTS.map(function(meal){
    var m=plan[meal.id]; if(!m) return '';
    var loggedClass=isPlanMealLogged(meal.id,m)?'plan-card plan-card-logged':'plan-card';
    return '<div class="'+loggedClass+'" id="plancard_'+meal.id+'">'+
      '<div class="plan-card-header">'+
        '<span class="plan-card-emoji">'+meal.emoji+'</span>'+
        '<div class="plan-card-info">'+
          '<span class="plan-card-meal">'+meal.name+'</span>'+
          '<span class="plan-card-name">'+escHtml(m.name)+'</span>'+
        '</div>'+
        '<div class="plan-card-macros">'+
          '<span class="plan-protein">'+m.protein+'g</span>'+
          '<span class="plan-kcal">'+m.kcal+' kcal</span>'+
        '</div>'+
      '</div>'+
      '<div class="plan-card-ingredients">'+escHtml(m.ingredients)+'</div>'+
      '<button class="plan-log-btn" data-meal="'+meal.id+'">'+
        (isPlanMealLogged(meal.id,m)?'✓ Logged':'Log this meal')+
      '</button>'+
    '</div>';
  }).join('');

  // Individual log buttons
  document.getElementById('planCards').querySelectorAll('.plan-log-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var mid=btn.dataset.meal, m=currentPlan[mid]; if(!m) return;
      logPlanMeal(mid,m);
      // Update card visually without closing modal
      var card=document.getElementById('plancard_'+mid);
      if(card){ card.classList.add('plan-card-logged'); btn.textContent='✓ Logged'; btn.disabled=true; }
    });
  });

  document.getElementById('planModal').classList.remove('hidden');
}

// Check if a plan meal was already logged today
function isPlanMealLogged(mealId, m) {
  if (!m) return false;
  var log = loadTodayLog();
  var items = log.meals[mealId] || [];
  return items.some(function(i){ return i.name === m.name; });
}

function logPlanMeal(mealId, m) {
  var log=loadTodayLog();
  if(!log.meals[mealId]) log.meals[mealId]=[];
  // Avoid duplicate
  if(log.meals[mealId].some(function(i){return i.name===m.name;})) {showToast('Already logged: '+m.name); return;}
  log.meals[mealId].push({name:m.name,protein:m.protein,kcal:m.kcal});
  saveTodayLog(log); renderDashboard();
  showToast(m.name+' logged ✅');
}

document.getElementById('btnRegeneratePlan').addEventListener('click',generateAndShowPlan);
document.getElementById('btnClosePlanModal').addEventListener('click',function(){document.getElementById('planModal').classList.add('hidden');});
document.getElementById('planModal').addEventListener('click',function(e){if(e.target===document.getElementById('planModal'))document.getElementById('planModal').classList.add('hidden');});

// Log All button
document.getElementById('btnLogAllPlan').addEventListener('click',function(){
  if(!currentPlan) return;
  var logged=0;
  MEAL_DEFAULTS.forEach(function(meal){
    var m=currentPlan[meal.id]; if(!m) return;
    logPlanMeal(meal.id,m); logged++;
  });
  document.getElementById('planModal').classList.add('hidden');
  renderDashboard();
  showToast('All '+logged+' meals logged! 🎉',3000);
});

// ═══════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════
document.getElementById('btnOpenProfile').addEventListener('click',function(){loadProfileForm();showScreen('profile');});
document.getElementById('avatarBtn').addEventListener('click',function(){renderAccountScreen();});
document.getElementById('btnBackFromProfile').addEventListener('click',function(){showScreen('dash');renderDashboard();});

function loadProfileForm(){
  var p=loadProfile(activeUserId); if(!p) return;
  document.getElementById('profName').value=p.name||'';
  document.getElementById('profAge').value=p.age||'';
  document.getElementById('profWeight').value=p.weight||'';
  document.getElementById('profHeight').value=p.height||'';
  document.getElementById('profProteinTarget').value=p.proteinTarget||DEFAULT_PROTEIN_TARGET;
  document.getElementById('profCalTarget').value=p.calTarget||'';
  document.getElementById('profPin').value='';  // never pre-fill PIN
  updateProfBMI(); renderHerbaProfileList();
}
function updateProfBMI(){
  var w=parseFloat(document.getElementById('profWeight').value);
  var h=parseFloat(document.getElementById('profHeight').value);
  document.getElementById('profBMI').textContent=calcBMI(w,h)||'—';
}
['profWeight','profHeight'].forEach(function(id){document.getElementById(id).addEventListener('input',updateProfBMI);});

document.getElementById('btnSaveProfile').addEventListener('click',function(){
  var p=loadProfile(activeUserId)||{};
  p.name=document.getElementById('profName').value.trim();
  p.age=parseInt(document.getElementById('profAge').value)||null;
  p.weight=parseFloat(document.getElementById('profWeight').value)||null;
  p.height=parseFloat(document.getElementById('profHeight').value)||null;
  p.proteinTarget=parseInt(document.getElementById('profProteinTarget').value)||DEFAULT_PROTEIN_TARGET;
  p.calTarget=parseInt(document.getElementById('profCalTarget').value)||null;

  // PIN change
  var newPin=document.getElementById('profPin').value.trim();
  if(newPin){
    if(!/^\d{4}$/.test(newPin)){showToast('PIN must be exactly 4 digits');return;}
    p.pinHash=hashPin(newPin);
    showToast('Profile & PIN saved ✅');
  } else {
    showToast('Profile saved ✅');
  }
  saveProfile(activeUserId,p);
});

// Herbalife list
function renderHerbaProfileList(){
  var profile=loadProfile(activeUserId), herba=(profile&&profile.herba)?profile.herba:[];
  var list=document.getElementById('herbaList');
  if(!herba.length){list.innerHTML='<p class="helper-text">No products yet. Add one below.</p>';return;}
  list.innerHTML=herba.map(function(h,i){
    return '<div class="herba-item">'+
      '<div class="herba-item-info">'+
        '<span class="herba-item-name">'+escHtml(h.name)+'</span>'+
        '<span class="herba-item-macros">'+
          '<span class="herba-item-g">'+h.protein+'g protein</span>'+
          (h.kcal?' · <span class="herba-item-kcal">'+h.kcal+' kcal</span>':'')+
        '</span>'+
      '</div>'+
      '<button class="herba-item-del" data-idx="'+i+'">✕</button></div>';
  }).join('');
  list.querySelectorAll('.herba-item-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var p=loadProfile(activeUserId); p.herba.splice(parseInt(btn.dataset.idx),1);
      saveProfile(activeUserId,p); renderHerbaProfileList(); showToast('Product removed');
    });
  });
}
document.getElementById('btnAddHerba').addEventListener('click',function(){
  var name=document.getElementById('herbaName').value.trim();
  var protein=parseFloat(document.getElementById('herbaProtein').value);
  var kcal=parseFloat(document.getElementById('herbaKcal').value)||0;
  if(!name){showToast('Enter product name');return;}
  if(!protein||protein<=0){showToast('Enter protein grams > 0');return;}
  var p=loadProfile(activeUserId)||{}; if(!p.herba)p.herba=[];
  p.herba.push({name:name,protein:protein,kcal:kcal}); saveProfile(activeUserId,p);
  document.getElementById('herbaName').value='';
  document.getElementById('herbaProtein').value='';
  document.getElementById('herbaKcal').value='';
  renderHerbaProfileList(); showToast('Added: '+name+' ✅');
});
document.getElementById('btnDeleteProfile').addEventListener('click',function(){
  if(!confirm('Delete this profile? All data will be permanently removed.')) return;
  localStorage.removeItem('protrack_profile_'+activeUserId);
  Object.keys(localStorage).filter(function(k){return k.indexOf('protrack_log_'+activeUserId)===0;}).forEach(function(k){localStorage.removeItem(k);});
  var ids=getAllUserIds().filter(function(id){return id!==activeUserId;}); saveAllUserIds(ids);
  localStorage.removeItem('protrack_active_user'); activeUserId=null;
  showToast('Profile deleted'); renderAccountScreen();
});

// ═══════════════════════════════════════════════════════════════
// SERVICE WORKER
// ═══════════════════════════════════════════════════════════════
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('service-worker.js')
      .then(function(){console.log('[ProTrack] SW registered');})
      .catch(function(e){console.warn('[ProTrack] SW failed:',e);});
  });
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
function init(){
  var remembered=localStorage.getItem('protrack_active_user');
  var ids=getAllUserIds();
  if(remembered&&ids.indexOf(remembered)!==-1){
    activeUserId=remembered;
    // Still require PIN re-entry on fresh page load for security
    var p=loadProfile(remembered);
    if(profileHasPin(p)){
      renderAccountScreen();
      attemptLogin(remembered);
    } else {
      renderDashboard(); showScreen('dash');
    }
  } else {
    renderAccountScreen();
  }
}
init();
