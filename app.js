/* ═══════════════════════════════════════════════════════════════
   ProTrack — app.js  v2.0
   Pure vanilla JS · No dependencies · localStorage only

   NEW in v2:
   ─ Fixed & improved manual meal entry with live preview + validation
   ─ Proper calorie tracking (per-meal + daily total, dual ring display)
   ─ AI Meal Generator — combinatorial engine, no repeats
   ─ Auto Plan My Day — full day generator hitting protein target
   ─ Smarter, varied meal suggestions (shuffled daily, no dupes)
   ─ Herbalife product library with calories
   ─ UX improvements throughout
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION  ← edit these values to tune the app
// ─────────────────────────────────────────────────────────────────

/** Grams of protein recommended per kcal (Apple Health override) */
const PROTEIN_KCAL_RATIO = 0.1;

/** Default daily protein target when no profile value exists */
const DEFAULT_PROTEIN_TARGET = 110;

/** Default daily calorie target */
const DEFAULT_KCAL_TARGET = 2000;

// ─────────────────────────────────────────────────────────────────
// MEAL SLOT DEFINITIONS
// ─────────────────────────────────────────────────────────────────
const MEAL_DEFAULTS = [
  { id: 'breakfast',       emoji: '🌅', name: 'Breakfast',       defaultTarget: 25 },
  { id: 'lunch',           emoji: '☀️',  name: 'Lunch',           defaultTarget: 30 },
  { id: 'afternoon_snack', emoji: '🍎', name: 'Afternoon Snack', defaultTarget: 10 },
  { id: 'dinner',          emoji: '🌙', name: 'Dinner',          defaultTarget: 35 },
  { id: 'evening_snack',   emoji: '🌃', name: 'Evening Snack',   defaultTarget: 10 },
];

// ─────────────────────────────────────────────────────────────────
// FOOD LIBRARY
// Each entry: { name, protein (g per serving), kcal, serving }
// ─────────────────────────────────────────────────────────────────
const FOOD_LIBRARY = [
  // Meat
  { name: 'Chicken breast',          protein: 31, kcal: 165, serving: '100g cooked' },
  { name: 'Chicken thigh',           protein: 26, kcal: 209, serving: '100g cooked' },
  { name: 'Turkey breast',           protein: 29, kcal: 135, serving: '100g cooked' },
  { name: 'Beef mince (lean)',        protein: 26, kcal: 218, serving: '100g cooked' },
  { name: 'Beef steak',              protein: 27, kcal: 207, serving: '100g cooked' },
  { name: 'Pork loin',               protein: 26, kcal: 185, serving: '100g cooked' },
  { name: 'Ham (sliced)',            protein: 17, kcal: 115, serving: '100g' },
  { name: 'Bacon (2 rashers)',       protein: 12, kcal: 138, serving: '40g cooked' },
  // Fish & Seafood
  { name: 'Tuna (canned)',           protein: 25, kcal: 116, serving: '100g drained' },
  { name: 'Salmon fillet',           protein: 25, kcal: 208, serving: '100g cooked' },
  { name: 'Cod fillet',              protein: 23, kcal: 105, serving: '100g cooked' },
  { name: 'Haddock',                 protein: 22, kcal: 100, serving: '100g cooked' },
  { name: 'Sardines (canned)',       protein: 25, kcal: 208, serving: '100g' },
  { name: 'Mackerel (canned)',       protein: 19, kcal: 305, serving: '100g' },
  { name: 'Prawns / Shrimp',         protein: 24, kcal: 99,  serving: '100g cooked' },
  { name: 'Mussels',                 protein: 24, kcal: 172, serving: '100g cooked' },
  // Eggs & Dairy
  { name: 'Egg (large, whole)',      protein: 6,  kcal: 72,  serving: '1 egg' },
  { name: '2 Eggs',                  protein: 12, kcal: 144, serving: '2 large eggs' },
  { name: '3 Eggs',                  protein: 18, kcal: 216, serving: '3 large eggs' },
  { name: 'Egg whites (3)',          protein: 11, kcal: 51,  serving: '3 whites' },
  { name: 'Greek yogurt (full fat)', protein: 10, kcal: 97,  serving: '100g' },
  { name: 'Greek yogurt (200g pot)', protein: 20, kcal: 194, serving: '200g pot' },
  { name: 'Greek yogurt 0% fat',    protein: 10, kcal: 57,  serving: '100g' },
  { name: 'Cottage cheese',          protein: 11, kcal: 98,  serving: '100g' },
  { name: 'Cottage cheese (200g)',  protein: 22, kcal: 196, serving: '200g tub' },
  { name: 'Milk (semi-skimmed)',    protein: 3,  kcal: 46,  serving: '100ml' },
  { name: 'Skyr (plain)',            protein: 11, kcal: 65,  serving: '100g' },
  { name: 'Quark (plain)',           protein: 12, kcal: 67,  serving: '100g' },
  { name: 'Ricotta',                 protein: 11, kcal: 174, serving: '100g' },
  { name: 'Cheddar cheese (100g)', protein: 25, kcal: 402, serving: '100g' },
  { name: 'Cheddar (40g slice)',    protein: 10, kcal: 161, serving: '40g' },
  { name: 'Mozzarella',              protein: 22, kcal: 280, serving: '100g' },
  { name: 'Parmesan (30g grated)',  protein: 10, kcal: 129, serving: '30g' },
  { name: 'Whey protein shake',      protein: 24, kcal: 130, serving: '1 scoop (30g)' },
  { name: 'Casein shake',            protein: 24, kcal: 120, serving: '1 scoop (30g)' },
  // Plant Protein
  { name: 'Lentils (cooked)',        protein: 9,  kcal: 116, serving: '100g' },
  { name: 'Lentils (200g)',          protein: 18, kcal: 232, serving: '200g cooked' },
  { name: 'Chickpeas (cooked)',      protein: 9,  kcal: 164, serving: '100g' },
  { name: 'Black beans',             protein: 9,  kcal: 132, serving: '100g cooked' },
  { name: 'Kidney beans',            protein: 8,  kcal: 127, serving: '100g cooked' },
  { name: 'Edamame (shelled)',       protein: 11, kcal: 121, serving: '100g cooked' },
  { name: 'Tofu (firm)',             protein: 17, kcal: 144, serving: '100g' },
  { name: 'Tempeh',                  protein: 19, kcal: 193, serving: '100g' },
  { name: 'Seitan',                  protein: 25, kcal: 165, serving: '100g' },
  { name: 'Pea protein powder',      protein: 21, kcal: 100, serving: '1 scoop (25g)' },
  // Nuts & Seeds
  { name: 'Peanut butter (2 tbsp)', protein: 7,  kcal: 188, serving: '32g' },
  { name: 'Almond butter (2 tbsp)', protein: 7,  kcal: 196, serving: '32g' },
  { name: 'Almonds (30g)',           protein: 6,  kcal: 164, serving: '30g' },
  { name: 'Pumpkin seeds (30g)',    protein: 9,  kcal: 163, serving: '30g' },
  { name: 'Hemp seeds (30g)',       protein: 10, kcal: 170, serving: '30g' },
  // Grains
  { name: 'Oats (40g dry)',          protein: 5,  kcal: 150, serving: '40g' },
  { name: 'Quinoa (100g cooked)',   protein: 4,  kcal: 120, serving: '100g cooked' },
  { name: 'Brown rice (100g)',      protein: 3,  kcal: 111, serving: '100g cooked' },
  { name: 'Wholegrain bread',       protein: 4,  kcal: 110, serving: '1 slice (40g)' },
  { name: 'Pasta (100g cooked)',    protein: 5,  kcal: 158, serving: '100g cooked' },
  { name: 'Wholegrain wrap',        protein: 4,  kcal: 130, serving: '1 large wrap' },
  // Snacks
  { name: 'Protein bar',             protein: 20, kcal: 220, serving: '~60g bar' },
  { name: 'Beef jerky',              protein: 33, kcal: 264, serving: '100g' },
  { name: 'Hummus (100g)',           protein: 5,  kcal: 166, serving: '100g' },
  { name: 'String cheese',           protein: 7,  kcal: 80,  serving: '28g stick' },
  { name: 'Babybel (light)',         protein: 6,  kcal: 41,  serving: '1 round (20g)' },
];

// ─────────────────────────────────────────────────────────────────
// DEFAULT HERBALIFE PRODUCT LIBRARY
// Pre-loaded for new users. Add products here to make them
// available to everyone. Users can also add their own in Profile.
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// MEAL SUGGESTIONS POOL
//
// Large variety per slot. getDailySuggestions() picks 4 per day
// using a date-seeded shuffle so they rotate each morning.
// ─────────────────────────────────────────────────────────────────
const SUGGESTION_POOL = {
  breakfast: [
    { label: '3 scrambled eggs + 200g Greek yogurt',             protein: 38, kcal: 424 },
    { label: 'Overnight oats + whey protein + blueberries',      protein: 29, kcal: 410 },
    { label: '3-egg omelette with ham & cheddar',                protein: 32, kcal: 380 },
    { label: 'Cottage cheese on 2 slices wholegrain toast',      protein: 21, kcal: 318 },
    { label: 'Smoked salmon + 2 poached eggs + rye bread',       protein: 38, kcal: 460 },
    { label: 'Protein pancakes (oats + egg + banana)',           protein: 22, kcal: 340 },
    { label: 'Skyr parfait with granola + almonds',              protein: 23, kcal: 380 },
    { label: 'Turkey bacon + 3 eggs + wholegrain toast',         protein: 34, kcal: 430 },
    { label: 'Quark with berries + 1 scoop whey',               protein: 33, kcal: 260 },
    { label: '200g Greek yogurt + hemp seeds + honey',           protein: 23, kcal: 285 },
    { label: 'Egg & spinach wrap with feta',                     protein: 24, kcal: 360 },
    { label: 'Banana protein smoothie (whey + milk + oats)',     protein: 34, kcal: 420 },
  ],
  lunch: [
    { label: 'Grilled chicken breast + quinoa + roasted veg',   protein: 52, kcal: 490 },
    { label: 'Tuna niçoise salad with eggs',                     protein: 38, kcal: 380 },
    { label: 'Salmon & avocado brown rice bowl',                 protein: 42, kcal: 530 },
    { label: 'Chicken wrap with hummus & salad',                 protein: 39, kcal: 480 },
    { label: 'Beef mince & lentil soup + wholegrain roll',       protein: 34, kcal: 520 },
    { label: 'Turkey & mozzarella salad + pasta',                protein: 36, kcal: 490 },
    { label: 'Prawn stir-fry with brown rice',                   protein: 36, kcal: 400 },
    { label: 'Greek chicken bowl with tzatziki & pitta',         protein: 44, kcal: 560 },
    { label: 'Lentil & feta salad with soft-boiled egg',         protein: 24, kcal: 360 },
    { label: 'Tofu poke bowl with edamame & sesame',             protein: 32, kcal: 420 },
    { label: 'Tuna & chickpea salad in wholegrain wrap',         protein: 35, kcal: 470 },
    { label: 'Cottage cheese & veggie flatbread',                protein: 26, kcal: 390 },
  ],
  afternoon_snack: [
    { label: '200g cottage cheese + cucumber sticks',            protein: 22, kcal: 196 },
    { label: 'Protein bar + black coffee',                       protein: 20, kcal: 220 },
    { label: '150g Greek yogurt + 30g almonds',                  protein: 21, kcal: 310 },
    { label: '2 hard-boiled eggs + cherry tomatoes',             protein: 12, kcal: 150 },
    { label: 'Whey shake with 200ml semi-skimmed milk',          protein: 31, kcal: 230 },
    { label: 'Skyr (150g) + handful blueberries',                protein: 17, kcal: 120 },
    { label: '100g edamame + pinch of sea salt',                 protein: 11, kcal: 121 },
    { label: '2 rice cakes + peanut butter + banana',            protein: 8,  kcal: 250 },
    { label: 'String cheese × 2 + apple',                       protein: 14, kcal: 190 },
    { label: 'Tuna (65g) + oatcakes',                           protein: 15, kcal: 200 },
  ],
  dinner: [
    { label: 'Chicken thigh with sweet potato & broccoli',      protein: 48, kcal: 580 },
    { label: 'Salmon with lentils & wilted spinach',             protein: 48, kcal: 600 },
    { label: 'Beef mince stir-fry with brown rice',              protein: 50, kcal: 620 },
    { label: 'Turkey mince chilli with kidney beans',            protein: 54, kcal: 540 },
    { label: 'Prawn pasta with garlic, chilli & courgette',      protein: 40, kcal: 520 },
    { label: 'Cod fillet + quinoa + roasted peppers',            protein: 48, kcal: 480 },
    { label: 'Chicken & chickpea curry with brown rice',         protein: 50, kcal: 640 },
    { label: 'Pork loin + roasted new potatoes + green beans',   protein: 52, kcal: 580 },
    { label: 'Tempeh & vegetable stir-fry with noodles',         protein: 38, kcal: 510 },
    { label: 'Baked haddock + quinoa + tenderstem broccoli',     protein: 50, kcal: 490 },
    { label: 'Turkey burger + sweet potato fries + slaw',        protein: 44, kcal: 620 },
    { label: 'Seitan steak + mashed sweet potato + kale',       protein: 52, kcal: 560 },
  ],
  evening_snack: [
    { label: '200g cottage cheese + berries',                    protein: 22, kcal: 210 },
    { label: '150g Greek yogurt + 1 tbsp PB',                   protein: 17, kcal: 240 },
    { label: '1 scoop casein shake + 200ml milk',               protein: 31, kcal: 200 },
    { label: '2 hard-boiled eggs',                               protein: 12, kcal: 144 },
    { label: 'Quark (150g) + berries + drizzle honey',          protein: 18, kcal: 150 },
    { label: 'Skyr (150g) + 30g almonds',                       protein: 22, kcal: 270 },
    { label: 'Smoked salmon (50g) + cucumber',                   protein: 10, kcal: 70  },
    { label: '100g beef jerky',                                  protein: 33, kcal: 264 },
    { label: 'Protein bar',                                      protein: 20, kcal: 220 },
    { label: '200g low-fat cottage cheese on 2 rice cakes',     protein: 24, kcal: 260 },
  ],
};

// ─────────────────────────────────────────────────────────────────
// AUTO MEAL PLAN DATABASE
//
// Curated named meals per slot with full macro estimates.
// The generator picks randomly from each pool and checks the
// total protein target is met. Easy to extend: just add more
// objects to each array following the same { name, ingredients,
// protein, kcal } format.
// ─────────────────────────────────────────────────────────────────
const PLAN_MEALS = {
  breakfast: [
    { name: 'Protein Oats Bowl',      ingredients: 'Oats + whey protein + berries + almond butter',        protein: 32, kcal: 430 },
    { name: 'Big Egg Breakfast',      ingredients: '3 scrambled eggs + Greek yogurt + wholegrain toast',   protein: 38, kcal: 480 },
    { name: 'Smoked Salmon Plate',    ingredients: 'Smoked salmon + 2 poached eggs + rye bread',           protein: 38, kcal: 460 },
    { name: 'Quark Protein Bowl',     ingredients: 'Quark + berries + hemp seeds + honey',                 protein: 28, kcal: 290 },
    { name: 'Cottage Cheese Toast',   ingredients: 'Cottage cheese + wholegrain toast + sliced tomatoes',  protein: 24, kcal: 360 },
    { name: 'Skyr Parfait',           ingredients: 'Skyr + granola + almonds + banana',                    protein: 22, kcal: 400 },
    { name: 'Turkey Omelette',        ingredients: '3 eggs + turkey bacon + cheddar + spinach',            protein: 38, kcal: 440 },
    { name: 'Protein Smoothie',       ingredients: 'Whey + milk + banana + oats (blended)',                protein: 35, kcal: 450 },
  ],
  lunch: [
    { name: 'Chicken Quinoa Bowl',    ingredients: 'Chicken breast + quinoa + roasted veg + pesto',       protein: 52, kcal: 555 },
    { name: 'Tuna Salad Wrap',        ingredients: 'Tuna + chickpeas + wholegrain wrap + salad',           protein: 38, kcal: 470 },
    { name: 'Salmon Rice Bowl',       ingredients: 'Salmon + brown rice + avocado + cucumber',             protein: 42, kcal: 560 },
    { name: 'Turkey Protein Wrap',    ingredients: 'Turkey breast + mozzarella + spinach + wrap',          protein: 40, kcal: 490 },
    { name: 'Beef Lentil Soup',       ingredients: 'Lean beef + lentils + veg + wholegrain roll',          protein: 42, kcal: 580 },
    { name: 'Greek Chicken Bowl',     ingredients: 'Chicken + quinoa + feta + olives + tzatziki',          protein: 46, kcal: 570 },
    { name: 'Tofu Poke Bowl',         ingredients: 'Firm tofu + brown rice + edamame + sesame dressing',  protein: 34, kcal: 440 },
    { name: 'Prawn Stir-Fry',         ingredients: 'Prawns + brown rice + broccoli + soy-ginger sauce',   protein: 38, kcal: 410 },
  ],
  afternoon_snack: [
    { name: 'Cottage Cheese Pot',     ingredients: 'Cottage cheese + cucumber + cherry tomatoes',          protein: 22, kcal: 196 },
    { name: 'Protein Shake',          ingredients: 'Whey protein + semi-skimmed milk',                     protein: 31, kcal: 220 },
    { name: 'Yogurt & Nut Mix',       ingredients: 'Greek yogurt + almonds + berries',                     protein: 21, kcal: 310 },
    { name: 'Egg & Tomato',           ingredients: '2 hard-boiled eggs + cherry tomatoes + hot sauce',     protein: 12, kcal: 154 },
    { name: 'Skyr Pot',               ingredients: 'Skyr (150g) + berries + hemp seeds',                   protein: 19, kcal: 145 },
    { name: 'Protein Bar',            ingredients: 'High-protein bar (20g+ protein)',                      protein: 20, kcal: 220 },
  ],
  dinner: [
    { name: 'Chicken & Sweet Potato', ingredients: 'Chicken breast + sweet potato + broccoli + garlic',   protein: 50, kcal: 590 },
    { name: 'Salmon & Lentils',       ingredients: 'Salmon fillet + lentils + spinach + lemon-dill',      protein: 50, kcal: 620 },
    { name: 'Beef Mince Stir-Fry',   ingredients: 'Lean beef mince + brown rice + peppers + soy sauce',  protein: 52, kcal: 640 },
    { name: 'Turkey Chilli',          ingredients: 'Turkey mince + kidney beans + tomatoes + rice',        protein: 54, kcal: 550 },
    { name: 'Cod & Quinoa',           ingredients: 'Cod fillet + quinoa + roasted peppers + pesto',        protein: 48, kcal: 490 },
    { name: 'Chicken Curry',          ingredients: 'Chicken + chickpeas + coconut-light sauce + rice',     protein: 50, kcal: 650 },
    { name: 'Pork Loin Plate',        ingredients: 'Pork loin + new potatoes + green beans + mustard',    protein: 52, kcal: 580 },
    { name: 'Prawn Pasta',            ingredients: 'Prawns + pasta + courgette + garlic + chilli',         protein: 40, kcal: 520 },
  ],
  evening_snack: [
    { name: 'Cottage Cheese & Berries', ingredients: 'Cottage cheese (200g) + mixed berries',             protein: 22, kcal: 210 },
    { name: 'Casein Shake',           ingredients: 'Casein protein + milk — slow-digesting',               protein: 30, kcal: 210 },
    { name: 'Greek Yogurt & PB',      ingredients: 'Greek yogurt (150g) + peanut butter + banana',         protein: 18, kcal: 290 },
    { name: 'Quark & Honey',          ingredients: 'Quark (150g) + berries + drizzle honey',               protein: 18, kcal: 150 },
    { name: 'Boiled Eggs',            ingredients: '2 hard-boiled eggs + salt & pepper',                   protein: 12, kcal: 144 },
    { name: 'Skyr & Almonds',         ingredients: 'Skyr (150g) + 30g almonds',                            protein: 23, kcal: 270 },
  ],
};

// ─────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────
let activeUserId  = null;
let currentMealId = null;
let currentPlan   = null;

// ─────────────────────────────────────────────────────────────────
// LOCALSTORAGE HELPERS
// ─────────────────────────────────────────────────────────────────
function getAllUserIds()           { return JSON.parse(localStorage.getItem('protrack_users') || '[]'); }
function saveAllUserIds(ids)       { localStorage.setItem('protrack_users', JSON.stringify(ids)); }
function loadProfile(uid)          { return JSON.parse(localStorage.getItem('protrack_profile_' + uid) || 'null'); }
function saveProfile(uid, profile) { localStorage.setItem('protrack_profile_' + uid, JSON.stringify(profile)); }
function todayKey()                { return new Date().toISOString().slice(0, 10); }

function loadTodayLog() {
  return JSON.parse(localStorage.getItem('protrack_log_' + activeUserId + '_' + todayKey()) || 'null')
    || { meals: {}, healthKcal: 0 };
}
function saveTodayLog(log) {
  localStorage.setItem('protrack_log_' + activeUserId + '_' + todayKey(), JSON.stringify(log));
}

function loadHistory(days) {
  const profile = loadProfile(activeUserId);
  const target  = profile ? profile.proteinTarget || DEFAULT_PROTEIN_TARGET : DEFAULT_PROTEIN_TARGET;
  const result  = [];
  for (let i = days; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const log = JSON.parse(localStorage.getItem('protrack_log_' + activeUserId + '_' + dateStr) || 'null');
    const total = log ? getTotalProtein(log) : 0;
    result.push({ dayLabel: d.toLocaleDateString('en-GB', { weekday: 'short' }), total, target, hit: total >= target });
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
// CALCULATION HELPERS
// ─────────────────────────────────────────────────────────────────
function getTotalProtein(log) {
  return Object.values(log.meals || {}).flat().reduce(function(s, i) { return s + (i.protein || 0); }, 0);
}

// Total calories from food items logged (not including Apple Health kcal)
function getTotalFoodKcal(log) {
  return Object.values(log.meals || {}).flat().reduce(function(s, i) { return s + (i.kcal || 0); }, 0);
}

function getMealProtein(log, mealId) {
  return (log.meals[mealId] || []).reduce(function(s, i) { return s + (i.protein || 0); }, 0);
}

function getMealKcal(log, mealId) {
  return (log.meals[mealId] || []).reduce(function(s, i) { return s + (i.kcal || 0); }, 0);
}

function getEffectiveTarget(profile, log) {
  var base  = (profile && profile.proteinTarget) ? profile.proteinTarget : DEFAULT_PROTEIN_TARGET;
  var hkcal = (log && log.healthKcal) ? log.healthKcal : 0;
  return hkcal > 0 ? Math.round(hkcal * PROTEIN_KCAL_RATIO) : base;
}

function getMealTarget(mealDef, effectiveTotal) {
  return Math.round(mealDef.defaultTarget / DEFAULT_PROTEIN_TARGET * effectiveTotal);
}

function calcBMI(weight, height) {
  if (!weight || !height) return null;
  var h = height / 100;
  var bmi = weight / (h * h);
  var cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  return bmi.toFixed(1) + ' — ' + cat;
}

// ─────────────────────────────────────────────────────────────────
// SHUFFLE & SEEDING HELPERS
// ─────────────────────────────────────────────────────────────────

// Simple seeded PRNG (LCG) — same seed always produces same sequence
function seededRand(seed) {
  var s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

// Shuffle using seed — produces same order for same seed (repeatable daily suggestions)
function seededShuffle(arr, seed) {
  var a = arr.slice();
  var rand = seededRand(seed);
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rand() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

// Random shuffle — used for auto-plan (different every press)
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function todaySeed() {
  return parseInt(todayKey().replace(/-/g, ''), 10);
}

// Returns 4 suggestions for a slot, rotated daily via seeded shuffle
function getDailySuggestions(mealId) {
  var pool    = SUGGESTION_POOL[mealId] || [];
  var seed    = todaySeed() + mealId.length * 997; // offset per slot
  var shuffled = seededShuffle(pool, seed);
  return shuffled.slice(0, 4);
}

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

var toastTimer = null;
function showToast(msg, duration) {
  duration = duration || 2500;
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { el.classList.add('hidden'); }, duration);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.add('hidden');
    s.classList.remove('active');
  });
  var t = document.getElementById('screen-' + id);
  t.classList.remove('hidden');
  t.classList.add('active');
  window.scrollTo(0, 0);
}

// ─────────────────────────────────────────────────────────────────
// ACCOUNT SCREEN
// ─────────────────────────────────────────────────────────────────
function renderAccountScreen() {
  var ids  = getAllUserIds();
  var list = document.getElementById('accountList');
  list.innerHTML = '';

  if (!ids.length) {
    list.innerHTML = '<p class="account-list-empty">No profiles yet — create one below!</p>';
  } else {
    ids.forEach(function(uid) {
      var p = loadProfile(uid);
      if (!p) return;
      var btn = document.createElement('button');
      btn.className = 'account-card';
      btn.innerHTML =
        '<div class="account-avatar">' + (p.name || '?').slice(0, 2).toUpperCase() + '</div>' +
        '<div class="account-card-info">' +
          '<div class="account-card-name">' + escHtml(p.name || 'Unnamed') + '</div>' +
          '<div class="account-card-meta">Target: ' + (p.proteinTarget || DEFAULT_PROTEIN_TARGET) + 'g protein' +
            (p.calTarget ? ' · ' + p.calTarget + ' kcal' : '') + '</div>' +
        '</div>' +
        '<span class="account-card-arrow">›</span>';
      btn.addEventListener('click', function() { loginAs(uid); });
      list.appendChild(btn);
    });
  }
  showScreen('account');
}

function loginAs(uid) {
  activeUserId = uid;
  localStorage.setItem('protrack_active_user', uid);
  renderDashboard();
  showScreen('dash');
}

document.getElementById('btnNewAccount').addEventListener('click', function() {
  document.getElementById('newAccountForm').classList.remove('hidden');
  document.getElementById('btnNewAccount').classList.add('hidden');
  document.getElementById('newName').focus();
});

document.getElementById('btnCancelNew').addEventListener('click', function() {
  document.getElementById('newAccountForm').classList.add('hidden');
  document.getElementById('btnNewAccount').classList.remove('hidden');
});

['newWeight', 'newHeight'].forEach(function(id) {
  document.getElementById(id).addEventListener('input', function() {
    var w = parseFloat(document.getElementById('newWeight').value);
    var h = parseFloat(document.getElementById('newHeight').value);
    document.getElementById('newBMI').textContent = calcBMI(w, h) || '—';
  });
});

document.getElementById('btnSaveNew').addEventListener('click', function() {
  var name = document.getElementById('newName').value.trim();
  if (!name) { showToast('Please enter your name'); return; }

  var uid = genId();
  var profile = {
    name:          name,
    age:           parseInt(document.getElementById('newAge').value)           || null,
    weight:        parseFloat(document.getElementById('newWeight').value)      || null,
    height:        parseFloat(document.getElementById('newHeight').value)      || null,
    proteinTarget: parseInt(document.getElementById('newProteinTarget').value) || DEFAULT_PROTEIN_TARGET,
    calTarget:     parseInt(document.getElementById('newCalTarget').value)     || null,
    herba:         DEFAULT_HERBA_PRODUCTS.slice(),  // pre-load default Herbalife products
    createdAt:     new Date().toISOString(),
  };

  saveProfile(uid, profile);
  var ids = getAllUserIds();
  ids.push(uid);
  saveAllUserIds(ids);
  showToast('Welcome, ' + name + '! 🎉');
  loginAs(uid);
});

// ─────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  var profile = loadProfile(activeUserId);
  if (!profile) return;
  var log = loadTodayLog();

  // Top bar
  var initials = (profile.name || '?').slice(0, 2).toUpperCase();
  document.getElementById('avatarBtn').textContent  = initials;
  document.getElementById('topBarName').textContent = profile.name;
  document.getElementById('topBarDate').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'short',
  });

  document.getElementById('healthKcal').value = log.healthKcal || '';

  // Calculations
  var effectiveTarget = getEffectiveTarget(profile, log);
  var totalProtein    = getTotalProtein(log);
  var totalFoodKcal   = getTotalFoodKcal(log);
  var kcalTarget      = profile.calTarget || DEFAULT_KCAL_TARGET;
  var protPct         = Math.min(totalProtein / effectiveTarget, 1);
  var kcalPct         = Math.min(totalFoodKcal / kcalTarget, 1);
  var remaining       = Math.max(effectiveTarget - totalProtein, 0);

  // Protein ring (SVG stroke-dashoffset, circ = 2π×52 ≈ 326.7)
  var circ   = 326.7;
  var arcEl  = document.getElementById('ringArc');
  arcEl.style.strokeDashoffset = circ - protPct * circ;
  arcEl.style.stroke = protPct >= 1 ? 'var(--green-light)' : protPct >= 0.6 ? 'var(--green)' : 'var(--orange)';
  document.getElementById('ringNum').textContent = Math.round(totalProtein);

  // Calorie ring
  var kcalArcEl = document.getElementById('kcalArc');
  kcalArcEl.style.strokeDashoffset = circ - kcalPct * circ;
  document.getElementById('kcalRingNum').textContent = totalFoodKcal;

  // Stat pills
  document.getElementById('statConsumed').textContent = Math.round(totalProtein) + 'g';
  document.getElementById('statTarget').textContent   = effectiveTarget + 'g';
  document.getElementById('statRemain').textContent   = Math.round(remaining) + 'g';
  document.getElementById('statKcal').textContent     = totalFoodKcal;

  // Progress bar
  document.getElementById('bigBarFill').style.width = Math.round(protPct * 100) + '%';
  document.getElementById('bigBarPct').textContent  = Math.round(protPct * 100) + '%';

  // Dynamic message
  var msgEl = document.getElementById('dynamicMsg');
  if (protPct >= 1) {
    msgEl.textContent = '🎉 Goal smashed! You\'ve hit ' + Math.round(totalProtein) + 'g today.';
    msgEl.style.color = 'var(--green-light)';
  } else {
    msgEl.textContent = Math.round(remaining) + 'g more to reach your ' + effectiveTarget + 'g goal.';
    msgEl.style.color = 'var(--text2)';
  }

  renderMealSlots(log, profile, effectiveTarget);
  renderSummary(log, profile, effectiveTarget, totalProtein, totalFoodKcal);
  renderHistory(totalProtein, effectiveTarget);
}

// ─────────────────────────────────────────────────────────────────
// MEAL SLOTS
// ─────────────────────────────────────────────────────────────────
function renderMealSlots(log, profile, effectiveTarget) {
  var container = document.getElementById('mealSlots');

  // Remember open slots before re-render
  var openSlots = {};
  container.querySelectorAll('.meal-slot.open').forEach(function(el) {
    openSlots[el.id] = true;
  });

  container.innerHTML = '';

  // Find highest-protein meal for highlight
  var allProteins = MEAL_DEFAULTS.map(function(m) { return getMealProtein(log, m.id); });
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
    slot.className = 'meal-slot' + (isComplete ? ' complete' : '') + (isTopMeal ? ' top-meal' : '');
    slot.id = 'slot_' + meal.id;
    if (openSlots['slot_' + meal.id]) slot.classList.add('open');

    // Logged items
    var itemsHtml = '';
    if (items.length) {
      itemsHtml = '<div class="logged-items">';
      items.forEach(function(item, idx) {
        itemsHtml +=
          '<div class="log-item">' +
            '<span class="log-item-dot"></span>' +
            '<span class="log-item-name">' + escHtml(item.name) + '</span>' +
            '<span class="log-item-macros">' +
              '<span class="log-item-g">' + item.protein + 'g</span>' +
              (item.kcal ? '<span class="log-item-kcal">' + item.kcal + ' kcal</span>' : '') +
            '</span>' +
            '<button class="log-item-del" data-meal="' + meal.id + '" data-idx="' + idx + '" aria-label="Remove">✕</button>' +
          '</div>';
      });
      itemsHtml += '</div>';
    } else {
      itemsHtml = '<p class="empty-slot-msg">Nothing logged yet</p>';
    }

    // Daily-shuffled suggestion chips
    var suggestions = getDailySuggestions(meal.id);
    var chipsHtml = suggestions.map(function(s) {
      return '<button class="suggestion-chip"' +
        ' data-meal="' + meal.id + '"' +
        ' data-name="' + escHtml(s.label) + '"' +
        ' data-protein="' + s.protein + '"' +
        ' data-kcal="' + s.kcal + '">' +
        '<span class="sug-label">' + escHtml(s.label) + '</span>' +
        '<span class="sug-macros">~' + s.protein + 'g · ' + s.kcal + 'kcal</span>' +
        '</button>';
    }).join('');

    var barColor = isComplete ? 'var(--green-light)' : 'var(--green)';

    slot.innerHTML =
      '<div class="meal-header" data-meal="' + meal.id + '" role="button" tabindex="0">' +
        '<div class="meal-icon-wrap">' +
          '<span class="meal-emoji">' + meal.emoji + '</span>' +
          (isTopMeal ? '<span class="top-badge" title="Most protein today">⭐</span>' : '') +
        '</div>' +
        '<div class="meal-title-block">' +
          '<div class="meal-name">' + meal.name + '</div>' +
          '<div class="meal-sub">' +
            '<span class="meal-sub-prot">' + Math.round(mealActual) + 'g / ' + mealTarget + 'g protein</span>' +
            (mealKcal > 0 ? '<span class="meal-sub-kcal"> · ' + mealKcal + ' kcal</span>' : '') +
            (isComplete ? '<span class="meal-sub-done"> ✅</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="meal-progress-mini">' +
          '<span class="meal-g-mini">' + Math.round(mealActual) + 'g</span>' +
          '<div class="meal-mini-bar">' +
            '<div class="meal-mini-fill" style="width:' + Math.round(mealPct * 100) + '%;background:' + barColor + '"></div>' +
          '</div>' +
        '</div>' +
        '<span class="meal-chevron">▼</span>' +
      '</div>' +
      '<div class="meal-body">' +
        itemsHtml +
        '<div class="suggestion-row">' +
          '<div class="suggestion-label">💡 Suggestions (refreshed daily)</div>' +
          '<div class="suggestion-chips">' + chipsHtml + '</div>' +
        '</div>' +
        '<button class="add-food-btn" data-meal="' + meal.id + '">' +
          '<span class="add-food-icon">＋</span> Add Food / Meal' +
        '</button>' +
      '</div>';

    container.appendChild(slot);
  });

  // Event delegation
  container.querySelectorAll('.meal-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var slot   = header.closest('.meal-slot');
      var isOpen = slot.classList.contains('open');
      container.querySelectorAll('.meal-slot.open').forEach(function(s) { s.classList.remove('open'); });
      if (!isOpen) slot.classList.add('open');
    });
  });

  container.querySelectorAll('.log-item-del').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      deleteFoodItem(btn.dataset.meal, parseInt(btn.dataset.idx));
    });
  });

  container.querySelectorAll('.suggestion-chip').forEach(function(chip) {
    chip.addEventListener('click', function(e) {
      e.stopPropagation();
      addFoodItem(chip.dataset.meal, chip.dataset.name, parseFloat(chip.dataset.protein), parseFloat(chip.dataset.kcal));
    });
  });

  container.querySelectorAll('.add-food-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      openFoodModal(btn.dataset.meal);
    });
  });
}

// ─────────────────────────────────────────────────────────────────
// FOOD LOG MUTATIONS
// ─────────────────────────────────────────────────────────────────
function addFoodItem(mealId, name, protein, kcal) {
  kcal = kcal || 0;
  var log = loadTodayLog();
  if (!log.meals[mealId]) log.meals[mealId] = [];
  log.meals[mealId].push({
    name:    name,
    protein: Math.round(protein * 10) / 10,
    kcal:    Math.round(kcal) || 0,
  });
  saveTodayLog(log);
  renderDashboard();
  // Reopen the slot after render
  setTimeout(function() {
    var slot = document.getElementById('slot_' + mealId);
    if (slot && !slot.classList.contains('open')) slot.classList.add('open');
  }, 30);
  showToast('Added: ' + name + ' (+' + protein + 'g protein' + (kcal ? ', ' + kcal + ' kcal' : '') + ')');
}

function deleteFoodItem(mealId, idx) {
  var log  = loadTodayLog();
  var item = (log.meals[mealId] || [])[idx];
  if (!item) return;
  log.meals[mealId].splice(idx, 1);
  saveTodayLog(log);
  renderDashboard();
  setTimeout(function() {
    var slot = document.getElementById('slot_' + mealId);
    if (slot && !slot.classList.contains('open')) slot.classList.add('open');
  }, 30);
  showToast('Removed: ' + item.name);
}

// ─────────────────────────────────────────────────────────────────
// FOOD MODAL
// ─────────────────────────────────────────────────────────────────
var filteredFoods = FOOD_LIBRARY.slice();

function openFoodModal(mealId) {
  currentMealId = mealId;
  var def = MEAL_DEFAULTS.filter(function(m) { return m.id === mealId; })[0];
  document.getElementById('modalMealName').textContent = 'Add to ' + (def ? def.name : 'Meal');

  // Reset all inputs
  document.getElementById('manualFoodName').value    = '';
  document.getElementById('manualFoodProtein').value = '';
  document.getElementById('manualFoodCal').value     = '';
  document.getElementById('manualPreview').innerHTML  = '';
  document.getElementById('manualValidation').classList.add('hidden');
  document.getElementById('foodSearch').value         = '';

  filteredFoods = FOOD_LIBRARY.slice();
  renderFoodGrid();
  renderHerbaGrid();
  switchModalTab('library');
  document.getElementById('foodModal').classList.remove('hidden');
}

function closeFoodModal() {
  document.getElementById('foodModal').classList.add('hidden');
}

document.getElementById('btnCloseModal').addEventListener('click', closeFoodModal);
document.getElementById('foodModal').addEventListener('click', function(e) {
  if (e.target === document.getElementById('foodModal')) closeFoodModal();
});

// Modal tabs
document.querySelectorAll('.mtab').forEach(function(tab) {
  tab.addEventListener('click', function() { switchModalTab(tab.dataset.tab); });
});

function switchModalTab(tabId) {
  document.querySelectorAll('.mtab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.modal-tab-pane').forEach(function(p) {
    p.classList.add('hidden'); p.classList.remove('active');
  });
  document.querySelector('.mtab[data-tab="' + tabId + '"]').classList.add('active');
  var pane = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
  pane.classList.remove('hidden');
  pane.classList.add('active');
  if (tabId === 'manual') document.getElementById('manualFoodName').focus();
}

// Food library search
document.getElementById('foodSearch').addEventListener('input', function() {
  var q = this.value.toLowerCase().trim();
  filteredFoods = q ? FOOD_LIBRARY.filter(function(f) { return f.name.toLowerCase().indexOf(q) !== -1; }) : FOOD_LIBRARY.slice();
  renderFoodGrid();
});

function renderFoodGrid() {
  var grid = document.getElementById('foodGrid');
  if (!filteredFoods.length) {
    grid.innerHTML = '<p class="grid-empty">No foods match your search.</p>';
    return;
  }
  grid.innerHTML = filteredFoods.map(function(f) {
    return '<button class="food-chip"' +
      ' data-name="' + escHtml(f.name) + '"' +
      ' data-protein="' + f.protein + '"' +
      ' data-kcal="' + f.kcal + '">' +
      '<span class="food-chip-name">' + escHtml(f.name) + '</span>' +
      '<span class="food-chip-macros">' +
        '<span class="food-chip-g">' + f.protein + 'g</span>' +
        '<span class="food-chip-kcal">' + f.kcal + ' kcal</span>' +
      '</span>' +
      '<span class="food-chip-serving">' + f.serving + '</span>' +
      '</button>';
  }).join('');

  grid.querySelectorAll('.food-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      addFoodItem(currentMealId, chip.dataset.name, parseFloat(chip.dataset.protein), parseFloat(chip.dataset.kcal));
      closeFoodModal();
    });
  });
}

function renderHerbaGrid() {
  var profile = loadProfile(activeUserId);
  var herba   = (profile && profile.herba) ? profile.herba : [];
  var grid    = document.getElementById('herbaGrid');
  var hint    = document.getElementById('herbaModalHint');

  if (!herba.length) {
    grid.innerHTML = '';
    hint.classList.remove('hidden');
    return;
  }
  hint.classList.add('hidden');
  grid.innerHTML = herba.map(function(h) {
    return '<button class="food-chip food-chip-herba"' +
      ' data-name="' + escHtml(h.name) + '"' +
      ' data-protein="' + h.protein + '"' +
      ' data-kcal="' + (h.kcal || 0) + '">' +
      '<span class="food-chip-name">' + escHtml(h.name) + '</span>' +
      '<span class="food-chip-macros">' +
        '<span class="food-chip-g herba-g">' + h.protein + 'g</span>' +
        (h.kcal ? '<span class="food-chip-kcal">' + h.kcal + ' kcal</span>' : '') +
      '</span>' +
      '<span class="food-chip-serving">Herbalife</span>' +
      '</button>';
  }).join('');

  grid.querySelectorAll('.food-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      addFoodItem(currentMealId, chip.dataset.name, parseFloat(chip.dataset.protein), parseFloat(chip.dataset.kcal));
      closeFoodModal();
    });
  });
}

// ─────────────────────────────────────────────────────────────────
// MANUAL ENTRY — live preview + validation
// ─────────────────────────────────────────────────────────────────

// Update live preview card while user types
function updateManualPreview() {
  var name    = document.getElementById('manualFoodName').value.trim();
  var protein = parseFloat(document.getElementById('manualFoodProtein').value);
  var kcal    = parseFloat(document.getElementById('manualFoodCal').value) || 0;
  var preview = document.getElementById('manualPreview');

  if (name && !isNaN(protein) && protein > 0) {
    preview.innerHTML =
      '<div class="preview-card">' +
        '<div class="preview-name">' + escHtml(name) + '</div>' +
        '<div class="preview-macros">' +
          '<span class="preview-protein">' + protein + 'g protein</span>' +
          (kcal > 0 ? '<span class="preview-kcal">' + kcal + ' kcal</span>' : '') +
        '</div>' +
      '</div>';
  } else {
    preview.innerHTML = '';
  }
}

['manualFoodName', 'manualFoodProtein', 'manualFoodCal'].forEach(function(id) {
  document.getElementById(id).addEventListener('input', updateManualPreview);
});

document.getElementById('btnAddManual').addEventListener('click', function() {
  var name    = document.getElementById('manualFoodName').value.trim();
  var protein = parseFloat(document.getElementById('manualFoodProtein').value);
  var kcal    = parseFloat(document.getElementById('manualFoodCal').value) || 0;
  var validEl = document.getElementById('manualValidation');

  // Validation
  if (!name) {
    showValidationError(validEl, 'Please enter a food or meal name.');
    document.getElementById('manualFoodName').focus();
    return;
  }
  if (isNaN(protein) || protein <= 0) {
    showValidationError(validEl, 'Please enter protein grams greater than 0.');
    document.getElementById('manualFoodProtein').focus();
    return;
  }
  if (!isNaN(kcal) && kcal < 0) {
    showValidationError(validEl, 'Calories cannot be negative.');
    document.getElementById('manualFoodCal').focus();
    return;
  }

  validEl.classList.add('hidden');
  addFoodItem(currentMealId, name, protein, kcal);
  closeFoodModal();
});

function showValidationError(el, msg) {
  el.textContent = '⚠ ' + msg;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─────────────────────────────────────────────────────────────────
// APPLE HEALTH KCAL INPUT
// ─────────────────────────────────────────────────────────────────
document.getElementById('healthKcal').addEventListener('change', function() {
  var val = parseFloat(this.value) || 0;
  var log = loadTodayLog();
  log.healthKcal = val;
  saveTodayLog(log);
  if (val > 0) {
    var calc = Math.round(val * PROTEIN_KCAL_RATIO);
    showToast('Apple Health: ' + val + ' kcal → protein target set to ' + calc + 'g');
  }
  renderDashboard();
});

// ─────────────────────────────────────────────────────────────────
// RESET DAY
// ─────────────────────────────────────────────────────────────────
document.getElementById('btnResetDay').addEventListener('click', function() {
  if (!confirm('Reset all food logs for today? Your history is kept.')) return;
  localStorage.removeItem('protrack_log_' + activeUserId + '_' + todayKey());
  renderDashboard();
  showToast('Today\'s log cleared 🔄');
});

// ─────────────────────────────────────────────────────────────────
// DAILY SUMMARY CARD
// ─────────────────────────────────────────────────────────────────
function renderSummary(log, profile, effectiveTarget, totalProtein, totalFoodKcal) {
  var remaining  = Math.max(effectiveTarget - totalProtein, 0);
  var pct        = Math.min(totalProtein / effectiveTarget, 1);
  var kcalTarget = (profile.calTarget) ? profile.calTarget : DEFAULT_KCAL_TARGET;
  var kcalLeft   = Math.max(kcalTarget - totalFoodKcal, 0);

  document.getElementById('summaryGrid').innerHTML =
    '<div class="summary-cell">' +
      '<span class="summary-cell-val green">' + Math.round(totalProtein) + 'g</span>' +
      '<span class="summary-cell-lbl">Protein eaten</span>' +
    '</div>' +
    '<div class="summary-cell">' +
      '<span class="summary-cell-val">' + effectiveTarget + 'g</span>' +
      '<span class="summary-cell-lbl">Protein target</span>' +
    '</div>' +
    '<div class="summary-cell">' +
      '<span class="summary-cell-val orange">' + Math.round(remaining) + 'g</span>' +
      '<span class="summary-cell-lbl">Protein left</span>' +
    '</div>' +
    '<div class="summary-cell">' +
      '<span class="summary-cell-val kcal-val">' + totalFoodKcal + '</span>' +
      '<span class="summary-cell-lbl">Calories logged</span>' +
    '</div>' +
    '<div class="summary-cell">' +
      '<span class="summary-cell-val">' + kcalTarget + '</span>' +
      '<span class="summary-cell-lbl">Calorie target</span>' +
    '</div>' +
    '<div class="summary-cell">' +
      '<span class="summary-cell-val ' + (kcalLeft > 0 ? 'orange' : 'green') + '">' + kcalLeft + '</span>' +
      '<span class="summary-cell-lbl">Calories left</span>' +
    '</div>';

  var msgEl = document.getElementById('summaryMsg');
  if (pct >= 1) {
    msgEl.className = 'summary-msg success';
    msgEl.textContent = '🏆 Excellent! You\'ve hit your ' + effectiveTarget + 'g protein goal today!';
  } else if (pct >= 0.85) {
    msgEl.className = 'summary-msg warning';
    msgEl.textContent = '💪 Almost there — just ' + Math.round(remaining) + 'g more to go!';
  } else if (pct >= 0.5) {
    msgEl.className = 'summary-msg warning';
    msgEl.textContent = '🔥 You\'re ' + Math.round(remaining) + 'g away from your goal. Keep it up!';
  } else {
    msgEl.className = 'summary-msg neutral';
    msgEl.textContent = '📋 Log your meals to hit ' + effectiveTarget + 'g protein. You\'ve got this!';
  }
}

// ─────────────────────────────────────────────────────────────────
// 7-DAY HISTORY CHART (CSS bar chart, no library needed)
// ─────────────────────────────────────────────────────────────────
function renderHistory(todayTotal, effectiveTarget) {
  var history = loadHistory(6);
  var days    = history.concat([{
    dayLabel: 'Today', total: todayTotal,
    target: effectiveTarget, hit: todayTotal >= effectiveTarget,
  }]);
  var maxVal = Math.max.apply(null, days.map(function(d) { return d.total; }).concat([effectiveTarget, 1]));

  document.getElementById('historyChart').innerHTML = days.map(function(d) {
    var heightPx = Math.max(Math.round((d.total / maxVal) * 80), d.total > 0 ? 3 : 0);
    var cls      = d.dayLabel === 'Today' ? 'today' : (d.hit ? 'hit' : 'miss');
    return '<div class="chart-col">' +
      '<div class="chart-bar-wrap">' +
        '<div class="chart-bar ' + cls + '" style="height:' + heightPx + 'px" title="' + d.total + 'g protein"></div>' +
      '</div>' +
      '<span class="chart-g">' + (d.total > 0 ? Math.round(d.total) : '—') + '</span>' +
      '<span class="' + (d.dayLabel === 'Today' ? 'chart-today-lbl' : 'chart-day') + '">' + d.dayLabel + '</span>' +
      '</div>';
  }).join('');
}

// ─────────────────────────────────────────────────────────────────
// AUTO PLAN GENERATOR
//
// 1. Pick one random meal from each slot's PLAN_MEALS pool.
// 2. Sum protein across all slots.
// 3. If total < 85% of target, swap dinner for the
//    highest-protein dinner to close the gap.
// 4. Display the plan in a modal; user can re-roll or log all.
// ─────────────────────────────────────────────────────────────────
document.getElementById('btnAutoPlan').addEventListener('click', function() {
  generateAndShowPlan();
});

function generateAndShowPlan() {
  var profile = loadProfile(activeUserId);
  var log     = loadTodayLog();
  var target  = getEffectiveTarget(profile, log);

  // Pick random meal from each slot
  var plan = {};
  MEAL_DEFAULTS.forEach(function(meal) {
    var pool = shuffle(PLAN_MEALS[meal.id] || []);
    plan[meal.id] = pool[0];
  });

  // Check total protein
  var planTotal = Object.keys(plan).reduce(function(s, k) { return s + (plan[k] ? plan[k].protein : 0); }, 0);

  // Boost: if under 85% of target, use highest-protein dinner
  if (planTotal < target * 0.85) {
    var sortedDinner = PLAN_MEALS.dinner.slice().sort(function(a, b) { return b.protein - a.protein; });
    plan.dinner = sortedDinner[0];
    planTotal   = Object.keys(plan).reduce(function(s, k) { return s + (plan[k] ? plan[k].protein : 0); }, 0);
  }

  currentPlan = plan;

  document.getElementById('planModalSub').textContent =
    'Estimated total: ' + planTotal + 'g protein · targeting ' + target + 'g';

  document.getElementById('planCards').innerHTML = MEAL_DEFAULTS.map(function(meal) {
    var m = plan[meal.id];
    if (!m) return '';
    return '<div class="plan-card">' +
      '<div class="plan-card-header">' +
        '<span class="plan-card-emoji">' + meal.emoji + '</span>' +
        '<div class="plan-card-info">' +
          '<span class="plan-card-meal">' + meal.name + '</span>' +
          '<span class="plan-card-name">' + escHtml(m.name) + '</span>' +
        '</div>' +
        '<div class="plan-card-macros">' +
          '<span class="plan-protein">' + m.protein + 'g</span>' +
          '<span class="plan-kcal">' + m.kcal + ' kcal</span>' +
        '</div>' +
      '</div>' +
      '<div class="plan-card-ingredients">' + escHtml(m.ingredients) + '</div>' +
      '</div>';
  }).join('');

  document.getElementById('planModal').classList.remove('hidden');
}

document.getElementById('btnRegeneratePlan').addEventListener('click', generateAndShowPlan);

document.getElementById('btnClosePlanModal').addEventListener('click', function() {
  document.getElementById('planModal').classList.add('hidden');
});
document.getElementById('planModal').addEventListener('click', function(e) {
  if (e.target === document.getElementById('planModal'))
    document.getElementById('planModal').classList.add('hidden');
});

document.getElementById('btnAcceptPlan').addEventListener('click', function() {
  if (!currentPlan) return;
  var log = loadTodayLog();

  MEAL_DEFAULTS.forEach(function(meal) {
    var m = currentPlan[meal.id];
    if (!m) return;
    if (!log.meals[meal.id]) log.meals[meal.id] = [];
    log.meals[meal.id].push({ name: m.name, protein: m.protein, kcal: m.kcal });
  });

  saveTodayLog(log);
  document.getElementById('planModal').classList.add('hidden');
  renderDashboard();
  showToast('Meal plan logged! All meals added. 🎉', 3000);
});

// ─────────────────────────────────────────────────────────────────
// PROFILE SCREEN
// ─────────────────────────────────────────────────────────────────
document.getElementById('btnOpenProfile').addEventListener('click', function() {
  loadProfileForm();
  showScreen('profile');
});

document.getElementById('avatarBtn').addEventListener('click', function() {
  renderAccountScreen();
});

document.getElementById('btnBackFromProfile').addEventListener('click', function() {
  showScreen('dash');
  renderDashboard();
});

function loadProfileForm() {
  var p = loadProfile(activeUserId);
  if (!p) return;
  document.getElementById('profName').value          = p.name          || '';
  document.getElementById('profAge').value           = p.age           || '';
  document.getElementById('profWeight').value        = p.weight        || '';
  document.getElementById('profHeight').value        = p.height        || '';
  document.getElementById('profProteinTarget').value = p.proteinTarget || DEFAULT_PROTEIN_TARGET;
  document.getElementById('profCalTarget').value     = p.calTarget     || '';
  updateProfBMI();
  renderHerbaProfileList();
}

function updateProfBMI() {
  var w = parseFloat(document.getElementById('profWeight').value);
  var h = parseFloat(document.getElementById('profHeight').value);
  document.getElementById('profBMI').textContent = calcBMI(w, h) || '—';
}
['profWeight', 'profHeight'].forEach(function(id) {
  document.getElementById(id).addEventListener('input', updateProfBMI);
});

document.getElementById('btnSaveProfile').addEventListener('click', function() {
  var p = loadProfile(activeUserId) || {};
  p.name          = document.getElementById('profName').value.trim();
  p.age           = parseInt(document.getElementById('profAge').value)           || null;
  p.weight        = parseFloat(document.getElementById('profWeight').value)      || null;
  p.height        = parseFloat(document.getElementById('profHeight').value)      || null;
  p.proteinTarget = parseInt(document.getElementById('profProteinTarget').value) || DEFAULT_PROTEIN_TARGET;
  p.calTarget     = parseInt(document.getElementById('profCalTarget').value)     || null;
  saveProfile(activeUserId, p);
  showToast('Profile saved ✅');
});

// ─────────────────────────────────────────────────────────────────
// HERBALIFE PRODUCT LIBRARY (Profile screen)
// ─────────────────────────────────────────────────────────────────
function renderHerbaProfileList() {
  var profile = loadProfile(activeUserId);
  var herba   = (profile && profile.herba) ? profile.herba : [];
  var list    = document.getElementById('herbaList');

  if (!herba.length) {
    list.innerHTML = '<p class="helper-text">No products yet. Add one below.</p>';
    return;
  }

  list.innerHTML = herba.map(function(h, i) {
    return '<div class="herba-item">' +
      '<div class="herba-item-info">' +
        '<span class="herba-item-name">' + escHtml(h.name) + '</span>' +
        '<span class="herba-item-macros">' +
          '<span class="herba-item-g">' + h.protein + 'g protein</span>' +
          (h.kcal ? '<span class="herba-item-kcal"> · ' + h.kcal + ' kcal</span>' : '') +
        '</span>' +
      '</div>' +
      '<button class="herba-item-del" data-idx="' + i + '" aria-label="Remove">✕</button>' +
      '</div>';
  }).join('');

  list.querySelectorAll('.herba-item-del').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var p = loadProfile(activeUserId);
      p.herba.splice(parseInt(btn.dataset.idx), 1);
      saveProfile(activeUserId, p);
      renderHerbaProfileList();
      showToast('Product removed');
    });
  });
}

document.getElementById('btnAddHerba').addEventListener('click', function() {
  var name    = document.getElementById('herbaName').value.trim();
  var protein = parseFloat(document.getElementById('herbaProtein').value);
  var kcal    = parseFloat(document.getElementById('herbaKcal').value) || 0;
  if (!name)            { showToast('Enter product name'); return; }
  if (!protein || protein <= 0) { showToast('Enter protein grams > 0'); return; }

  var p = loadProfile(activeUserId) || {};
  if (!p.herba) p.herba = [];
  p.herba.push({ name: name, protein: protein, kcal: kcal });
  saveProfile(activeUserId, p);

  document.getElementById('herbaName').value    = '';
  document.getElementById('herbaProtein').value = '';
  document.getElementById('herbaKcal').value    = '';
  renderHerbaProfileList();
  showToast('Added: ' + name + ' ✅');
});

document.getElementById('btnDeleteProfile').addEventListener('click', function() {
  if (!confirm('Delete this profile? All data will be permanently removed.')) return;
  localStorage.removeItem('protrack_profile_' + activeUserId);
  Object.keys(localStorage)
    .filter(function(k) { return k.indexOf('protrack_log_' + activeUserId) === 0; })
    .forEach(function(k) { localStorage.removeItem(k); });
  var ids = getAllUserIds().filter(function(id) { return id !== activeUserId; });
  saveAllUserIds(ids);
  localStorage.removeItem('protrack_active_user');
  activeUserId = null;
  showToast('Profile deleted');
  renderAccountScreen();
});

// ─────────────────────────────────────────────────────────────────
// SERVICE WORKER
// ─────────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js')
      .then(function() { console.log('[ProTrack] SW registered'); })
      .catch(function(e) { console.warn('[ProTrack] SW failed:', e); });
  });
}

// ─────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────
function init() {
  var remembered = localStorage.getItem('protrack_active_user');
  var ids        = getAllUserIds();

  if (remembered && ids.indexOf(remembered) !== -1) {
    activeUserId = remembered;
    renderDashboard();
    showScreen('dash');
  } else {
    renderAccountScreen();
  }
}

init();
