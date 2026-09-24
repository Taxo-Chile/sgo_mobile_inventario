import { environment } from '../../environments/environment';

/*
 * Versión visible de la app. Se muestra en el menú lateral, para que cuando un
 * operador reporte algo desde terreno se sepa qué build tiene instalada — las
 * APK se distribuyen a mano y conviven varias a la vez.
 *
 * La fuente es environment.appVersion, que ya existe en los tres environments
 * y cambia con cada build. La constante sólo existe para darle al resto del
 * código un nombre estable, del mismo modo que lo hace sodimac con su
 * version.ts: si mañana la fuente cambia, cambia acá y nada más.
 *
 * Para decidir si hay que actualizar NO se usa esta constante: esa comparación
 * se hace contra el versionCode que reporta Android (ver AppInfoService).
 */
export const APP_VERSION = environment.appVersion;
