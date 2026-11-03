# Laboratorio 05: Seguridad de Aplicaciones (SAST, DAST, SCA y Pentesting)

[![Seguridad estatica - SAST y secretos](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/actions/workflows/seguridad-estatica.yml/badge.svg)](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/actions/workflows/seguridad-estatica.yml)

**Institucion:** Escuela Colombiana de Ingenieria Julio Garavito  
**Asignatura:** Fundamentos de Seguridad de la Informacion (FDSI)  
**Periodo Academico:** 2026-02  
**Integrantes:**
- Diego Fabian Andrade Duran
- Felipe Amador Gonzalez

---

## 1. Descripcion del Proyecto

Este repositorio contiene la implementacion del portal **MuvAutomation Incident Hub**, utilizado como base tecnica para el Laboratorio 05 de Fundamentos de Seguridad de la Informacion. En este ejercicio se integraron y validaron controles de seguridad profesionales a lo largo del ciclo de vida del software (DevSecOps), cubriendo:
- **SAST (Static Application Security Testing):** Analisis continuo de codigo con Semgrep OSS y GitHub CodeQL Default Setup.
- **Secret Detection:** Prevencion y escaneo de credenciales expuestas con Gitleaks y GitHub Secret Scanning.
- **SCA (Software Composition Analysis):** Deteccion y remediacion de dependencias vulnerables con GitHub Dependabot y `npm audit`.
- **DAST Pasivo (Dynamic Application Security Testing):** Auditoria en tiempo de ejecucion con OWASP ZAP Baseline.
- **Pentesting Controlado:** Confirmacion practica no destructiva de hipotesis de riesgo en staging local autorizado.
- **Remediacion Verificable:** Correccion de hallazgos mediante Pull Request y pruebas automatizadas de regresion (`npm test`).

---

## 2. Enlaces Rapidos a la Documentacion Tecnica

- [Informe de Seguridad y Evidencias](docs/SECURITY.md)
- [Reporte Tecnico de Hallazgos y Analisis](docs/REPORTE_HALLAZGOS.md)
- [Checklist de Seguridad para Pull Request](docs/CHECKLIST_PR.md)
- [Tablero Interactivo del Laboratorio (8 Etapas)](AppSec_Lab_FSI.html)
- [Reporte DAST Pasivo OWASP ZAP (HTML)](reports/zap-report.html)
- [Pull Request de Remediacion (#10)](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/pull/10)

---

## 3. Estructura del Proyecto

```text
├── .github/
│   ├── dependabot.yml              # Configuracion de analisis de dependencias (SCA)
│   └── workflows/
│       ├── seguridad-estatica.yml  # Pipeline CI para SAST (Semgrep) y Secretos (Gitleaks)
│       └── dast-staging.yml        # Pipeline para DAST pasivo sobre staging (OWASP ZAP)
├── app/
│   ├── config/                     # Variables de entorno y configuraciones de prueba
│   ├── public/                     # Portal web y activos estaticos
│   ├── test/                       # Pruebas automatizadas y de regresion de seguridad
│   ├── package.json                # Dependencias del proyecto (parcheadas a versiones seguras)
│   └── server.js                   # Logica backend segura con saneamiento y cabeceras
├── docs/
│   ├── CHECKLIST_PR.md             # Lista de verificacion obligatoria para PRs
│   ├── README_INTEGRACION.md       # Guia metodologica de integracion
│   ├── REPORTE_HALLAZGOS.md        # Informe formal de vulnerabilidades (F-01 a F-04)
│   └── SECURITY.md                 # Registro de linea base, alcance y evidencias antes/despues
├── reports/                        # Evidencias en bruto descargadas de los escaneos
│   ├── semgrep.json                # Resultado inicial de SAST Semgrep
│   ├── semgrep-remediated.json     # Reescaneo post-remediacion de Semgrep
│   ├── gitleaks-results.sarif      # Resultado de escaneo de secretos
│   ├── zap-report.html             # Informe visual HTML de OWASP ZAP
│   └── zap-report.json             # Informe estructurado JSON de OWASP ZAP
└── AppSec_Lab_FSI.html             # Tablero interactivo con las 8 etapas completadas
```

---

## 4. Instrucciones de Ejecucion y Validacion Local

### 4.1. Instalacion de dependencias
```bash
cd app
npm install
```

### 4.2. Ejecucion de la suite de pruebas de regresion
```bash
npm test
```
*Salida esperada:*
```text
✔ Seguridad - Prevencion de XSS Reflejado en busqueda (/api/v1/search)
✔ Seguridad - Sanitizacion de etiquetas HTML arbitrarias (Pentest <u>)
✔ Seguridad - Validacion de Cabeceras HTTP Hardened
✔ Seguridad - Proteccion de Cookie de Sesion (HttpOnly, Secure, SameSite)
ℹ pass 4
ℹ fail 0
```

### 4.3. Inicio del servidor seguro
```bash
npm start
```
El portal estara disponible en `http://localhost:8080`.

---

## 5. Guia Paso a Paso para la Sustentacion en Vivo (Demostracion de 5 Minutos)

Esta seccion detalla la secuencia exacta, comandos, rutas, puertos y evidencias para presentar el laboratorio ante el profesor en vivo.

### Minuto 1: Inicio del servidor y presentacion de la plataforma
1. Abrir terminal en la carpeta `app`:
   ```bash
   cd app
   npm start
   ```
2. Abrir en el navegador:
   ```text
   http://localhost:8080
   ```
3. Explicar brevemente: La plataforma es *MuvAutomation Incident Hub*, un portal de triaje de alertas de seguridad. En la linea base inicial tenia un fallo critico de inyeccion de codigo en el buscador y configuraciones debiles de cabeceras.

---

### Minuto 2: Demostracion de la vulnerabilidad corregida (Pentest controlado de XSS)
1. Enviar en el navegador la peticion de prueba con payload inocuo:
   ```text
   http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E
   ```
2. O desde otra terminal con comando directo:
   ```bash
   curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"
   ```
3. **Que mostrar al profesor:**
   - La etiqueta `<u>` **no se renderiza ni se ejecuta**.
   - En el codigo fuente HTML aparece codificada como `&lt;u&gt;Prueba_Controlada_FDSI&lt;/u&gt;`.
   - Explicar la funcion `escapeHtml()` en `app/server.js` que neutraliza `< > & " '` antes de generar la respuesta.

---

### Minuto 3: Demostracion de cabeceras de seguridad y proteccion de cookies (DAST)
1. Consultar en terminal el endpoint de sesion con sus cabeceras:
   ```bash
   curl -i http://localhost:8080/api/v1/auth/session
   ```
2. **Que resaltar al profesor:**
   - `Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict`: Evita que scripts en el cliente roben la cookie de sesion mediante `document.cookie`.
   - `Content-Security-Policy`: Sin directiva `'unsafe-inline'` para scripts.
   - `X-Frame-Options: DENY`: Proteccion estricta contra ataques de Clickjacking.
   - `X-Content-Type-Options: nosniff`: Evita suplantacion de tipo MIME.
   - Ausencia total de la cabecera `X-Powered-By` (reduccion de huella digital).

---

### Minuto 4: Ejecucion en vivo de pruebas automatizadas y chequeo de dependencias (SCA)
1. Ejecutar las pruebas automatizadas de regresion:
   ```bash
   npm test
   ```
   - Mostrar que las 4 pruebas pasan en verde inmediatamente:
     - Prevencion de `<script>` en busqueda.
     - Sanitizacion de etiquetas HTML.
     - Cabeceras de seguridad activas.
     - Flags de cookies verificados.
2. Ejecutar la revision de dependencias:
   ```bash
   npm audit
   ```
   - Mostrar la salida `found 0 vulnerabilities`, evidenciando que se resolvieron las alertas de Dependabot al actualizar a `express@^4.22.3` y `cookie-parser@^1.4.7`.

---

### Minuto 5: Evidencias de los escaneos y Pull Request en GitHub
1. **Tablero Interactivo (8 etapas completadas):**
   - Abrir en el navegador el archivo local:
     ```text
     AppSec_Lab_FSI.html
     ```
   - Mostrar la barra de progreso en verde: **8 de 8 etapas completadas**.
2. **Reportes de Escaneo:**
   - Abrir en el navegador `reports/zap-report.html` (informe de OWASP ZAP Baseline).
   - Mostrar en el editor `reports/semgrep.json` y `reports/gitleaks-results.sarif`.
3. **Pull Request en GitHub:**
   - Abrir el enlace del PR:
     ```text
     https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/pull/10
     ```
   - Mostrar los commits limpios, el checklist de seguridad marcado y los checks de GitHub Actions (CodeQL y Semgrep) en verde.
