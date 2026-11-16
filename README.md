# PokéBattle - Torneo de Campeones

Aplicación web hecha con Angular para la Práctica 02.1 de Programación y Plataformas Web. La idea es simular un pequeño torneo Pokémon entre dos jugadores: cada uno arma su equipo de 3 Pokémon y se enfrentan en combates por turnos, eligiendo qué ataque usar en cada turno.

PokéAPI solo entrega los datos (estadísticas, tipos y movimientos), así que las reglas de la batalla las programé yo dentro de la app.

**Sitio desplegado:** 
**Repositorio:**

## ¿Qué se puede hacer?

- Registrar el nombre de los dos jugadores.
- Ver el catálogo de los 151 Pokémon de la primera generación y buscarlos por nombre.
- Armar los equipos por turnos (primero el jugador 1, luego el jugador 2). Se pueden quitar Pokémon de la selección o reiniciarla, y no se permite repetir un Pokémon en el torneo.
- Ver los equipos con sus tipos antes de empezar.
- Pelear 3 combates (Pokémon 1 vs 1, 2 vs 2 y 3 vs 3). En cada turno el jugador elige uno de los ataques de su Pokémon.
- Seguir la vida de cada Pokémon con una barra que se actualiza después de cada ataque.
- Revisar el historial de la batalla, que indica el daño, si el ataque falló y si fue muy efectivo o no.
- Ver el marcador y al campeón. Se juegan siempre los 3 combates y gana quien tenga más victorias.

### Reglas del combate

Estas son las reglas que implementé:

1. **Quién empieza:** ataca primero el Pokémon con mayor velocidad (`speed`).
2. **Ataques disponibles:** a cada Pokémon se le asignan hasta 4 movimientos con daño, tomados de su lista de movimientos e intentando que sean de tipos diferentes.
3. **Precisión:** si el movimiento tiene `accuracy`, puede fallar según ese porcentaje.
4. **Daño:**
   ```
   daño = (poder × ataque / defensa / 5) × efectividad × bonus
   ```
   - Si el movimiento es físico se usan `attack` y `defense`; si es especial, `special-attack` y `special-defense`.
   - `efectividad` sale de las relaciones de daño del tipo del rival (x2, x0.5 o x0).
   - `bonus` es 1.5 cuando el ataque es del mismo tipo que el Pokémon que lo usa.
5. El combate termina cuando la vida (`hp`) de uno de los dos llega a 0.

## Endpoints de PokéAPI que uso

| Endpoint | Para qué lo uso |
|---|---|
| `GET /pokemon?limit=151` | Cargar el catálogo de Pokémon para elegir los equipos. |
| `GET /pokemon/{nombre}` | Traer los datos de cada Pokémon elegido: imagen, tipos, estadísticas (hp, attack, defense, speed, etc.) y su lista de movimientos. |
| `GET /move/{nombre}` | Obtener los datos de cada ataque: tipo, poder, precisión, si es físico o especial y su nombre en español. Con esto se arman los botones de ataque y se calcula el daño. |
| `GET /type/{nombre}` | Obtener las relaciones de daño del tipo del Pokémon que recibe el ataque (`double_damage_from`, `half_damage_from`, `no_damage_from`) para saber si el ataque es muy efectivo, poco efectivo o no le afecta. |

Las respuestas de `/move` y `/type` se guardan en memoria mientras la app está abierta para no repetir la misma petición en cada turno.

## Estructura del proyecto

```
src/app/
├── components/
│   ├── tournament/       # Componente principal: inscripción, combates y resultado
│   ├── team-selector/    # Catálogo, búsqueda y selección de los equipos
│   └── pokemon-card/     # Tarjeta reutilizable del Pokémon (imagen, tipos y vida)
├── models/
│   └── pokemon.ts        # Interfaces de las respuestas de la API
└── services/
    ├── pokemon.ts        # Peticiones a /pokemon
    ├── pokemon-move.ts   # Peticiones a /move y selección de ataques
    └── pokemon-type.ts   # Peticiones a /type y cálculo de efectividad
```

Las peticiones se hacen con `HttpClient` de Angular. No hay backend propio ni base de datos, todo se consume directo desde PokéAPI.

## Manejo de carga y errores

- Mensajes de carga mientras se trae el catálogo, los equipos y los ataques.
- Si falla el catálogo aparece un mensaje y un botón para reintentar.
- Si la búsqueda no encuentra nada se muestra "No encontramos ningún Pokémon con ...".
- Si no se pueden cargar los equipos o un ataque falla por conexión, se muestra el error y se puede volver a intentar sin recargar la página.

## Cómo ejecutarlo en local

Necesitas tener instalado [Node.js](https://nodejs.org/) (versión 20.19 o superior) y npm.

```bash
git clone 
cd pokebattle
npm install
npm start
```

Luego abre `http://localhost:4200/` en el navegador.

Para generar la versión de producción:

```bash
npm run build
```

Los archivos quedan en `dist/pokebattle/browser`.

## Despliegue en Vercel

Importé el repositorio de GitHub en Vercel. El proyecto incluye un `vercel.json` con la configuración:

- **Build command:** `npm run build`
- **Output directory:** `dist/pokebattle/browser`

## Tecnologías

- Angular 21 (componentes standalone)
- TypeScript
- HttpClient + RxJS
- [PokéAPI](https://pokeapi.co/docs/v2)
- Vercel

---

Hecho por Thalia Sagbay, Programación y Plataformas Web, Universidad Politécnica Salesiana.
