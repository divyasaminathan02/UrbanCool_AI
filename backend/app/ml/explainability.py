def compute_feature_contributions(
    ndvi: float,
    built_up_density: float,
    lst_celsius: float,
    official_temp: float,
    elevation_m: float,
    population: int
) -> dict:
    """
    Computes explainable AI contribution weights and generates concise municipal explanations.
    """
    # Normalized driver intensities (0 to 100)
    ndvi_weight = round(min(98.0, max(20.0, (1.0 - ndvi) * 100)), 1)
    built_up_weight = round(min(98.0, max(25.0, built_up_density * 95)), 1)
    
    lst_delta = max(0.0, lst_celsius - official_temp)
    lst_weight = round(min(98.0, max(30.0, (lst_delta / 8.0) * 85 + 20)), 1)
    
    # Lower elevation (520m) traps air more than hilltop (680m)
    elevation_weight = round(min(90.0, max(15.0, ((680.0 - elevation_m) / 160.0) * 75)), 1)
    
    pop_weight = round(min(95.0, max(20.0, (population / 25000.0) * 85)), 1)
    
    # Generate human-readable summary
    reasons = []
    if ndvi < 0.20:
        reasons.append("sparse vegetative canopy (<20% NDVI)")
    elif ndvi < 0.35:
        reasons.append("moderate canopy cover")
        
    if built_up_density > 0.70:
        reasons.append("high built-up thermal mass")
        
    if lst_delta > 3.0:
        reasons.append(f"intense surface heat retention (+{lst_delta:.1f}°C LST anomaly)")
        
    if elevation_m < 560:
        reasons.append("low-lying airflow stagnation basin")
        
    if population > 18000:
        reasons.append("dense daytime human exposure")

    if not reasons:
        summary = "Microclimate is well-buffered by balanced urban tree canopy and moderate structural density."
    else:
        summary = f"Risk is elevated because this micro-grid combines {', '.join(reasons)}. Localized thermal amplification exceeds the city baseline."
        
    return {
        "driver_ndvi_pct": ndvi_weight,
        "driver_built_up_pct": built_up_weight,
        "driver_lst_pct": lst_weight,
        "driver_elevation_pct": elevation_weight,
        "driver_population_pct": pop_weight,
        "explainable_summary": summary
    }
