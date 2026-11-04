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
- [Guia de Sustentacion en Ingles (English Q&A Guide)](#6-technical-defense--evaluation-guide-english-step-by-step-for-2-presenters)

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

## 6. Technical Defense & Evaluation Guide (English Step-by-Step for 2 Presenters)

This section provides the technical defense narrative structured specifically for a two-presenter demonstration in English, detailing the most critical vulnerability, how it was discovered across the DevSecOps lifecycle, and how it was remediated and verified.

### Team Presentation Roles
- **Speaker 1 (Diego Fabian Andrade Duran):** System architecture, identification of the most critical vulnerability (CWE-79 & CWE-1004), and automated discovery methodology (SAST & DAST).
- **Speaker 2 (Felipe Amador Gonzalez):** Controlled manual pentesting, code-level remediation, defense-in-depth security headers/cookie attributes, and automated regression verification.

---

### Step 1: What was the most critical vulnerability found? (Speaker 1)
- **Vulnerability Title:** Reflected Cross-Site Scripting (XSS) in Search Endpoint combined with Insecure Session Cookie Attributes.
- **Classification:** OWASP Top 10 A03:2021 (Injection) | CWE-79 (Improper Neutralization of Input During Web Page Generation) and CWE-1004 (Sensitive Cookie Without 'HttpOnly' Flag).
- **Vulnerable Endpoints:** `GET /api/v1/search?q=...` and `GET /api/v1/auth/session` in `app/server.js`.
- **Severity Rating:** High (CVSS v3.1 Score: 7.5 — `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N`).
- **Technical Context:**
  1. The `/api/v1/search` endpoint directly interpolated the raw query string (`req.query.q`) into an HTML template string sent to the client without escaping special characters.
  2. Simultaneously, the `/api/v1/auth/session` route issued an `auth_token` cookie without the `HttpOnly`, `Secure`, or `SameSite` flags, while the initial Content Security Policy permitted `'unsafe-inline'`.
- **Impact on the CIA Triad:**
  - **Confidentiality (High):** An attacker can craft a crafted URL that executes arbitrary JavaScript within the authenticated victim's browser session. By accessing `document.cookie`, the script can exfiltrate session tokens, enabling unauthorized session hijacking of incident analysts.
  - **Integrity (High):** An attacker can arbitrarily manipulate the DOM, present fraudulent incident alerts, modify triage statuses, or initiate administrative requests on behalf of the victim.
  - **Availability (Low):** The backend Node.js process remains functional, but application availability is disrupted on affected client browsers.

---

### Step 2: How did we find it? (Discovery Methodology) (Speakers 1 & 2)

We utilized a multi-stage verification strategy combining static analysis, dynamic scanning, and non-destructive manual pentesting:

#### 2.1. Automated SAST (Static Application Security Testing) — Speaker 1
- **GitHub CodeQL Analysis:** Semantic data-flow analysis on `main` tracked untrusted input from `req.query.q` to the sink in `res.send()`. CodeQL flagged alert `js/reflected-xss` at line 95 with High severity.
- **Semgrep OSS:** Scanning with the `p/owasp-top-ten` rule pack triggered rule `javascript.express.security.injection.raw-html-format.raw-html-format`, identifying direct template literal concatenation in `app/server.js`.

#### 2.2. Automated DAST (Dynamic Application Security Testing) — Speaker 1
- **OWASP ZAP Baseline Scan:** Run against our local authorized staging environment (`http://localhost:8080`), generating `reports/zap-report.html` and `reports/zap-report.json`.
  - Alert `10038` (Medium): Content Security Policy permissive header allowing `'unsafe-inline'` and wildcard `*`.
  - Alert `10010` (Medium): `auth_token` cookie issued without `HttpOnly` flag.
  - Alert `10016` (Medium): Missing anti-clickjacking header (`X-Frame-Options`).

#### 2.3. Controlled Manual Penetration Testing (Harmless PoC) — Speaker 2
- We designed a non-destructive test request using an innocuous HTML probe to test the reflection hypothesis:
  ```bash
  curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"
  ```
- **Observed Baseline Output:**
  ```html
  HTTP/1.1 200 OK
  Content-Type: text/html; charset=utf-8

  <h2>Resultados para la consulta: <u>Prueba_Controlada_FDSI</u></h2>
  ```
- **Confirmation:** The server reflected raw `<u>` tags without encoding, causing the browser to render underlined text. This confirmed that an unencoded `<script>` payload would execute directly in the browser.

---

### Step 3: How did we remediate and solve it? (Speaker 2)

We implemented a defense-in-depth solution across application code, HTTP headers, and dependency management:

#### 3.1. Contextual Output Sanitization (Code-Level Fix)
- Implemented the `escapeHtml()` function in `app/server.js` to escape all HTML metacharacters:
  ```javascript
  function escapeHtml(unsafeText) {
    if (typeof unsafeText !== 'string') return '';
    return unsafeText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  ```
- The query parameter is strictly sanitized prior to rendering:
  ```javascript
  const sanitizedQuery = escapeHtml(rawQuery);
  ```

#### 3.2. Session Cookie & Header Hardening (Defense-in-Depth)
- **Cookie Protection:** Configured `HttpOnly`, `Secure`, and `SameSite=Strict` in `res.cookie()`:
  ```javascript
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000,
    path: '/'
  });
  ```
  This ensures that even in the event of an injection vulnerability, scripts cannot access the session token through the DOM API.
- **Strict HTTP Headers:** Added Express middleware enforcing:
  - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';` (removes unsafe inline scripts).
  - `X-Frame-Options: DENY` (prevents clickjacking via iframes).
  - `X-Content-Type-Options: nosniff` (prevents MIME confusion attacks).
  - `app.disable('x-powered-by')` (suppresses framework technology disclosure).

#### 3.3. Automated Regression Testing (`npm test`)
- Built an automated test suite in `app/test/security.test.js` using Node's native test runner (`node --test`).
- Asserts that:
  - `<script>alert("xss")</script>` is encoded to `&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;`.
  - Format tags (`<u>`) are encoded to `&lt;u&gt;`.
  - Security headers (`nosniff`, `DENY`, strict CSP) are present on all responses.
  - Session cookies contain `HttpOnly`, `Secure`, and `SameSite=Strict`.
- Result: **4 of 4 tests passing (100% PASS)**.

#### 3.4. Dependency Supply Chain Remediation (SCA)
- Upgraded `express` to `^4.22.3` and `cookie-parser` to `^1.4.7` in `app/package.json`.
- Output: `npm audit` reports `found 0 vulnerabilities`, resolving all 14 Dependabot alerts (ReDoS and DoS advisories).

#### 3.5. Pull Request & CI Verification
- All remediation commits were pushed to branch `security/lab-fsi` and submitted via [Pull Request #10](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/pull/10).
- GitHub Actions CI re-ran CodeQL and Semgrep on the PR, passing with zero code findings.

---

### Step 4: Quick Live Verification Commands for the Professor (Both Speakers)

During the live demonstration, run these commands to prove the remediation to the professor in real time:

1. **Demonstrate XSS Sanitization:**
   ```bash
   curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"
   ```
   *Verified Output:* Contains `&lt;u&gt;Prueba_Controlada_FDSI&lt;/u&gt;`. The tag is neutral text and cannot execute.

2. **Demonstrate Cookie & Header Hardening:**
   ```bash
   curl -i http://localhost:8080/api/v1/auth/session
   ```
   *Verified Output:* Shows `Set-Cookie: ... HttpOnly; Secure; SameSite=Strict`, `X-Frame-Options: DENY`, and strict `Content-Security-Policy`.

3. **Run Automated Regression Tests:**
   ```bash
   cd app && npm test
   ```
   *Verified Output:* `4 pass, 0 fail` in less than 500ms.

4. **Verify Supply Chain Health:**
   ```bash
   npm audit
   ```
   *Verified Output:* `found 0 vulnerabilities`.
