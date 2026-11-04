const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('Seguridad - Prevencion de XSS Reflejado en busqueda (/api/v1/search)', async () => {
  const payload = '<script>alert("xss")</script>';
  const encodedPayload = encodeURIComponent(payload);
  const res = await fetch(`${baseUrl}/api/v1/search?q=${encodedPayload}`);
  const body = await res.text();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.includes('<script>'), false, 'Fallo: Se detecto etiqueta <script> en claro en la respuesta HTML');
  assert.strictEqual(body.includes('</script>'), false, 'Fallo: Se detecto cierre de etiqueta </script> en claro');
  assert.strictEqual(body.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'), true, 'Fallo: El payload no fue correctamente saneado a entidades HTML');
});

test('Seguridad - Sanitizacion de etiquetas HTML arbitrarias (Pentest <u>)', async () => {
  const payload = '<u>Prueba_Controlada_FDSI</u>';
  const encodedPayload = encodeURIComponent(payload);
  const res = await fetch(`${baseUrl}/api/v1/search?q=${encodedPayload}`);
  const body = await res.text();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.includes('<u>Prueba_Controlada_FDSI</u>'), false, 'Fallo: La etiqueta <u> fue reflejada sin escapar');
  assert.strictEqual(body.includes('&lt;u&gt;Prueba_Controlada_FDSI&lt;/u&gt;'), true, 'Exito: Etiqueta <u> codificada a entidades seguras');
});

test('Seguridad - Validacion de Cabeceras HTTP Hardened', async () => {
  const res = await fetch(`${baseUrl}/api/v1/status`);

  assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
  assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
  const csp = res.headers.get('content-security-policy');
  assert.ok(csp, 'Cabecera CSP ausente');
  assert.strictEqual(csp.includes("'unsafe-inline' in script-src"), false);
  assert.strictEqual(csp.includes("frame-ancestors 'none'"), true);
  assert.strictEqual(res.headers.get('x-powered-by'), null, 'Fallo: Fuga de cabecera X-Powered-By');
});

test('Seguridad - Proteccion de Cookie de Sesion (HttpOnly, Secure, SameSite)', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/session`);
  const setCookie = res.headers.get('set-cookie');

  assert.strictEqual(res.status, 200);
  assert.ok(setCookie, 'Fallo: Cabecera Set-Cookie no fue emitida');
  assert.ok(setCookie.includes('HttpOnly'), 'Fallo: Cookie no contiene directiva HttpOnly');
  assert.ok(setCookie.includes('Secure'), 'Fallo: Cookie no contiene directiva Secure');
  assert.ok(setCookie.includes('SameSite=Strict'), 'Fallo: Cookie no contiene directiva SameSite=Strict');
});
