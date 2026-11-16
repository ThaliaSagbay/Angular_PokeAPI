
import { Component, ChangeDetectorRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { PokemonResumen } from '../../models/pokemon';
import { PokemonService } from '../../services/pokemon';

export interface SeleccionEquipos {
  equipo1: string[];
  equipo2: string[];
}

@Component({
  selector: 'app-team-selector',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './team-selector.html',
  styleUrl: './team-selector.css'
})
export class TeamSelectorComponent implements OnInit {

  @Input() jugador1 = 'Jugador 1';
  @Input() jugador2 = 'Jugador 2';
  @Input() deshabilitado = false;

  @Output() equiposSeleccionados = new EventEmitter<SeleccionEquipos>();

  catalogo: PokemonResumen[] = [];
  cargandoCatalogo = true;
  errorCatalogo = '';
  busqueda = '';

  seleccionJugador1: string[] = [];
  seleccionJugador2: string[] = [];

  constructor(
    private pokemonService: PokemonService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarCatalogo();
  }

  async cargarCatalogo() {

    this.cargandoCatalogo = true;
    this.errorCatalogo = '';
    this.cd.detectChanges();

    try {
      this.catalogo = await this.pokemonService.getListaPokemon();
    } catch {
      this.errorCatalogo = 'No se pudo cargar el catálogo de Pokémon. Revisa tu conexión.';
    } finally {
      this.cargandoCatalogo = false;
      this.cd.detectChanges();
    }
  }

  get completo(): boolean {
    return this.seleccionJugador1.length === 3 && this.seleccionJugador2.length === 3;
  }

  estaSeleccionado(nombre: string): boolean {
    return this.seleccionJugador1.includes(nombre) || this.seleccionJugador2.includes(nombre);
  }

  // Mientras el equipo 1 no esté completo, elige el jugador 1
  get turno(): number {
    return this.seleccionJugador1.length < 3 ? 1 : 2;
  }

  seleccionarPokemon(nombre: string) {

    if (this.deshabilitado || this.completo || this.estaSeleccionado(nombre)) {
      return;
    }

    if (this.turno === 1) {
      this.seleccionJugador1 = [...this.seleccionJugador1, nombre];
    } else {
      this.seleccionJugador2 = [...this.seleccionJugador2, nombre];
    }

    if (this.completo) {
      this.equiposSeleccionados.emit({
        equipo1: [...this.seleccionJugador1],
        equipo2: [...this.seleccionJugador2]
      });
    }
  }

  quitarPokemon(jugador: number, nombre: string) {

    if (this.deshabilitado) {
      return;
    }

    if (jugador === 1) {
      this.seleccionJugador1 = this.seleccionJugador1.filter(n => n !== nombre);
    } else {
      this.seleccionJugador2 = this.seleccionJugador2.filter(n => n !== nombre);
    }
  }

  reiniciarSeleccion() {
    this.seleccionJugador1 = [];
    this.seleccionJugador2 = [];
    this.busqueda = '';
  }

  obtenerImagen(url: string): string {

    const partes = url.split('/');
    const id = partes[partes.length - 2];

    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
  }

  pokemonFiltrados(): PokemonResumen[] {

    const texto = this.busqueda.trim().toLowerCase();

    return this.catalogo.filter(pokemon => pokemon.name.includes(texto));
  }
}
