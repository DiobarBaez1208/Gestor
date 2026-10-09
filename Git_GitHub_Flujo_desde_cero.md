# Git + GitHub — Flujo completo desde cero

Guía práctica para crear un repositorio local, vincularlo con un repositorio de GitHub y realizar el primer `push`.

---

# 1. Modelo mental

Antes de ejecutar comandos, conviene distinguir cuatro conceptos:

```text
PROYECTO LOCAL
    │
    │ git init
    ▼
REPOSITORIO GIT LOCAL
    │
    │ git add
    ▼
STAGING AREA
    │
    │ git commit
    ▼
HISTORIAL LOCAL
    │
    │ git push
    ▼
REPOSITORIO REMOTO EN GITHUB
```

Además, Git y GitHub manejan dos cosas diferentes:

```text
Git
├── user.name
└── user.email

GitHub CLI
└── cuenta autenticada

Git remote
└── dirección del repositorio remoto
```

No deben confundirse.

---

# 2. Git vs GitHub

## 2.1 Git

**Git** es el sistema de control de versiones que administra el historial del proyecto en tu computadora.

Git puede funcionar completamente sin GitHub.

Ejemplos:

```powershell
git init
git add .
git commit
git log
git branch
```

---

## 2.2 GitHub

**GitHub** es un servicio remoto donde puedes almacenar repositorios Git y colaborar con otras personas.

La relación es:

```text
Git local
   │
   │ push / pull / fetch
   ▼
GitHub
```

GitHub no sustituye a Git.

---

# 3. Git identity: user.name y user.email

Git necesita identificar quién creó cada commit.

Consulta el nombre global:

```powershell
git config --global user.name
```

Consulta el correo global:

```powershell
git config --global user.email
```

También puedes consultar ambos:

```powershell
git config --global --get-regexp "user\."
```

Resultado típico:

```text
user.name=Diobar Baez
user.email=correo@example.com
```

## Importante

Esto:

```powershell
git config --global user.name
```

**NO te dice con qué cuenta de GitHub estás autenticado.**

Por ejemplo:

```text
Git identity:
user.name = Diobar Baez
user.email = correo@example.com

GitHub account:
DiobarBaez1208
```

Son conceptos diferentes.

---

# 4. Cambiar la identidad de Git

Si quieres cambiar el nombre:

```powershell
git config --global user.name "Diobar Baez"
```

Si quieres cambiar el correo:

```powershell
git config --global user.email "correo@example.com"
```

El parámetro:

```text
--global
```

significa que la configuración se aplica a todos los repositorios de Git de ese usuario de Windows.

También existe configuración específica para un repositorio:

```powershell
git config user.name "Diobar Baez"
git config user.email "correo@example.com"
```

Esta configuración local tiene prioridad sobre la global.

---

# 5. GitHub CLI

GitHub CLI (`gh`) es la herramienta oficial de línea de comandos para interactuar con GitHub.

Comprueba si está instalada:

```powershell
gh --version
```

Puedes consultar las cuentas autenticadas:

```powershell
gh auth status
```

Ejemplo:

```text
github.com
  ✓ Logged in to github.com account DiobarBaez1208
  - Active account: true
```

---

# 6. Cambiar la cuenta activa de GitHub CLI

Si tienes varias cuentas autenticadas:

```powershell
gh auth status
```

Puedes cambiar la cuenta activa:

```powershell
gh auth switch --user DiobarBaez1208
```

Después verifica:

```powershell
gh auth status
```

La cuenta deseada debe aparecer como:

```text
- Active account: true
```

---

# 7. Cerrar sesión de una cuenta específica

Si tienes una cuenta que ya no quieres utilizar en esa computadora:

```powershell
gh auth logout --hostname github.com --user diobarWebshau
```

Esto elimina la autenticación local de GitHub CLI.

**No elimina la cuenta de GitHub.**

Simplemente elimina sus credenciales guardadas en esta computadora.

Después:

```powershell
gh auth status
```

---

# 8. Autenticarse con GitHub

Si todavía no tienes una cuenta autenticada:

```powershell
gh auth login
```

Normalmente puedes seleccionar:

```text
GitHub.com
HTTPS
Login with a web browser
```

Después puedes comprobar:

```powershell
gh auth status
```

---

# 9. Preparar el proyecto local

Supongamos que tienes:

```text
C:\Users\Dioba\Desktop\Amphenol-TCS\WEB\gestor
```

Entra al proyecto:

```powershell
cd C:\Users\Dioba\Desktop\Amphenol-TCS\WEB\gestor
```

Comprueba la ubicación:

```powershell
Get-Location
```

---

# 10. Comprobar si ya existe un repositorio Git

Antes de ejecutar `git init`, puedes comprobar:

```powershell
git status
```

Si aparece algo como:

```text
On branch main
```

o:

```text
On branch master
```

probablemente ya existe un repositorio Git.

También puedes comprobar directamente:

```powershell
Test-Path .git
```

Resultado:

```text
True
```

significa que existe la carpeta `.git`.

---

# 11. Inicializar Git

Si el proyecto todavía NO es un repositorio Git:

```powershell
git init
```

Esto crea:

```text
gestor/
├── .git/
├── ...
```

La carpeta `.git` contiene la información interna del repositorio:

- historial
- referencias
- configuración
- objetos
- ramas
- información del repositorio

No debes modificarla manualmente.

---

# 12. Crear un .gitignore

Antes de hacer:

```powershell
git add .
```

es muy recomendable crear `.gitignore`.

Ejemplo para proyectos Node.js:

```gitignore
node_modules/
dist/
build/
coverage/

.env
.env.*
!.env.example

*.log

.DS_Store
Thumbs.db
```

El objetivo es evitar subir archivos que:

- no deberían estar versionados
- son generados automáticamente
- contienen secretos
- son demasiado pesados
- son específicos de una máquina

Por ejemplo:

```text
node_modules/
```

normalmente no se versiona.

---

# 13. Revisar el estado

```powershell
git status
```

Este es uno de los comandos más importantes de Git.

Permite saber:

- en qué rama estás
- qué archivos están modificados
- qué archivos no están rastreados
- qué archivos están en staging
- qué cambios están listos para commit

Ejemplo:

```text
On branch main

Untracked files:
  src/
  package.json
```

---

# 14. Configurar la rama principal

Puedes establecer `main` como rama actual:

```powershell
git branch -M main
```

## ¿Qué significa?

`-M` cambia el nombre de la rama actual a `main`.

Por ejemplo:

```text
master
   ↓
main
```

`main` es actualmente el nombre convencional utilizado para la rama principal en muchos repositorios.

---

# 15. Crear el repositorio en GitHub

Puedes crear el repositorio desde la página de GitHub.

Por ejemplo:

```text
Gestor
```

Repositorio:

```text
https://github.com/DiobarBaez1208/Gestor
```

Si ya tienes el proyecto local, normalmente conviene evitar crear archivos iniciales innecesarios en GitHub, como otro `README.md`, si quieres hacer el primer commit desde tu proyecto local.

---

# 16. Ver los remotos existentes

```powershell
git remote -v
```

Si no existe ninguno, no aparecerá nada.

Si ya existe:

```text
origin  git@github.com:DiobarBaez1208/Gestor.git (fetch)
origin  git@github.com:DiobarBaez1208/Gestor.git (push)
```

---

# 17. Agregar un repositorio remoto

Si no existe `origin`:

```powershell
git remote add origin git@github.com:DiobarBaez1208/Gestor.git
```

Aquí:

```text
git remote
```

administra repositorios remotos.

```text
add
```

agrega uno.

```text
origin
```

es el nombre del remoto.

```text
git@github.com:DiobarBaez1208/Gestor.git
```

es la dirección del repositorio.

---

# 18. ¿Qué es origin?

`origin` no es una palabra mágica de GitHub.

Es simplemente el nombre convencional que Git utiliza para identificar el repositorio remoto principal.

Puedes tener:

```text
origin
upstream
company
backup
```

Pero normalmente:

```text
origin
```

representa el repositorio principal.

---

# 19. SSH vs HTTPS

Existen dos formas comunes de configurar el remoto.

## SSH

```text
git@github.com:DiobarBaez1208/Gestor.git
```

Git utiliza claves SSH.

Ventaja:

```text
Git
 ↓
SSH key
 ↓
GitHub
```

Pero necesitas tener una clave SSH correctamente configurada y asociada a GitHub.

---

## HTTPS

```text
https://github.com/DiobarBaez1208/Gestor.git
```

Git utiliza autenticación HTTPS.

Si utilizas GitHub CLI, puedes configurar Git para utilizar las credenciales gestionadas por `gh`.

---

# 20. Cambiar de SSH a HTTPS

Si actualmente tienes:

```text
git@github.com:DiobarBaez1208/Gestor.git
```

puedes cambiarlo a:

```powershell
git remote set-url origin https://github.com/DiobarBaez1208/Gestor.git
```

Comprueba:

```powershell
git remote -v
```

Debe aparecer:

```text
origin  https://github.com/DiobarBaez1208/Gestor.git (fetch)
origin  https://github.com/DiobarBaez1208/Gestor.git (push)
```

---

# 21. Configurar Git para utilizar GitHub CLI

Después de autenticarte con `gh`:

```powershell
gh auth setup-git
```

Este comando configura Git para utilizar las credenciales de GitHub CLI para operaciones compatibles.

Después:

```powershell
gh auth status
```

---

# 22. Agregar archivos al staging

Para agregar todos los archivos permitidos por `.gitignore`:

```powershell
git add .
```

Conceptualmente:

```text
Working directory
       │
       │ git add .
       ▼
Staging area
```

Todavía NO crea un commit.

---

# 23. Revisar el staging

Después de:

```powershell
git add .
```

ejecuta:

```powershell
git status
```

Podrás ver:

```text
Changes to be committed:
```

Eso significa que esos archivos están preparados para el próximo commit.

---

# 24. Revisar exactamente qué se va a incluir

Puedes utilizar:

```powershell
git diff --cached
```

Esto muestra los cambios que actualmente están en staging.

Es especialmente útil antes del primer commit.

---

# 25. Crear el commit

```powershell
git commit -m "Primer commit"
```

El commit crea una versión registrada en el historial local.

Flujo:

```text
Archivos
   │
   │ git add
   ▼
Staging
   │
   │ git commit
   ▼
Historial Git local
```

El mensaje:

```text
"Primer commit"
```

describe el cambio realizado.

También puedes utilizar:

```powershell
git commit -m "Initial commit"
```

---

# 26. Comprobar el historial

Después del commit:

```powershell
git log --oneline
```

Ejemplo:

```text
a31f92e Primer commit
```

Puedes obtener más información con:

```powershell
git log
```

---

# 27. Comprobar la rama

```powershell
git branch
```

Ejemplo:

```text
* main
```

El `*` indica la rama actualmente seleccionada.

---

# 28. Hacer el primer push

Una vez que tienes:

- repositorio Git local
- commit
- rama `main`
- remoto `origin`
- autenticación correcta

ejecutas:

```powershell
git push -u origin main
```

---

# 29. ¿Qué significa cada parte?

```powershell
git push -u origin main
```

### `git`

Utiliza Git.

### `push`

Envía commits del repositorio local al repositorio remoto.

### `origin`

Indica qué remoto utilizar.

### `main`

Indica qué rama enviar.

### `-u`

Establece la relación de seguimiento entre:

```text
main local
   ↕
origin/main remoto
```

Después del primer push, normalmente podrás utilizar simplemente:

```powershell
git push
```

---

# 30. Flujo completo recomendado

Para un proyecto nuevo que todavía NO tiene Git:

```powershell
# 1. Entrar al proyecto
cd C:\ruta\al\proyecto

# 2. Inicializar Git
git init

# 3. Crear/revisar .gitignore

# 4. Establecer la rama principal
git branch -M main

# 5. Revisar el estado
git status

# 6. Agregar archivos
git add .

# 7. Revisar lo que será incluido
git status
git diff --cached

# 8. Crear el commit
git commit -m "Initial commit"

# 9. Agregar el repositorio de GitHub
git remote add origin https://github.com/USUARIO/REPOSITORIO.git

# 10. Configurar Git con GitHub CLI
gh auth setup-git

# 11. Verificar autenticación
gh auth status

# 12. Verificar remoto
git remote -v

# 13. Subir el proyecto
git push -u origin main
```

---

# 31. Flujo si el proyecto YA tiene Git

Si el proyecto ya contiene `.git`:

```powershell
cd C:\ruta\al\proyecto

git status

git remote -v

git branch -M main

git add .

git status

git diff --cached

git commit -m "Initial commit"

git remote add origin https://github.com/USUARIO/REPOSITORIO.git

gh auth setup-git

gh auth status

git push -u origin main
```

Pero si `origin` ya existe, NO debes ejecutar:

```powershell
git remote add origin ...
```

En ese caso utiliza:

```powershell
git remote set-url origin https://github.com/USUARIO/REPOSITORIO.git
```

---

# 32. Flujo específico para tu proyecto Gestor

En tu caso:

```text
C:\Users\Dioba\Desktop\Amphenol-TCS\WEB\gestor
```

y el repositorio:

```text
DiobarBaez1208/Gestor
```

El flujo sería:

```powershell
cd C:\Users\Dioba\Desktop\Amphenol-TCS\WEB\gestor

git status

git init

git branch -M main

git remote -v

git remote add origin https://github.com/DiobarBaez1208/Gestor.git

git add .

git status

git diff --cached

git commit -m "Initial commit"

gh auth status

gh auth setup-git

git remote -v

git push -u origin main
```

Si `origin` ya existe:

```powershell
git remote set-url origin https://github.com/DiobarBaez1208/Gestor.git
```

en lugar de:

```powershell
git remote add origin ...
```

---

# 33. Comandos de diagnóstico importantes

## Ver configuración global

```powershell
git config --global --list
```

## Ver configuración del repositorio actual

```powershell
git config --local --list
```

## Ver nombre

```powershell
git config user.name
```

## Ver correo

```powershell
git config user.email
```

## Ver remoto

```powershell
git remote -v
```

## Ver ramas

```powershell
git branch
```

## Ver estado

```powershell
git status
```

## Ver historial

```powershell
git log --oneline
```

## Ver autenticación de GitHub CLI

```powershell
gh auth status
```

---

# 34. Comando incorrecto de tu lista original

Tenías:

```powershell
git status --username
```

Ese comando **no es válido para consultar el usuario de Git**.

Para consultar el nombre configurado:

```powershell
git config user.name
```

Para consultar el correo:

```powershell
git config user.email
```

Para consultar la cuenta autenticada en GitHub CLI:

```powershell
gh auth status
```

Son tres cosas diferentes.

---

# 35. Diferencia fundamental entre los comandos

| Comando | Qué consulta/modifica |
|---|---|
| `git config user.name` | Nombre utilizado en commits |
| `git config user.email` | Correo utilizado en commits |
| `gh auth status` | Cuenta autenticada en GitHub CLI |
| `gh auth switch` | Cambia la cuenta activa de `gh` |
| `gh auth logout` | Elimina una autenticación local de `gh` |
| `git remote -v` | Repositorios remotos configurados |
| `git init` | Inicializa un repositorio Git |
| `git add .` | Envía cambios al staging |
| `git commit` | Crea un commit local |
| `git push` | Envía commits al remoto |
| `git pull` | Descarga e integra cambios del remoto |
| `git fetch` | Descarga referencias/cambios sin integrarlos |
| `git branch` | Consulta/administra ramas |
| `git status` | Muestra el estado del repositorio |

---

# 36. Errores comunes

## `Permission denied (publickey)`

Ejemplo:

```text
git@github.com: Permission denied (publickey).
```

Normalmente significa que estás utilizando SSH y GitHub no acepta la clave SSH presentada.

Puedes:

### Opción A — Configurar SSH correctamente

Mantener:

```text
git@github.com:...
```

y configurar una SSH key asociada a la cuenta correcta.

### Opción B — Utilizar HTTPS

Cambiar:

```powershell
git remote set-url origin https://github.com/USUARIO/REPOSITORIO.git
```

y configurar:

```powershell
gh auth setup-git
```

---

# 37. `remote origin already exists`

Si ejecutas:

```powershell
git remote add origin ...
```

y recibes:

```text
error: remote origin already exists.
```

no debes volver a agregarlo.

Consulta:

```powershell
git remote -v
```

Si necesitas cambiarlo:

```powershell
git remote set-url origin https://github.com/USUARIO/REPOSITORIO.git
```

---

# 38. `src refspec main does not match any`

Si recibes:

```text
error: src refspec main does not match any
```

normalmente significa que todavía no tienes un commit en esa rama.

Haz:

```powershell
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

# 39. Repositorio remoto no encontrado

Si aparece algo como:

```text
Repository not found.
```

comprueba:

```powershell
git remote -v
```

Verifica que la dirección sea exactamente la correcta.

También verifica:

```powershell
gh auth status
```

y que la cuenta tenga acceso al repositorio.

---

# 40. Verificación final

Antes de considerar terminado el proceso:

```powershell
git status
```

```powershell
git remote -v
```

```powershell
git branch
```

```powershell
git log --oneline
```

```powershell
gh auth status
```

Una configuración esperada sería:

```text
GitHub:
DiobarBaez1208
    │
    ▼
https://github.com/DiobarBaez1208/Gestor

Local:
gestor/
├── .git/
├── .gitignore
├── package.json
├── ...
└── src/

Branch:
main

Remote:
origin → https://github.com/DiobarBaez1208/Gestor.git

Latest commit:
Initial commit
```

Y finalmente:

```powershell
git push -u origin main
```

---

# 41. Flujo diario después del primer push

Una vez configurado el repositorio, normalmente no necesitas repetir toda la configuración.

El flujo cotidiano es:

```powershell
git status

git add .

git status

git commit -m "Descripción del cambio"

git push
```

Si necesitas obtener cambios del servidor:

```powershell
git pull
```

Un flujo más cuidadoso puede ser:

```powershell
git status
git pull
git add .
git diff --cached
git commit -m "Descripción del cambio"
git push
```

---

# 42. Resumen mental definitivo

Piensa en Git como tres estados principales:

```text
┌──────────────────────┐
│  Working Directory   │
│  Archivos modificados│
└──────────┬───────────┘
           │
        git add
           │
           ▼
┌──────────────────────┐
│    Staging Area      │
│ Cambios preparados   │
└──────────┬───────────┘
           │
       git commit
           │
           ▼
┌──────────────────────┐
│   Local Repository   │
│  Historial de Git    │
└──────────┬───────────┘
           │
        git push
           │
           ▼
┌──────────────────────┐
│   Remote Repository  │
│       GitHub         │
└──────────────────────┘
```

Y separa siempre:

```text
IDENTIDAD DE COMMITS
    git config user.name
    git config user.email

AUTENTICACIÓN DE GITHUB
    gh auth status
    gh auth switch
    gh auth logout
    gh auth login

UBICACIÓN DEL REPOSITORIO
    git remote -v

CONTROL DE VERSIONES
    git init
    git add
    git commit
    git branch
    git status

SINCRONIZACIÓN
    git push
    git pull
    git fetch
```

Esta separación evita gran parte de la confusión entre "mi usuario de Git", "mi cuenta de GitHub", "mi repositorio local" y "mi repositorio remoto".
