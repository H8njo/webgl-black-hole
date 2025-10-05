import Blackhole from './components/Blackhole';

function App() {
  const galaxyConfig = {
    numStars: 13000,
    cameraSpeed: 0,
    starSizeRange: {
      small: { min: 0.5, max: 1.2, ratio: 0.7 },
      medium: { min: 1.0, max: 1.8, ratio: 0.2 },
      large: { min: 1.5, max: 2.5, ratio: 0.1 },
    },
    brightnessRange: { min: 0.8, max: 1.0 },
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1516331138075-f3adc1e149cd?q=80&w=2708&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  };
  return <Blackhole {...galaxyConfig} />;
}

export default App;
