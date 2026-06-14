import config from '../config.js';

/**
 * Fetches the current distance reading from the ESP32 web server.
 * Includes a timeout to prevent requests from hanging if the device is offline.
 * 
 * @returns {Promise<{success: boolean, data?: object, error?: string, timestamp: string}>}
 */
export async function fetchESP32Data() {
  const timestamp = new Date().toISOString();
  try {
    // Add a 4-second timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(config.esp32Url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        device: data.device || 'ESP32',
        sensor: data.sensor || 'HC-SR04/DS18B20',
        distance_cm: data.distance_cm !== undefined ? data.distance_cm : null,
        temperature_c: data.temperature_c !== undefined ? data.temperature_c : null,
        status: data.ultrasonic_status || data.status || 'ok'
      },
      timestamp
    };
  } catch (error) {
    let errorMessage = error.message;
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out - ESP32 is offline or unreachable';
    }
    return {
      success: false,
      error: errorMessage,
      timestamp
    };
  }
}
