export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8088/api',
  appVersion: '0.1.0',

  /*
   * Manifiesto de versión para la autoactualización. Archivo estático; cuelga
   * de api/ para heredar CORS. Ver server/README.md.
   *
   * Acá va una URL ABSOLUTA y no un relativo como en los otros environments,
   * porque apiUrl apunta al `php -S` de 127.0.0.1:8088, que no lee .htaccess:
   * un JSON estático servido ahí no recibe headers de CORS y el WebView lo
   * rechaza. Apuntando al vhost de Apache (sodimac-ws.test) los headers existen
   * y la consulta funciona igual que en producción.
   *
   * Desarrollo y producción NO leen el mismo archivo: mientras sea así no hay
   * forma de probar la oferta de actualización sin ofrecérsela también a las
   * tablets en terreno. Se toca version_test.json, se prueba, y lo que ven los
   * operadores no se movió nunca.
   *
   * Si version_test.json no existe, la consulta falla y simplemente no se
   * ofrece nada — la app sigue funcionando igual.
   */
  actualizacionEndpoint: 'http://sodimac-ws.test/api/tablet/actualizaciones/version_test.json',
};
