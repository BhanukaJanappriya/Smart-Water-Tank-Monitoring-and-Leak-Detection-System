#include <Arduino.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebServer.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ─── WiFi Credentials ─────────────────────────────────────────────────────
const char* ssid     = "Dialog 4G 471";
const char* password = "5DFC24D3";

// ─── Ultrasonic Sensor Pins ───────────────────────────────────────────────
#define TRIG_PIN 23
#define ECHO_PIN 22

// ─── Temperature Sensor Pin ───────────────────────────────────────────────
#define TEMP_PIN 4

// ─── Delays ───────────────────────────────────────────────────────────────
const int setup_delay      = 1000;
const int wifi_setup_delay = 500;

// ─── Temperature Sensor Setup ─────────────────────────────────────────────
OneWire oneWire(TEMP_PIN);
DallasTemperature tempSensor(&oneWire);

WebServer server(80);

// ─── Read Distance ────────────────────────────────────────────────────────
long getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return -1;

  return (duration / 2) / 29.1;
}

// ─── Read Temperature ─────────────────────────────────────────────────────
float getTemperature() {
  tempSensor.requestTemperatures();
  float temp = tempSensor.getTempCByIndex(0);
  return temp;  // returns -127.0 if error
}

// ─── Web Server Response ──────────────────────────────────────────────────
void handleRoot() {
  long  distance = getDistance();
  float temp     = getTemperature();

  String json = "{";

  json += "\"device\":\"ESP32\",";

  // ── Distance ──
  if (distance == -1) {
    json += "\"distance_cm\":null,";
    json += "\"ultrasonic_status\":\"error - no echo received\",";
  } else {
    json += "\"distance_cm\":" + String(distance) + ",";
    json += "\"ultrasonic_status\":\"ok\",";
  }

  // ── Temperature ──
  if (temp == -127.0) {
    json += "\"temperature_c\":null,";
    json += "\"temperature_status\":\"error - check wiring\"";
  } else {
    json += "\"temperature_c\":" + String(temp, 1) + ",";  // 1 decimal place
    json += "\"temperature_status\":\"ok\"";
  }

  json += "}";

  server.send(200, "application/json", json);
}

// ─── Setup ────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(setup_delay);

  // Ultrasonic pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Temperature sensor
  tempSensor.begin();

  // Connect to hotspot
  Serial.println("Connecting to hotspot...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(wifi_setup_delay);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Connected to hotspot!");
  Serial.print("Visit this URL: http://");
  Serial.println(WiFi.localIP());

  // Set up mDNS responder
  if (!MDNS.begin("watertank")) {
    Serial.println("Error setting up MDNS responder!");
  } else {
    Serial.println("mDNS responder started");
    Serial.println("Visit this URL: http://watertank.local");
  }

  server.on("/", handleRoot);
  server.begin();
  Serial.println("Web server started!");
}

// ─── Loop ─────────────────────────────────────────────────────────────────
void loop() {
  server.handleClient();
}