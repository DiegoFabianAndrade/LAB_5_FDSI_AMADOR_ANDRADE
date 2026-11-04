# Informe Tecnico de Hallazgos de Seguridad

**Integrantes:**
- Diego Fabian Andrade Duran
- Felipe Amador Gonzalez  
**Institucion:** Escuela Colombiana de Ingenieria Julio Garavito  
**Asignatura:** Fundamentos de Seguridad de la Informacion (FDSI)  
**Repositorio:** `https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE`  
**Entorno:** Staging local (`http://localhost:8080`)  

---

## 1. Resumen general

Durante este laboratorio evaluamos la seguridad de la aplicacion web utilizando herramientas en diferentes etapas:
- Analisis estatico (SAST) con Semgrep y CodeQL.
- Deteccion de credenciales y secretos con Gitleaks.
- Analisis de dependencias (SCA) con Dependabot y npm audit.
- Analisis dinamico pasivo (DAST) con OWASP ZAP.
- Pruebas manuales controladas (Pentesting).

Los hallazgos principales fueron:
1. **XSS Reflejado en la busqueda (CWE-79):** En el endpoint `/api/v1/search`, el parametro `q` se concatenaba directamente en el HTML devuelto sin sanitizar.
2. **Cookies de sesion sin flags de seguridad (CWE-1004):** La cookie de autenticacion no tenia configurados los atributos `HttpOnly`, `Secure` ni `SameSite`, y la politica de CSP permitia scripts inline.
3. **Dependencias desactualizadas (SCA):** Version de Express desactualizada en `package.json` con vulnerabilidades reportadas en Dependabot.

Todas estas vulnerabilidades fueron corregidas en la rama `security/lab-fsi` y se verificaron con pruebas automatizadas (`npm test`).

---

## 2. Metodologia de evaluacion

El proceso de analisis se desarrollo en el siguiente orden:
Linea Base -> SAST (Semgrep y CodeQL) -> Deteccion de secretos -> SCA (Dependabot) -> DAST pasivo (ZAP) -> Pentesting manual -> Remediacion -> Pruebas de regresion

---

## 3. Detalle de los hallazgos

### Hallazgo 1: Cross-Site Scripting (XSS) Reflejado en la busqueda
- **Descripcion:** En el endpoint `GET /api/v1/search`, la aplicacion recibia el parametro `q` y lo insertaba directamente en la respuesta HTML sin escapar caracteres especiales.
- **Clasificacion:** CWE-79 / OWASP A03:2021 (Inyeccion).
- **Severidad:** Alta. Si un atacante envia un enlace con codigo JavaScript malicioso a un usuario autenticado, el script se ejecuta en el navegador de la victima.
- **Herramientas que lo detectaron:**
  - CodeQL: regla `js/reflected-xss` en `app/server.js`.
  - Semgrep: regla `javascript.express.security.injection.raw-html-format`.
- **Codigo vulnerable original:**
  ```javascript
  const query = req.query.q || '';
  const respuestaHtml = `<h2>Resultados para la consulta: ${query}</h2>`;
  res.send(respuestaHtml);
  ```
- **Validacion manual (Pentest):**
  Se probo la peticion:
  ```bash
  curl -s "http://localhost:8080/api/v1/search?q=%3Cu%3EPrueba_Controlada_FDSI%3C%2Fu%3E"
  ```
  El servidor respondio con la etiqueta `<u>` en claro, confirmando que el HTML se interpretaba directamente.
- **Correccion aplicada:**
  Se creo la funcion `escapeHtml()` para sanitizar los caracteres `< > & " '` antes de generar el HTML:
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
- **Verificacion:**
  Al repetir la peticion, el servidor devuelve `&lt;u&gt;Prueba_Controlada_FDSI&lt;/u&gt;`, asegurando que el navegador solo lo interprete como texto plano. Tambien se valida en los tests con `npm test`.

---

### Hallazgo 2: Cookie de sesion sin atributos de seguridad
- **Descripcion:** La cookie `auth_token` generada en `/api/v1/auth/session` se enviaba sin los flags `HttpOnly`, `Secure` ni `SameSite`.
- **Clasificacion:** CWE-1004 / OWASP A05:2021 (Configuracion Incorrecta de Seguridad).
- **Severidad:** Media. Al no tener `HttpOnly`, cualquier script inyectado mediante XSS puede leer la cookie con `document.cookie` y robar la sesion.
- **Herramienta que lo detecto:**
  - OWASP ZAP (Alerta 10010 - Cookie No HttpOnly Flag).
- **Correccion aplicada:**
  Se modifico la configuracion de la cookie en `app/server.js`:
  ```javascript
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000,
    path: '/'
  });
  ```
- **Verificacion:**
  Se comprobo con `curl -i http://localhost:8080/api/v1/auth/session` que la respuesta incluye `HttpOnly; Secure; SameSite=Strict`.

---

### Hallazgo 3: Cabeceras HTTP permisivas y falta de proteccion contra Clickjacking
- **Descripcion:** Faltaban cabeceras de seguridad como `X-Frame-Options` y la cabecera `Content-Security-Policy` tenia habilitado `'unsafe-inline'`. Ademas, se mostraba la cabecera `X-Powered-By`.
- **Clasificacion:** CWE-1021 / OWASP A05:2021.
- **Severidad:** Media.
- **Herramienta que lo detecto:**
  - OWASP ZAP (Alertas de Content Security Policy y X-Frame-Options).
- **Correccion aplicada:**
  Se anadio middleware en `app/server.js` para forzar politicas estrictas:
  ```javascript
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';");
  app.disable('x-powered-by');
  ```

---

### Hallazgo 4: Dependencias vulnerables (SCA)
- **Descripcion:** La version inicial de `express` (4.19.2) contenia dependencias transitivas con problemas conocidos de ReDoS y Denegacion de Servicio.
- **Clasificacion:** CWE-1333 / OWASP A06:2021.
- **Severidad:** Alta.
- **Herramientas que lo detectaron:**
  - Dependabot (14 alertas de seguridad).
  - `npm audit` (8 vulnerabilidades reportadas).
- **Correccion aplicada:**
  Se actualizaron las versiones en `app/package.json` a `express@^4.22.3` y `cookie-parser@^1.4.7`.
- **Verificacion:**
  Se ejecuto `npm audit` obteniendo `0 vulnerabilities`.

---

## 4. Analisis de falsos positivos y decisiones

- **XSS en busqueda:** Verdadero positivo. Se pudo comprobar tanto con las herramientas estaticas (CodeQL y Semgrep) como manualmente enviando una etiqueta `<u>` en la peticion HTTP.
- **Advertencia de Semgrep sobre tags en GitHub Actions:** Semgrep sugiere usar hashes SHA en lugar de tags (`actions/checkout@v4`). Para un proyecto de laboratorio usamos las versiones oficiales de GitHub, por lo que se acepta esta advertencia sin riesgo para el codigo de la aplicacion.

---

## 5. Conclusiones

1. Las herramientas de analisis estatico como Semgrep y CodeQL permiten identificar vulnerabilidades desde etapas tempranas, pero siempre es necesario validar manualmente los hallazgos para entender el impacto real.
2. El analisis dinamico con OWASP ZAP complementa al SAST evaluando como responde la aplicacion en ejecucion, especialmente respecto a cabeceras y cookies que no siempre se detectan solo leyendo codigo fuente.
3. Aplicar una estrategia de defensa en profundidad (sanitizar entradas, proteger cookies y configurar cabeceras) garantiza que si un control falla, los demas evitan un compromiso mayor del sistema.
