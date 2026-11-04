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
- [Guia Rapida de Sustentacion en Ingles (English Q&A)](#6-quick-5-minute-technical-defense-english-qa)

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

## 5. Guia de Sustentacion y Demostracion de Evidencias en Vivo (Español)

A continuacion se presenta la secuencia tecnica para la reproduccion y verificacion en vivo de los controles de seguridad implementados en el proyecto.

### Paso 1: Despliegue del servicio y revision de la arquitectura
1. **Ejecucion del backend:**
   ```bash
   cd app
   npm start
   ```
2. **Acceso al portal:**
   - URL: `http://localhost:8080`
   - Puerto de escucha: `8080` (HTTP local autorizado).
3. **Contexto del sistema:** La aplicacion *MuvAutomation Incident Hub* opera como un centro de triaje de alertas. En su linea base presentaba fallos en el manejo de entradas dinamicas y politicas de cabeceras incompletas, las cuales fueron auditadas y mitigadas.

---

### Paso 2: Validacion de la mitigacion de XSS reflejado (Pentest controlado)
1. **Peticion de prueba con payload inocuo:**
   - Acceso desde navegador:
     ```text
     http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E
     ```
   - O mediante peticion HTTP por terminal:
     ```bash
     curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"
     ```
2. **Comportamiento observado y control aplicado:**
   - La etiqueta `<u>` no se renderiza como elemento de formato en el navegador.
   - En el HTML retornado se comprueba la codificacion de entidades: `&lt;u&gt;Prueba_Controlada_FDSI&lt;/u&gt;`.
   - **Mecanismo defensivo:** La funcion `escapeHtml()` en `app/server.js` neutraliza los caracteres `< > & " '` antes de la interpolacion en la plantilla.

---

### Paso 3: Verificacion de cabeceras de seguridad y atributos de sesion (DAST pasivo)
1. **Consulta del endpoint de autenticacion simulada:**
   ```bash
   curl -i http://localhost:8080/api/v1/auth/session
   ```
2. **Controles verificados en las cabeceras de respuesta:**
   - `Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict`: Previene la extraccion del token de sesion mediante scripts maliciosos en `document.cookie`.
   - `Content-Security-Policy: default-src 'self'`: Restringe la ejecucion de scripts inline no autorizados (`'unsafe-inline'`).
   - `X-Frame-Options: DENY`: Bloquea el renderizado en iframes para prevenir ataques de Clickjacking.
   - `X-Content-Type-Options: nosniff`: Evita la reinterpretacion arbitraria de tipos MIME.
   - Supresion de `X-Powered-By` para evitar la exposicion del framework backend.

---

### Paso 4: Ejecucion de la suite de regresion automatizada y analisis de dependencias (SCA)
1. **Ejecucion de pruebas automatizadas:**
   ```bash
   npm test
   ```
   - Confirma la aprobacion del 100% de los casos de prueba (4 de 4 pruebas pasando en verde):
     - Prevencion de `<script>` en busquedas.
     - Sanitizacion de etiquetas HTML arbitrarias.
     - Presencia de cabeceras HTTP de proteccion.
     - Configuracion correcta de los atributos de la cookie de sesion.
2. **Auditoria de dependencias de terceros:**
   ```bash
   npm audit
   ```
   - Salida: `found 0 vulnerabilities`, evidenciando la resolucion de los avisos de seguridad ReDoS y DoS tras actualizar `express` y `cookie-parser`.

---

### Paso 5: Revision del flujo de trabajo DevSecOps en GitHub (SAST, Secretos y Pull Request)
1. **Tablero interactivo de seguimiento:**
   - Visualizacion del archivo local `AppSec_Lab_FSI.html` con las 8 etapas completadas y enlaces a evidencias.
2. **Informes tecnicos generados:**
   - Reporte DAST pasivo: `reports/zap-report.html` y `reports/zap-report.json`.
   - Reportes SAST y Secretos: `reports/semgrep.json` y `reports/gitleaks-results.sarif`.
3. **Trazabilidad en GitHub:**
   - [Pull Request #10](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/pull/10): Contiene los commits de remediacion, el checklist de seguridad diligenciado y la aprobacion de los flujos de trabajo en GitHub Actions (CodeQL y Semgrep).

---

## 6. Quick 5-Minute Technical Defense (English Q&A)

Concise, high-impact reference designed for a 5-minute two-person evaluation answering the three core questions.

### Speaker Roles (5-Minute Split)
- **Speaker 1 (Diego Fabian Andrade Duran):** Question 1 (Critical Vulnerability) & Question 2 (Discovery with SAST & DAST).
- **Speaker 2 (Felipe Amador Gonzalez):** Question 3 (Remediation & Automated Verification) + Live Demo Commands.

---

### Q1: What was the most critical vulnerability found? (Speaker 1 — ~1 min)
- **Vulnerability:** Reflected Cross-Site Scripting (**CWE-79**) in `/api/v1/search?q=...`, amplified by Insecure Session Cookies (**CWE-1004**) in `/api/v1/auth/session`.
- **Severity:** **High (CVSS 7.5)**.
- **Why it was critical:**
  1. The search parameter was reflected directly into the HTML body with zero sanitization.
  2. The session cookie lacked `HttpOnly` and `Secure` attributes, and CSP allowed `'unsafe-inline'`.
- **Security Impact:** An attacker could craft a malicious link to steal the analyst's active session token via `document.cookie` (Confidentiality & Integrity compromised), leading to complete **Session Hijacking**.

---

### Q2: How did we find it? (Speaker 1 — ~1.5 min)
We identified and validated it through three complementary DevSecOps layers:
1. **SAST (Static Analysis):**
   - **GitHub CodeQL:** Flagged alert `js/reflected-xss` (High) at `app/server.js:95`, tracing untrusted input from `req.query.q` directly into `res.send()`.
   - **Semgrep OSS:** Triggered rule `raw-html-format` on unescaped HTML concatenation.
2. **DAST (Dynamic Analysis):**
   - **OWASP ZAP Baseline Scan:** Flagged missing `HttpOnly` flag on `auth_token` and permissive CSP with `'unsafe-inline'`.
3. **Controlled Manual Pentesting:**
   - Sent a safe HTML probe:
     ```bash
     curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"
     ```
   - **Confirmed:** The baseline server returned unescaped `<u>` tags in the HTML response (rendered as underlined text), proving that executable `<script>` payloads would run unrestricted in the browser.

---

### Q3: How did we solve and verify it? (Speaker 2 — ~2 min)
We applied a defense-in-depth fix across code, headers, dependencies, and automated tests:
1. **Contextual Output Sanitization:** Created `escapeHtml()` in `app/server.js` to escape metacharacters (`<`, `>`, `&`, `"`, `'`) before template rendering.
2. **Defense-in-Depth Hardening:**
   - Configured `HttpOnly; Secure; SameSite=Strict` on session cookies, blocking JavaScript access to credentials.
   - Enforced strict `Content-Security-Policy: default-src 'self'` (no inline scripts) and `X-Frame-Options: DENY`.
3. **Supply Chain (SCA):** Upgraded `express` to `^4.22.3` and `cookie-parser` to `^1.4.7` (resolving 14 Dependabot alerts; `npm audit` $\rightarrow$ `0 vulnerabilities`).
4. **Automated Regression Suite:** Wrote 4 automated unit tests in `app/test/security.test.js` (`npm test`: 4/4 passing).
5. **Pull Request Workflow:** Submitted via [Pull Request #10](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/pull/10), verified green by GitHub Actions CI.

---

### 30-Second Live Verification Commands (Speaker 2 — ~0.5 min)

```bash
# 1. Prove XSS is neutralized (returns &lt;u&gt;, text cannot execute)
curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"

# 2. Prove cookies and headers are hardened (shows HttpOnly; Secure; SameSite=Strict and DENY)
curl -i http://localhost:8080/api/v1/auth/session

# 3. Prove regression tests pass (4 tests pass in <500ms)
cd app && npm test

# 4. Prove dependencies are clean (0 vulnerabilities)
npm audit
```
