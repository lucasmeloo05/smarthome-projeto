# SmartHome MQTT Dashboard

## Descrição

Sistema de automação residencial utilizando MQTT para comunicação entre um dispositivo embarcado (ESP32 simulado no Wokwi) e uma interface web desenvolvida em React.

O sistema permite monitorar temperatura, umidade e presença em tempo real, além de controlar remotamente a iluminação de um ambiente através de mensagens MQTT.

---

## Integrantes

* Gabriel Gama de Sousa Rezende
* Gabriel Nogueira Rezende
* Gabriel Pereira Rodrigues
* Heraldo Fagundes Tomaz Junior
* Lucas Mendes Polonio de Melo
* Lucas Carneiro Lozano Silva

---

## Tema

Automação residencial com MQTT e monitoramento em tempo real.

---

## Demonstração da Arquitetura

```text
┌─────────────────────┐
│  ESP32 (Wokwi)      │
│                     │
│ - Temperatura       │
│ - Umidade           │
│ - Presença          │
│ - Controle da luz   │
└──────────┬──────────┘
           │ MQTT/TLS
           ▼
┌─────────────────────┐
│    HiveMQ Cloud     │
│     Broker MQTT     │
└──────────┬──────────┘
           │ MQTT over WebSocket
           ▼
┌─────────────────────┐
│ Dashboard React     │
│                     │
│ - Gráficos          │
│ - Logs MQTT         │
│ - Controle da luz   │
│ - Monitoramento     │
└─────────────────────┘
```

---

## Tecnologias Utilizadas

### Dispositivo Embarcado

* ESP32 (simulado no Wokwi)
* Arduino Framework

### Comunicação

* MQTT
* HiveMQ Cloud
* Mosquitto
* MQTT Explorer

### Frontend

* React
* MQTT.js
* Chart.js
* React ChartJS 2

### Ferramentas

* GitHub
* Vercel
* Wokwi

---

## Tópicos MQTT Utilizados

| Tópico                             | Descrição                        |
| ---------------------------------- | -------------------------------- |
| smarthome/casa1/status             | Status do ESP32 (online/offline) |
| smarthome/casa1/sala/luz/comando   | Comando para ligar/desligar luz  |
| smarthome/casa1/sala/luz/status    | Estado atual da luz              |
| smarthome/casa1/sala/presenca      | Detecção de presença             |
| smarthome/casa1/quarto/temperatura | Temperatura ambiente             |
| smarthome/casa1/quarto/umidade     | Umidade ambiente                 |

---

## QoS Utilizados

### QoS 0

Utilizado para telemetria e eventos da aplicação.

Justificativa:
As mensagens são frequentes e a perda ocasional de uma mensagem não compromete o funcionamento do sistema.

Tópicos:

* smarthome/casa1/quarto/temperatura
* smarthome/casa1/quarto/umidade
* smarthome/casa1/sala/presenca
* smarthome/casa1/sala/luz/comando
* smarthome/casa1/sala/luz/status

---

### QoS 1

Utilizado no Last Will and Testament (LWT).

Justificativa:
Garantir que a informação de desconexão inesperada do dispositivo seja entregue pelo broker.

Tópico:

* smarthome/casa1/status

---

## Recursos MQTT Utilizados

### Wildcard

O dashboard utiliza:

```text
smarthome/casa1/#
```

para receber todas as mensagens relacionadas à residência.

---

### Retained Messages

Mensagens importantes permanecem armazenadas no broker para novos clientes.

Exemplos:

* Status do ESP32
* Estado da luz
* Estado de presença

---

### Last Will and Testament (LWT)

Foi configurado um LWT para informar quando o ESP32 perder conexão inesperadamente.

Tópico:

```text
smarthome/casa1/status
```

Mensagem:

```text
offline
```

---

## Testes Realizados

### MQTT Explorer

Monitoramento dos tópicos MQTT em tempo real.

### Mosquitto

Teste realizado utilizando:

```bash
mosquitto_sub
```

conectado ao broker HiveMQ Cloud.

Resultado:

Recebimento bem-sucedido das mensagens publicadas pelo ESP32.

### Dashboard React

Recebimento e publicação de mensagens MQTT via WebSocket.

---

## Interface Web

Funcionalidades disponíveis:

* Monitoramento da temperatura
* Monitoramento da umidade
* Monitoramento de presença
* Controle da iluminação
* Gráfico em tempo real de temperatura
* Gráfico em tempo real de umidade
* Visualização dos logs MQTT

---

## Link do Projeto Wokwi

Adicionar:

```text
https://wokwi.com/projects/465239888594155521
```

---

## Link da Aplicação

Adicionar:

```text
https://smarthome-projeto.vercel.app/
```

---

## Repositório

Adicionar:

```text
https://github.com/lucasmeloo05/smarthome-projeto/
```

---

## Conclusão

O projeto demonstra a utilização do protocolo MQTT em um cenário de automação residencial, integrando um dispositivo embarcado, um broker MQTT na nuvem e uma interface web para monitoramento e controle em tempo real.
