import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '../../core/http/http-client';
import { environment } from '../../../environments/environment';
import { ActualizacionApiRepository } from '../../domain/actualizacion/repositories/actualizacion.repository';
import { VersionDisponible } from '../../domain/actualizacion/models/version-disponible.model';

/*
 * Lee el manifiesto de versión del servidor.
 *
 *   GET <apiUrl>/tablet/actualizaciones/version.json   (producción)
 *   GET <apiUrl>/tablet/actualizaciones/version_test.json  (desarrollo)
 *
 *   { "status": "OK", "data": { "version_code": 1, "version_name": "0.1.0",
 *                               "url": "...", "sha256": "...",
 *                               "obligatoria": false, "notas": "..." } }
 *
 * Es un archivo estático, no un PHP. Vive colgando de api/ porque necesita los
 * headers de CORS —el WebView rechaza la respuesta sin ellos— y ahí hay un
 * .htaccess propio que se los pone. Ver server/README.md.
 */

const ENDPOINT_POR_DEFECTO = 'tablet/actualizaciones/version.json';

/*
 * Más corto que el default de los otros endpoints: esta consulta corre al entrar
 * a Inicio y no puede demorar el arranque. Si el servidor no contesta pronto, se
 * sigue sin actualizar — no es un error que valga la pena mostrarle al operador.
 */
const TIMEOUT_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class ActualizacionApiService implements ActualizacionApiRepository {
  private http = inject(HttpClient);

  async consultarUltimaVersion(): Promise<VersionDisponible | null> {
    const endpoint = environment.actualizacionEndpoint ?? ENDPOINT_POR_DEFECTO;

    const crudo = await this.http.get<unknown>(endpoint, { timeoutMs: TIMEOUT_MS });
    const version = parsearVersion(crudo);

    if (isDevMode()) console.log('[ActualizacionApi]', version);
    return version;
  }
}

/*
 * Ante cualquier forma que no reconozca devuelve null — "no hay actualización".
 *
 * Es deliberadamente estricto con los tres campos que importan: sin versionCode
 * no se puede comparar, sin url no se puede bajar, y sin sha256 no se puede
 * verificar. Aceptar un manifiesto a medias sería peor que ignorarlo: llevaría
 * al operador hasta el instalador con un archivo que nadie validó.
 */
export function parsearVersion(crudo: unknown): VersionDisponible | null {
  if (crudo === null || typeof crudo !== 'object' || Array.isArray(crudo)) return null;

  const obj = crudo as Record<string, unknown>;

  const versionCode = Number(obj['version_code'] ?? obj['versionCode']);
  if (!Number.isInteger(versionCode) || versionCode <= 0) return null;

  const url = obj['url'];
  if (typeof url !== 'string' || url.trim() === '') return null;

  const sha256 = obj['sha256'];
  if (typeof sha256 !== 'string' || !/^[0-9a-f]{64}$/i.test(sha256.trim())) return null;

  const versionName = obj['version_name'] ?? obj['versionName'];

  return {
    versionCode,
    versionName: typeof versionName === 'string' && versionName.trim() !== ''
      ? versionName
      : String(versionCode),
    url:         url.trim(),
    sha256:      sha256.trim().toLowerCase(),
    // Ante la duda, NO obligatoria: bloquear el trabajo del operador por un
    // campo mal escrito en un JSON es peor que dejarlo posponer.
    obligatoria: obj['obligatoria'] === true,
  };
}
