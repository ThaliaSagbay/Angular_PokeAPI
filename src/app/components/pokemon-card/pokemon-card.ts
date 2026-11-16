
import { Component, Input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Pokemon } from '../../models/pokemon';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCardComponent {

  @Input({ required: true }) pokemon!: Pokemon;

  // Si se envía la vida, la tarjeta muestra la barra (modo combate)
  @Input() vida: number | null = null;
  @Input() vidaMaxima = 0;

  @Input() grande = false;

  get imagen(): string {
    return this.pokemon.sprites.other['official-artwork'].front_default ?? '';
  }

  get porcentajeVida(): number {
    if (this.vida === null || this.vidaMaxima === 0) {
      return 0;
    }
    return (this.vida / this.vidaMaxima) * 100;
  }
}
