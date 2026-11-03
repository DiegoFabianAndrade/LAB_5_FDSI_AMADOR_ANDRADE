# Laboratorio 05: Seguridad de Aplicaciones (SAST, DAST, SCA y Pentesting)

**Institución:** Escuela Colombiana de Ingeniería Julio Garavito  
**Asignatura:** Fundamentos de Seguridad de la Información (FDSI)  
**Periodo Académico:** 2026-02  
**Integrantes:**
- Diego Fabián Andrade Durán
- Felipe Amador González

---

## 1. Descripción del Proyecto

Este repositorio contiene la infraestructura y código fuente del portal **MuvAutomation Incident Hub**, utilizado como caso práctico para la integración de controles continuos de seguridad en el ciclo de vida de desarrollo de software (DevSecOps).

El objetivo principal es implementar, auditar y mitigar riesgos técnicos mediante herramientas automatizadas de análisis estático (SAST con Semgrep y CodeQL), detección de credenciales (Secret Scanning y Gitleaks), análisis de composición de software (SCA con Dependabot) y análisis dinámico de aplicaciones (DAST pasivo con OWASP ZAP), respaldado por pruebas de pentesting controlado y Pull Requests de remediación.

---

## 2. Estructura del Repositorio

```text
├── .github/
│   ├── dependabot.yml              # Configuración de análisis de dependencias (SCA)
│   └── workflows/
│       ├── seguridad-estatica.yml  # Pipeline CI para SAST (Semgrep) y Secretos (Gitleaks)
│       └── dast-staging.yml        # Pipeline manual para DAST pasivo (OWASP ZAP)
├── app/
│   ├── config/                     # Configuraciones de prueba
│   ├── public/                     # Interfaz web y activos estáticos
│   ├── test/                       # Pruebas automatizadas y de regresión
│   ├── package.json                # Dependencias del proyecto
│   └── server.js                   # Lógica del servidor y endpoints REST
├── docs/
│   ├── CHECKLIST_PR.md             # Lista de verificación de seguridad para Pull Requests
│   ├── README_INTEGRACION.md       # Guía de integración de controles
│   ├── REPORTE_HALLAZGOS.md        # Informe técnico detallado de vulnerabilidades
│   └── SECURITY.md                 # Registro de línea base, alcance y evidencias
└── AppSec_Lab_FSI.html             # Tablero interactivo de seguimiento de etapas
```

---

## 3. Enlaces Rápidos a la Documentación de Seguridad

- [Informe de Seguridad y Evidencias](docs/SECURITY.md)
- [Reporte Técnico de Hallazgos](docs/REPORTE_HALLAZGOS.md)
- [Checklist de Seguridad para PR](docs/CHECKLIST_PR.md)

---

## 4. Instrucciones de Ejecución Local

### Prerrequisitos
- Node.js (v18+)
- npm (v9+)

### Instalación y Despliegue
```bash
cd app
npm install
npm start
```
El servidor quedará disponible en `http://localhost:8080`.
