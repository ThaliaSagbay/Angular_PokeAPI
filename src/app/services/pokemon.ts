
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Pokemon, PokemonResumen } from '../models/pokemon';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private http = inject(HttpClient);
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon/';

  async getPokemon(nombre: string): Promise<Pokemon> {
    try {
      return await firstValueFrom(
        this.http.get<Pokemon>(this.apiUrl + nombre.trim().toLowerCase())
      );
    } catch {
      throw new Error(`No se encontró el Pokémon "${nombre}"`);
    }
  }

  async getListaPokemon(): Promise<PokemonResumen[]> {
    try {
      const datos = await firstValueFrom(
        this.http.get<{ results: PokemonResumen[] }>(this.apiUrl + '?limit=151')
      );
      return datos.results;
    } catch {
      throw new Error('No se pudo cargar el catálogo');
    }
  }
}
