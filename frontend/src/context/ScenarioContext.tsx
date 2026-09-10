import React, { createContext, useContext, useState } from 'react';
import { ScenarioType } from '../types';

interface ScenarioContextType {
  scenario: ScenarioType;
  setScenario: (sc: ScenarioType) => void;
  scenarioTitle: string;
  scenarioDescription: string;
  isSimulatedMode: boolean;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenario, setScenario] = useState<ScenarioType>('normal');

  const metadata: Record<ScenarioType, { title: string; desc: string }> = {
    normal: {
      title: 'Normal Day Baseline',
      desc: 'City synoptic forecast ~34.2°C. Localized hotspots remain within manageable thresholds.',
    },
    heatwave: {
      title: 'Severe Heatwave Event',
      desc: 'City synoptic forecast 38.6°C. High thermal accumulation in dense wards with peaks reaching 42.4°C.',
    },
    extreme: {
      title: 'Extreme Heat Emergency (Indradhanu Simulation)',
      desc: 'Critical heat anomaly. City forecast 41.2°C, localized microclimates reaching 45.8°C with widespread multi-department activations.',
    },
  };

  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        setScenario,
        scenarioTitle: metadata[scenario].title,
        scenarioDescription: metadata[scenario].desc,
        isSimulatedMode: true,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = () => {
  const context = useContext(ScenarioContext);
  if (!context) throw new Error('useScenario must be used within ScenarioProvider');
  return context;
};
