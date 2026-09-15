export interface User {
  correo: string;
  rut: string;
  rut_normalizado: string;
  nombre?: string;
  perfil?: string;
}

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}
