export const environment = {
  production: false,
  apiUrl: 'http://sodimac-ws.test/api',
  appVersion: '0.1.0',

  /*
   * Manifiesto de versión para la autoactualización. Archivo estático; cuelga
   * de api/ para heredar CORS. Ver server/README.md.
   *
   * Relativo: se concatena con apiUrl, que ya es el vhost de Apache — ahí el
   * .htaccess de server/api/tablet/actualizaciones/ sí se aplica y pone los
   * headers que el WebView necesita.
   *
   * Apunta al manifiesto de PRUEBA, no al de producción: es la build con la que
   * se prueba la franja de actualización sin tocar lo que ven los operadores.
   */
  actualizacionEndpoint: 'tablet/actualizaciones/version_test.json',
};
