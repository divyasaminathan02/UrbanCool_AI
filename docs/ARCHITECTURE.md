# UrbanCool AI — Technical Architecture & System Design

```
+-----------------------------------------------------------------------------------+
|                              MUNICIPAL OPERATORS                                  |
|   Heat Action Officer | Urban Planner | Water Officer | Public Health | Admin     |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                        FRONTEND GIS COMMAND CENTER                                |
|        React 19 + TypeScript + Vite + TailwindCSS + Leaflet + Recharts            |
|  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  |
|  │ Command Dashboard│  │ GIS Heat Map 250m│  │ Action Workflow  │  │ Analytics │  |
|  └──────────────────┘  └──────────────────┘  └──────────────────┘  └───────────┘  |
+-----------------------------------------------------------------------------------+
                                         │  REST API (Axios / JSON)
                                         ▼
+-----------------------------------------------------------------------------------+
|                           FASTAPI APPLICATION LAYER                               |
|  ┌─────────────────────────────────────────────────────────────────────────────┐  |
|  │ Routers: /dashboard | /heatmap | /zones | /forecast | /recommendations      │  |
|  │          /interventions | /analytics | /alerts | /data-sources | /predict   │  |
|  └─────────────────────────────────────────────────────────────────────────────┘  |
+-----------------------------------------------------------------------------------+
       │                                     │                              │
       ▼                                     ▼                              ▼
+──────────────────+               +──────────────────+           +──────────────────+
|  ML DOWNSCALING  |               |  DETERMINISTIC   |           |  DATA & DATABASE |
|      ENGINE      |               |   RULE ENGINE    |           |      LAYER       |
|  • Gradient      |               |  • Water Tanker  |           |  • SQLAlchemy    |
|    Boosted Model |               |    Prioritization|           |  • SQLite / Post |
|  • Localized     |               |  • Cooling Center|           |    greSQL ready  |
|    Delta T Anom  |               |    Activation    |           |  • 30+ Pune 250m |
|  • Steadman Bio  |               |  • Citizen SMS   |           |    Micro-Grids   |
|    Heat Index    |               |    Directives    |           |  • Multi-Scenario|
+──────────────────+               +──────────────────+           +──────────────────+
```

---

## 1. Downscaling & Mathematical Formulation

### 1.1 Temperature Anomaly Regressor
The microclimate module estimates localized excess heat:
$$\Delta T = w_{\text{veg}}(1 - \text{NDVI}) + w_{\text{built}}\text{BuiltUp} + w_{\text{topo}}\frac{h_{\text{max}} - h}{h_{\text{range}}} + w_{\text{lst}}(\text{LST} - T_{\text{synoptic}}) - w_{\text{wind}}\frac{v}{v_{\text{max}}}$$

### 1.2 Bio-Thermal Heat Index
Calculates apparent thermal stress incorporating relative humidity:
$$\text{Heat Index} = T_{\text{loc}} + 0.5555 \left( \frac{\text{RH}}{100} \cdot 6.11 \cdot e^{5417.75 \left(\frac{1}{273.16} - \frac{1}{273.15 + T_{\text{loc}}}\right)} - 10.0 \right)$$

---

## 2. Deterministic Action Lifecycle

1. **Safety Guarantee**: Life-safety recommendations are evaluated deterministically by the rule engine rather than generative stochastic models.
2. **Lifecycle State Machine**:
   $$\text{NEW} \longrightarrow \text{ACKNOWLEDGED} \longrightarrow \text{DISPATCHED} \longrightarrow \text{IN PROGRESS} \longrightarrow \text{RESOLVED}$$
3. **Auditability**: Every dispatch logs operator role, timestamps, resources assigned, and affected citizen capacity.
