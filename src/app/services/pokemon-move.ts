
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Movimiento, Pokemon } from '../models/pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonMoveService {

  private http = inject(HttpClient);
  private apiUrl = 'https://pokeapi.co/api/v2/move/';

  private cache = new Map<string, Movimiento>();

  async getMove(nombre: string): Promise<Movimiento> {

    const clave = nombre.toLowerCase();
    const guardado = this.cache.get(clave);

    if (guardado) {
      return guardado;
    }

    try {
      const movimiento = await firstValueFrom(this.http.get<Movimiento>(this.apiUrl + clave));
      this.cache.set(clave, movimiento);
      return movimiento;
    } catch {
      throw new Error('No se encontró el movimiento');
    }
  }

  /**
   * Arma la lista de hasta 4 ataques para un combate.
   * Tomo varios movimientos repartidos en la lista del Pokémon, me quedo con
   * los que hacen daño y trato de que sean de tipos distintos.
   */
  async getMovimientosCombate(pokemon: Pokemon, cantidad = 4): Promise<Movimiento[]> {

    const nombres = pokemon.moves.map(m => m.move.name);
    const candidatos = this.repartir(nombres, 12);

    const resultados = await Promise.allSettled(candidatos.map(n => this.getMove(n)));

    const conDanio = resultados
      .filter((r): r is PromiseFulfilledResult<Movimiento> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter(m => (m.power ?? 0) > 0 && m.damage_class.name !== 'status');

    const elegidos: Movimiento[] = [];

    // Primero uno por cada tipo diferente
    for (const movimiento of conDanio) {
      if (elegidos.length < cantidad && !elegidos.some(e => e.type.name === movimiento.type.name)) {
        elegidos.push(movimiento);
      }
    }

    // Si faltan, completo con los que queden
    for (const movimiento of conDanio) {
      if (elegidos.length < cantidad && !elegidos.includes(movimiento)) {
        elegidos.push(movimiento);
      }
    }

    // Por si el Pokémon no tiene ningún ataque con daño (ej. Magikarp, Ditto)
    if (elegidos.length === 0) {
      elegidos.push(await this.getMove('struggle'));
    }

    return elegidos;
  }

  nombreEnEspanol(movimiento: Movimiento): string {
    const traduccion = movimiento.names.find(n => n.language.name === 'es');
    return traduccion ? traduccion.name : movimiento.name;
  }

  // Devuelve hasta "maximo" elementos repartidos a lo largo de la lista
  private repartir(lista: string[], maximo: number): string[] {

    if (lista.length <= maximo) {
      return lista;
    }

    const paso = lista.length / maximo;
    const resultado: string[] = [];

    for (let i = 0; i < maximo; i++) {
      resultado.push(lista[Math.floor(i * paso)]);
    }

    return resultado;
  }
}
