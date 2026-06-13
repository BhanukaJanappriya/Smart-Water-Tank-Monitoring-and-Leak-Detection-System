#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

// ─── WiFi Credentials (your mobile hotspot) ───────────────────────────────
const char* ssid     = "Galaxy A04 3240";// Your phone's hotspot name
const char* password = "urpp3190";   // Your pohne's hotspot password

// ─── Ultrasonic Sensor Pins ────────────────────────────────────────────────
#define TRIG_PIN 23
#define ECHO_PIN 22

// ─── Delays ───────────────────────────────────────────────────────────────
const int setup_delay     = 1000;
const int wifi_setup_delay = 500;

WebServer server(80);

// ─── Read Distance from Sensor ────────────────────────────────────────────
long getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) return -1;  // -1 means no reading / sensor error

  return (duration / 2) / 29.1;
}

// ─── Web Server Response ──────────────────────────────────────────────────
void handleRoot() {
  long distance = getDistance();

  String json = "{";
  json += "\"device\":\"ESP32\",";
  json += "\"sensor\":\"HC-SR04\",";

  if (distance == -1) {
    json += "\"distance_cm\":null,";
    json += "\"status\":\"error - no echo received\"";
  } else {
    json += "\"distance_cm\":" + String(distance) + ",";
    json += "\"status\":\"ok\"";
  }

  json += "}";

  server.send(200, "application/json", json);
}

// ─── Setup ────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(setup_delay);

  // Sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Connect to hotspot
  Serial.println("Connecting to hotspot...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(wifi_setup_delay);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Connected to hotspot!");
  Serial.print("Visit this URL on your phone: http://");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.begin();
  Serial.println("Web server started!");
}

// ─── Loop ─────────────────────────────────────────────────────────────────
void loop() {
  server.handleClient();  // Listen for incoming requests
}