# WebGL Black Hole Effect

A stunning WebGL-powered black hole visualization with interactive starfield background and gravitational distortion effects.

## Features

- 🌌 **Dynamic Starfield**: Procedurally generated stars with realistic size distribution and brightness
- 🕳️ **Black Hole Physics**: Realistic gravitational lensing and distortion effects
- 🎨 **Interactive Background**: Click to move the black hole to any position
- ⚡ **WebGL Performance**: Hardware-accelerated rendering for smooth 60fps animation
- 🎛️ **Configurable Settings**: Customizable star count, camera speed, and visual parameters
- 🖼️ **Background Images**: Support for custom background images with Unsplash integration

## Demo

Experience the black hole effect in action - click anywhere to move the black hole and watch the stars bend around it!

## Technology Stack

- **React 18** - Component-based UI
- **TypeScript** - Type-safe development
- **WebGL** - Hardware-accelerated graphics
- **GLSL Shaders** - Custom fragment shaders for black hole effects
- **Canvas 2D** - Starfield rendering
- **Vite** - Fast development and building

## Project Structure

```
src/
├── components/
│   └── Blackhole/
│       ├── index.tsx          # Main component
│       ├── Blackhole.tsx      # WebGL black hole component
│       └── Galaxy.tsx         # Starfield background component
├── hooks/
│   └── useBlackHole.ts        # WebGL logic and black hole physics
├── shaders/
│   └── blackholeShaders.ts    # GLSL vertex and fragment shaders
├── utils/
│   └── webglUtils.ts          # WebGL utility functions
└── App.tsx                    # Main application component
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/webgl-black-hole.git
cd webgl-black-hole
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Configuration

The black hole effect can be customized through the `galaxyConfig` object in `App.tsx`:

```typescript
const galaxyConfig = {
  numStars: 10000, // Number of stars to render
  cameraSpeed: 0.3, // Speed of camera movement
  starSizeRange: {
    small: { min: 0.3, max: 1.0, ratio: 0.8 }, // 80% small stars
    medium: { min: 1.0, max: 1.8, ratio: 0.15 }, // 15% medium stars
    large: { min: 1.8, max: 3.0, ratio: 0.05 }, // 5% large stars
  },
  brightnessRange: { min: 0.7, max: 1.0 }, // Star brightness range
};
```

## Key Components

### Galaxy Component

- Renders the starfield background using Canvas 2D
- Supports custom background images
- Configurable star distribution and properties
- Smooth camera movement animation

### BlackHole Component

- WebGL-powered gravitational distortion effects
- Interactive positioning (click to move)
- Real-time shader-based rendering
- Synchronized with background camera movement

### WebGL Shaders

- **Vertex Shader**: Renders a full-screen quad
- **Fragment Shader**: Implements gravitational lensing physics
- Real-time distortion calculations
- Smooth interpolation and anti-aliasing

## Physics Implementation

The black hole effect uses realistic gravitational physics:

- **Gravitational Pull**: `pull = mass / (distance² + epsilon)`
- **Lensing Effect**: UV coordinates are rotated around the black hole center
- **Time Dilation**: Background movement synchronized with camera speed
- **Event Horizon**: Central region with maximum distortion

## Performance Optimization

- **Efficient Rendering**: Single draw call per frame
- **GPU Acceleration**: All calculations performed in shaders
- **Memory Management**: Proper WebGL resource cleanup
- **Responsive Design**: Automatic canvas resizing

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires WebGL 1.0 support.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **Custom Shaders**: Modify `blackholeShaders.ts` for new visual effects
2. **Star Properties**: Extend the `Star` interface in `Galaxy.tsx`
3. **Physics Parameters**: Adjust gravitational constants in the fragment shader
4. **UI Controls**: Add interactive controls in `App.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by real gravitational lensing effects observed in space
- WebGL shader techniques based on astrophysical simulations
- Background images provided by Unsplash

## Future Enhancements

- [ ] Multiple black holes support
- [ ] Particle system for accretion disk
- [ ] VR/AR compatibility
- [ ] Real-time physics simulation
- [ ] Custom shader editor
- [ ] Export to video functionality

---

Made with ❤️ and WebGL
