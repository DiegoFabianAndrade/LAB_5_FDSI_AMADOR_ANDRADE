const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Ocultar huella digital del servidor (DAST / Information Disclosure)
app.disable('x-powered-by');

// Restriccion de origenes cruzados segura
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8080',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Saneamiento de cadenas contra Cross-Site Scripting (XSS Reflejado - CWE-79)
function escapeHtml(unsafeText) {
  if (typeof unsafeText !== 'string') return '';
  return unsafeText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Middleware de endurecimiento de cabeceras de seguridad HTTP
app.use((req, res, next) => {
  // Evitar suplantacion de tipo MIME
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevencion estricta de Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Politica estricta de referencia
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // HSTS para transporte seguro (en produccion/staging TLS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Content Security Policy endurecida (sin directivas 'unsafe-inline' en scripts ni comodines globales)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  );
  res.setHeader('X-Lab-Environment', 'LAB5-APPSEC-REMEDIATED');
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
    timestamp: new Date().toISOString()
  });
});

// Endpoint de busqueda seguro: Saneamiento exhaustivo del parametro 'q'
app.get('/api/v1/search', (req, res) => {
  const rawQuery = req.query.q || '';
  const sanitizedQuery = escapeHtml(rawQuery);
  
  // Filtrado funcional
  const resultados = incidentes.filter(inc => 
    inc.titulo.toLowerCase().includes(rawQuery.toLowerCase()) ||
    inc.severidad.toLowerCase().includes(rawQuery.toLowerCase())
  );

  // Construccion segura de respuesta HTML sin interpolacion directa de literales
  let itemsHtml = '';
  for (const r of resultados) {
    itemsHtml += '<div class="res"><strong>[' + escapeHtml(r.severidad) + ']</strong> ' + 
                 escapeHtml(r.titulo) + ' (Origen: ' + escapeHtml(r.origen) + ')</div>';
  }

  // nosemgrep: javascript.express.security.injection.raw-html-format.raw-html-format
  const cabeceraHtml = '<!doctype html><html lang="es"><head><meta charset="utf-8">' + // nosemgrep
    '<title>Resultados de Busqueda</title><style>' +
    'body { font-family: sans-serif; background: #0b1324; color: #f1f5f9; padding: 2rem; }' +
    '.res { background: #14213d; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }' +
    'a { color: #38bdf8; }</style></head><body>' +
    '<h2>Resultados para la consulta: ' + sanitizedQuery + '</h2>' +
    '<p>Coincidencias encontradas: ' + resultados.length + '</p><div>';

  const pieHtml = '</div><p><a href="/">Volver al portal</a></p></body></html>';
  const respuestaHtml = cabeceraHtml + itemsHtml + pieHtml;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(respuestaHtml);
});

// Endpoint de sesion seguro: Proteccion de cookies de sesion (HttpOnly, Secure, SameSite)
app.get('/api/v1/auth/session', (req, res) => {
  const dummyToken = "sess_mock_remediated_token_fdsi_54321";
  res.cookie('auth_token', dummyToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000,
    path: '/'
  });
  res.json({ mensaje: "Sesion segura configurada con atributos HttpOnly y SameSite", protegido: true });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[MuvAutomation Hub] Servidor seguro ejecutandose en el puerto ${PORT}`);
  });
}

module.exports = app;
