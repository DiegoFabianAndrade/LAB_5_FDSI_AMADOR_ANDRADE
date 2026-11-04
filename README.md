# Laboratorio 05 - Seguridad de Aplicaciones (SAST, DAST y Pentesting)

**Integrantes:**
- Diego Fabian Andrade Duran
- Felipe Amador Gonzalez

**Materia:** Fundamentos de Seguridad de la Informacion (FDSI)  
**Institucion:** Escuela Colombiana de Ingenieria Julio Garavito  

---

## Descripcion
En este repositorio se encuentra el desarrollo del Laboratorio 5 de seguridad de aplicaciones. Aplicamos diferentes herramientas de seguridad sobre una aplicacion web en Node.js y Express:
- **SAST:** Analisis estatico de codigo con Semgrep y CodeQL.
- **Deteccion de secretos:** Escaneo con Gitleaks para evitar credenciales o tokens expuestos.
- **SCA:** Revision de dependencias con Dependabot y npm audit.
- **DAST:** Analisis dinamico pasivo con OWASP ZAP.
- **Pentesting:** Prueba manual controlada para validar la falla de XSS reflejado.
- **Remediacion:** Correccion del XSS, proteccion de cookies y cabeceras de seguridad, y creacion de pruebas unitarias con Pull Request.

---

## Enlaces a documentos y reportes
- [Reporte tecnico de hallazgos](docs/REPORTE_HALLAZGOS.md)
- [Evidencias de escaneos y pruebas](docs/SECURITY.md)
- [Checklist del Pull Request](docs/CHECKLIST_PR.md)
- [Reporte HTML de OWASP ZAP](reports/zap-report.html)
- [Tablero del laboratorio](AppSec_Lab_FSI.html)
- [Pull Request de remediacion (#10)](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/pull/10)

---

## Como ejecutar el proyecto

1. Instalar dependencias:
   ```bash
   cd app
   npm install
   ```

2. Ejecutar las pruebas de seguridad:
   ```bash
   npm test
   ```

3. Iniciar el servidor local:
   ```bash
   npm start
   ```
   La aplicacion se abre en `http://localhost:8080`.

---

## Guia para la sustentacion

### 1. Comandos para la demostracion en vivo
Con estos comandos le mostramos al profesor las vulnerabilidades corregidas:

- **Probar el XSS reflejado corregido:**
  Hacer una peticion con una etiqueta HTML de prueba:
  ```bash
  curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"
  ```
  *Resultado:* Devuelve `&lt;u&gt;Prueba_Controlada_FDSI&lt;/u&gt;`. La entrada queda escapada como texto plano y el navegador no interpreta la etiqueta.

- **Verificar cookies y cabeceras de seguridad:**
  Consultar el endpoint de autenticacion:
  ```bash
  curl -i http://localhost:8080/api/v1/auth/session
  ```
  *Resultado:* Muestra `Set-Cookie: ... HttpOnly; Secure; SameSite=Strict`, `X-Frame-Options: DENY` y la cabecera `Content-Security-Policy`.

- **Correr los tests automatizados:**
  ```bash
  cd app && npm test
  ```
  *Resultado:* Pasan las 4 pruebas unitarias de seguridad.

- **Verificar dependencias (SCA):**
  ```bash
  npm audit
  ```
  *Resultado:* 0 vulnerabilidades.

---

### 2. Sustentacion en ingles (Q&A de 5 minutos)

Resumen de las 3 preguntas clave divididas entre Diego y Felipe:

#### Question 1: What was the most critical vulnerability found?
*(Diego)*
The most critical vulnerability was a **Reflected XSS (CWE-79)** in the search endpoint (`/api/v1/search?q=...`), combined with **insecure session cookies (CWE-1004)**. The user input was being reflected directly into the HTML without any sanitization or escaping. Additionally, the session cookie lacked the `HttpOnly` and `Secure` flags, and the CSP allowed unsafe inline scripts. This meant an attacker could send a malicious link to an analyst, execute JavaScript in their browser, and steal their session token through `document.cookie` (session hijacking).

#### Question 2: How did we find it?
*(Diego)*
We found it using three security layers:
1. **SAST:** CodeQL flagged `js/reflected-xss` at line 95 of `app/server.js`, and Semgrep detected unescaped HTML concatenation (`raw-html-format`).
2. **DAST:** OWASP ZAP reported that the session cookie was missing the `HttpOnly` attribute and detected a permissive Content Security Policy.
3. **Manual Pentest:** We tested the endpoint with a harmless probe:
   ```bash
   curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"
   ```
   In the original code, the server returned raw `<u>` tags without escaping, confirming that script tags would execute in the browser.

#### Question 3: How did we solve it?
*(Felipe)*
We applied a defense-in-depth fix:
1. **Input sanitization:** We implemented an `escapeHtml()` function in `server.js` that escapes dangerous characters (`<`, `>`, `&`, `"`, `'`) before inserting them into HTML.
2. **Cookie protection:** We added `httpOnly: true`, `secure: true`, and `sameSite: 'strict'` to the session cookie so JavaScript cannot access it.
3. **Security headers:** We added `Content-Security-Policy: default-src 'self'` and `X-Frame-Options: DENY`.
4. **Dependency updates:** We updated `express` and `cookie-parser`, resolving all 14 Dependabot alerts (`npm audit` now shows 0 vulnerabilities).
5. **Testing and PR:** We created 4 automated regression tests in `test/security.test.js` and submitted all fixes via Pull Request #10.
