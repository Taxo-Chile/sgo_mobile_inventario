export const environment = {
  production: true,
  apiUrl: 'https://sodimac-ws.taxo.cl/api',
  appVersion: '0.1.0',

  /*
   * Manifiesto de versión para la autoactualización. Archivo estático; cuelga
   * de api/ para heredar CORS. Ver server/README.md.
   *
   * Relativo: se concatena con apiUrl, así que el archivo vive en
   * https://sodimac-ws.taxo.cl/api/tablet/actualizaciones/version.json y es el
   * único que leen las tablets en terreno. version_test.json queda sólo para
   * desarrollo.
   */
  actualizacionEndpoint: 'tablet/actualizaciones/version.json',
};
