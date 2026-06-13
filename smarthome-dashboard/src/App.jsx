import { useEffect, useState } from "react";
import mqtt from "mqtt";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [temperatura, setTemperatura] = useState("--");
  const [status, setStatus] = useState("Desconectado");
  const [luz, setLuz] = useState("OFF");
  const [historicoTemp, setHistoricoTemp] = useState([]);
  const [presenca, setPresenca] = useState("AUSENTE");
  const [umidade, setUmidade] = useState("--");
  const [historicoUmidade, setHistoricoUmidade] = useState([]);

  const [client, setClient] = useState(null);

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const mqttClient = mqtt.connect(
      "wss://cd7a510790bf435e82c1318c38404fb7.s1.eu.hivemq.cloud:8884/mqtt",
      {
        username: "mqtt_admin",
        password: "!XrnZaywS8mH2m9",
      }
    );

    mqttClient.on("connect", () => {
      console.log("Conectado ao MQTT");

      setStatus("Conectado");

      mqttClient.subscribe("smarthome/casa1/#");
    });

    mqttClient.on("message", (topic, message) => {
      const valor = message.toString().trim();

      const horario = new Date().toLocaleTimeString();

      setLogs((prev) => [
        `[${horario}] ${topic}: ${valor}`,
        ...prev.slice(0, 14)
      ]);

      if (topic === "smarthome/casa1/quarto/temperatura") {

        setTemperatura(valor);

        setHistoricoTemp((prev) => {

          const novo = [
            ...prev,
            {
              hora: new Date().toLocaleTimeString(),
              temperatura: Number(valor),
            },
          ];

          return novo.slice(-10);
        });
      }

      if (topic === "smarthome/casa1/quarto/umidade") {

        setUmidade(valor);

        setHistoricoUmidade((prev) => {

          const novo = [
            ...prev,
            {
              hora: new Date().toLocaleTimeString(),
              umidade: Number(valor),
            },
          ];

          return novo.slice(-10);
        });
      }

      if (topic === "smarthome/casa1/status") {
        setStatus(valor);
      }

      if (topic === "smarthome/casa1/sala/luz/status") {
        setLuz(valor);
      }

      if (topic === "smarthome/casa1/sala/presenca") {
        setPresenca(valor);
      }
    });

    mqttClient.on("error", (err) => {
      console.error(err);
      setStatus("Erro MQTT");
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  const ligarLuz = () => {
    client?.publish(
      "smarthome/casa1/sala/luz/comando",
      "ON"
    );
  };

  const desligarLuz = () => {
    client?.publish(
      "smarthome/casa1/sala/luz/comando",
      "OFF"
    );
  };

  const chartData = {
    labels: historicoTemp.map(item => item.hora),

    datasets: [
      {
        label: "Temperatura °C",
        data: historicoTemp.map(item => item.temperatura),

        borderColor: "#00bfff",
        backgroundColor: "#00bfff",

        tension: 0.3,
      },
    ],
  };

  const umidadeChartData = {
    labels: historicoUmidade.map(item => item.hora),

    datasets: [
      {
        label: "Umidade %",
        data: historicoUmidade.map(item => item.umidade),

        borderColor: "#00ff88",
        backgroundColor: "#00ff88",

        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,

    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "#333",
        },
      },

      y: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "#333",
        },
      },
    },
  };


  const temperaturas = historicoTemp.map(
    item => item.temperatura
  );

  const tempMax =
    temperaturas.length > 0
      ? Math.max(...temperaturas)
      : "--";

  const tempMin =
    temperaturas.length > 0
      ? Math.min(...temperaturas)
      : "--";

  const tempMedia =
    temperaturas.length > 0
      ? (
          temperaturas.reduce(
            (a, b) => a + b,
            0
          ) / temperaturas.length
        ).toFixed(1)
      : "--";
return (
  <div
    style={{
      padding: "30px",
      fontFamily: "Arial",
    }}
  >
    <h1>🏠 SmartHome Dashboard</h1>

  <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "20px",
      }}
    >

      <div
        style={{
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "10px",
          minWidth: "220px",
        }}
      >
        <h3>Status ESP32</h3>
        <h2>{status}</h2>
      </div>

      <div
        style={{
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "10px",
          minWidth: "220px",
        }}
      >
        <h3>Temperatura</h3>
        <h2>{temperatura} °C</h2>
      </div>

      <div
        style={{
          background: "#1c1c1c",
          padding: "20px",
          borderRadius: "10px",
          minWidth: "220px",
        }}
      >
        <h3>Umidade</h3>
        <h2>{umidade}%</h2>
      </div>

    </div>

    <div
      style={{
        marginTop: "20px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        flexWrap: "wrap",
        fontWeight: "bold",
      }}
    >
      <div>🌡️ Máx: {tempMax} °C</div>
      <div>❄️ Mín: {tempMin} °C</div>
      <div>📊 Média: {tempMedia} °C</div>
    </div>

    <div
      style={{
        marginTop: "20px",
        marginBottom: "20px",
        maxWidth: "800px",
      }}
    >
      <Line
       data={chartData}
       options={chartOptions}
      />
      {Number(temperatura) > 30 && (
        <div
          style={{
            background: "#ff4444",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            marginTop: "15px",
            fontWeight: "bold",
          }}
        >
          ⚠️ ALERTA: Temperatura acima de 30°C
        </div>
      )}
    </div>

    <div
      style={{
        marginTop: "40px",
        marginBottom: "20px",
        maxWidth: "800px",
      }}
    >
      <h3>📈 Histórico de Umidade</h3>

      <Line
        data={umidadeChartData}
        options={chartOptions}
      />
    </div>
    
    <h2>
      Luz da Sala:
      <span
        style={{
          color: luz === "ON" ? "#00ff00" : "#ff4444",
          marginLeft: "10px",
        }}
      >
        {luz === "ON" ? "🟢 Ligada" : "🔴 Desligada"}
      </span>
    </h2>

    <div style={{ marginTop: "20px" }}>
      <button onClick={ligarLuz}>
        Ligar Luz
      </button>

      <button
        onClick={desligarLuz}
        style={{ marginLeft: "10px" }}
      >
        Desligar Luz
      </button>
    </div>

    <hr style={{ marginTop: "30px" }} />

    <h2>
      Presença:
      <span
        style={{
          color:
            presenca === "DETECTADA"
              ? "#00ff00"
              : "#ff4444",
          marginLeft: "10px",
        }}
      >
        {presenca === "DETECTADA"
          ? "🚶 Detectada"
          : "⭕ Ausente"}
      </span>
    </h2>

    <h2>Logs MQTT</h2>

    <p>Total de logs: {logs.length}</p>

    <div
      style={{
        background: "#f0f0f0",
        color: "black",
        padding: "10px",
        borderRadius: "8px",
        maxHeight: "250px",
        overflowY: "auto",
        textAlign: "left",
      }}
    >
      {logs.map((log, index) => (
        <div
          key={index}
          style={{
            marginBottom: "5px",
            borderBottom: "1px solid #ccc",
            paddingBottom: "5px",
          }}
        >
          {log}
        </div>
      ))}
    </div>

  </div>
);
}

export default App;