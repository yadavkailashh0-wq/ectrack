# 🌿 EcoTrack – Sustainable Living Tracker

**Course:** CSE326 – Internet Programming (CA1)
**Tech stack:** HTML5 · CSS3 · Vanilla JavaScript (ES6) — no frameworks, no libraries, no backend.

EcoTrack lets a user enter their monthly habits (electricity, LPG, water, fuel, public transport, flights, diet, waste), calculates their yearly CO₂ footprint, compares it with the Indian average (2 tons/person/year) and suggests personalised eco tips.

## 📁 File Structure

```
/
├── index.html   → page structure (semantic HTML5)
├── style.css    → all styling (CSS variables, Flexbox, Grid, media queries)
├── script.js    → all logic (calculation, validation, DOM, localStorage, canvas chart)
└── README.md    → this file
```

## ✨ Features

- Responsive navbar with mobile hamburger menu, scroll-spy and back-to-top button
- Hero section with animated stat counters
- Carbon footprint calculator with full validation, live estimate and toast messages
- Result dashboard: yearly/monthly CO₂, category breakdown with animated bars, Low/Medium/High rating, **Canvas API bar chart**, personalised tips
- My History table saved in **localStorage** (delete one / clear all, survives reload)
- Monthly goal tracker with progress bar
- 8 eco tip cards with category filters, search and modal details
- Daily habit checklist (saved in localStorage, resets every new day)
- Contact / feedback form with validation
- Fully responsive: Mobile (<768px), Tablet (768–1024px), Desktop (>1024px)

## 🧮 Calculation Logic (emission factors)

| Category    | Formula (kg CO₂ per year) |
|-------------|---------------------------|
| Electricity | kWh/month × 0.82 × 12 |
| LPG         | cylinders/month × 35.4 × 12 |
| Fuel        | litres/month × (2.31 petrol or 2.68 diesel) × 12 |
| Bus/Train   | km/month × 0.04 × 12 |
| Flights     | flights/year × 250 |
| Water       | litres/month × 0.001 × 12 |
| Diet        | Vegetarian 1500 · Non-Veg 2500 · Vegan 1000 |
| Waste       | kg/week × 0.5 × 52 |

*Transport = Fuel + Bus/Train + Flights. Monthly total = yearly total ÷ 12.*

**Rating:** Low ≤ 2000 kg · Medium 2000–4000 kg · High > 4000 kg (per year).

## ▶️ Run Locally

1. Download or clone the project.
2. Double-click `index.html` (or open it in any modern browser).
3. No installation or server needed.

## 🚀 Deploy on GitHub Pages

1. Create a GitHub account at <https://github.com> (if you don't have one).
2. Click **New repository**, name it e.g. `sustainable-living-tracker`, keep it **Public**, and click **Create repository**.
3. Upload the four files (`index.html`, `style.css`, `script.js`, `README.md`) using **Add file → Upload files**, then click **Commit changes**.
   *Make sure `index.html` is in the root of the repository (not inside a sub-folder).*

   Or using Git commands:
   ```bash
   git init
   git add .
   git commit -m "EcoTrack CA1 project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/sustainable-living-tracker.git
   git push -u origin main
   ```
4. Open the repository **Settings → Pages**.
5. Under **Build and deployment → Source**, choose **Deploy from a branch**.
6. Select branch **main** and folder **/ (root)**, then click **Save**.
7. Wait 1–2 minutes. Your site will be live at:
   `https://<your-username>.github.io/sustainable-living-tracker/`
8. Paste this link in your submission.

## 👨‍🎓 Team

| Student | Name | Reg. No. |
|---------|------|----------|
| 1 | _Your name here_ | _Reg. No._ |
| 2 | _Your name here_ | _Reg. No._ |
| 3 | _Your name here_ | _Reg. No._ |

---
&copy; 2026 EcoTrack – CSE326
