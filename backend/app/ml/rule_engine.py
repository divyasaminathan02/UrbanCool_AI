from typing import List, Dict, Any

def generate_recommendations(
    zone_id: str,
    zone_name: str,
    risk_score: float,
    predicted_temp: float,
    ndvi: float,
    built_up_density: float,
    population: int,
    vulnerable_pop: int,
    scenario: str
) -> List[Dict[str, Any]]:
    """
    Deterministic rule engine that produces prioritized municipal advisories.
    Safety-critical calculations are strictly deterministic and never hallucinated.
    """
    recs = []
    
    # 1. Critical Water Tanker Deployment
    if risk_score >= 85 and (population >= 15000 or ndvi < 0.20):
        priority = "CRITICAL" if risk_score >= 90 else "HIGH"
        recs.append({
            "id": f"REC-WT-{zone_id}-{scenario}",
            "zone_id": zone_id,
            "scenario": scenario,
            "category": "Water",
            "priority": priority,
            "action_title": "Water Tanker & Mist Cannon Deployment",
            "description": f"Dispatch municipal water tankers and evaporative misting units to high-density hubs in {zone_name}. Predicted local peak of {predicted_temp}°C.",
            "expected_impact": f"Provides hydration and localized microclimate cooling for ~{min(population, 18000):,} exposed citizens.",
            "status": "DISPATCHED" if risk_score >= 92 else "NEW",
            "assigned_department": "Water Supply & Emergency Services",
            "deadline_text": "Dispatch before 11:30 AM"
        })
        
    # 2. Cooling Center Activation
    if risk_score >= 80 or (risk_score >= 70 and vulnerable_pop > 3000):
        priority = "CRITICAL" if risk_score >= 90 else "HIGH"
        recs.append({
            "id": f"REC-CC-{zone_id}-{scenario}",
            "zone_id": zone_id,
            "scenario": scenario,
            "category": "Cooling Centers",
            "priority": priority,
            "action_title": "Public Cooling Center & Transit Shelter Activation",
            "description": f"Designate community halls, transit hubs, and air-conditioned public libraries in {zone_name} as emergency cooling shelters with clean drinking water and ORS packets.",
            "expected_impact": f"Directly safeguards ~{vulnerable_pop:,} vulnerable residents (elderly, infants, transit riders).",
            "status": "IN PROGRESS" if risk_score >= 90 else "NEW",
            "assigned_department": "Public Health & Social Welfare",
            "deadline_text": "Operational by 10:00 AM"
        })
        
    # 3. Public Heat Alert & Worker Advisory
    if risk_score >= 75:
        priority = "CRITICAL" if risk_score >= 90 else "HIGH"
        recs.append({
            "id": f"REC-PA-{zone_id}-{scenario}",
            "zone_id": zone_id,
            "scenario": scenario,
            "category": "Public Alerts",
            "priority": priority,
            "action_title": "Hyper-Local SMS / IVR Heat Advisory & Worker Moratorium",
            "description": f"Issue targeted warning to construction contractors, street vendors, and delivery fleets in {zone_name} to pause strenuous outdoor labor between 12:00 PM and 4:00 PM.",
            "expected_impact": "Reduces acute heat exhaustion and emergency room admissions by an estimated 35-45%.",
            "status": "ACKNOWLEDGED",
            "assigned_department": "Disaster Management & Labor Cell",
            "deadline_text": "Broadcast immediately"
        })
        
    # 4. Tree Canopy & Cool Roof Planning (Medium/Long term)
    if risk_score >= 65 and ndvi <= 0.25:
        recs.append({
            "id": f"REC-TC-{zone_id}-{scenario}",
            "zone_id": zone_id,
            "scenario": scenario,
            "category": "Tree Canopy",
            "priority": "MEDIUM",
            "action_title": "Targeted Urban Canopy & High-Albedo Cool Roof Program",
            "description": f"Zone exhibits acute vegetative deficit (NDVI {ndvi:.2f}). Prioritize for fast-growing native avenue trees and white cool-roof coating on civic buildings.",
            "expected_impact": "Long-term surface temperature reduction of 1.5°C to 2.8°C.",
            "status": "NEW",
            "assigned_department": "Urban Planning & Garden Dept",
            "deadline_text": "Q3 Implementation"
        })

    # 5. Electricity Grid Peak Shifting Warning
    if risk_score >= 82 and built_up_density >= 0.65:
        recs.append({
            "id": f"REC-EG-{zone_id}-{scenario}",
            "zone_id": zone_id,
            "scenario": scenario,
            "category": "Electricity Demand",
            "priority": "HIGH" if risk_score >= 88 else "MEDIUM",
            "action_title": "Substation Load Pre-Cooling & Peak Demand Alert",
            "description": f"High air conditioning demand forecast for {zone_name}. Alert distribution grid operators to reinforce feeder lines and prevent local transformer trips.",
            "expected_impact": "Prevents grid failure during 14:00-17:00 peak cooling surge.",
            "status": "NEW",
            "assigned_department": "MSEDCL / Municipal Energy Cell",
            "deadline_text": "Notify Grid Dispatcher"
        })

    return recs
