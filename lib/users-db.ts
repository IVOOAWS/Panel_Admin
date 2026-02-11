// Almacenamiento en memoria para usuarios (hasta conectar BD)
// En producción, esto consultará la BD MySQL
export let USERS_DB = [
  {
    id: '1',
    email: 'admin@delivery.com',
    passwordHash: '$2a$10$KIXxPfxQXu.xW9QQq/qtxOOzwAXn0wEqmKZmWmDfkrKn5q.tHFB.K', // admin123
    role: 'admin',
    name: 'Administrador',
    createdAt: new Date().toISOString(),
  },
];

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  name: string;
  createdAt: string;
}
