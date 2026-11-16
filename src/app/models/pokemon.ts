
// Respuesta de /pokemon/{nombre} (solo los campos que usa la app)
export interface Pokemon {
  id: number;
  name: string;

  sprites: {
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };

  types: {
    type: {
      name: string;
    };
  }[];

  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];

  moves: {
    move: {
      name: string;
      url: string;
    };
  }[];
}

// Elemento del catálogo /pokemon?limit=151
export interface PokemonResumen {
  name: string;
  url: string;
}

// Respuesta de /move/{nombre}
export interface Movimiento {
  id: number;
  name: string;
  power: number | null;
  accuracy: number | null;
  type: { name: string };
  damage_class: { name: string };
  names: { name: string; language: { name: string } }[];
}

// Respuesta de /type/{nombre}
export interface TipoPokemon {
  name: string;
  damage_relations: {
    double_damage_from: { name: string }[];
    half_damage_from: { name: string }[];
    no_damage_from: { name: string }[];
  };
}
