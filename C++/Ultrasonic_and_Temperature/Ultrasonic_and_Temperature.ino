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

// ─── Serial Print Interval ────────────────────────────────────────────────
const int PRINT_INTERVAL = 2000;          // 2 seconds
unsigned long lastPrintTime = 0;          // tracks last print time

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
  return temp;
}

// ─── Print Sensor Values to Serial ────────────────────────────────────────
void printSensorValues() {
  long  distance = getDistance();
  float temp     = getTemperature();

  Serial.println("──────────────────────────────");

  // Distance
  Serial.print("Distance : ");
  if (distance == -1) {
    Serial.println("ERROR - no echo received");
  } else {
    Serial.print(distance);
    Serial.println(" cm");
  }

  // Temperature
  Serial.print("Temp     : ");
  if (temp == -127.0) {
    Serial.println("ERROR - check wiring");
  } else {
    Serial.print(temp, 1);
    Serial.println(" °C");
  }

  Serial.println("──────────────────────────────");
}

// ─── Web Server Response ──────────────────────────────────────────────────
void handleRoot() {
  long  distance = getDistance();
  float temp     = getTemperature();

  String json = "{";
  json += "\"device\":\"ESP32\",";
  json += "\"status\":\"ok\",";
  json += "\"sensors\":{";

  // Ultrasonic sensor data
  json += "\"ultrasonic\":{";
  if (distance == -1) {
    json += "\"distance_cm\":null,";
    json += "\"status\":\"error - no echo received\"";
  } else {
    json += "\"distance_cm\":" + String(distance) + ",";
    json += "\"status\":\"ok\"";
  }
  json += "},";

  // Temperature sensor data
  json += "\"temperature\":{";
  if (temp == -127.0) {
    json += "\"temperature_c\":null,";
    json += "\"status\":\"error - check wiring\"";
  } else {
    json += "\"temperature_c\":" + String(temp, 1) + ",";
    json += "\"status\":\"ok\"";
  }
  json += "}";

  json += "}"; // End of sensors
  json += "}"; // End of main object

  server.send(200, "application/json", json);
}

// ─── Setup ────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(setup_delay);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  tempSensor.begin();

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

  // Print sensor values every 2 seconds
  // if (millis() - lastPrintTime >= PRINT_INTERVAL) {
  //   printSensorValues();
  //   lastPrintTime = millis();
  // }
}