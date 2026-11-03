# Laboratorio 05: Seguridad de Aplicaciones (SAST, DAST, SCA y Pentesting)

[![Seguridad estática - SAST y secretos](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/actions/workflows/seguridad-estatica.yml/badge.svg)](https://github.com/DiegoFabianAndrade/LAB_5_FDSI_AMADOR_ANDRADE/actions/workflows/seguridad-estatica.yml)

**Institución:** Escuela Colombiana de Ingeniería Julio Garavito  
**Asignatura:** Fundamentos de Seguridad de la Información (FDSI)  
**Periodo Académico:** 2026-02  
**Integrantes:**
- Diego Fabián Andrade Durán
- Felipe Amador González

---

## 1. Descripción del Proyecto

Este repositorio contiene la implementación del portal **MuvAutomation Incident Hub**, utilizado como base técnica para el Laboratorio 05 de Fundamentos de Seguridad de la Información. En este ejercicio se integraron y validaron controles de seguridad profesionales a lo largo del ciclo de vida del software (DevSecOps), cubriendo:
- **SAST (Static Application Security Testing):** Análisis continuo de código con Semgrep OSS y GitHub CodeQL Default Setup.
- **Secret Detection:** Prevención y escaneo de credenciales expuestas con Gitleaks y GitHub Secret Scanning.
- **SCA (Software Composition Analysis):** Detección y remediación de dependencias vulnerables con GitHub Dependabot y `npm audit`.
- **DAST Pasivo (Dynamic Application Security Testing):** Auditoría en tiempo de ejecución con OWASP ZAP Baseline.
- **Pentesting Controlado:** Confirmación práctica no destructiva de hipótesis de riesgo en staging local autorizado.
- **Remediación Verificable:** Corrección de hallazgos mediante Pull Request y pruebas automatizadas de regresión (`npm test`).

---

## 2. Enlaces Rápidos a la Documentación Técnica

- 📄 **[Informe de Seguridad y Evidencias](docs/SECURITY.md)**
- 📋 **[Reporte Técnico de Hallazgos y Análisis](docs/REPORTE_HALLAZGOS.md)**
- 🔍 **[Checklist de Seguridad para Pull Request](docs/CHECKLIST_PR.md)**
- 🌐 **[Tablero Interactivo del Laboratorio (8 Etapas)](AppSec_Lab_FSI.html)**
- 📊 **[Reporte DAST Pasivo OWASP ZAP (HTML)](reports/zap-report.html)**

---

## 3. Estructura del Proyecto

```text
├── .github/
│   ├── dependabot.yml              # Configuración de análisis de dependencias (SCA)
│   └── workflows/
│       ├── seguridad-estatica.yml  # Pipeline CI para SAST (Semgrep) y Secretos (Gitleaks)
│       └── dast-staging.yml        # Pipeline para DAST pasivo sobre staging (OWASP ZAP)
├── app/
│   ├── config/                     # Variables de entorno y configuraciones de prueba
│   ├── public/                     # Portal web y activos estáticos
│   ├── test/                       # Pruebas automatizadas y de regresión de seguridad
│   ├── package.json                # Dependencias del proyecto (parcheadas a versiones seguras)
│   └── server.js                   # Lógica backend segura con saneamiento y cabeceras
├── docs/
│   ├── CHECKLIST_PR.md             # Lista de verificación obligatoria para PRs
│   ├── README_INTEGRACION.md       # Guía metodológica de integración
│   ├── REPORTE_HALLAZGOS.md        # Informe formal de vulnerabilidades (F-01 a F-04)
│   └── SECURITY.md                 # Registro de línea base, alcance y evidencias antes/después
├── reports/                        # Evidencias en bruto descargadas de los escaneos
│   ├── semgrep.json                # Resultado inicial de SAST Semgrep
│   ├── semgrep-remediated.json     # Reescaneo post-remediación de Semgrep
│   ├── gitleaks-results.sarif      # Resultado de escaneo de secretos
│   ├── zap-report.html             # Informe visual HTML de OWASP ZAP
│   └── zap-report.json             # Informe estructurado JSON de OWASP ZAP
└── AppSec_Lab_FSI.html             # Tablero interactivo con las 8 etapas completadas
```

---

## 4. Instrucciones de Ejecución y Validación Local

### 4.1. Instalación de dependencias
```bash
cd app
npm install
```

### 4.2. Ejecución de la suite de pruebas de regresión
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
El portal estará disponible en `http://localhost:8080`.
