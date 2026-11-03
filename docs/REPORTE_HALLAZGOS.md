# Informe Técnico de Hallazgos de Seguridad

**Proyecto:** MuvAutomation Incident Hub  
**Integrantes:**
- Diego Fabián Andrade Durán
- Felipe Amador González  
**Institución:** Escuela Colombiana de Ingeniería Julio Garavito  
**Asignatura:** Fundamentos de Seguridad de la Información (FDSI) — 2026-02  
**Repositorio:** `https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE`  
**Commit de Línea Base:** `9101d191aec1967f3814462f4d0fcc99131e17f2`  
**Entorno Autorizado:** Staging local controlado (`http://localhost:8080`)  
**Fecha de Evaluación:** 3 de Noviembre de 2026  

---

## 1. Resumen Ejecutivo

Durante el desarrollo del Laboratorio 05, se ejecutó una evaluación integral de seguridad sobre la arquitectura y base de código de la plataforma web **MuvAutomation Incident Hub**. Para ello, se articuló una estrategia DevSecOps basada en cinco capas complementarias: análisis estático (SAST con Semgrep y CodeQL), detección de secretos (Gitleaks y GitHub Secret Scanning), análisis de composición de software (SCA con Dependabot y npm audit), análisis dinámico pasivo (DAST con OWASP ZAP Baseline) y validación manual de hipótesis mediante técnicas de pentesting no destructivo.

Los tres riesgos principales identificados fueron:
1. **Inyección de código del lado del cliente (Reflected XSS - CWE-79):** Identificado en el endpoint de búsqueda `/api/v1/search`, donde el parámetro de consulta `q` era interpolado directamente en el cuerpo HTML sin validación ni codificación contextual.
2. **Deficiencias en la configuración de cabeceras y cookies de sesión (CWE-1004 / CWE-1021):** Ausencia del atributo `HttpOnly` y `Secure` en cookies de autenticación, sumado a una política de seguridad de contenido (CSP) excesivamente permisiva con directiva `'unsafe-inline'`.
3. **Uso de dependencias de terceros vulnerables (SCA / ReDoS y DoS en bibliotecas base):** Presencia de versiones de `express` y sus submódulos (`body-parser`, `path-to-regexp`, `cookie`, `send`) con avisos de seguridad críticos abiertos en Dependabot.

Todos los hallazgos críticos fueron debidamente remediados en la rama `security/lab-fsi`, implementando funciones de codificación de entidades HTML, middleware de endurecimiento de cabeceras HTTP, parametrización segura de cookies y actualización a dependencias parcheadas. La eficacia de las correcciones fue validada mediante un conjunto automatizado de pruebas unitarias y de regresión (`npm test`).

---

## 2. Metodología de Evaluación

El proceso siguió rigurosamente la secuencia de ejecución establecida para entornos de pruebas autorizados:
$$\text{Alcance y Línea Base} \longrightarrow \text{SAST (Semgrep / CodeQL)} \longrightarrow \text{Secret Detection} \longrightarrow \text{SCA (Dependabot)} \longrightarrow \text{DAST Pasivo} \longrightarrow \text{Pentesting Controlado} \longrightarrow \text{Remediación} \longrightarrow \text{Reanálisis y Regresión}$$

---

## 3. Detalle de Hallazgos Identificados

### Hallazgo F-01: Cross-Site Scripting Reflejado en Búsqueda de Alertas
- **Título:** Reflected Cross-Site Scripting (XSS) vía parámetro de consulta HTTP.
- **Categoría OWASP / CWE:** OWASP Top 10 A03:2021 — Inyección | CWE-79: Improper Neutralization of Input During Web Page Generation.
- **Severidad y Justificación:** **Alta** (CVSS v3.1: 7.5 - `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N`). Un atacante podría engañar a un operador para hacer clic en un enlace malicioso que ejecute scripts en el contexto de la aplicación, facilitando el robo de tokens o la ejecución de acciones no autorizadas.
- **Evidencia Técnica (Línea Base):**
  - **Detección CodeQL:** Alerta `js/reflected-xss` en `app/server.js:95`.
  - **Detección Semgrep:** Regla `javascript.express.security.injection.raw-html-format.raw-html-format`.
  - **Código vulnerable original:**
    ```javascript
    const query = req.query.q || '';
    const respuestaHtml = `<h2>Resultados para la consulta: ${query}</h2>`;
    res.send(respuestaHtml);
    ```
- **Impacto:**
  - *Confidencialidad:* Alta (potencial exfiltración de cookies no protegidas o datos sensibles visualizados).
  - *Integridad:* Alta (capacidad de manipular el DOM y alterar el comportamiento visual del portal).
  - *Disponibilidad:* Baja (no compromete directamente el tiempo de actividad del servicio backend).
- **Pasos de Validación Segura (Pentest Controlado):**
  1. Se envió una petición inocua al entorno local: `GET /api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E`.
  2. Se analizó la respuesta HTTP generada: el servidor devolvió código `200 OK` con la etiqueta HTML `<u>` renderizada en claro dentro del elemento `<h2>`.
- **Medida de Remediación Aplicada:**
  Se desarrolló la función defensiva `escapeHtml()` para neutralizar metacaracteres HTML (`<`, `>`, `&`, `"`, `'`):
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
  El valor devuelto se codifica antes de insertarse en el cuerpo de la respuesta, garantizando que el navegador lo interprete exclusivamente como texto plano.
- **Resultado del Reescaneo y Prueba de Regresión:**
  - Al reenviar la petición de prueba, la respuesta reflejó `&lt;u&gt;Prueba_Controlada_FDSI&lt;/u&gt;`.
  - La prueba unitaria automatizada en `app/test/security.test.js` confirmó que la etiqueta `<script>` y metacaracteres HTML quedan completamente neutralizados.

---

### Hallazgo F-02: Emisión de Cookie de Sesión sin Flags de Seguridad
- **Título:** Falta de atributos `HttpOnly`, `Secure` y `SameSite` en cookie de autenticación.
- **Categoría OWASP / CWE:** OWASP Top 10 A05:2021 — Configuración de Seguridad Incorrecta | CWE-1004 (Sensitive Cookie Without 'HttpOnly' Flag) y CWE-614 (Sensitive Cookie in HTTPS Session Without 'Secure' Attribute).
- **Severidad y Justificación:** **Media** (CVSS v3.1: 5.3). Al no contar con `HttpOnly`, cualquier vulnerabilidad de XSS (como la identificada en F-01) permite que scripts del atacante lean directamente la cookie mediante `document.cookie`.
- **Evidencia Técnica (Línea Base):**
  - **Detección OWASP ZAP Baseline:** Alerta ID `10010` (Cookie No HttpOnly Flag).
  - **Cabecera original observada:**
    `Set-Cookie: auth_token=sess_mock_test_token_fdsi_987654; Path=/`
- **Impacto:**
  - *Confidencialidad:* Alta (fuga de credenciales de sesión ante ataques en el cliente).
  - *Integridad:* Media (secuestro de sesión del usuario).
  - *Disponibilidad:* Nula.
- **Medida de Remediación Aplicada:**
  Se reconfiguró la llamada en `app/server.js`:
  ```javascript
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000,
    path: '/'
  });
  ```
- **Resultado del Reescaneo:**
  - Cabecera verificada: `Set-Cookie: auth_token=...; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Strict`.
  - La prueba de regresión validó automáticamente la presencia de todos los atributos de protección.

---

### Hallazgo F-03: Componentes de Terceros con Vulnerabilidades Conocidas (SCA)
- **Título:** Dependencias de Node.js desactualizadas sujetas a ReDoS y Denegación de Servicio.
- **Categoría OWASP / CWE:** OWASP Top 10 A06:2021 — Componentes Vulnerables y Desactualizados | CWE-1333: Inefficient Regular Expression Complexity & CWE-400: Uncontrolled Resource Consumption.
- **Severidad y Justificación:** **Alta** (Advisories GitHub: GHSA-qwcr-r2fm-qrc7, GHSA-9wv6-86v2-598j). Afecta a `express 4.19.2` y sus dependencias transitivas (`body-parser`, `path-to-regexp`, `qs`, `send`).
- **Evidencia Técnica:**
  - `npm audit` reportó 8 vulnerabilidades (3 de severidad alta, 1 moderada, 4 bajas).
  - Dependabot generó 14 alertas automáticas y 8 Pull Requests de actualización en el repositorio.
- **Impacto:**
  - *Disponibilidad:* Alta (ataques de expresiones regulares lentas pueden bloquear el bucle de eventos de Node.js).
  - *Integridad y Confidencialidad:* Baja.
- **Medida de Remediación Aplicada:**
  Se actualizaron las bibliotecas principales a `express@^4.22.3` y `cookie-parser@^1.4.7` en `app/package.json`, asegurando compatibilidad hacia atrás y resolviendo las vulnerabilidades en subdependencias.
- **Resultado del Reescaneo:**
  - Ejecución de `npm audit` arrojó: `found 0 vulnerabilities`.

---

## 4. Análisis de Falsos Positivos vs. Verdaderos Positivos

1. **Verdadero Positivo — XSS Reflejado en `app/server.js`:**
   - *Clasificación:* Verdadero Positivo.
   - *Justificación:* Tanto Semgrep como CodeQL identificaron un flujo de datos real donde la entrada del usuario no confiable (`req.query.q`) alcanzaba la salida del navegador sin una capa intermedia de saneamiento. La confirmación práctica mediante pentesting inocuo corroboró la presencia del fallo.
2. **Falsa Alarma / Hallazgo Contextual No Crítico — Versionamiento de GitHub Actions:**
   - *Clasificación:* Riesgo Informacional / Falsa Alarma Operativa.
   - *Justificación:* Semgrep reportó la regla `github-actions-mutable-action-tag` debido al uso de etiquetas semánticas como `actions/checkout@v4` o `actions/setup-python@v5`. Si bien la regla aconseja fijar hashes SHA inmutables para mitigar riesgos de cadena de suministro teóricos, en el entorno de desarrollo y laboratorio universitario el uso de versiones mayores oficiales es el estándar recomendado para recibir actualizaciones de seguridad transparentes sin comprometer la ejecución de los pipelines.

---

## 5. Reflexión Final y Conclusiones DevSecOps

1. **Aportes y limitaciones de las herramientas automatizadas:**
   - *SAST (Semgrep y CodeQL):* Fueron fundamentales para descubrir fallos en etapas tempranas de codificación (Shift-Left). Sin embargo, reglas puramente sintácticas pueden alertar advertencias sobre estructuras de plantillas incluso cuando se emplea codificación segura manual, requiriendo validación experta (triage).
   - *SCA (Dependabot):* Automatiza de forma sobresaliente el monitoreo del árbol de dependencias transitivas, evitando que bibliotecas vulnerables permanezcan desatendidas. No obstante, se debe validar la compatibilidad antes de fusionar actualizaciones mayores a ciegas.
   - *DAST (OWASP ZAP):* Evalúa la aplicación en tiempo de ejecución, detectando fallos de transporte, cabeceras de respuesta y comportamiento dinámico que escapan al análisis de código fuente estático.
2. **Integración en el Ciclo de Vida del Software:**
   - La implementación de controles como validaciones en Pull Requests (vía GitHub Actions), políticas de branch protection y pruebas unitarias de seguridad automatizadas permite que la seguridad deje de ser un cuello de botella de última hora y se convierta en una propiedad intrínseca y verificable del software desde su origen.
