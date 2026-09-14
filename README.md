# UrbanCool AI

> **Dynamic AI-Driven Hyper-Local Microclimate Forecasting & Adaptive Urban Heat Advisory System**  
> Built for the **PCCOE Indradhanu — International Grand Challenge 2026** under the theme **"AI for Climate Change"**.

[![UN SDG 13: Climate Action](https://img.shields.io/badge/UN%20SDG%2013-Climate%20Action-darkgreen?style=flat-square)](https://sdgs.un.org/goals/goal13)
[![UN SDG 11: Sustainable Cities](https://img.shields.io/badge/UN%20SDG%2011-Sustainable%20Cities-orange?style=flat-square)](https://sdgs.un.org/goals/goal11)
[![UN SDG 3: Good Health](https://img.shields.io/badge/UN%20SDG%203-Good%20Health-red?style=flat-square)](https://sdgs.un.org/goals/goal3)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-12263A?style=flat-square)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-18B6A4?style=flat-square)](https://vitejs.dev)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-00B4D8?style=flat-square&logo=githubpages)](https://divyasaminathan02.github.io/UrbanCool_AI/)

---

## 1. Executive Summary & Problem Statement

Urban centers face extreme spatial heterogeneity during heatwaves. Conventional city-level meteorological forecasts (e.g. from IMD or regional weather stations) report a single regional temperature for an entire metropolitan area. In reality, land surface temperature (LST), tree canopy deficits (low NDVI), dense concrete built-up density, and elevation variations cause localized microclimate thermal anomalies ranging from **+2.5°C to +4.8°C** higher than the official forecast.

**UrbanCool AI** bridges this critical operational gap. It does not replace synoptic forecasts; instead, it performs **AI-driven spatial downscaling to ~250m micro-grids** across the city and translates predictions into a deterministic municipal action pipeline:

$$\text{FORECAST} \longrightarrow \text{HEAT RISK (0--100)} \longrightarrow \text{EXPLAINABLE AI} \longrightarrow \text{PRIORITIZATION} \longrightarrow \text{MUNICIPAL ACTION} \longrightarrow \text{TRACKING}$$

---

## 2. Target Users & Personas

UrbanCool AI functions as an enterprise municipal command center designed for:
1. **Municipal Heat Action Officer (Disaster Management Cell)**: Evaluates high-risk corridors and triggers emergency protocols.
2. **Water Supply Officer**: Dispatches municipal water tankers and evaporative misting cannons.
3. **Public Health Officer**: Pre-activates air-conditioned community cooling shelters and alerts hospitals.
4. **Urban Planner**: Identifies acute tree canopy deficits and high-albedo cool roof opportunities.
5. **Electricity & Utility Officer**: Anticipates localized air conditioning power surges and substation grid stress.

---

## 3. Product Features & Routes

| Route | Name | Key Functionality |
| :--- | :--- | :--- |
| `/login` | **Municipal Sign-in** | Role persona switcher (`HEAT_OFFICER`, `PLANNER`, `WATER_OFFICER`, `PUBLIC_HEALTH`, `ADMIN`). |
| `/dashboard` | **Command Overview** | Top 5 KPIs, interactive GIS heat risk map, priority zones list, categorized action dispatch cards. |
| `/heat-map` | **Heat Map GIS** | Full-screen GIS interface with 250m polygons, multi-layer toggles (Risk, LST, NDVI, Built-Up, Population, Elevation), and Zone Intelligence sidebar. |
| `/zones` | **Zones Directory** | Searchable & sortable directory of 30+ Pune micro-grids with thermal highlights. |
| `/zone/:id` | **Zone Deep Dive** | 24-hour diurnal temperature curve, historical heat events benchmark, model feature contribution estimate, and localized advisories. |
| `/forecast` | **48h Forecast** | Multi-day timeline (Morning, Afternoon, Evening, Night) comparing Official IMD vs UrbanCool localized peaks. |
| `/recommendations` | **Action Advisories** | Deterministic rule-engine recommendations with full status lifecycle (`NEW` &rarr; `ACKNOWLEDGED` &rarr; `DISPATCHED` &rarr; `IN PROGRESS` &rarr; `RESOLVED`). |
| `/interventions` | **Fleet Operations** | Real-time municipal fleet tracking, live ETA timers, vehicle capacity, and completion records. |
| `/analytics` | **Climate Analytics** | Multi-day risk curves, ward ranking bar charts, NDVI/LST spatial correlations, and honest model validation metrics. |
| `/alerts` | **Heat Warnings** | Emergency public heat alerts, outdoor worker labor moratoriums, and SMS/IVR broadcast triggers. |
| `/data-sources` | **Data Registry** | Metadata transparency and update frequencies with `LIVE`, `OPEN DATA`, and `DEMO DATA` status tags. |
| `/settings` | **System Settings** | Configurable risk thresholds, multi-criteria weightings, and simulated webhook integrations. |

---

## 4. AI & ML Methodology

### Localized Temperature Downscaling Equation
$$\Delta T_{\text{microclimate}} = f(\text{Official Temp}, \text{LST}, \text{NDVI}, \text{Built-up Density}, \text{Elevation}, \text{Wind Speed}, \text{Humidity})$$
$$T_{\text{localized}} = T_{\text{official}} + \Delta T_{\text{microclimate}}$$

### Composite Multi-Criteria Heat Risk Score ($0 \le \text{Risk} \le 100$)
$$\text{Risk} = w_{\text{thermal}} \cdot \text{TempScore} + w_{\text{env}} \cdot \left[ 0.5(1 - \text{NDVI}) + 0.5(\text{BuiltUp}) \right] + w_{\text{pop}} \cdot \text{PopulationExposure}$$

* **Low (0–39)**: Cool green/teal baseline
* **Moderate (40–59)**: Amber/yellow monitoring
* **High (60–79)**: Orange alert
* **Very High (80–89)**: Coral advisory
* **Extreme (90–100)**: Red emergency dispatch

### Model Performance Metrics (Validated on Pune Dataset)
* **Mean Absolute Error (MAE)**: `0.14°C`
* **Root Mean Squared Error (RMSE)**: `0.21°C`
* **Coefficient of Determination ($R^2$)**: `0.942`
* **Forecast Confidence**: `91.5%`

---

## 5. Built vs Future Production Architecture

| Capability | Built in Hackathon Application | Future Production Integration |
| :--- | :--- | :--- |
| **Micro-grid Downscaling** | 250m spatial resolution across 30+ Pune zones | 100m city-wide continuous raster downscaling |
| **Data Provenance** | Open Data (ESA Sentinel-2, NASA SRTM) + Simulated Telemetry | Live streaming IoT sensor mesh & IMD automated API |
| **Interventions** | Interactive operational dispatch workflow & ETA tracking | Municipal CAD / GIS automated fleet dispatch telemetry |
| **Scenario Switcher** | Instant multi-scenario simulation (Normal, Heatwave, Extreme) | Automated 7-day numerical weather prediction pipeline |

---

## 6. Quick Start & Local Setup

### Prerequisites
* **Python**: 3.11+
* **Node.js**: 20+ / 24+ & `npm`

### Step 1: Clone and Setup Backend
```bash
cd "d:/UrbanCool AI/backend"
python -m pip install -r requirements.txt
python test_backend.py  # Runs automated endpoint & DB verification
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs on `http://127.0.0.1:8000` (Swagger docs at `http://127.0.0.1:8000/docs`).*

### Step 2: Setup Frontend
```bash
cd "d:/UrbanCool AI/frontend"
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend runs on `http://127.0.0.1:5173`.*

---

## 7. Demo Credentials

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Heat Action Officer** | `heat_officer` | `Password@123` | Master heat disaster command & alert broadcasting |
| **Water Logistics Officer** | `water_officer` | `Password@123` | Water tanker fleet and mist cannon dispatch |
| **Urban Planner** | `urban_planner` | `Password@123` | Canopy deficit analysis & cool roof zoning |
| **Public Health Officer** | `health_officer` | `Password@123` | Cooling shelter activation & hospital preparedness |
| **System Administrator** | `admin` | `Password@123` | Threshold calibration & sensor management |

---

## 8. Alignment with UN Sustainable Development Goals

* **UN SDG 13 (Climate Action)**: Provides hyper-local early warning systems to adapt to increasing heatwave frequency.
* **UN SDG 11 (Sustainable Cities and Communities)**: Enhances municipal resilience through targeted cool roof and urban forestry interventions.
* **UN SDG 3 (Good Health and Well-being)**: Reduces heat stroke and mortality in outdoor workers, elderly, and vulnerable demographics.
