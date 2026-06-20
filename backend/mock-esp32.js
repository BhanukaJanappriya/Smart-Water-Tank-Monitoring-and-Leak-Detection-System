import http from 'http';

const PORT = 8080;

// Tank Simulation State
let currentDistanceCm = 30.0; // Start at 30cm (approx 75% full for standard config)
let mode = 'stable'; // 'stable', 'leak', 'usage', 'refill'
let modeTimer = 0;

console.log('Starting ESP32 Simulator...');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // Simulate current state distance updates
    updateSimulation();

    const responseData = {
      device: "ESP32_SIMULATOR",
      status: "ok",
      sensors: {
        ultrasonic: {
          distance_cm: Math.round(currentDistanceCm * 10) / 10,
          status: "ok"
        },
        temperature: {
          temperature_c: 24.5,
          status: "ok"
        }
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

// Update the simulated tank distance depending on the mode
function updateSimulation() {
  modeTimer++;

  // Change modes periodically every 20 requests/ticks
  if (modeTimer > 25) {
    modeTimer = 0;
    switch (mode) {
      case 'stable':
        mode = 'leak';
        console.log('\n>>> SIMULATOR STATE CHANGE: Starting slow water leak simulation...');
        break;
      case 'leak':
        mode = 'refill';
        console.log('\n>>> SIMULATOR STATE CHANGE: Starting tank refill simulation...');
        break;
      case 'refill':
        mode = 'usage';
        console.log('\n>>> SIMULATOR STATE CHANGE: Starting rapid normal water usage simulation...');
        break;
      case 'usage':
      default:
        mode = 'stable';
        console.log('\n>>> SIMULATOR STATE CHANGE: Tank stable...');
        break;
    }
  }

  // Adjust distance (distance increases = water level drops)
  if (mode === 'stable') {
    // Add small sensor noise
    currentDistanceCm += (Math.random() - 0.5) * 0.1;
  } else if (mode === 'leak') {
    // Slow steady drop (leak). Distance increases by 0.3cm per tick
    currentDistanceCm += 0.4;
  } else if (mode === 'refill') {
    // Rapid increase of water (refill). Distance decreases by 2.0cm per tick
    currentDistanceCm -= 2.0;
  } else if (mode === 'usage') {
    // Rapid normal water usage. Distance increases by 1.5cm per tick
    currentDistanceCm += 1.5;
  }

  // Clamping distance between 10cm (full) and 90cm (empty)
  currentDistanceCm = Math.max(10.0, Math.min(90.0, currentDistanceCm));
  
  console.log(`[ESP32 SIM] Mode: ${mode.toUpperCase()} | Simulated Distance: ${Math.round(currentDistanceCm * 10) / 10} cm`);
}

server.listen(PORT, () => {
  console.log(`ESP32 Simulator is listening on http://localhost:${PORT}`);
  console.log(`To test the backend with this simulator, change ESP32_URL in .env to http://localhost:${PORT}`);
});
