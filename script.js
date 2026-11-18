/* =====================================================
   EcoTrack - Sustainable Living Tracker  (CSE326 CA1)
   Vanilla JavaScript (ES6) - no libraries, no backend
   -----------------------------------------------------
   TABLE OF CONTENTS
   1.  Constants & emission factors
   2.  Helper functions (DOM, localStorage, toast)
   3.  Navbar, scroll spy & back-to-top
   4.  Hero animated counters
   5.  Calculation logic (VIVA: formulas explained)
   6.  Form validation
   7.  Calculator form (live calc + submit)
   8.  Result dashboard (DOM manipulation + canvas chart)
   9.  History (localStorage)
   10. Goal tracker
   11. Eco tips (filter, search, modal)
   12. Daily habit checklist
   13. Contact form
   14. Init
   ===================================================== */
'use strict'; // strict mode catches common coding mistakes

/* ---------------------------------------------------
   1. CONSTANTS & EMISSION FACTORS
   --------------------------------------------------- */
const FACTORS = {
  electricity: 0.82,   // kg CO2 per kWh
  lpg: 35.4,           // kg CO2 per cylinder
  petrol: 2.31,        // kg CO2 per litre of petrol
  diesel: 2.68,        // kg CO2 per litre of diesel
  transit: 0.04,       // kg CO2 per km of bus/train
  flight: 250,         // kg CO2 per flight
  water: 0.001,        // kg CO2 per litre (approximation)
  waste: 0.5,          // kg CO2 per kg of waste
  diet: { vegetarian: 1500, nonveg: 2500, vegan: 1000 } // kg CO2 per YEAR
};

const INDIAN_AVG = 2000; // Indian average = 2 tons = 2000 kg CO2 per person per year

// localStorage keys
const KEY_HISTORY = 'ecotrack_history';
const KEY_GOAL = 'ecotrack_goal';
const KEY_HABITS = 'ecotrack_habits';

// Categories used in the dashboard + chart
const CATEGORIES = [
  { key: 'electricity', label: 'Electricity', short: 'Elec.',  icon: '⚡', color: '#f4b400' },
  { key: 'transport',   label: 'Transport',   short: 'Trans.', icon: '🚗', color: '#4285f4' },
  { key: 'lpg',         label: 'LPG',         short: 'LPG',    icon: '🔥', color: '#ea6a47' },
  { key: 'diet',        label: 'Diet',        short: 'Diet',   icon: '🥗', color: '#34a853' },
  { key: 'waste',       label: 'Waste',       short: 'Waste',  icon: '🗑️', color: '#8e6c8a' },
  { key: 'water',       label: 'Water',       short: 'Water',  icon: '💧', color: '#00acc1' }
];

// Personalised tips shown for the highest-emission category
const PERSONAL_TIPS = {
  electricity: [
    'Replace old bulbs with LED lights – they use up to 80% less electricity.',
    'Unplug chargers and switch off devices at the socket instead of leaving them on standby.',
    'Choose 5-star rated appliances and set your AC to 24–26 °C.',
    'Use natural daylight and ceiling fans whenever possible.'
  ],
  transport: [
    'Use bus, metro or train for daily travel instead of a private vehicle.',
    'Carpool with friends or colleagues to share fuel and emissions.',
    'Cycle or walk for short distances (under 3 km).',
    'Keep your tyres inflated and vehicle serviced – it improves mileage. Try to avoid unnecessary flights.'
  ],
  lpg: [
    'Use a pressure cooker – it can cut cooking fuel use by up to 70%.',
    'Cover pots while cooking and keep the flame low once water boils.',
    'Plan meals to avoid reheating food again and again.',
    'Consider an induction cooktop powered by renewable energy.'
  ],
  diet: [
    'Try "Meatless Mondays" – even one plant-based day a week cuts emissions.',
    'Choose local, seasonal vegetables and fruits.',
    'Cook only what you need and avoid food wastage.',
    'Replace red meat with pulses, beans or tofu more often.'
  ],
  waste: [
    'Segregate dry and wet waste and compost kitchen scraps.',
    'Carry a cloth bag and a steel bottle to avoid single-use plastic.',
    'Repair, reuse and donate items instead of throwing them away.',
    'Buy products with minimal packaging.'
  ],
  water: [
    'Fix leaking taps – a dripping tap wastes over 2,000 litres a year.',
    'Take shorter showers and use a bucket instead of a shower when possible.',
    'Reuse RO reject water for mopping and gardening.',
    'Harvest rainwater for plants and cleaning.'
  ]
};

// Data for the 8 tip cards in the Eco Tips section
const TIPS = [
  { id: 1, title: 'Save Electricity', cat: 'energy', icon: '💡',
    short: 'Switch to LEDs and unplug idle devices.',
    text: 'Electricity is one of the biggest sources of household emissions in India because the grid still relies heavily on coal.',
    steps: ['Replace bulbs with LEDs', 'Unplug chargers when not in use', 'Use 5-star rated appliances', 'Set AC to 24–26 °C'],
    impact: 'Potential saving: up to 300 kg CO₂ per year.' },
  { id: 2, title: 'Save Water', cat: 'water', icon: '🚿',
    short: 'Fix leaks and take shorter showers.',
    text: 'Pumping, treating and heating water uses energy. Saving water also saves electricity and fuel.',
    steps: ['Fix dripping taps', 'Close the tap while brushing', 'Use a bucket for bathing', 'Run washing machine only with full loads'],
    impact: 'Potential saving: 20–30% of household water use.' },
  { id: 3, title: 'Use Public Transport', cat: 'transport', icon: '🚌',
    short: 'Bus and train emit far less CO₂ per person.',
    text: 'A bus or train emits only a fraction of the CO₂ per passenger compared with a private car or two-wheeler.',
    steps: ['Plan routes with metro/bus apps', 'Get a monthly pass', 'Combine trips to avoid extra travel', 'Carpool when public transport is unavailable'],
    impact: 'Potential saving: up to 500 kg CO₂ per year.' },
  { id: 4, title: 'Reduce Plastic', cat: 'waste', icon: '🛍️',
    short: 'Carry a cloth bag and a steel bottle.',
    text: 'Plastic is made from fossil fuels and takes hundreds of years to decompose. Reducing use cuts both waste and emissions.',
    steps: ['Carry a cloth bag', 'Use a refillable steel bottle', 'Say no to plastic straws and cutlery', 'Buy loose products instead of packaged'],
    impact: 'One person can avoid around 300 plastic bags a year.' },
  { id: 5, title: 'Plant Trees', cat: 'waste', icon: '🌳',
    short: 'One tree absorbs about 20 kg of CO₂ yearly.',
    text: 'Trees absorb CO₂, cool the surroundings, and support wildlife. Planting native species works best.',
    steps: ['Join a local plantation drive', 'Grow plants on your balcony', 'Adopt and water a sapling', 'Choose native species'],
    impact: 'A mature tree can absorb ~20 kg CO₂ per year.' },
  { id: 6, title: 'Cycle or Walk', cat: 'transport', icon: '🚲',
    short: 'Zero emissions for short trips.',
    text: 'Short trips under 3 km are perfect for walking or cycling. It is free, healthy and emission-free.',
    steps: ['Cycle to college or market', 'Walk for small errands', 'Park once and walk between nearby places', 'Join a cycling group'],
    impact: 'Replacing a 5 km petrol bike trip saves ~0.4 kg CO₂ each time.' },
  { id: 7, title: 'Solar Power', cat: 'energy', icon: '☀️',
    short: 'Use solar heaters and lights.',
    text: 'Solar energy is clean and abundant in India. Even small solar devices reduce your dependency on the grid.',
    steps: ['Install a solar water heater', 'Use solar garden lights', 'Charge devices with solar chargers', 'Explore rooftop solar subsidies'],
    impact: 'A 1 kW rooftop system can save ~1,200 kg CO₂ per year.' },
  { id: 8, title: 'Compost & Recycle', cat: 'waste', icon: '♻️',
    short: 'Turn kitchen waste into compost.',
    text: 'Food waste in landfills produces methane, a powerful greenhouse gas. Composting avoids this.',
    steps: ['Segregate wet and dry waste', 'Start a small compost bin', 'Recycle paper, glass and metal', 'Donate old clothes and books'],
    impact: 'Composting can cut household waste by up to 50%.' }
];

// 8 daily habits for the checklist
const HABITS = [
  { id: 'h1', text: '🛍️ Carry a cloth bag' },
  { id: 'h2', text: '💡 Switch off lights when leaving a room' },
  { id: 'h3', text: '🚲 Use a cycle or walk for short trips' },
  { id: 'h4', text: '🚿 Take a short shower (under 5 min)' },
  { id: 'h5', text: '🔌 Unplug unused chargers' },
  { id: 'h6', text: '♻️ Segregate dry and wet waste' },
  { id: 'h7', text: '🥤 Use a reusable water bottle' },
  { id: 'h8', text: '🥗 Eat a plant-based meal' }
];

/* ---------------------------------------------------
   2. HELPER FUNCTIONS
   --------------------------------------------------- */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Read JSON from localStorage safely (returns fallback if empty or corrupted)
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn('Could not read localStorage:', err);
    return fallback;
  }
}

// Save JSON to localStorage
function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Could not write localStorage:', err);
  }
}

// Format numbers like 12,345.6
const fmt = (n, d = 1) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: d });

// Toast notification (auto removes after 3.5 seconds)
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' error-toast' : '');
  toast.textContent = message;
  $('#toastContainer').appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ---------------------------------------------------
   3. NAVBAR, SCROLL SPY & BACK-TO-TOP
   --------------------------------------------------- */
function initNavbar() {
  const hamburger = $('#hamburger');
  const menu = $('#navMenu');

  // Hamburger click: toggle menu (click event)
  hamburger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close mobile menu after clicking a link
  $$('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // window scroll event: back-to-top button + highlight active nav link
  const backBtn = $('#backToTop');
  const sections = ['home', 'calculator', 'history', 'tips', 'contact'];

  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('show', window.scrollY > 400);

    let current = 'home';
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) current = id;
    });
    // Results/goal/habits sections belong to nearby menu items
    const extra = { results: 'calculator', goal: 'history', habits: 'tips' };
    Object.keys(extra).forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('hidden') && el.getBoundingClientRect().top <= 120 &&
          el.getBoundingClientRect().bottom > 120) current = extra[id];
    });
    $$('.nav-link').forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  });

  // window.scroll API: smooth scroll to top
  backBtn.addEventListener('click', () => window.scroll({ top: 0, behavior: 'smooth' }));
}

/* ---------------------------------------------------
   4. HERO ANIMATED COUNTERS
   --------------------------------------------------- */
// Animates a number from 0 to target using requestAnimationFrame
function animateNumber(el, target, duration = 1800, decimals = 0, suffix = '') {
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = fmt(target * eased, decimals) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initCounters() {
  $$('.stat-number').forEach((el) => {
    animateNumber(el, Number(el.dataset.target), 2000, 0, el.dataset.suffix || '');
  });
}

/* ---------------------------------------------------
   5. CALCULATION LOGIC  (IMPORTANT FOR VIVA)
   ---------------------------------------------------
   All results are in kg CO2 PER YEAR.

   Electricity = kWh per month x 0.82 x 12
   LPG         = cylinders per month x 35.4 x 12
   Fuel        = litres per month x (2.31 petrol | 2.68 diesel) x 12
   Bus/Train   = km per month x 0.04 x 12
   Flights     = flights per year x 250
   Transport   = Fuel + Bus/Train + Flights
   Water       = litres per month x 0.001 x 12
   Diet        = fixed: Vegetarian 1500 | Non-Veg 2500 | Vegan 1000
   Waste       = kg per week x 0.5 x 52

   Total yearly  = sum of all categories
   Total monthly = Total yearly / 12
   --------------------------------------------------- */
function calculateFootprint(v) {
  const fuelFactor = v.fuelType === 'diesel' ? FACTORS.diesel : FACTORS.petrol;

  const electricity = v.electricity * FACTORS.electricity * 12;
  const lpg = v.lpg * FACTORS.lpg * 12;
  const fuel = v.fuel * fuelFactor * 12;
  const transit = v.transit * FACTORS.transit * 12;
  const flights = v.flights * FACTORS.flight;
  const transport = fuel + transit + flights;
  const water = v.water * FACTORS.water * 12;
  const diet = FACTORS.diet[v.diet] || 0;
  const waste = v.waste * FACTORS.waste * 52;

  const categories = { electricity, transport, lpg, diet, waste, water };
  const yearly = electricity + transport + lpg + diet + waste + water;

  return { categories, yearly, monthly: yearly / 12 };
}

// Rating compared with Indian average (2000 kg/year)
//   Low    : at or below the average (<= 2000 kg)
//   Medium : up to double the average (2000 - 4000 kg)
//   High   : more than double the average (> 4000 kg)
function getRating(yearly) {
  if (yearly <= INDIAN_AVG) return { label: 'Low', cls: 'low' };
  if (yearly <= INDIAN_AVG * 2) return { label: 'Medium', cls: 'medium' };
  return { label: 'High', cls: 'high' };
}

/* ---------------------------------------------------
   6. FORM VALIDATION
   --------------------------------------------------- */
// Show / clear error message below a field
function setError(input, message) {
  const errorEl = document.getElementById(input.id + '-error');
  if (errorEl) errorEl.textContent = message;
  input.classList.toggle('invalid', Boolean(message));
  input.classList.toggle('valid', !message && input.value.trim() !== '');
}

// Validation rules for the calculator form
const CALC_RULES = [
  { id: 'name', type: 'name', label: 'Name' },
  { id: 'electricity', type: 'number', allowZero: false, label: 'Electricity usage' },
  { id: 'lpg', type: 'number', allowZero: true, label: 'LPG cylinders' },
  { id: 'water', type: 'number', allowZero: false, label: 'Water usage' },
  { id: 'fuel', type: 'number', allowZero: true, label: 'Fuel quantity' },
  { id: 'transit', type: 'number', allowZero: true, label: 'Bus/Train distance' },
  { id: 'flights', type: 'number', allowZero: true, integer: true, label: 'Flights' },
  { id: 'diet', type: 'select', label: 'Diet type' },
  { id: 'waste', type: 'number', allowZero: false, label: 'Waste' }
];

// Validate one field. Returns true if valid.
function validateField(rule) {
  const input = document.getElementById(rule.id);
  const value = input.value.trim();

  if (rule.type === 'select') {
    if (value === '') { setError(input, 'Please select your ' + rule.label.toLowerCase() + '.'); return false; }
    setError(input, ''); return true;
  }

  if (rule.type === 'name') {
    if (value === '') { setError(input, 'Name is required.'); return false; }
    if (value.length < 2) { setError(input, 'Name must be at least 2 characters.'); return false; }
    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(value)) { setError(input, 'Name can contain only letters and spaces.'); return false; }
    setError(input, ''); return true;
  }

  // number
  if (value === '') { setError(input, rule.label + ' is required.'); return false; }
  const num = Number(value);
  if (Number.isNaN(num)) { setError(input, 'Please enter a valid number.'); return false; }
  if (rule.allowZero ? num < 0 : num <= 0) {
    setError(input, rule.allowZero ? 'Value cannot be negative.' : rule.label + ' must be greater than 0.');
    return false;
  }
  if (rule.integer && !Number.isInteger(num)) { setError(input, 'Please enter a whole number.'); return false; }
  if (num > 1000000) { setError(input, 'Value is too large.'); return false; }
  setError(input, ''); return true;
}

/* ---------------------------------------------------
   7. CALCULATOR FORM (live calculation + submit)
   --------------------------------------------------- */
// Read raw values from the form (empty -> 0 for live preview)
function readFormValues() {
  const num = (id) => parseFloat(document.getElementById(id).value) || 0;
  return {
    name: $('#name').value.trim(),
    electricity: num('electricity'),
    lpg: num('lpg'),
    water: num('water'),
    fuelType: $('#fuelType').value,
    fuel: num('fuel'),
    transit: num('transit'),
    flights: num('flights'),
    diet: $('#diet').value,
    waste: num('waste')
  };
}

function initCalculator() {
  const form = $('#calcForm');

  // blur / input / change events: validate fields while typing
  CALC_RULES.forEach((rule) => {
    const input = document.getElementById(rule.id);
    input.addEventListener('blur', () => validateField(rule));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) validateField(rule);
    });
    input.addEventListener('change', () => validateField(rule));
  });

  // LIVE CALCULATION: update estimate on every change in the form
  const updateLive = () => {
    const result = calculateFootprint(readFormValues());
    $('#liveValue').textContent = fmt(result.yearly, 1) + ' kg CO₂ / year';
  };
  form.addEventListener('input', updateLive);
  form.addEventListener('change', updateLive);

  // Reset: clear errors and live estimate
  form.addEventListener('reset', () => {
    setTimeout(() => {
      CALC_RULES.forEach((r) => setError(document.getElementById(r.id), ''));
      $$('#calcForm .valid').forEach((el) => el.classList.remove('valid'));
      updateLive();
    }, 0);
  });

  // submit event
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // stop page reload

    // validate all fields (map first so every error message is shown)
    const results = CALC_RULES.map(validateField);
    if (results.includes(false)) {
      showToast('Please fix the errors in the form.', 'error');
      const firstBad = $('#calcForm .invalid');
      if (firstBad) firstBad.focus();
      return;
    }

    const values = readFormValues();
    const calc = calculateFootprint(values);
    const rating = getRating(calc.yearly);

    // Build a history entry
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      name: values.name,
      yearly: calc.yearly,
      monthly: calc.monthly,
      categories: calc.categories,
      rating: rating.label,
      ratingCls: rating.cls
    };

    const history = loadData(KEY_HISTORY, []);
    history.unshift(entry);          // newest first
    saveData(KEY_HISTORY, history);

    renderResults(entry);
    renderHistory();
    updateGoalProgress();
    showToast('✅ Calculation successful! Result saved to history.');

    // reveal and scroll to results
    $('#results').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ---------------------------------------------------
   8. RESULT DASHBOARD (DOM manipulation) + CANVAS CHART
   --------------------------------------------------- */
let lastChartData = null; // remembered so chart can be redrawn on resize

function renderResults(entry) {
  const section = $('#results');
  section.classList.remove('hidden'); // show hidden section

  $('#resultGreeting').textContent = `Hello ${entry.name}, here is your carbon footprint summary.`;

  // Animated totals
  animateNumber($('#totalKg'), entry.yearly, 1200, 1);
  animateNumber($('#totalTons'), entry.yearly / 1000, 1200, 2);
  animateNumber($('#monthlyKg'), entry.monthly, 1200, 1);

  // Rating badge + comparison text
  const badge = $('#ratingBadge');
  badge.textContent = entry.rating;
  badge.className = 'badge ' + entry.ratingCls;
  const diff = ((entry.yearly - INDIAN_AVG) / INDIAN_AVG) * 100;
  $('#ratingText').textContent = diff > 0
    ? `${fmt(diff, 0)}% above the Indian average (2 tons/year)`
    : `${fmt(Math.abs(diff), 0)}% below the Indian average (2 tons/year). Great job!`;

  // Sort categories (highest first) to find top emitters
  const sorted = CATEGORIES
    .map((c) => ({ ...c, value: entry.categories[c.key] }))
    .sort((a, b) => b.value - a.value);
  const top = sorted[0];

  // ---- Category breakdown with animated progress bars ----
  const wrap = $('#breakdown');
  wrap.innerHTML = ''; // clear old rows
  CATEGORIES.forEach((cat) => {
    const value = entry.categories[cat.key];
    const percent = entry.yearly > 0 ? (value / entry.yearly) * 100 : 0;

    const row = document.createElement('div');
    row.className = 'break-row' + (cat.key === top.key ? ' top' : '');

    const topLine = document.createElement('div');
    topLine.className = 'break-top';
    const label = document.createElement('span');
    label.textContent = `${cat.icon} ${cat.label}`;
    const val = document.createElement('span');
    val.textContent = `${fmt(value, 1)} kg (${fmt(percent, 0)}%)`;
    topLine.append(label, val);

    const track = document.createElement('div');
    track.className = 'progress-track';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.background = cat.color;
    fill.style.width = '0%';
    track.appendChild(fill);

    row.append(topLine, track);
    wrap.appendChild(row);

    // small delay so CSS transition animates from 0% to the value
    setTimeout(() => { fill.style.width = percent + '%'; }, 80);
  });

  // ---- Personalised tips based on highest category ----
  $('#topCategory').textContent = `(Your highest source: ${top.label})`;
  const list = $('#personalTips');
  list.innerHTML = '';
  const tipsToShow = [
    ...PERSONAL_TIPS[top.key].slice(0, 3),
    ...PERSONAL_TIPS[sorted[1].key].slice(0, 1)
  ];
  tipsToShow.forEach((t, i) => {
    const li = document.createElement('li');
    li.textContent = `${i < 3 ? top.icon : sorted[1].icon} ${t}`;
    list.appendChild(li);
  });

  // ---- Chart ----
  lastChartData = CATEGORIES.map((c) => ({ ...c, value: entry.categories[c.key] }));
  animateChart();
}

// Animate the bars from 0 to full height
function animateChart() {
  const start = performance.now();
  const duration = 900;
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    drawChart(1 - Math.pow(1 - p, 3));
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Draws the bar chart using the Canvas 2D API (no chart library)
function drawChart(progress = 1) {
  if (!lastChartData) return;
  const canvas = $('#emissionChart');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w === 0 || h === 0) return;

  // scale canvas for sharp rendering on retina screens
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const small = w < 480;
  const pad = { top: 28, right: 12, bottom: 38, left: small ? 44 : 56 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const maxVal = Math.max(...lastChartData.map((d) => d.value), 1);
  // round the max up to a "nice" number for grid lines
  const niceMax = Math.ceil(maxVal / 500) * 500 || 500;

  ctx.font = (small ? 10 : 12) + 'px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#66756d';
  ctx.strokeStyle = '#e0e9e3';
  ctx.lineWidth = 1;

  // horizontal grid lines + y-axis labels
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const y = pad.top + chartH - (chartH * i) / steps;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillText(fmt((niceMax * i) / steps, 0), pad.left - 6, y + 4);
  }

  // bars
  const slot = chartW / lastChartData.length;
  const barW = Math.min(slot * 0.6, 60);
  ctx.textAlign = 'center';
  lastChartData.forEach((d, i) => {
    const x = pad.left + slot * i + (slot - barW) / 2;
    const barH = (d.value / niceMax) * chartH * progress;
    const y = pad.top + chartH - barH;

    ctx.fillStyle = d.color;
    ctx.beginPath();
    // rounded top corners (fallback if roundRect is unsupported)
    if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
    else ctx.rect(x, y, barW, barH);
    ctx.fill();

    // value label above the bar
    ctx.fillStyle = '#1f2d27';
    ctx.fillText(fmt(d.value * progress, 0), x + barW / 2, y - 6);

    // category label below the axis
    ctx.fillStyle = '#66756d';
    ctx.fillText(small ? d.short : d.label, x + barW / 2, h - 14);
  });
}

// Redraw chart when the window is resized (responsive canvas)
window.addEventListener('resize', () => drawChart(1));

/* ---------------------------------------------------
   9. HISTORY (localStorage)
   --------------------------------------------------- */
function renderHistory() {
  const history = loadData(KEY_HISTORY, []);
  const body = $('#historyBody');
  body.innerHTML = '';

  $('#historyCount').textContent = `${history.length} record${history.length === 1 ? '' : 's'}`;
  $('#historyEmpty').classList.toggle('hidden', history.length > 0);
  $('#clearHistory').disabled = history.length === 0;

  history.forEach((item, index) => {
    const tr = document.createElement('tr');

    const cells = [
      index + 1,
      item.date,
      item.name,
      `${fmt(item.yearly, 1)} kg (${fmt(item.yearly / 1000, 2)} t)`
    ];
    cells.forEach((text) => {
      const td = document.createElement('td');
      td.textContent = text; // textContent prevents HTML injection
      tr.appendChild(td);
    });

    // rating cell
    const ratingTd = document.createElement('td');
    const tag = document.createElement('span');
    tag.className = 'tag ' + item.ratingCls;
    tag.textContent = item.rating;
    ratingTd.appendChild(tag);
    tr.appendChild(ratingTd);

    // delete button cell
    const actionTd = document.createElement('td');
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-danger';
    del.textContent = '🗑 Delete';
    del.dataset.id = item.id;
    actionTd.appendChild(del);
    tr.appendChild(actionTd);

    body.appendChild(tr);
  });
}

function initHistory() {
  // Event delegation: one listener handles all delete buttons
  $('#historyBody').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const history = loadData(KEY_HISTORY, []).filter((h) => h.id !== id);
    saveData(KEY_HISTORY, history);
    renderHistory();
    updateGoalProgress();
    showToast('Entry deleted.');
  });

  $('#clearHistory').addEventListener('click', () => {
    if (!confirm('Delete ALL history records?')) return;
    localStorage.removeItem(KEY_HISTORY);
    renderHistory();
    updateGoalProgress();
    showToast('All history cleared.');
  });

  renderHistory(); // load saved history on page load
}

/* ---------------------------------------------------
   10. GOAL TRACKER
   --------------------------------------------------- */
function updateGoalProgress() {
  const goal = loadData(KEY_GOAL, null);
  const history = loadData(KEY_HISTORY, []);
  const current = history.length ? history[0].monthly : null; // latest calculation

  $('#goalValue').textContent = goal ? `${fmt(goal, 1)} kg / month` : 'Not set';
  $('#goalCurrent').textContent = current !== null ? `${fmt(current, 1)} kg / month` : 'No data';

  const bar = $('#goalBar');
  const msg = $('#goalMessage');

  if (!goal || current === null) {
    bar.style.width = '0%';
    bar.classList.remove('over');
    msg.textContent = !goal
      ? 'Set a goal and calculate your footprint to see progress.'
      : 'Goal saved! Now calculate your footprint to compare.';
    return;
  }

  // progress = current / goal  (100% means goal reached exactly)
  const percent = (current / goal) * 100;
  bar.style.width = Math.min(percent, 100) + '%';
  bar.classList.toggle('over', percent > 100);

  if (percent <= 100) {
    msg.textContent = `🎉 You are within your goal! Using ${fmt(percent, 0)}% of your monthly target. ${fmt(goal - current, 1)} kg to spare.`;
  } else {
    msg.textContent = `⚠️ You are ${fmt(percent - 100, 0)}% over your goal. Reduce about ${fmt(current - goal, 1)} kg CO₂ per month.`;
  }
}

function initGoal() {
  const form = $('#goalForm');
  const input = $('#goalInput');
  const saved = loadData(KEY_GOAL, null);
  if (saved) input.value = saved;

  input.addEventListener('input', () => { if (input.classList.contains('invalid')) validateGoal(); });

  function validateGoal() {
    const value = input.value.trim();
    if (value === '') { setError(input, 'Please enter your monthly goal.'); return false; }
    const num = Number(value);
    if (Number.isNaN(num) || num <= 0) { setError(input, 'Goal must be a number greater than 0.'); return false; }
    if (num > 100000) { setError(input, 'Goal is too large.'); return false; }
    setError(input, ''); return true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateGoal()) { showToast('Please enter a valid goal.', 'error'); return; }
    saveData(KEY_GOAL, Number(input.value));
    updateGoalProgress();
    showToast('🎯 Goal saved successfully!');
  });

  updateGoalProgress();
}

/* ---------------------------------------------------
   11. ECO TIPS (filter + search + modal)
   --------------------------------------------------- */
let activeFilter = 'all';

function renderTips() {
  const grid = $('#tipsGrid');
  const query = $('#tipSearch').value.trim().toLowerCase();
  grid.innerHTML = '';
  let count = 0;

  TIPS.forEach((tip) => {
    const matchesCat = activeFilter === 'all' || tip.cat === activeFilter;
    const matchesText = tip.title.toLowerCase().includes(query) || tip.short.toLowerCase().includes(query);
    if (!matchesCat || !matchesText) return; // hide tip
    count++;

    const card = document.createElement('article');
    card.className = 'card tip-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');

    const icon = document.createElement('div');
    icon.className = 'tip-icon';
    icon.textContent = tip.icon;
    const title = document.createElement('h3');
    title.textContent = tip.title;
    const short = document.createElement('p');
    short.textContent = tip.short;
    const more = document.createElement('span');
    more.className = 'tip-more';
    more.textContent = 'Read more →';
    card.append(icon, title, short, more);

    card.addEventListener('click', () => openModal(tip));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(tip); }
    });
    grid.appendChild(card);
  });

  $('#tipsEmpty').classList.toggle('hidden', count > 0);
}

function openModal(tip) {
  $('#modalIcon').textContent = tip.icon;
  $('#modalTitle').textContent = tip.title;
  $('#modalCat').textContent = tip.cat.charAt(0).toUpperCase() + tip.cat.slice(1);
  $('#modalText').textContent = tip.text;
  const list = $('#modalList');
  list.innerHTML = '';
  tip.steps.forEach((s) => {
    const li = document.createElement('li');
    li.textContent = s;
    list.appendChild(li);
  });
  $('#modalImpact').textContent = '🌍 ' + tip.impact;
  $('#modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // stop background scroll
  $('#modalClose').focus();
}

function closeModal() {
  $('#modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function initTips() {
  // filter buttons (click)
  $$('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderTips();
    });
  });

  // live search (input event)
  $('#tipSearch').addEventListener('input', renderTips);

  // modal close: X button, overlay click, Escape key
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  renderTips();
}

/* ---------------------------------------------------
   12. DAILY HABIT CHECKLIST
   --------------------------------------------------- */
// Stored as { date: 'Mon Jan 01 2026', checked: ['h1','h3'] } so it resets every new day
function loadHabits() {
  const data = loadData(KEY_HABITS, null);
  const today = new Date().toDateString();
  if (!data || data.date !== today) return { date: today, checked: [] };
  return data;
}

function updateHabitUI() {
  const data = loadHabits();
  const done = data.checked.length;
  $('#habitCount').textContent = `${done}/${HABITS.length} habits done`;
  $('#habitBar').style.width = (done / HABITS.length) * 100 + '%';

  // reward message depends on number of habits completed
  let msg;
  if (done === 0) msg = 'Start ticking to earn rewards! 🌱';
  else if (done <= 3) msg = '👍 Good start! Every small action counts.';
  else if (done <= 5) msg = '🌿 Great going! You are making a real difference.';
  else if (done <= 7) msg = '🌟 Awesome! Almost an Eco Hero!';
  else msg = '🏆 Eco Hero! All habits done today. Planet says thank you!';
  $('#habitReward').textContent = msg;

  $$('.habit-item').forEach((label) => {
    const cb = label.querySelector('input');
    label.classList.toggle('done', cb.checked);
  });
}

function initHabits() {
  const list = $('#habitList');
  const data = loadHabits();

  HABITS.forEach((h) => {
    const label = document.createElement('label');
    label.className = 'habit-item';
    label.htmlFor = h.id;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = h.id;
    cb.checked = data.checked.includes(h.id);
    const span = document.createElement('span');
    span.textContent = h.text;
    label.append(cb, span);
    list.appendChild(label);

    // checkbox change event: save state to localStorage
    cb.addEventListener('change', () => {
      const current = loadHabits();
      current.checked = current.checked.filter((id) => id !== h.id);
      if (cb.checked) current.checked.push(h.id);
      saveData(KEY_HABITS, current);
      updateHabitUI();
      if (cb.checked && current.checked.length === HABITS.length) {
        showToast('🏆 Amazing! You completed all 8 habits today!');
      }
    });
  });

  $('#habitReset').addEventListener('click', () => {
    saveData(KEY_HABITS, { date: new Date().toDateString(), checked: [] });
    $$('#habitList input').forEach((cb) => { cb.checked = false; });
    updateHabitUI();
    showToast('Checklist reset for today.');
  });

  updateHabitUI();
}

/* ---------------------------------------------------
   13. CONTACT FORM
   --------------------------------------------------- */
function initContact() {
  const form = $('#contactForm');
  const nameEl = $('#cName');
  const emailEl = $('#cEmail');
  const msgEl = $('#cMessage');

  const checks = {
    cName: () => {
      const v = nameEl.value.trim();
      if (!v) return setError(nameEl, 'Name is required.'), false;
      if (v.length < 2) return setError(nameEl, 'Name must be at least 2 characters.'), false;
      return setError(nameEl, ''), true;
    },
    cEmail: () => {
      const v = emailEl.value.trim();
      // simple regex: something@something.something
      if (!v) return setError(emailEl, 'Email is required.'), false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setError(emailEl, 'Enter a valid email address.'), false;
      return setError(emailEl, ''), true;
    },
    cMessage: () => {
      const v = msgEl.value.trim();
      if (!v) return setError(msgEl, 'Message is required.'), false;
      if (v.length < 10) return setError(msgEl, 'Message must be at least 10 characters.'), false;
      return setError(msgEl, ''), true;
    }
  };

  [nameEl, emailEl, msgEl].forEach((el) => {
    el.addEventListener('blur', checks[el.id]);
    el.addEventListener('input', () => { if (el.classList.contains('invalid')) checks[el.id](); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = [checks.cName(), checks.cEmail(), checks.cMessage()];
    if (ok.includes(false)) { showToast('Please correct the highlighted fields.', 'error'); return; }
    showToast(`📩 Thank you ${nameEl.value.trim()}! Your feedback has been sent.`);
    form.reset();
    [nameEl, emailEl, msgEl].forEach((el) => el.classList.remove('valid', 'invalid'));
  });
}

/* ---------------------------------------------------
   14. INIT - runs when the page has loaded
   --------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initCalculator();
  initHistory();
  initGoal();
  initTips();
  initHabits();
  initContact();
});
