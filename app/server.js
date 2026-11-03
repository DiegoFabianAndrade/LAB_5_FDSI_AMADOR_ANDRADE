const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cabeceras de seguridad base (version preliminar sin endurecimiento estricto)
app.use((req, res, next) => {
  res.setHeader('X-Lab-Environment', 'LAB5-APPSEC-STAGING');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Politica CSP permisiva inicial (permite scripts inline y comodines)
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' *;");
  next();
});

// Almacen de incidentes simulados
const incidentes = [
  {
    id: "INC-2026-001",
    titulo: "Escaneo de puertos TCP sospechoso",
    severidad: "Alta",
    origen: "192.168.1.105",
    estado: "En revision",
    timestamp: "2026-11-03T14:10:00Z"
  },
  {
    id: "INC-2026-002",
    titulo: "Intento de acceso a ruta administrativa no autorizada",
    severidad: "Media",
    origen: "10.0.1.50",
    estado: "Mitigado",
    timestamp: "2026-11-03T14:35:00Z"
  },
  {
    id: "INC-2026-003",
    titulo: "Fuga potencial de cabeceras de depuracion",
    severidad: "Baja",
    origen: "10.0.1.20",
    estado: "Cerrado",
    timestamp: "2026-11-03T15:00:00Z"
  }
];

// Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoints funcionales
app.get('/api/v1/alerts', (req, res) => {
  res.json({
    total: incidentes.length,
    entorno: "Staging FDSI 2026",
    incidentes: incidentes
  });
});

app.get('/api/v1/status', (req, res) => {
  res.json({
    estado: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint de busqueda de alertas (Vulnerable a XSS Reflejado por concatenacion directa de query)
app.get('/api/v1/search', (req, res) => {
  const query = req.query.q || '';
  
  // Filtrado de incidentes
  const resultados = incidentes.filter(inc => 
    inc.titulo.toLowerCase().includes(query.toLowerCase()) ||
    inc.severidad.toLowerCase().includes(query.toLowerCase())
  );

  // Vulnerabilidad inicial: El parametro query se interpola directamente en el cuerpo HTML sin saneamiento
  const respuestaHtml = `
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Resultados de Busqueda</title>
      <style>
        body { font-family: sans-serif; background: #0b1324; color: #f1f5f9; padding: 2rem; }
        .res { background: #14213d; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        a { color: #38bdf8; }
      </style>
    </head>
    <body>
      <h2>Resultados para la consulta: ${query}</h2>
      <p>Coincidencias encontradas: ${resultados.length}</p>
      <div>
        ${resultados.map(r => `<div class="res"><strong>[${r.severidad}]</strong> ${r.titulo} (Origen: ${r.origen})</div>`).join('')}
      </div>
      <p><a href="/">Volver al portal</a></p>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(respuestaHtml);
});

// Endpoint de autenticacion simulada (Cookie sin directivas HttpOnly ni Secure)
app.get('/api/v1/auth/session', (req, res) => {
  const dummyToken = "sess_mock_test_token_fdsi_987654";
  // Vulnerabilidad inicial: cookie de sesion sin HttpOnly ni Secure
  res.cookie('auth_token', dummyToken, {
    httpOnly: false,
    secure: false,
    path: '/'
  });
  res.json({ mensaje: "Sesion de prueba generada", token: dummyToken });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[MuvAutomation Hub] Servidor ejecutandose en el puerto ${PORT}`);
  });
}

module.exports = app;
