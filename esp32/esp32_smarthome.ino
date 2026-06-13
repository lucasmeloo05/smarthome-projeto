#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// ======================
// PINOS
// ======================

const int ledPin = 2;
const int presencaPin = 4;

// ======================
// WIFI
// ======================

const char* ssid = "Wokwi-GUEST";
const char* password = "";

// ======================
// HIVEMQ CLOUD
// ======================

const char* mqtt_server =
"cd7a510790bf435e82c1318c38404fb7.s1.eu.hivemq.cloud";

const int mqtt_port = 8883;

const char* mqtt_user = "mqtt_admin";
const char* mqtt_pass = "!XrnZaywS8mH2m9";

// ======================
// MQTT
// ======================

WiFiClientSecure espClient;
PubSubClient client(espClient);

// ======================
// CONTROLE PRESENCA
// ======================

bool presencaAnterior = false;

// ======================
// RECEBE COMANDOS MQTT
// ======================

void callback(char* topic, byte* payload, unsigned int length) {

  String message = "";

  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("Topico: ");
  Serial.println(topic);

  Serial.print("Mensagem: ");
  Serial.println(message);

  if (String(topic) == "smarthome/casa1/sala/luz/comando") {

    if (message == "ON") {

      digitalWrite(ledPin, HIGH);

      client.publish(
        "smarthome/casa1/sala/luz/status",
        "ON",
        true
      );

      Serial.println("Luz ligada");
    }

    if (message == "OFF") {

      digitalWrite(ledPin, LOW);

      client.publish(
        "smarthome/casa1/sala/luz/status",
        "OFF",
        true
      );

      Serial.println("Luz desligada");
    }
  }
}

// ======================
// RECONECTA MQTT
// ======================

void reconnect() {

  while (!client.connected()) {

    Serial.println("Conectando MQTT...");

    String clientId = "ESP32-";
    clientId += String(random(0xffff), HEX);

    if (client.connect(
      clientId.c_str(),
      mqtt_user,
      mqtt_pass,
      "smarthome/casa1/status",
      1,
      true,
      "offline"
    )) {

      Serial.println("MQTT conectado!");

      client.publish(
        "smarthome/casa1/status",
        "online",
        true
      );

      client.publish(
        "smarthome/casa1/sala/luz/status",
        digitalRead(ledPin) ? "ON" : "OFF",
        true
      );

      client.subscribe(
        "smarthome/casa1/sala/luz/comando"
      );

    } else {

      Serial.print("Falha MQTT: ");
      Serial.println(client.state());

      delay(2000);
    }
  }
}

// ======================
// SETUP
// ======================

void setup() {

  pinMode(ledPin, OUTPUT);

  pinMode(
    presencaPin,
    INPUT
  );

  Serial.begin(115200);

  Serial.println("Conectando WiFi...");

  WiFi.begin(
    ssid,
    password
  );

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi conectado!");

  espClient.setInsecure();

  client.setServer(
    mqtt_server,
    mqtt_port
  );

  client.setCallback(callback);
}

// ======================
// LOOP
// ======================

void loop() {

  if (!client.connected()) {
    reconnect();
  }

  client.loop();

  // ======================
  // SENSOR PIR
  // ======================

  bool presencaAtual =
    digitalRead(presencaPin);

  if (
    presencaAtual &&
    !presencaAnterior
  ) {

    Serial.println(
      "Movimento detectado!"
    );

    digitalWrite(
      ledPin,
      HIGH
    );

    client.publish(
      "smarthome/casa1/sala/presenca",
      "DETECTADA",
      true
    );

    client.publish(
      "smarthome/casa1/sala/luz/status",
      "ON",
      true
    );
  }

  if (
    !presencaAtual &&
    presencaAnterior
  ) {

    Serial.println(
      "Sem movimento"
    );

    digitalWrite(
      ledPin,
      LOW
    );

    client.publish(
      "smarthome/casa1/sala/presenca",
      "AUSENTE",
      true
    );

    client.publish(
      "smarthome/casa1/sala/luz/status",
      "OFF",
      true
    );
  }

  presencaAnterior =
    presencaAtual;

  // ======================
  // TEMPERATURA E UMIDADE
  // ======================

  static unsigned long ultimaLeitura = 0;

  if (
    millis() - ultimaLeitura >= 5000
  ) {

    ultimaLeitura = millis();

    int temperatura =
      random(20, 35);

    int umidade =
      random(40, 90);

    char tempString[10];
    char umidadeString[10];

    sprintf(
      tempString,
      "%d",
      temperatura
    );

    sprintf(
      umidadeString,
      "%d",
      umidade
    );

    client.publish(
      "smarthome/casa1/quarto/temperatura",
      tempString
    );

    client.publish(
      "smarthome/casa1/quarto/umidade",
      umidadeString
    );

    Serial.print("Temperatura: ");
    Serial.println(tempString);

    Serial.print("Umidade: ");
    Serial.println(umidadeString);
  }
}