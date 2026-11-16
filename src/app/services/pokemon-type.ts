
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TipoPokemon } from '../models/pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonTypeService {

  private http = inject(HttpClient);
  private apiUrl = 'https://pokeapi.co/api/v2/type/';

  // Guardo los tipos ya consultados para no repetir la misma petición en cada ataque
  private cache = new Map<string, TipoPokemon>();

  async getType(nombre: string): Promise<TipoPokemon> {

    const clave = nombre.toLowerCase();
    const guardado = this.cache.get(clave);

    if (guardado) {
      return guardado;
    }

    try {
      const tipo = await firstValueFrom(this.http.get<TipoPokemon>(this.apiUrl + clave));
      this.cache.set(clave, tipo);
      return tipo;
    } catch {
      throw new Error('No se encontró el tipo');
    }
  }

  // Multiplicador de daño de un tipo de ataque contra los tipos del defensor
  async calcularEfectividad(tipoAtaque: string, tiposDefensor: string[]): Promise<number> {

    let efectividad = 1;

    for (const nombreTipo of tiposDefensor) {

      const relaciones = (await this.getType(nombreTipo)).damage_relations;

      if (relaciones.no_damage_from.some(t => t.name === tipoAtaque)) {
        return 0;
      }

      if (relaciones.double_damage_from.some(t => t.name === tipoAtaque)) {
        efectividad *= 2;
      }

      if (relaciones.half_damage_from.some(t => t.name === tipoAtaque)) {
        efectividad *= 0.5;
      }
    }

    return efectividad;
  }
}
