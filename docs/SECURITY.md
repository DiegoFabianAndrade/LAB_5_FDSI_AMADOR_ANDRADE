# Seguridad del proyecto — Evidencia del Laboratorio 05

**Institución:** Escuela Colombiana de Ingeniería Julio Garavito  
**Asignatura:** Fundamentos de Seguridad de la Información (FDSI) — Grupo 2602  
**Integrantes:**
- Diego Fabián Andrade Durán
- Felipe Amador González

---

## 1. Alcance autorizado
- **Repositorio:** `https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE`
- **Rama evaluada y commit de línea base:** Rama `main` / Commit SHA: `9101d191aec1967f3814462f4d0fcc99131e17f2`
- **Rama de remediación:** Rama `security/lab-fsi`
- **URL de staging propio:** `http://localhost:8080` (Entorno local aislado y controlado para laboratorio académico)
- **Responsables y autorización:** Diego Fabián Andrade Durán y Felipe Amador González (3 de Noviembre de 2026). Pruebas autorizadas bajo los lineamientos académicos de la materia FDSI.
- **Fuera de alcance:** Sistemas en producción, plataformas de terceros, denegación de servicio distribuida (DDoS), inyecciones destructivas y uso de credenciales o información personal real.

---

## 2. Línea base y herramientas integradas

| Herramienta | Tipo | Fecha | Resultado | Enlace a evidencia |
|---|---|---|---|---|
| **CodeQL Default Setup** | SAST | 03/11/2026 | 1 Hallazgo Crítico (`js/reflected-xss`) en `app/server.js:95` | [CodeQL Alert #1 en GitHub](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/security/code-scanning) |
| **Semgrep OSS** | SAST | 03/11/2026 | 1 Hallazgo Verdadero Positivo (`raw-html-format` / XSS) y 7 advertencias de configuración CI | `reports/semgrep.json` / Workflow Run GitHub Actions #41715844565 |
| **Gitleaks & GitHub Secret Scanning** | Detección de Secretos | 03/11/2026 | 0 secretos reales expuestos. Repositorio limpio de claves privadas | `reports/results.sarif` / Pestaña Security en GitHub |
| **Dependabot & npm audit** | SCA | 03/11/2026 | 14 alertas abiertas (8 dependencias vulnerables: `express`, `cookie`, `body-parser`, `path-to-regexp`, `send`, `qs`) | [Dependabot Alerts](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/security/dependabot) |
| **OWASP ZAP Baseline** | DAST pasivo | 03/11/2026 | 3 alertas medias (CSP permisiva con `unsafe-inline`, ausencia de atributo `HttpOnly`, omisión de `X-Frame-Options`) | `reports/zap-report.html` y `reports/zap-report.json` |

---

## 3. Hallazgos y gestión de vulnerabilidades

| ID | Categoría OWASP / CWE | Descripción sin secretos | Riesgo | Archivo / Ruta | Cambio propuesto | Estado |
|---|---|---|---|---|---|---|
| **F-01** | A03:2021 - Injection / CWE-79 (Reflected XSS) | El parámetro `q` en `/api/v1/search` se interpolaba directamente en el cuerpo HTML sin saneamiento de caracteres especiales. | **Alto** | `app/server.js:95` | Implementar codificación de entidades HTML con `escapeHtml()` y sanitizar toda salida dinámica. | **Mitigado** |
| **F-02** | A05:2021 - Security Misconfiguration / CWE-1004 & CWE-614 | La cookie de autenticación `auth_token` se expedía sin las directivas `HttpOnly`, `Secure` ni `SameSite=Strict`. | **Medio** | `app/server.js:105` | Configurar los atributos `httpOnly: true`, `secure: true` y `sameSite: 'strict'` en `res.cookie()`. | **Mitigado** |
| **F-03** | A05:2021 - Security Misconfiguration / CWE-1021 | Cabecera `Content-Security-Policy` utilizaba directivas permisivas (`unsafe-inline` y `*`), careciendo además de `X-Frame-Options`. | **Medio** | `app/server.js:20` | Aplicar CSP estricto `default-src 'self'` sin scripts en línea y cabecera `X-Frame-Options: DENY`. | **Mitigado** |
| **F-04** | A06:2021 - Vulnerable Components / CWE-1333 & CWE-400 | Dependencias desactualizadas en `package.json` (`express 4.19.2`, `body-parser`, `cookie`, `send`) con vulnerabilidades ReDoS y DoS. | **Alto** | `app/package.json` | Actualizar a versiones estables y parcheadas (`express@^4.22.3`, `cookie-parser@^1.4.7`). | **Mitigado** |

---

## 4. Validación antes y después

- **Evidencia inicial (Línea base):**
  - **SAST (CodeQL & Semgrep):** Detección de `js/reflected-xss` y `raw-html-format` en `app/server.js` línea 95.
  - **SCA (Dependabot & npm audit):** 8 vulnerabilidades (3 altas, 1 moderada, 4 bajas) registradas en `npm audit` y 14 alertas automáticas en Dependabot.
  - **DAST Pasivo (OWASP ZAP):** Identificación de política CSP permisiva (`unsafe-inline`) y cookie sin `HttpOnly`.
  - **Pentest manual inicial:** Petición `GET /api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E` reflejó directamente la etiqueta `<u>` en la respuesta HTTP 200.
- **Pull Request con corrección:**
  - Pull Request de remediación desde `security/lab-fsi` hacia `main`.
- **Evidencia de reescaneo:**
  - **Pruebas automatizadas de regresión (`npm test`):** 4 pruebas unitarias ejecutadas exitosamente (100% pass) validando mitigación de XSS, codificación de entidades, cabeceras seguras y flags de cookies.
  - **Reanálisis Semgrep:** Supresión total del hallazgo de código en `app/server.js` (`semgrep-remediated.json`).
  - **Reanálisis SCA (`npm audit`):** `found 0 vulnerabilities` tras actualizar el ecosistema a `express@^4.22.3`.
  - **Reanálisis DAST Pasivo:** Generación de `zap-report-remediated.json` con cabeceras estrictas y directiva `SameSite=Strict`.
- **Riesgo residual y decisión:**
  - El riesgo residual en código aplicativo y dependencias directas fue reducido a nivel **Bajo**. Se aceptan temporalmente las advertencias de Semgrep respecto al versionamiento mutable de GitHub Actions (`@v4`), al ser acciones oficiales de GitHub y no representar vectores de ataque explotables en el servicio en ejecución.

---

## 5. Pentest autorizado (Validación controlada de hipótesis)

- **Hipótesis H1 (Cross-Site Scripting Reflejado):**
  - *Hipótesis:* La falta de codificación contextual de entradas en el parámetro `q` permite la inyección de elementos HTML en el navegador de la víctima.
  - *Entorno:* Servidor local aislado `http://localhost:8080`.
  - *Petición inocua enviada:*  
    `GET /api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E HTTP/1.1`  
    `Host: localhost:8080`
  - *Respuesta inicial observada:*  
    `HTTP/1.1 200 OK`  
    `Content-Type: text/html; charset=utf-8`  
    `... <h2>Resultados para la consulta: <u>Prueba_Controlada_FDSI</u></h2> ...`  
    *Resultado inicial:* **Vulnerabilidad confirmada y reproducible.**
  - *Respuesta posterior a remediación:*  
    `HTTP/1.1 200 OK`  
    `... <h2>Resultados para la consulta: &lt;u&gt;Prueba_Controlada_FDSI&lt;/u&gt;</h2> ...`  
    *Resultado final:* **Mitigación verificada exitosamente.**
- **Hipótesis H2 (Exposición de Cookie de Sesión):**
  - *Hipótesis:* La cookie emitida en `/api/v1/auth/session` carece de restricción `HttpOnly`, permitiendo su lectura ante vectores XSS.
  - *Petición inocua enviada:* `GET /api/v1/auth/session`
  - *Respuesta inicial observada:* `Set-Cookie: auth_token=sess_mock_test_token_fdsi_987654; Path=/` (Sin HttpOnly ni Secure).
  - *Respuesta posterior a remediación:* `Set-Cookie: auth_token=...; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Strict`
  - *Resultado final:* **Mitigación verificada exitosamente.**
