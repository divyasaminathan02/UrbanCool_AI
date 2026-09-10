# UrbanCool AI — Hackathon Judging Demo Script

Follow this step-by-step walkthrough during live presentation to showcase the complete end-to-end workflow:

### Step 1: Login with Municipal Persona
* Open `/login`
* Select **Heat Action Officer** (`heat_officer` / `Password@123`)
* Click **Access Command Center** &rarr; Lands on `/dashboard`

### Step 2: Executive Command Center Overview
* Point out the **Top 5 KPI Cards**:
  * City Heat Risk (e.g. 63.5/100)
  * High-Risk Zones Count
  * Population Exposed
  * Active Operations (awaiting dispatch vs in-progress)
  * Forecast Confidence (`91.5%`)
* Highlight the interactive **250m Resolution Heat Risk Map** on the left.

### Step 3: Heat Map GIS & Explainable AI
* Navigate to `/heat-map`
* Switch layers:
  * Click **LST (°C)** &rarr; reveals surface thermal emissivity hotspots
  * Click **NDVI Canopy** &rarr; exposes acute green cover deficits in dense market wards
* Click on an **Extreme / Very High Risk Polygon** (e.g. `PMC-W17-G042` Shivajinagar or `PMC-W21-G088` Hadapsar)
* Inspect the **Zone Intelligence Panel**:
  * Localized Anomaly: `+3.4°C` above official city forecast
  * Explainable AI drivers: Low vegetation (82%), Built-up density (71%), Surface LST (84%)
  * "Why this zone is at risk" explainable narrative

### Step 4: Deterministic Action Dispatch Workflow
* In the Zone Intelligence Panel, click **Dispatch Water Tanker**
* Automatically navigates to `/interventions` with the new fleet logged
* Change status: `DISPATCHED` &rarr; `IN PROGRESS` (ETA updates to Active On Site) &rarr; `RESOLVED`

### Step 5: Public Heat Alert Broadcasting
* Navigate to `/alerts`
* Select an Extreme Heat Alert (e.g. Shivajinagar Central)
* Click **Broadcast Alert to Public** &rarr; Triggers live citizen SMS/IVR moratorium simulation

### Step 6: 48-Hour Forecast & Core Product Story
* Navigate to `/forecast`
* Show the **48-Hour Timeline** across Morning, Afternoon, Evening, Night
* Highlight the **City vs Localized Comparison Table** proving why standard city-average forecasts fail dense urban corridors

### Step 7: Model Analytics & Provenance Transparency
* Navigate to `/analytics`: Show empirical validation metrics (MAE `0.14°C`, RMSE `0.21°C`, R² `0.942`) and Ward Heat Rankings
* Navigate to `/data-sources`: Show transparent open data labeling (NASA MODIS, ESA Sentinel-2, SRTM DEM, IMD AWS)

### Step 8: Multi-Scenario Climate Simulation
* In the top bar, click **Scenario: Normal Day** &rarr; switch to **Severe Heatwave Event** or **Extreme Heat**
* Show the entire dashboard, heat risk polygons, KPIs, and advisories updating reactively in real time!
