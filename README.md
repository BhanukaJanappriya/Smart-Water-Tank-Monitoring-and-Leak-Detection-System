# Smart Water Tank Monitoring and Leak Detection System

This repository contains the source code for a Smart Water Tank Monitoring and Leak Detection System, designed to prevent water wastage and monitor tank levels in real-time.

## Project Architecture

The system consists of two main parts:
1. **IoT Node (ESP32)**: Reads distance to water using an HC-SR04 ultrasonic sensor and exposes a JSON API over WiFi/Hotspot containing raw distance data.
2. **Express Backend**: Polls the ESP32 sensor, calculates depth/volume/percentage metrics, manages historical logs, implements statistical leak detection using linear regression, and hosts interactive OpenAPI documentation.

---

## Getting Started

### 📂 Backend Setup
The Express backend is located in the [/backend](./backend) folder.
For installation instructions, API route specifications, and details about the leak-detection algorithm, please refer to the:
📄 **[Backend README](./backend/README.md)**

To run the backend server and its local ESP32 simulation utility:
1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Run the simulator (to mock sensor reads):
   ```bash
   npm run mock
   ```
4. Run the backend API server (runs on port 3000):
   ```bash
   npm run dev
   ```

### 🔌 IoT ESP32 Firmware
A sketch example of the firmware is provided in the repository configuration. It connects to a local WiFi/hotspot, initializes the trigger and echo pins for the ultrasonic sensor, and spins up a web server on port 80.
When the backend requests `http://<ESP32_IP>/`, it responds with:
```json
{
  "device": "ESP32",
  "sensor": "HC-SR04",
  "distance_cm": 45.2,
  "status": "ok"
}
```