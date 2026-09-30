import type { CorsRequest, CorsOptionsDelegate } from "cors";
import cors from "cors";

/* ──────────────────────────────────────────────────────────────────────────────
 *  ACCEPTED_ORIGINS
 * ──────────────────────────────────────────────────────────────────────────────
 * Usamos un Set<string> por tres razones clave:
 *
 * 1) Búsqueda O(1): muchísimos más eficiente que array.includes()
 * 2) Evita duplicados: imposible agregar el mismo origen dos veces por error
 * 3) Se alinea perfectamente con TypeScript estricto: Set<string> expresa
 *    intención de inmutabilidad y mejora mantenibilidad.
 *
 * En un entorno productivo este Set podría poblarse desde:
 * - variables de entorno
 * - base de datos
 * - servicio remoto de autorización
 */
const ACCEPTED_ORIGINS: Set<string> = new Set<string>([
    "http://localhost:3003",
    "http://localhost:5173",
    "http://localhost:5174",
]);

/* ──────────────────────────────────────────────────────────────────────────────
 *  corsDelegate — CORAZÓN DE LA LÓGICA CORS
 * ──────────────────────────────────────────────────────────────────────────────
 * Aquí aprovechamos la forma más potente del middleware `cors`:
 *
 *   CorsOptionsDelegate<CorsRequest>
 *
 * Esta firma es la ÚNICA que nos permite:
 * - recibir el request tipado
 * - inspeccionar headers dinámicamente
 * - decidir en tiempo real si permitir o bloquear el origen
 *
 * Flujo real:
 *
 *   app.use( cors(corsDelegate) )
 *        └──▶ Express ejecuta:
 *              corsDelegate(req, callback)
 *
 * Donde nosotros devolvemos:
 *
 *   callback(null, corsOptions)        → request permitido
 *   callback(error, { origin: false }) → request bloqueado
 *
 * Esto nos da:
 * ✔ Control dinámico de CORS
 * ✔ Posibilidad futura de reglas por método / ruta
 * ✔ Mensajes claros de error
 * ✔ Compatibilidad total con TypeScript estricto
 */
const corsDelegate: CorsOptionsDelegate<CorsRequest> = (req, callback): void => {
    // El header "Origin" puede venir undefined en requests NO navegador:
    // - cURL
    // - Postman
    // - SSR
    // - server-to-server
    const origin: string | undefined = req.headers.origin;

    // Opciones CORS completas que el navegador espera,
    // especialmente para preflight OPTIONS
    //
    // Nota importante:
    // - origin: true NO significa "*"
    //   significa "refleja el origin recibido"
    // - Esto es OBLIGATORIO si usas credentials: true
    const corsOptions = {
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    };

    /* -------------------------------------------------------------------------
     * CASO 1 — Requests SIN header Origin
     * -------------------------------------------------------------------------
     * CORS es una política EXCLUSIVA de navegadores.
     *
     * Si no hay Origin, no tiene sentido aplicar bloqueo,
     * por lo tanto permitimos la solicitud.
     */
    if (origin === undefined) {
        return callback(null, corsOptions);
    }

    /* -------------------------------------------------------------------------
     * CASO 2 — Origen permitido explícitamente
     * -------------------------------------------------------------------------
     * Validamos contra nuestra whitelist.
     */
    if (ACCEPTED_ORIGINS.has(origin)) {
        return callback(null, corsOptions);
    }

    /* -------------------------------------------------------------------------
     * CASO 3 — Origen NO permitido
     * -------------------------------------------------------------------------
     * Bloqueamos la solicitud generando un Error estándar.
     *
     * ⚠ Importante:
     * Usamos `Error` nativo porque:
     * - Express lo entiende
     * - errorMiddleware puede manejarlo de forma segura
     * - evita asumir propiedades como err.error (que NO existen)
     */
    const error = new Error(
        `CORS Error: Origin "${origin}" is not allowed to access this service.`
    );

    // Denegamos y notificamos al navegador
    return callback(error, { origin: false });
};

/* ──────────────────────────────────────────────────────────────────────────────
 *  MIDDLEWARE FINAL
 * ──────────────────────────────────────────────────────────────────────────────
 * Construimos el middleware final llamando a cors() con nuestro delegate.
 *
 * Este middleware puede montarse directamente en Express:
 *
 *   app.use(corsMiddleware)
 *
 * O por router:
 *
 *   router.use(corsMiddleware)
 */
const corsMiddleware = cors(corsDelegate);

export { corsMiddleware };
