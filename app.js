/* ═══════════════════════════════════════════════════
   ProTrack — app.js
   Pure vanilla JS, no dependencies.
   All data stored in localStorage per user profile.
   ═══════════════════════════════════════════════════ */

'use strict';

// ──────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────

/**
 * PROTEIN_RATIO: grams of protein recommended per kcal consumed.
 * Default: 0.25g per kcal → so 2000 kcal = 500g (too high, we use it differently below).
 * Actually we use the classic "1g per 4 kcal from protein" rule:
 * protein_g = kcal * PROTEIN_KCAL_RATIO
 * ← CHANGE THIS VALUE to adjust the ratio ←
 */
const PROTEIN_KCAL_RATIO = 0.1; // 1g protein per 10 kcal  (tweak to taste)

/** Default meal protein targets (must sum to DEFAULT_PROTEIN_TARGET) */
const MEAL_DEFAULTS = [
  { id: 'breakfast',       emoji: '🌅', name: 'Breakfast',        defaultTarget: 25 },
  { id: 'lunch',           emoji: '☀️',  name: 'Lunch',            defaultTarget: 30 },
  { id: 'afternoon_snack', emoji: '🍎', name: 'Afternoon Snack',   defaultTarget: 10 },
  { id: 'dinner',          emoji: '🌙', name: 'Dinner',            defaultTarget: 35 },
  { id: 'evening_snack',   emoji: '🌃', name: 'Evening Snack',     defaultTarget: 10 },
];

const DEFAULT_PROTEIN_TARGET = 110;

// ──────────────────────────────────────────────────
// FOOD LIBRARY
// A large, varied list of common high-protein foods.
// Each entry: { name, protein (per serving), kcal (approx), serving }
// ──────────────────────────────────────────────────
const FOOD_LIBRARY = [
  // ─── Meat & Fish ───
  { name: 'Chicken breast',       protein: 31, kcal: 165, serving: '100g cooked' },
  { name: 'Chicken thigh',        protein: 26, kcal: 209, serving: '100g cooked' },
  { name: 'Turkey breast',        protein: 29, kcal: 135, serving: '100g cooked' },
  { name: 'Beef mince (lean)',     protein: 26, kcal: 218, serving: '100g cooked' },
  { name: 'Beef steak (sirloin)',  protein: 27, kcal: 207, serving: '100g cooked' },
  { name: 'Pork loin',            protein: 26, kcal: 185, serving: '100g cooked' },
  { name: 'Ham (sliced)',         protein: 17, kcal: 115, serving: '100g' },
  { name: 'Tuna (canned in water)',protein:25, kcal: 116, serving: '100g drained' },
  { name: 'Salmon (fillet)',       protein: 25, kcal: 208, serving: '100g cooked' },
  { name: 'Cod (fillet)',          protein: 23, kcal: 105, serving: '100g cooked' },
  { name: 'Haddock',               protein: 22, kcal: 100, serving: '100g cooked' },
  { name: 'Sardines (canned)',     protein: 25, kcal: 208, serving: '100g' },
  { name: 'Prawns / Shrimp',       protein: 24, kcal: 99,  serving: '100g cooked' },
  { name: 'Mackerel (canned)',     protein: 19, kcal: 305, serving: '100g' },
  { name: 'Mussels',               protein: 24, kcal: 172, serving: '100g cooked' },

  // ─── Eggs & Dairy ───
  { name: 'Egg (whole, large)',    protein: 6,  kcal: 72,  serving: '1 egg' },
  { name: 'Egg whites (2)',        protein: 7,  kcal: 34,  serving: '2 egg whites' },
  { name: 'Greek yogurt (full fat)',protein:10, kcal: 97,  serving: '100g' },
  { name: 'Greek yogurt (0% fat)', protein: 10, kcal: 57,  serving: '100g' },
  { name: 'Cottage cheese',        protein: 11, kcal: 98,  serving: '100g' },
  { name: 'Milk (semi-skimmed)',   protein: 3,  kcal: 46,  serving: '100ml' },
  { name: 'Milk (full fat)',       protein: 3,  kcal: 61,  serving: '100ml' },
  { name: 'Skyr (plain)',          protein: 11, kcal: 65,  serving: '100g' },
  { name: 'Quark (plain)',         protein: 12, kcal: 67,  serving: '100g' },
  { name: 'Ricotta cheese',        protein: 11, kcal: 174, serving: '100g' },
  { name: 'Cheddar cheese',        protein: 25, kcal: 402, serving: '100g' },
  { name: 'Mozzarella',            protein: 22, kcal: 280, serving: '100g' },
  { name: 'Parmesan',              protein: 32, kcal: 431, serving: '100g' },
  { name: 'Whey protein shake',    protein: 24, kcal: 130, serving: '1 scoop (30g)' },

  // ─── Plant-Based Protein ───
  { name: 'Lentils (cooked)',      protein: 9,  kcal: 116, serving: '100g' },
  { name: 'Chickpeas (cooked)',    protein: 9,  kcal: 164, serving: '100g' },
  { name: 'Black beans (cooked)', protein: 9,  kcal: 132, serving: '100g' },
  { name: 'Kidney beans',          protein: 8,  kcal: 127, serving: '100g cooked' },
  { name: 'Edamame (shelled)',     protein: 11, kcal: 121, serving: '100g cooked' },
  { name: 'Tofu (firm)',           protein: 17, kcal: 144, serving: '100g' },
  { name: 'Tempeh',                protein: 19, kcal: 193, serving: '100g' },
  { name: 'Seitan',                protein: 25, kcal: 165, serving: '100g' },
  { name: 'Soya mince',            protein: 51, kcal: 295, serving: '100g dry' },
  { name: 'Pea protein powder',    protein: 21, kcal: 100, serving: '1 scoop (25g)' },

  // ─── Nuts, Seeds & Spreads ───
  { name: 'Peanut butter (2 tbsp)',protein: 7, kcal: 188, serving: '32g' },
  { name: 'Almond butter (2 tbsp)',protein: 7, kcal: 196, serving: '32g' },
  { name: 'Almonds',               protein: 6,  kcal: 164, serving: '30g handful' },
  { name: 'Pumpkin seeds',         protein: 9,  kcal: 163, serving: '30g' },
  { name: 'Sunflower seeds',       protein: 6,  kcal: 165, serving: '30g' },
  { name: 'Hemp seeds',            protein: 10, kcal: 170, serving: '30g' },
  { name: 'Chia seeds',            protein: 4,  kcal: 137, serving: '28g (2 tbsp)' },

  // ─── Grains & Carbs ───
  { name: 'Oats (dry)',            protein: 5,  kcal: 150, serving: '40g (¼ cup)' },
  { name: 'Quinoa (cooked)',       protein: 4,  kcal: 120, serving: '100g' },
  { name: 'Brown rice (cooked)',   protein: 3,  kcal: 111, serving: '100g' },
  { name: 'Wholegrain bread',      protein: 4,  kcal: 110, serving: '1 slice (40g)' },
  { name: 'Pasta (cooked)',        protein: 5,  kcal: 158, serving: '100g' },

  // ─── Snacks & Convenience ───
  { name: 'Protein bar (generic)', protein: 20, kcal: 220, serving: '1 bar ~60g' },
  { name: 'Babybel (light)',       protein: 6,  kcal: 41,  serving: '1 round (20g)' },
  { name: 'String cheese',         protein: 7,  kcal: 80,  serving: '28g stick' },
  { name: 'Hummus',                protein: 5,  kcal: 166, serving: '100g' },
  { name: 'Beef jerky',            protein: 33, kcal: 264, serving: '100g' },
];

// ──────────────────────────────────────────────────
// MEAL SUGGESTIONS
// Smart, practical meal ideas tied to each meal slot.
// Format: { label, protein } — shown as quick-add chips.
// ──────────────────────────────────────────────────
const MEAL_SUGGESTIONS = {
  breakfast: [
    { label: '2 scrambled eggs + 150g Greek yogurt',   protein: 22 },
    { label: 'Oat porridge with 1 scoop whey + banana', protein: 27 },
    { label: '3-egg omelette with ham & cheddar',        protein: 30 },
    { label: 'Cottage cheese on wholegrain toast (×2)', protein: 20 },
    { label: 'Skyr parfait with almonds & berries',      protein: 18 },
  ],
  lunch: [
    { label: 'Grilled chicken breast + salad',          protein: 35 },
    { label: 'Tuna + chickpea salad wrap',               protein: 30 },
    { label: 'Lentil soup + wholegrain roll',            protein: 18 },
    { label: 'Salmon fillet + quinoa + veg',             protein: 32 },
    { label: 'Turkey & mozzarella wholegrain sandwich',  protein: 28 },
    { label: 'Greek chicken bowl with tzatziki',         protein: 36 },
  ],
  afternoon_snack: [
    { label: '100g cottage cheese + cucumber',          protein: 11 },
    { label: 'Handful almonds + 1 hard-boiled egg',      protein: 12 },
    { label: 'Protein bar',                              protein: 20 },
    { label: '200ml Greek yogurt + honey',               protein: 10 },
    { label: '2 rice cakes + peanut butter',             protein: 8  },
  ],
  dinner: [
    { label: 'Beef mince stir-fry + brown rice',        protein: 34 },
    { label: 'Salmon with roasted veg + quinoa',         protein: 30 },
    { label: 'Chicken thigh & lentil curry',             protein: 38 },
    { label: 'Prawn pasta with garlic & spinach',        protein: 30 },
    { label: 'Turkey burger + sweet potato fries',       protein: 33 },
    { label: 'Tofu & vegetable stir-fry + noodles',      protein: 22 },
  ],
  evening_snack: [
    { label: '200g cottage cheese + berries',           protein: 22 },
    { label: '150g Greek yogurt + 1 tbsp PB',           protein: 17 },
    { label: '2 boiled eggs',                            protein: 12 },
    { label: '1 scoop whey shake with milk',             protein: 27 },
    { label: 'String cheese × 2',                        protein: 14 },
  ],
};

// ──────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────

let activeUserId = null;   // currently logged-in user key
let currentMealId = null;  // which meal the food modal is adding to

// ──────────────────────────────────────────────────
// LOCAL STORAGE HELPERS
// ──────────────────────────────────────────────────

/** Returns the list of all user profile IDs */
function getAllUserIds() {
  return JSON.parse(localStorage.getItem('protrack_users') || '[]');
}

/** Save the user ID list */
function saveAllUserIds(ids) {
  localStorage.setItem('protrack_users', JSON.stringify(ids));
}

/** Load a user profile object */
function loadProfile(userId) {
  return JSON.parse(localStorage.getItem(`protrack_profile_${userId}`) || 'null');
}

/** Save a user profile object */
function saveProfile(userId, profile) {
  localStorage.setItem(`protrack_profile_${userId}`, JSON.stringify(profile));
}

/** Today's date string YYYY-MM-DD */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Load today's log for active user.
 *  Structure: { meals: { mealId: [ {name, protein, kcal} ] }, healthKcal: 0 }
 */
function loadTodayLog() {
  const key = `protrack_log_${activeUserId}_${todayKey()}`;
  return JSON.parse(localStorage.getItem(key) || 'null') || {
    meals: {}, healthKcal: 0
  };
}

/** Save today's log */
function saveTodayLog(log) {
  const key = `protrack_log_${activeUserId}_${todayKey()}`;
  localStorage.setItem(key, JSON.stringify(log));
}

/** Load history for past N days (returns array newest-first, excludes today) */
function loadHistory(days = 7) {
  const history = [];
  const profile = loadProfile(activeUserId);
  const target = profile?.proteinTarget || DEFAULT_PROTEIN_TARGET;

  for (let i = 1; i <= days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const key = `protrack_log_${activeUserId}_${dateStr}`;
    const log = JSON.parse(localStorage.getItem(key) || 'null');
    const total = log ? getTotalProtein(log) : 0;
    history.push({
      date: dateStr,
      dayLabel: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      total,
      target,
      hit: total >= target,
    });
  }
  return history.reverse(); // oldest → newest
}

// ──────────────────────────────────────────────────
// PROTEIN CALCULATION HELPERS
// ──────────────────────────────────────────────────

/** Sum all protein logged across all meals in a log object */
function getTotalProtein(log) {
  let total = 0;
  for (const mealId in log.meals) {
    for (const item of (log.meals[mealId] || [])) {
      total += item.protein || 0;
    }
  }
  return total;
}

/** Sum all kcal logged */
function getTotalKcal(log) {
  let total = 0;
  for (const mealId in log.meals) {
    for (const item of (log.meals[mealId] || [])) {
      total += item.kcal || 0;
    }
  }
  return total;
}

/** Protein per meal from log */
function getMealProtein(log, mealId) {
  return (log.meals[mealId] || []).reduce((s, i) => s + (i.protein || 0), 0);
}

/**
 * Calculate effective protein target.
 * If Apple Health kcal is entered, override the target using the ratio.
 */
function getEffectiveTarget(profile, log) {
  const base = profile?.proteinTarget || DEFAULT_PROTEIN_TARGET;
  const hkcal = log?.healthKcal || 0;
  if (hkcal > 0) {
    return Math.round(hkcal * PROTEIN_KCAL_RATIO);
  }
  return base;
}

/** Scale meal targets proportionally to effective total target */
function getMealTarget(mealDefault, effectiveTotal) {
  const ratio = effectiveTotal / DEFAULT_PROTEIN_TARGET;
  return Math.round(mealDefault.defaultTarget * ratio);
}

// ──────────────────────────────────────────────────
// UNIQUE ID GENERATOR
// ──────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ──────────────────────────────────────────────────
// BMI HELPER
// ──────────────────────────────────────────────────
function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const h = height / 100;
  const bmi = weight / (h * h);
  let cat = '';
  if (bmi < 18.5)       cat = 'Underweight';
  else if (bmi < 25)    cat = 'Normal';
  else if (bmi < 30)    cat = 'Overweight';
  else                  cat = 'Obese';
  return `${bmi.toFixed(1)} (${cat})`;
}

// ──────────────────────────────────────────────────
// TOAST NOTIFICATION
// ──────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, duration = 2400) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), duration);
}

// ──────────────────────────────────────────────────
// SCREEN NAVIGATION
// ──────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(`screen-${id}`).classList.remove('hidden');
}

// ──────────────────────────────────────────────────
// ACCOUNT SCREEN — list profiles, create new
// ──────────────────────────────────────────────────
function renderAccountScreen() {
  const ids = getAllUserIds();
  const list = document.getElementById('accountList');
  list.innerHTML = '';

  if (ids.length === 0) {
    list.innerHTML = '<p class="account-list-empty">No profiles yet — create one below!</p>';
  } else {
    ids.forEach(uid => {
      const p = loadProfile(uid);
      if (!p) return;
      const card = document.createElement('button');
      card.className = 'account-card';
      const initials = (p.name || '?').slice(0, 2).toUpperCase();
      card.innerHTML = `
        <div class="account-avatar">${initials}</div>
        <div class="account-card-info">
          <div class="account-card-name">${p.name || 'Unnamed'}</div>
          <div class="account-card-meta">Target: ${p.proteinTarget || DEFAULT_PROTEIN_TARGET}g protein · ${p.age || '—'} yrs</div>
        </div>
        <span style="color:var(--text3);font-size:18px">›</span>
      `;
      card.addEventListener('click', () => loginAs(uid));
      list.appendChild(card);
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

// ──────────────────────────────────────────────────
// NEW ACCOUNT FORM
// ──────────────────────────────────────────────────

document.getElementById('btnNewAccount').addEventListener('click', () => {
  document.getElementById('newAccountForm').classList.remove('hidden');
  document.getElementById('btnNewAccount').classList.add('hidden');
});

document.getElementById('btnCancelNew').addEventListener('click', () => {
  document.getElementById('newAccountForm').classList.add('hidden');
  document.getElementById('btnNewAccount').classList.remove('hidden');
});

// Auto-calc BMI on new account form
['newWeight', 'newHeight'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const w = parseFloat(document.getElementById('newWeight').value);
    const h = parseFloat(document.getElementById('newHeight').value);
    document.getElementById('newBMI').textContent = calcBMI(w, h) || '—';
  });
});

document.getElementById('btnSaveNew').addEventListener('click', () => {
  const name = document.getElementById('newName').value.trim();
  if (!name) { showToast('Please enter your name'); return; }

  const uid = genId();
  const profile = {
    name,
    age:           parseInt(document.getElementById('newAge').value)           || null,
    weight:        parseFloat(document.getElementById('newWeight').value)      || null,
    height:        parseFloat(document.getElementById('newHeight').value)      || null,
    proteinTarget: parseInt(document.getElementById('newProteinTarget').value) || DEFAULT_PROTEIN_TARGET,
    calTarget:     parseInt(document.getElementById('newCalTarget').value)     || null,
    herba:         [],   // array of { name, protein }
    createdAt:     new Date().toISOString(),
  };

  saveProfile(uid, profile);
  const ids = getAllUserIds();
  ids.push(uid);
  saveAllUserIds(ids);

  showToast(`Welcome, ${name}! 🎉`);
  loginAs(uid);
});

// ──────────────────────────────────────────────────
// DASHBOARD RENDER
// ──────────────────────────────────────────────────
function renderDashboard() {
  const profile = loadProfile(activeUserId);
  if (!profile) return;
  const log = loadTodayLog();

  // ─ Top bar ─
  const initials = (profile.name || '?').slice(0, 2).toUpperCase();
  document.getElementById('avatarBtn').textContent = initials;
  document.getElementById('topBarName').textContent = profile.name;
  document.getElementById('topBarDate').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'short'
  });

  // ─ Apple Health input ─
  document.getElementById('healthKcal').value = log.healthKcal || '';

  // ─ Protein totals ─
  const effectiveTarget = getEffectiveTarget(profile, log);
  const totalProtein = getTotalProtein(log);
  const totalKcal    = getTotalKcal(log);
  const pct = Math.min(totalProtein / effectiveTarget, 1);
  const remaining = Math.max(effectiveTarget - totalProtein, 0);

  // Update ring
  const circ = 326.7;
  const offset = circ - pct * circ;
  const arc = document.getElementById('ringArc');
  arc.style.strokeDashoffset = offset;
  // Colour ring by progress
  if (pct >= 1)         arc.style.stroke = 'var(--green-light)';
  else if (pct >= 0.6)  arc.style.stroke = 'var(--green)';
  else                  arc.style.stroke = 'var(--orange)';

  document.getElementById('ringNum').textContent = Math.round(totalProtein);
  document.getElementById('statConsumed').textContent = `${Math.round(totalProtein)}g`;
  document.getElementById('statTarget').textContent   = `${effectiveTarget}g`;
  document.getElementById('statRemain').textContent   = `${Math.round(remaining)}g`;

  document.getElementById('bigBarFill').style.width = `${Math.round(pct * 100)}%`;
  document.getElementById('bigBarPct').textContent  = `${Math.round(pct * 100)}%`;

  // Dynamic message under bar
  const msgEl = document.getElementById('dynamicMsg');
  if (pct >= 1) {
    msgEl.textContent = `🎉 Goal smashed! You've hit ${Math.round(totalProtein)}g today.`;
    msgEl.style.color = 'var(--green-light)';
  } else if (remaining > 0) {
    msgEl.textContent = `You need ${Math.round(remaining)}g more to hit today's goal.`;
    msgEl.style.color = 'var(--text2)';
  } else {
    msgEl.textContent = '';
  }

  // ─ Meal slots ─
  renderMealSlots(log, profile, effectiveTarget);

  // ─ Summary card ─
  renderSummary(log, profile, effectiveTarget, totalProtein, totalKcal);

  // ─ History chart ─
  renderHistory(totalProtein, effectiveTarget);
}

// ──────────────────────────────────────────────────
// MEAL SLOTS
// ──────────────────────────────────────────────────
function renderMealSlots(log, profile, effectiveTarget) {
  const container = document.getElementById('mealSlots');
  container.innerHTML = '';

  MEAL_DEFAULTS.forEach(meal => {
    const mealTarget  = getMealTarget(meal, effectiveTarget);
    const mealActual  = getMealProtein(log, meal.id);
    const mealPct     = Math.min(mealActual / mealTarget, 1);
    const mealRemain  = Math.max(mealTarget - mealActual, 0);
    const items       = log.meals[meal.id] || [];
    const isComplete  = mealActual >= mealTarget;

    const slot = document.createElement('div');
    slot.className = `meal-slot${isComplete ? ' complete' : ''}`;
    slot.id = `slot_${meal.id}`;

    // Build logged items HTML
    const itemsHtml = items.length
      ? `<div class="logged-items">${items.map((item, idx) => `
          <div class="log-item">
            <span class="log-item-name">${escHtml(item.name)}</span>
            <span class="log-item-g">${item.protein}g</span>
            ${item.kcal ? `<span class="log-item-kcal">${item.kcal}kcal</span>` : ''}
            <button class="log-item-del" data-meal="${meal.id}" data-idx="${idx}" aria-label="Remove">✕</button>
          </div>`).join('')}
        </div>`
      : '';

    // Build suggestion chips HTML
    const suggestions = MEAL_SUGGESTIONS[meal.id] || [];
    const chipsHtml = `
      <div class="suggestion-row">
        <div class="suggestion-label">💡 Suggestions</div>
        <div class="suggestion-chips">
          ${suggestions.map(s => `
            <button class="suggestion-chip"
              data-meal="${meal.id}"
              data-name="${escHtml(s.label)}"
              data-protein="${s.protein}">
              ${escHtml(s.label)} <strong>~${s.protein}g</strong>
            </button>`).join('')}
        </div>
      </div>`;

    slot.innerHTML = `
      <div class="meal-header" data-meal="${meal.id}" role="button" tabindex="0" aria-expanded="false">
        <span class="meal-emoji">${meal.emoji}</span>
        <div class="meal-title-block">
          <div class="meal-name">${meal.name}</div>
          <div class="meal-sub">
            ${Math.round(mealActual)}g / ${mealTarget}g
            ${isComplete ? '✅' : `· ${Math.round(mealRemain)}g remaining`}
          </div>
        </div>
        <div class="meal-progress-mini">
          <span class="meal-g">${Math.round(mealActual)}g</span>
          <div class="meal-mini-bar">
            <div class="meal-mini-fill" style="width:${Math.round(mealPct * 100)}%"></div>
          </div>
        </div>
        <span class="meal-chevron">▼</span>
      </div>
      <div class="meal-body">
        ${itemsHtml}
        ${chipsHtml}
        <button class="add-food-btn" data-meal="${meal.id}">+ Add Food to ${meal.name}</button>
      </div>`;

    container.appendChild(slot);
  });

  // ─ Event delegation for all meal interactions ─
  container.querySelectorAll('.meal-header').forEach(header => {
    header.addEventListener('click', () => {
      const slot = header.closest('.meal-slot');
      const isOpen = slot.classList.contains('open');
      // Close all others
      container.querySelectorAll('.meal-slot.open').forEach(s => s.classList.remove('open'));
      if (!isOpen) slot.classList.add('open');
    });
  });

  container.querySelectorAll('.log-item-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const mealId = btn.dataset.meal;
      const idx    = parseInt(btn.dataset.idx);
      deleteFoodItem(mealId, idx);
    });
  });

  container.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', e => {
      e.stopPropagation();
      addFoodItem(chip.dataset.meal, chip.dataset.name, parseFloat(chip.dataset.protein), 0);
    });
  });

  container.querySelectorAll('.add-food-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openFoodModal(btn.dataset.meal);
    });
  });
}

// ──────────────────────────────────────────────────
// FOOD LOG MUTATIONS
// ──────────────────────────────────────────────────
function addFoodItem(mealId, name, protein, kcal = 0) {
  const log = loadTodayLog();
  if (!log.meals[mealId]) log.meals[mealId] = [];
  log.meals[mealId].push({ name, protein: Math.round(protein * 10) / 10, kcal: kcal || 0 });
  saveTodayLog(log);
  renderDashboard();
  showToast(`Added: ${name} (+${protein}g protein)`);

  // Keep the slot open after adding
  setTimeout(() => {
    const slot = document.getElementById(`slot_${mealId}`);
    if (slot) slot.classList.add('open');
  }, 50);
}

function deleteFoodItem(mealId, idx) {
  const log = loadTodayLog();
  if (log.meals[mealId]) {
    const item = log.meals[mealId][idx];
    log.meals[mealId].splice(idx, 1);
    saveTodayLog(log);
    renderDashboard();
    if (item) showToast(`Removed: ${item.name}`);

    // Keep slot open after deletion
    setTimeout(() => {
      const slot = document.getElementById(`slot_${mealId}`);
      if (slot) slot.classList.add('open');
    }, 50);
  }
}

// ──────────────────────────────────────────────────
// FOOD MODAL
// ──────────────────────────────────────────────────
let filteredFoods = [...FOOD_LIBRARY];

function openFoodModal(mealId) {
  currentMealId = mealId;
  const mealDef = MEAL_DEFAULTS.find(m => m.id === mealId);
  document.getElementById('modalMealName').textContent =
    `Add to ${mealDef ? mealDef.name : 'Meal'}`;

  // Reset fields
  document.getElementById('manualFoodName').value    = '';
  document.getElementById('manualFoodProtein').value = '';
  document.getElementById('manualFoodCal').value     = '';
  document.getElementById('foodSearch').value        = '';

  filteredFoods = [...FOOD_LIBRARY];
  renderFoodGrid();
  renderHerbaGrid();

  // Switch to library tab by default
  switchModalTab('library');

  document.getElementById('foodModal').classList.remove('hidden');
  document.getElementById('foodSearch').focus();
}

function closeFoodModal() {
  document.getElementById('foodModal').classList.add('hidden');
}

document.getElementById('btnCloseModal').addEventListener('click', closeFoodModal);

// Close modal when clicking overlay background
document.getElementById('foodModal').addEventListener('click', e => {
  if (e.target === document.getElementById('foodModal')) closeFoodModal();
});

// Modal tabs
document.querySelectorAll('.mtab').forEach(tab => {
  tab.addEventListener('click', () => switchModalTab(tab.dataset.tab));
});

function switchModalTab(tabId) {
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-tab-pane').forEach(p => p.classList.add('hidden'));

  document.querySelector(`.mtab[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).classList.remove('hidden');
}

// Live search filter
document.getElementById('foodSearch').addEventListener('input', () => {
  const q = document.getElementById('foodSearch').value.toLowerCase().trim();
  filteredFoods = q
    ? FOOD_LIBRARY.filter(f => f.name.toLowerCase().includes(q))
    : [...FOOD_LIBRARY];
  renderFoodGrid();
});

function renderFoodGrid() {
  const grid = document.getElementById('foodGrid');
  if (filteredFoods.length === 0) {
    grid.innerHTML = '<p style="color:var(--text3);font-size:13px;grid-column:1/-1;padding:12px 0">No foods match your search.</p>';
    return;
  }
  grid.innerHTML = filteredFoods.map(f => `
    <button class="food-chip"
      data-name="${escHtml(f.name)}"
      data-protein="${f.protein}"
      data-kcal="${f.kcal}">
      <span class="food-chip-name">${escHtml(f.name)}</span>
      <span class="food-chip-g">${f.protein}g protein</span>
      <span class="food-chip-serving">${f.serving}</span>
    </button>`).join('');

  grid.querySelectorAll('.food-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      addFoodItem(currentMealId, chip.dataset.name,
        parseFloat(chip.dataset.protein), parseFloat(chip.dataset.kcal));
      closeFoodModal();
    });
  });
}

function renderHerbaGrid() {
  const profile = loadProfile(activeUserId);
  const herba = profile?.herba || [];
  const grid = document.getElementById('herbaGrid');
  const hint = document.getElementById('herbaModalHint');

  if (herba.length === 0) {
    grid.innerHTML = '';
    hint.classList.remove('hidden');
    return;
  }

  hint.classList.add('hidden');
  grid.innerHTML = herba.map((h, i) => `
    <button class="food-chip"
      data-name="${escHtml(h.name)}"
      data-protein="${h.protein}"
      data-kcal="${h.kcal || 0}">
      <span class="food-chip-name">${escHtml(h.name)}</span>
      <span class="food-chip-g" style="color:var(--orange)">${h.protein}g protein</span>
      <span class="food-chip-serving">Herbalife</span>
    </button>`).join('');

  grid.querySelectorAll('.food-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      addFoodItem(currentMealId, chip.dataset.name,
        parseFloat(chip.dataset.protein), parseFloat(chip.dataset.kcal));
      closeFoodModal();
    });
  });
}

// Manual food add
document.getElementById('btnAddManual').addEventListener('click', () => {
  const name    = document.getElementById('manualFoodName').value.trim();
  const protein = parseFloat(document.getElementById('manualFoodProtein').value) || 0;
  const kcal    = parseFloat(document.getElementById('manualFoodCal').value)    || 0;

  if (!name) { showToast('Please enter a food name'); return; }
  if (protein <= 0) { showToast('Please enter protein grams'); return; }

  addFoodItem(currentMealId, name, protein, kcal);
  closeFoodModal();
});

// ──────────────────────────────────────────────────
// APPLE HEALTH KCAL
// ──────────────────────────────────────────────────
document.getElementById('healthKcal').addEventListener('change', () => {
  const val = parseFloat(document.getElementById('healthKcal').value) || 0;
  const log = loadTodayLog();
  log.healthKcal = val;
  saveTodayLog(log);

  if (val > 0) {
    const calc = Math.round(val * PROTEIN_KCAL_RATIO);
    showToast(`Apple Health: ${val} kcal → Protein target updated to ${calc}g`);
  }
  renderDashboard();
});

// ──────────────────────────────────────────────────
// RESET TODAY
// ──────────────────────────────────────────────────
document.getElementById('btnResetDay').addEventListener('click', () => {
  if (!confirm('Reset all food logs for today? This cannot be undone.')) return;
  const key = `protrack_log_${activeUserId}_${todayKey()}`;
  localStorage.removeItem(key);
  renderDashboard();
  showToast('Today\'s log has been reset 🔄');
});

// ──────────────────────────────────────────────────
// SUMMARY CARD
// ──────────────────────────────────────────────────
function renderSummary(log, profile, effectiveTarget, totalProtein, totalKcal) {
  const grid = document.getElementById('summaryGrid');
  const remaining = Math.max(effectiveTarget - totalProtein, 0);
  const pct = Math.min(totalProtein / effectiveTarget, 1);

  grid.innerHTML = `
    <div class="summary-cell">
      <span class="summary-cell-val green">${Math.round(totalProtein)}g</span>
      <span class="summary-cell-lbl">Protein eaten</span>
    </div>
    <div class="summary-cell">
      <span class="summary-cell-val">${effectiveTarget}g</span>
      <span class="summary-cell-lbl">Target</span>
    </div>
    <div class="summary-cell">
      <span class="summary-cell-val orange">${Math.round(remaining)}g</span>
      <span class="summary-cell-lbl">Remaining</span>
    </div>
    <div class="summary-cell">
      <span class="summary-cell-val">${totalKcal > 0 ? totalKcal + (log.healthKcal > 0 ? '+' + log.healthKcal : '') : '—'}</span>
      <span class="summary-cell-lbl">Calories</span>
    </div>`;

  // Motivational message
  const msgEl = document.getElementById('summaryMsg');
  if (pct >= 1) {
    msgEl.className = 'summary-msg success';
    msgEl.textContent = `🏆 Great job! You've hit your ${effectiveTarget}g protein goal today!`;
  } else if (pct >= 0.8) {
    msgEl.className = 'summary-msg warning';
    msgEl.textContent = `💪 Almost there! Just ${Math.round(remaining)}g more to reach your goal.`;
  } else if (pct >= 0.5) {
    msgEl.className = 'summary-msg warning';
    msgEl.textContent = `🔥 Good progress — you're ${Math.round(remaining)}g away from your goal. Keep going!`;
  } else {
    msgEl.className = 'summary-msg neutral';
    msgEl.textContent = `📋 Log your meals to track your ${effectiveTarget}g protein target. You've got this!`;
  }
}

// ──────────────────────────────────────────────────
// HISTORY CHART (simple bar chart, no library needed)
// ──────────────────────────────────────────────────
function renderHistory(todayTotal, effectiveTarget) {
  const history = loadHistory(6); // 6 past days
  const chart = document.getElementById('historyChart');

  // Include today at the end
  const days = [
    ...history,
    { date: todayKey(), dayLabel: 'Today', total: todayTotal, target: effectiveTarget, hit: todayTotal >= effectiveTarget }
  ];

  // Max bar height is 80px; scale to the highest value
  const maxVal = Math.max(...days.map(d => d.total), effectiveTarget, 1);

  chart.innerHTML = days.map(d => {
    const heightPct = Math.round((d.total / maxVal) * 80);
    const barClass  = d.dayLabel === 'Today' ? 'today' : (d.hit ? 'hit' : 'miss');
    return `
      <div class="chart-col">
        <div class="chart-bar-wrap">
          <div class="chart-bar ${barClass}" style="height:${heightPct}px"></div>
        </div>
        <span class="chart-g">${d.total > 0 ? Math.round(d.total) : '—'}</span>
        <span class="${d.dayLabel === 'Today' ? 'chart-today-lbl' : 'chart-day'}">${d.dayLabel}</span>
      </div>`;
  }).join('');
}

// ──────────────────────────────────────────────────
// PROFILE SCREEN
// ──────────────────────────────────────────────────
document.getElementById('btnOpenProfile').addEventListener('click', () => {
  loadProfileForm();
  showScreen('profile');
});

document.getElementById('avatarBtn').addEventListener('click', () => {
  renderAccountScreen();
});

document.getElementById('btnBackFromProfile').addEventListener('click', () => {
  showScreen('dash');
  renderDashboard();
});

function loadProfileForm() {
  const profile = loadProfile(activeUserId);
  if (!profile) return;

  document.getElementById('profName').value          = profile.name || '';
  document.getElementById('profAge').value           = profile.age || '';
  document.getElementById('profWeight').value        = profile.weight || '';
  document.getElementById('profHeight').value        = profile.height || '';
  document.getElementById('profProteinTarget').value = profile.proteinTarget || DEFAULT_PROTEIN_TARGET;
  document.getElementById('profCalTarget').value     = profile.calTarget || '';

  updateProfBMI();
  renderHerbaProfileList();
}

function updateProfBMI() {
  const w = parseFloat(document.getElementById('profWeight').value);
  const h = parseFloat(document.getElementById('profHeight').value);
  document.getElementById('profBMI').textContent = calcBMI(w, h) || '—';
}

['profWeight', 'profHeight'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateProfBMI);
});

document.getElementById('btnSaveProfile').addEventListener('click', () => {
  const profile = loadProfile(activeUserId) || {};
  profile.name          = document.getElementById('profName').value.trim();
  profile.age           = parseInt(document.getElementById('profAge').value)           || null;
  profile.weight        = parseFloat(document.getElementById('profWeight').value)      || null;
  profile.height        = parseFloat(document.getElementById('profHeight').value)      || null;
  profile.proteinTarget = parseInt(document.getElementById('profProteinTarget').value) || DEFAULT_PROTEIN_TARGET;
  profile.calTarget     = parseInt(document.getElementById('profCalTarget').value)     || null;

  saveProfile(activeUserId, profile);
  showToast('Profile saved ✅');
});

// ─ Herbalife product management ─
function renderHerbaProfileList() {
  const profile = loadProfile(activeUserId);
  const herba = profile?.herba || [];
  const list = document.getElementById('herbaList');

  if (herba.length === 0) {
    list.innerHTML = '<p class="helper-text">No Herbalife products added yet.</p>';
    return;
  }
  list.innerHTML = herba.map((h, i) => `
    <div class="herba-item">
      <span class="herba-item-name">${escHtml(h.name)}</span>
      <span class="herba-item-g">${h.protein}g</span>
      ${h.kcal ? `<span style="font-size:11px;color:var(--text3)">${h.kcal}kcal</span>` : ''}
      <button class="herba-item-del" data-idx="${i}" aria-label="Remove">✕</button>
    </div>`).join('');

  list.querySelectorAll('.herba-item-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const profile = loadProfile(activeUserId);
      profile.herba.splice(idx, 1);
      saveProfile(activeUserId, profile);
      renderHerbaProfileList();
      showToast('Product removed');
    });
  });
}

document.getElementById('btnAddHerba').addEventListener('click', () => {
  const name    = document.getElementById('herbaName').value.trim();
  const protein = parseFloat(document.getElementById('herbaProtein').value) || 0;
  if (!name)      { showToast('Enter product name'); return; }
  if (protein <= 0) { showToast('Enter protein grams'); return; }

  const profile = loadProfile(activeUserId) || {};
  if (!profile.herba) profile.herba = [];
  profile.herba.push({ name, protein });
  saveProfile(activeUserId, profile);

  document.getElementById('herbaName').value    = '';
  document.getElementById('herbaProtein').value = '';
  renderHerbaProfileList();
  showToast(`Added: ${name}`);
});

// Delete entire profile
document.getElementById('btnDeleteProfile').addEventListener('click', () => {
  if (!confirm('Are you sure you want to delete this profile? All your data will be lost.')) return;

  // Remove profile data
  localStorage.removeItem(`protrack_profile_${activeUserId}`);

  // Remove from user list
  const ids = getAllUserIds().filter(id => id !== activeUserId);
  saveAllUserIds(ids);

  // Clear active user
  localStorage.removeItem('protrack_active_user');
  activeUserId = null;

  showToast('Profile deleted');
  renderAccountScreen();
});

// ──────────────────────────────────────────────────
// XSS-SAFE HTML ESCAPE
// ──────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ──────────────────────────────────────────────────
// SERVICE WORKER REGISTRATION
// ──────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('ProTrack SW registered'))
      .catch(err => console.warn('SW registration failed:', err));
  });
}

// ──────────────────────────────────────────────────
// APP INIT
// ──────────────────────────────────────────────────
function init() {
  // Check if there's a remembered active user
  const remembered = localStorage.getItem('protrack_active_user');
  const ids = getAllUserIds();

  if (remembered && ids.includes(remembered)) {
    // Auto-login returning user
    activeUserId = remembered;
    renderDashboard();
    showScreen('dash');
  } else {
    // First visit or no remembered user — show account picker
    renderAccountScreen();
  }
}

init();
