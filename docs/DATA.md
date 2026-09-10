# UrbanCool AI — Spatial Dataset & Feature Specifications

## 1. Spatial Structure

* **Demonstration Metropolitan Area**: Pune Municipal Corporation (PMC) & Pimpri-Chinchwad Municipal Corporation (PCMC), Maharashtra, India.
* **Geographic Extent**: Latitude 18.43°N to 18.64°N, Longitude 73.71°E to 73.95°E.
* **Spatial Resolution**: ~250m &times; 250m grid bounding boxes ($0.00225^\circ \times 0.00225^\circ$).
* **Zonal Entities**: 30 high-fidelity micro-grids covering core commercial zones (Shivajinagar, Swargate, Mandai), dense residential areas (Kothrud, Hadapsar, Yerawada), IT tech corridors (Hinjawadi, Kharadi, Viman Nagar), industrial belts (Bhosari, Chinchwad), and green buffers (Pune University, Vetal Tekdi, Empress Garden).

---

## 2. Feature Schema

| Feature Name | Source / Sensor | Resolution | Range | Physical Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `official_temp` | IMD Pune / Open-Meteo | City AWS | 30.0–45.0 °C | Synoptic macro temperature baseline |
| `lst_celsius` | NASA MODIS / Landsat | 1km &rarr; 250m | 32.0–52.0 °C | Radiometric land surface temperature |
| `baseline_ndvi` | Sentinel-2 / Copernicus | 10m &rarr; 250m | 0.05–0.70 | Normalized Difference Vegetation Index |
| `built_up_density`| Urban Land Use GIS | 250m grid | 0.05–0.98 | Proportion of impervious concrete/asbestos cover |
| `elevation_m` | NASA SRTM DEM | 30m grid | 520–680 m | Topographic elevation above sea level |
| `population` | Pune Census / WorldPop | 100m grid | 1,200–29,800 | Gridded daytime population density per cell |
| `vulnerable_pop` | Census Demographics | 100m grid | 150–7,600 | Elderly, pediatric, and outdoor labor count |

---

## 3. Scenarios Baseline

1. **Normal Day**:
   * Official City Base: `34.2°C`
   * Mean Localized Peak: `36.2°C`
   * High-Risk Zones Count: `8`
2. **Heatwave Event**:
   * Official City Base: `38.6°C`
   * Mean Localized Peak: `42.4°C` (+3.8°C thermal anomaly in commercial cores)
   * High-Risk Zones Count: `23`
3. **Extreme Heat Emergency**:
   * Official City Base: `41.2°C`
   * Mean Localized Peak: `45.8°C` (+4.6°C thermal anomaly in asbestos industrial zones)
   * High-Risk Zones Count: `29`
