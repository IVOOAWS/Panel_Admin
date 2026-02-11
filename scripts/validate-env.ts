#!/usr/bin/env node

/**
 * Script para validar que todas las variables de entorno requeridas están configuradas
 * Ejecutar con: npm run validate:env
 */

const requiredEnvVars = {
  // Base de datos
  DB_HOST: {
    required: true,
    description: 'Host del servidor MySQL',
    defaultValue: 'localhost',
  },
  DB_USER: {
    required: true,
    description: 'Usuario de MySQL',
    defaultValue: 'root',
  },
  DB_PASSWORD: {
    required: false,
    description: 'Contraseña de MySQL',
    defaultValue: '',
  },
  DB_NAME: {
    required: true,
    description: 'Nombre de la base de datos',
    defaultValue: 'paneldelivery',
  },
  DB_PORT: {
    required: false,
    description: 'Puerto de MySQL',
    defaultValue: '3306',
    validate: (value: string) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },

  // API IVOOAPP
  IVOOAPP_API_URL: {
    required: true,
    description: 'URL base de la API IVOOAPP',
    validate: (value: string) => /^https?:\/\/.+/.test(value),
  },
  IVOOAPP_API_KEY: {
    required: true,
    description: 'Bearer Token para autenticación en IVOOAPP',
    minLength: 20,
  },

  // Seguridad
  SESSION_SECRET: {
    required: true,
    description: 'Secreto para sesiones y JWT',
    minLength: 32,
  },

  // Entorno
  NODE_ENV: {
    required: false,
    description: 'Ambiente de ejecución',
    defaultValue: 'development',
    validate: (value: string) =>
      ['development', 'production', 'staging'].includes(value),
  },
};

interface EnvVar {
  required: boolean;
  description: string;
  defaultValue?: string;
  minLength?: number;
  validate?: (value: string) => boolean;
}

const reset = '\x1b[0m';
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';

console.log(`\n${cyan}╔════════════════════════════════════════════════════════╗${reset}`);
console.log(`${cyan}║  Panel Admin IVOO - Validación de Variables de Entorno  ║${reset}`);
console.log(`${cyan}╚════════════════════════════════════════════════════════╝${reset}\n`);

let allValid = true;
let missingRequired: string[] = [];
let warnings: string[] = [];

Object.entries(requiredEnvVars).forEach(([key, config]) => {
  const value = process.env[key];
  const hasValue = value !== undefined && value !== '';

  // Validar si existe
  if (!hasValue) {
    if (config.required) {
      console.log(`${red}✗ ${key}${reset}`);
      console.log(`  ${red}→ REQUERIDO: ${config.description}${reset}`);
      missingRequired.push(key);
      allValid = false;

      if (config.defaultValue) {
        console.log(`  ${yellow}  Valor por defecto: ${config.defaultValue}${reset}`);
      }
    } else {
      console.log(`${yellow}⚠ ${key}${reset}`);
      console.log(`  ${yellow}→ Opcional: ${config.description}${reset}`);
      if (config.defaultValue) {
        console.log(`  ${yellow}  Usando valor por defecto: ${config.defaultValue}${reset}`);
      }
      warnings.push(key);
    }
  } else {
    // Validar contenido
    let isContentValid = true;

    if (config.minLength && value.length < config.minLength) {
      console.log(`${red}✗ ${key}${reset}`);
      console.log(
        `  ${red}→ INSEGURO: Mínimo ${config.minLength} caracteres (tiene ${value.length})${reset}`
      );
      allValid = false;
      isContentValid = false;
    }

    if (config.validate && !config.validate(value)) {
      console.log(`${red}✗ ${key}${reset}`);
      console.log(
        `  ${red}→ INVÁLIDO: El valor no cumple con el formato requerido${reset}`
      );
      allValid = false;
      isContentValid = false;
    }

    if (isContentValid) {
      const display =
        key === 'IVOOAPP_API_KEY' || key === 'DB_PASSWORD' || key === 'SESSION_SECRET'
          ? value.substring(0, 10) + '...'
          : value;
      console.log(`${green}✓ ${key}${reset}`);
      console.log(`  ${green}→ ${config.description}${reset}`);
      console.log(`  ${cyan}  Valor: ${display}${reset}`);
    }
  }

  console.log();
});

// Resumen
console.log(`${cyan}╔════════════════════════════════════════════════════════╗${reset}`);
console.log(`${cyan}║                        RESUMEN                         ║${reset}`);
console.log(`${cyan}╚════════════════════════════════════════════════════════╝${reset}\n`);

if (allValid && warnings.length === 0) {
  console.log(`${green}✓ Todas las variables están correctamente configuradas${reset}\n`);
  process.exit(0);
}

if (warnings.length > 0) {
  console.log(`${yellow}⚠ ${warnings.length} variable(s) opcional(es) no configurada(s)${reset}`);
}

if (missingRequired.length > 0) {
  console.log(
    `${red}✗ ${missingRequired.length} variable(s) REQUERIDA(S) falta(n):${reset}`
  );
  missingRequired.forEach((key) => {
    console.log(`  ${red}→ ${key}${reset}`);
  });
  console.log(
    `\n${red}Por favor, configura estas variables en tu archivo .env${reset}\n`
  );
  process.exit(1);
}

console.log();
