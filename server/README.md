# Archivos del servidor para la autoactualización

Lo que hay que subir al servidor para que las tablets puedan actualizarse solas.
Vive en este repositorio y no en el del web service a propósito: el contenido
cambia con **cada release de la app**, así que tiene que moverse junto con el APK
que describe, no por su cuenta.

## Dónde va cada cosa

Rutas absolutas en el servidor. `/var/www/html/` es la raíz web, o sea que
`/var/www/html/app/...` se sirve como `http://50.16.13.230/app/...`.

```
server/api/tablet/actualizaciones/.htaccess
server/api/tablet/actualizaciones/version.json
server/api/tablet/actualizaciones/version_test.json
  → <docroot>/api/tablet/actualizaciones/        (mismo docroot que ya sirve api/*.php)

app/build/outputs/apk/release/app-release.apk
  → http://50.16.13.230/app/ws/sodimac/apk_analista/<nombre>.apk
```

La carpeta `api/tablet/actualizaciones/` hay que crearla. Permisos: `755` en las
carpetas y `644` en los archivos — si un archivo queda en `600`, Apache lo
entrega con 403 y el error no dice por qué.

### Desarrollo local

`ng serve` (environment.ts) y `ng build --configuration=dev_mockup`
(environment.dev-mockup.ts) leen `version_test.json` desde el vhost de Apache
`http://sodimac-ws.test`, no desde el `php -S` de 127.0.0.1:8088 — ese servidor
no aplica `.htaccess`, así que un JSON estático ahí no recibe headers de CORS y
el WebView lo descarta.

Para probar la franja en desarrollo hay que copiar a mano los archivos a
`C:\laragon\www\sodimac-ws\api\tablet\actualizaciones\`. El `.gitignore` de ese
proyecto ignora `*.json`, así que ahí nunca se versionan: la fuente de verdad es
esta carpeta.

Si `version_test.json` no existe, la consulta falla y la app de desarrollo
simplemente no ofrece nada. No se rompe.

## Dos manifiestos: producción y prueba

`version.json` es el que leen las tablets en terreno. `version_test.json` lo lee
sólo la build de desarrollo.

Existen separados porque mientras los dos leían el mismo archivo no había forma
de probar la oferta de actualización sin ofrecérsela también a las tablets
reales: subir un `version_code` de prueba se lo mostraba a todo el mundo.

Para probar la franja se toca `version_test.json` y nada más. `version.json` no
se mueve, y los operadores no ven nada.

El manifiesto **tiene que quedar colgando de `api/`**. Fuera de ahí no hay
`.htaccess` que le ponga CORS y el WebView de Android rechaza la respuesta.

Por el mismo motivo, si algún día esto pasa a ser un PHP: que **no** setee
headers de CORS por su cuenta. Duplicados — uno de Apache y otro del PHP — el
WebView los rechaza.

## Por qué un JSON y no un PHP

Porque no hay nada que calcular. Un archivo estático no tiene base de datos que
se caiga ni lógica que se rompa, y se edita a mano en los diez segundos que toma
subir un APK. Si más adelante se quiere servir por versión de tablet o por
tienda, se reemplaza por un PHP con la misma forma de respuesta y la app no se
entera.

## La carpeta del APK

No necesita CORS. La descarga la hace Capacitor de forma nativa, fuera del
WebView, así que las reglas de origen no aplican.

Lo que sí hace falta es que Apache no bloquee la extensión. Si la bloquea, el
MIME es `application/vnd.android.package-archive`.

## Qué significa cada campo

| Campo | Para qué |
|---|---|
| `version_code` | **Lo único que decide si hay que actualizar.** Es el entero que Android compara internamente; la app lee el suyo con `App.getInfo()` y ofrece actualizar si el del servidor es mayor. |
| `version_name` | Solo para mostrarle al operador. No sirve para comparar: `"0.1.10"` es menor que `"0.1.9"` en orden alfabético. |
| `url` | De dónde bajar el APK. Absoluta, porque la descarga nativa no resuelve rutas relativas. |
| `sha256` | Se verifica antes de instalar. Sin esto, una descarga cortada por mala señal le llega al instalador de Android como archivo corrupto y el operador ve un error sin contexto. |
| `obligatoria` | Si es `true`, la app no deja seguir contando hasta actualizar. |
| `notas` | **No se muestra en la app.** Es para quien mantiene este archivo: sirve para saber qué APK es cada una. Se probó mostrárselo al operador y sale en lenguaje de desarrollo, que no le dice nada y le tapa lo único que necesita leer: que no pierde su trabajo. |

## Al publicar una versión nueva

1. Subir `versionCode` y `versionName` en `android/app/build.gradle`, y
   `appVersion` en los tres `src/environments/environment*.ts` — son varios
   lugares que se desincronizan solos. Ya pasó en sodimac tras un merge.

   El `versionCode` tiene que ser **estrictamente mayor** al instalado, aunque el
   `versionName` se repita. Android compara el código, no el nombre: dos APK
   distintas con el mismo código no se pueden actualizar entre sí.

2. `npm run build && npx cap sync android && cd android && ./gradlew assembleRelease`

   Revisar el diff de `AndroidManifest.xml` antes de seguir: `cap sync` lo
   reescribe y ya borró `REQUEST_INSTALL_PACKAGES` una vez en sodimac. Sin ese
   permiso la autoactualización deja de funcionar y no hay ningún error que lo
   delate.

3. Verificar la firma. **No es opcional:** sin `keystore.properties`, Gradle
   compila igual y la APK sale sin firmar **en silencio**.

   ```bash
   apksigner verify --print-certs app/build/outputs/apk/release/app-release.apk
   ```

4. Renombrar a `sgo-<versionName>-vc<versionCode>.apk` y sacarle el hash.

   El `versionCode` va en el nombre a propósito: con dos APK distintas llamadas
   `sgo-0.1.2.apk` no hay forma de saber cuál tiene instalada un equipo.

   `sha256sum` en Git Bash antepone una barra al hash. Conviene:
   `python -c "import hashlib;print(hashlib.sha256(open(r'RUTA','rb').read()).hexdigest())"`

5. Subir el APK a la carpeta `apk_analista/`, con **exactamente** el nombre que
   va a declarar el manifiesto.

   En WinSCP: modo **Binario** —en modo Texto se corrompe el APK y el hash no
   coincide—, permisos **0644** —en 600 Apache devuelve 403— y subida a archivo
   temporal activada, para que una transferencia cortada no quede servida bajo el
   nombre real.

6. Recién ahí actualizar `version.json`. **En ese orden**: si el manifiesto
   apunta a un archivo que todavía no está, las tablets que consulten en el medio
   fallan la descarga.

7. **Verificar lo publicado, no lo local.** Es el paso que se saltea y el que
   atrapa los errores que los anteriores no ven — un nombre mal escrito, una
   subida a medias, permisos que devuelven 403:

   ```bash
   curl -s https://sodimac-ws.taxo.cl/api/tablet/actualizaciones/version.json
   curl -s -o bajada.apk http://50.16.13.230/app/ws/sodimac/apk_analista/<nombre>.apk
   ```

   El hash de `bajada.apk` tiene que ser igual al del manifiesto. Si no coincide
   —o si el APK pesa 196 bytes, que es el tamaño de la página de error 404— la
   actualización está rota aunque los archivos "se hayan subido bien".

## La llave de firma

Android exige que la firma coincida para actualizar una app instalada. Dos
llaves distintas producen **dos apps incompatibles con el mismo nombre**: un
equipo firmado con una no puede recibir la otra, hay que desinstalar, y eso
borra el trabajo que no se haya sincronizado.

Esto ya pasó en sodimac más de una vez, y por eso está escrito acá.

### Estado actual: llave TEMPORAL

Todavía **no** está el keystore de Taxo para este proyecto — lo maneja el equipo
que mantiene sodimac. Mientras tanto, generar una llave **temporal**:

```bash
keytool -genkeypair -v -keystore sgo-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sgo
```

Y completar `android/keystore.properties` según `android/keystore.properties.example`.
El `.jks` y el `keystore.properties` están en `.gitignore`: nunca se commitean.

**La temporal se conserva SIEMPRE, aunque se pase a la de Taxo.** Es lo que hace
posible la rotación de abajo; sin ella, cambiar de firma obligaría a
desinstalar la app en cada tablet y perder todo lo no sincronizado.

Cuando exista la huella oficial de la llave de Taxo, anotarla acá igual que
sodimac la tiene anotada y compararla contra `apksigner verify --print-certs`
después de cada `assembleRelease`. **Si muestra otra huella, esa APK no se
sube**: se instalaría bien y recién fallaría al intentar actualizarla, con los
equipos ya en terreno.

### Firmar con linaje (rotación temporal → Taxo)

`gradlew assembleRelease` firma sólo con la llave que declara
`keystore.properties`. Eso alcanza para un equipo que ya tiene una APK firmada
con esa llave. **No** alcanza para un equipo firmado con otra: Android rechaza la
actualización con `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, aunque el
`applicationId` sea el mismo.

El linaje V3 (`apksigner rotate`) es la prueba criptográfica de que la llave
vieja autorizó el cambio a la nueva. Con esa prueba embebida en el APK, un solo
archivo actualiza in-place a los dos orígenes.

```bash
apksigner rotate \
  --out sgo.lineage \
  --old-signer --ks sgo-release.jks --ks-pass pass:<temporal> \
    --ks-key-alias sgo --key-pass pass:<temporal> \
  --new-signer --ks <storeFile de keystore.properties> \
    --ks-pass pass:<storePassword> --ks-key-alias <keyAlias> --key-pass pass:<keyPassword>
```

Después, firmar con `--lineage sgo.lineage`. Ver sodimac `server/README.md` para
el detalle de por qué conviene dar **dos** firmantes con `--next-signer` (el
`apksigner` actual exige que la firma cubra todo el rango de `minSdkVersion`) y
por qué `--v1/--v2` se pueden apagar si la flota está en Android 9+.

**Antes de firmar nada, comprobar por ADB qué llave tiene instalada el equipo de
destino:**

```bash
adb shell pm path cl.taxo.sgo.inventario
adb pull <ruta que devuelva> instalada.apk
apksigner verify --print-certs instalada.apk
```

Si la huella no corresponde a ninguna de las llaves conocidas, no hay atajo: hay
que desinstalar en ese equipo puntual o encontrar esa llave.

### Generar el linaje una sola vez

Sólo una vez por rotación — no en cada release —, pero como no vive en el
repositorio (es sensible, como el `.jks`), conviene tener el comando a mano por
si se pierde. Se puede releer el linaje ya embebido en cualquier APK que lo
lleve:

```bash
apksigner lineage --in sgo-<version>-vc<n>.apk --print-certs --verbose
```
