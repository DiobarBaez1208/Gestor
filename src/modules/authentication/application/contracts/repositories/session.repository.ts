import type { Session } from "../../../domain/entities/session.aggregate";
import type { SessionId } from "../../../domain/value-objects/session-id.value-object";

// Este contrato representa la capacidad que Application necesita para persistir y recuperar sesiones.
// Por lo tanto, el Repository trabaja conceptualmente con: Session y no con SequelizeModel, ni MySQLRow, ni DatabaseRecord

/* 


10. ¿Qué significa save()?
save(
    session: Session,
): Promise<void>;

Significa:

"Application puede pedir que una Session sea persistida."

Por ejemplo, durante Login:

crear Session
     ↓
sessionRepository.save(session)
     ↓
persistir Session

Durante Logout:

obtener Session
     ↓
session.revoke()
     ↓
sessionRepository.save(session)

El Repository no decide la regla de negocio.

La regla:

session.revoke();

pertenece a Session.

El Repository solamente persiste el nuevo estado.

*/


export interface SessionRepository {

    // Para buscar una sesión necesito un identificador de sesión válido(value object y no string).
    // "Application puede pedirme una Session utilizando su SessionId."
    findById( id: SessionId ): Promise<Session | null>;

    // Application puede pedir que una Session sea persistida
    save( session: Session ): Promise<void>;
}