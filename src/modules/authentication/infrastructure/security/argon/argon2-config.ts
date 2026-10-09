import argon2 from "argon2";

/**
 * Configuración criptográfica utilizada por Argon2.
 *
 * Esta configuración se mantiene separada de `Argon2PasswordHasher`
 * para evitar mezclar la política/configuración del algoritmo con
 * la lógica encargada de generar y verificar hashes.
 */
export const argon2Config = {

    /**
     * Algoritmo de Argon2 utilizado para el hashing de contraseñas.
     *
     * `argon2id` combina las propiedades de Argon2i y Argon2d:
     *
     * - Resistencia frente a ataques de canal lateral.
     * - Resistencia frente a ataques basados en GPU.
     * - Es la variante generalmente recomendada para almacenar
     *   contraseñas.
     */
    type: argon2.argon2id,

    /**
     * Cantidad de memoria utilizada durante el proceso de hashing.
     *
     * El valor se expresa en KiB.
     *
     * 2 ** 17 = 131072 KiB ≈ 128 MiB.
     *
     * Aumentar este valor hace que cada operación de hashing
     * requiera más memoria, dificultando ataques masivos mediante
     * hardware especializado.
     */
    memoryCost: 2 ** 17,

    /**
     * Número de iteraciones del algoritmo.
     *
     * Determina cuántas veces se procesa internamente el algoritmo
     * sobre la memoria asignada.
     *
     * Un valor mayor incrementa el tiempo necesario para generar
     * y verificar cada contraseña.
     */
    timeCost: 4,

    /**
     * Número de hilos de ejecución utilizados durante el proceso.
     *
     * Permite que Argon2 utilice procesamiento paralelo para
     * aumentar el costo computacional de cada operación.
     *
     * El valor debe equilibrarse con la capacidad de CPU del
     * servidor, ya que valores elevados pueden aumentar el consumo
     * de CPU cuando existen muchas autenticaciones simultáneas.
     */
    parallelism: 2,

} as const;