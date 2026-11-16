
import { Component, ChangeDetectorRef } from '@angular/core';

import { Movimiento, Pokemon } from '../../models/pokemon';
import { PokemonService } from '../../services/pokemon';
import { PokemonTypeService } from '../../services/pokemon-type';
import { PokemonMoveService } from '../../services/pokemon-move';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card';
import { SeleccionEquipos, TeamSelectorComponent } from '../team-selector/team-selector';

type Estado = 'seleccion' | 'preparado' | 'combate' | 'finalizado';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [PokemonCardComponent, TeamSelectorComponent],
  templateUrl: './tournament.html',
  styleUrl: './tournament.css'
})
export class TournamentComponent {

  jugador1 = 'Jugador 1';
  jugador2 = 'Jugador 2';

  textoNombre1 = '';
  textoNombre2 = '';

  equipo1: Pokemon[] = [];
  equipo2: Pokemon[] = [];

  cargando = false;
  textoCarga = '';
  error = '';
  mensaje = '';

  estado: Estado = 'seleccion';
  ronda = 1;
  turno = 1;

  vida1 = 0;
  vida2 = 0;

  victorias1 = 0;
  victorias2 = 0;

  movimientos1: Movimiento[] = [];
  movimientos2: Movimiento[] = [];

  historial: string[] = [];

  constructor(
    private pokemonService: PokemonService,
    private typeService: PokemonTypeService,
    private moveService: PokemonMoveService,
    private cd: ChangeDetectorRef
  ) { }


  cambiarNombre(jugador: number, valor: string) {
    
    const nombre = valor.trim() || `Jugador ${jugador}`;

    if (jugador === 1) {
      this.textoNombre1 = valor;
      this.jugador1 = nombre;
    } else {
      this.textoNombre2 = valor;
      this.jugador2 = nombre;
    }
  }

  async cargarEquipos(seleccion: SeleccionEquipos) {

    this.cargando = true;
    this.textoCarga = 'Cargando equipos...';
    this.error = '';
    this.cd.detectChanges();

    try {

      [this.equipo1, this.equipo2] = await Promise.all([
        Promise.all(seleccion.equipo1.map(nombre => this.pokemonService.getPokemon(nombre))),
        Promise.all(seleccion.equipo2.map(nombre => this.pokemonService.getPokemon(nombre)))
      ]);

      this.estado = 'preparado';
      this.mensaje = '¡Los equipos están listos para competir!';

    } catch {

      this.error = 'No se pudieron cargar los equipos. Quita algún Pokémon y vuelve a elegir, o reinicia la selección.';
      this.equipo1 = [];
      this.equipo2 = [];

    } finally {

      this.cargando = false;
      this.cd.detectChanges();

    }
  }

  

  get pokemon1(): Pokemon {
    return this.equipo1[this.ronda - 1];
  }

  get pokemon2(): Pokemon {
    return this.equipo2[this.ronda - 1];
  }

  get movimientosTurno(): Movimiento[] {
    return this.turno === 1 ? this.movimientos1 : this.movimientos2;
  }

  get nombreTurno(): string {
    return this.turno === 1 ? this.jugador1 : this.jugador2;
  }

  get combateTerminado(): boolean {
    return this.vida1 === 0 || this.vida2 === 0;
  }

  iniciarTorneo() {

    this.ronda = 1;
    this.victorias1 = 0;
    this.victorias2 = 0;
    this.historial = [];

    this.iniciarCombate();
  }

  async iniciarCombate() {

    this.vida1 = this.obtenerEstadistica(this.pokemon1, 'hp');
    this.vida2 = this.obtenerEstadistica(this.pokemon2, 'hp');
    this.movimientos1 = [];
    this.movimientos2 = [];

    this.estado = 'combate';
    this.error = '';
    this.cargando = true;
    this.textoCarga = 'Preparando los ataques de cada Pokémon...';
    this.cd.detectChanges();

    try {

      [this.movimientos1, this.movimientos2] = await Promise.all([
        this.moveService.getMovimientosCombate(this.pokemon1),
        this.moveService.getMovimientosCombate(this.pokemon2)
      ]);

      
      const velocidad1 = this.obtenerEstadistica(this.pokemon1, 'speed');
      const velocidad2 = this.obtenerEstadistica(this.pokemon2, 'speed');
      this.turno = velocidad2 > velocidad1 ? 2 : 1;

      const primero = this.turno === 1 ? this.pokemon1 : this.pokemon2;

      this.mensaje = `Combate ${this.ronda}: ${this.nombre(this.pokemon1)} contra ${this.nombre(this.pokemon2)}. `
        + `Empieza ${this.nombre(primero)} por ser más rápido.`;

      this.historial.unshift(`--- Combate ${this.ronda}: ${this.nombre(this.pokemon1)} vs ${this.nombre(this.pokemon2)} ---`);

    } catch {

      this.error = 'No se pudieron cargar los ataques. Revisa tu conexión e intenta de nuevo.';

    } finally {

      this.cargando = false;
      this.cd.detectChanges();

    }
  }

  obtenerEstadistica(pokemon: Pokemon, nombre: string): number {

    const estadistica = pokemon.stats.find(s => s.stat.name === nombre);

    return estadistica ? estadistica.base_stat : 50;
  }

  nombre(pokemon: Pokemon): string {
    return pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  }

  nombreMovimiento(movimiento: Movimiento): string {
    return this.moveService.nombreEnEspanol(movimiento);
  }

  async atacar(movimiento: Movimiento) {

    if (this.estado !== 'combate' || this.cargando || this.combateTerminado) {
      return;
    }

    this.cargando = true;
    this.textoCarga = 'Ejecutando ataque...';
    this.error = '';
    this.cd.detectChanges();

    try {

      const atacante = this.turno === 1 ? this.pokemon1 : this.pokemon2;
      const defensor = this.turno === 1 ? this.pokemon2 : this.pokemon1;
      const nombreAtaque = this.nombreMovimiento(movimiento);

      // Regla: precisión del movimiento (si es null, el ataque nunca falla)
      const acierta = movimiento.accuracy === null || Math.random() * 100 < movimiento.accuracy;

      let mensaje: string;

      if (!acierta) {

        mensaje = `${this.nombre(atacante)} usó ${nombreAtaque}, pero falló.`;

      } else {

        const efectividad = await this.typeService.calcularEfectividad(
          movimiento.type.name,
          defensor.types.map(t => t.type.name)
        );

        
        const mismoTipo = atacante.types.some(t => t.type.name === movimiento.type.name) ? 1.5 : 1;

       
        const especial = movimiento.damage_class.name === 'special';
        const ataque = this.obtenerEstadistica(atacante, especial ? 'special-attack' : 'attack');
        const defensa = this.obtenerEstadistica(defensor, especial ? 'special-defense' : 'defense');

        const potencia = movimiento.power || 40;

        let danio = 0;

        if (efectividad > 0) {
          danio = Math.max(
            1,
            Math.floor((potencia * ataque / Math.max(1, defensa) / 5) * efectividad * mismoTipo)
          );
        }

        if (this.turno === 1) {
          this.vida2 = Math.max(0, this.vida2 - danio);
        } else {
          this.vida1 = Math.max(0, this.vida1 - danio);
        }

        mensaje = `${this.nombre(atacante)} usó ${nombreAtaque} (${movimiento.type.name}) e hizo ${danio} de daño.`;

        if (efectividad === 0) {
          mensaje += ' ¡No afecta al rival!';
        } else if (efectividad > 1) {
          mensaje += ' ¡Es muy efectivo!';
        } else if (efectividad < 1) {
          mensaje += ' No es muy efectivo.';
        }
      }

      this.historial.unshift(mensaje);

      if (this.combateTerminado) {
        this.terminarCombate(atacante);
      } else {
        this.turno = this.turno === 1 ? 2 : 1;
        this.mensaje = `${mensaje} Ahora es el turno de ${this.nombreTurno}.`;
      }

    } catch {

      this.error = 'No se pudo ejecutar el ataque. Intenta nuevamente.';

    } finally {

      this.cargando = false;
      this.cd.detectChanges();

    }
  }

  private terminarCombate(ganador: Pokemon) {

    if (this.vida1 === 0) {
      this.victorias2++;
    } else {
      this.victorias1++;
    }

    this.mensaje = `¡${this.nombre(ganador)} ganó el combate ${this.ronda}!`;
    this.historial.unshift(this.mensaje);

  
    if (this.ronda === 3) {
      this.estado = 'finalizado';
      const campeon = this.victorias1 > this.victorias2 ? this.jugador1 : this.jugador2;
      this.mensaje = `¡${campeon} es el campeón del torneo!`;
    }
  }

  siguienteCombate() {

    if (this.estado !== 'combate' || this.ronda >= 3 || !this.combateTerminado) {
      return;
    }

    this.ronda++;
    this.iniciarCombate();
  }

  nuevoTorneo() {
    this.estado = 'seleccion';
    this.equipo1 = [];
    this.equipo2 = [];
    this.movimientos1 = [];
    this.movimientos2 = [];
    this.historial = [];
    this.mensaje = '';
    this.error = '';
  }
}
