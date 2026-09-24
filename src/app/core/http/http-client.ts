import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  status: 'OK' | 'ERROR';
  msg?: string;
  data?: T;
}

export interface HttpRequestOptions {
  /*
   * fetch no tiene timeout propio: una conexión que acepta el TCP pero nunca
   * responde deja la promesa colgada hasta que corte el sistema, que en móvil
   * son minutos. Sólo lo piden los llamados que no pueden esperar indefinido.
   */
  timeoutMs?: number;
}

@Injectable({ providedIn: 'root' })
export class HttpClient {
  private readonly baseUrl = environment.apiUrl;

  async get<T>(endpoint: string, opciones?: HttpRequestOptions): Promise<T> {
    const response = await fetch(this.resolverUrl(endpoint), {
      method: 'GET',
      headers: this.getHeaders(),
      signal: opciones?.timeoutMs !== undefined ? AbortSignal.timeout(opciones.timeoutMs) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /*
   * Un endpoint puede venir absoluto cuando apunta a otro host que no es el de
   * la API — el manifiesto de actualización en desarrollo cuelga del vhost de
   * Apache porque el servidor de desarrollo no aplica CORS a los archivos
   * estáticos. Concatenarlo con baseUrl produciría una URL inválida y un error
   * que no explica nada.
   */
  private resolverUrl(endpoint: string): string {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    return `${this.baseUrl}/${endpoint}`;
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const token = localStorage.getItem('sgo_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || data.status === 'ERROR') {
      const error: any = new Error(data.msg || 'Error en la solicitud');
      error.status = response.status;
      throw error;
    }

    return data.data as T;
  }
}
