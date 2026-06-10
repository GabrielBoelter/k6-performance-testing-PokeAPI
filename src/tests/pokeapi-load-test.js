import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getPokemonDuration = new Trend('get_pokemon', true);
export const getSpeciesDuration = new Trend('get_species', true);
export const getPokemonListDuration = new Trend('get_pokemon_list', true);

export const RatePokemonOK = new Rate('pokemon_OK');
export const RateSpeciesOK = new Rate('species_OK');
export const RatePokemonListOK = new Rate('pokemon_list_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.05'],
    get_pokemon: ['p(95)<800'],
    get_species: ['p(95)<800'],
    get_pokemon_list: ['p(95)<700'],
    pokemon_OK: ['rate>0.95'],
    species_OK: ['rate>0.95'],
    pokemon_list_OK: ['rate>0.95']
  },
  stages: [
    { duration: '10s', target: 2 },
    { duration: '20s', target: 5 },
    { duration: '10s', target: 10 },
    { duration: '10s', target: 0 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export function setup() {
  const BASE_URL = 'https://pokeapi.co/api/v2';

  const res = http.get(`${BASE_URL}/pokemon?limit=100&offset=0`);

  check(res, { 'setup: lista carregada': r => r.status === 200 });

  const names = JSON.parse(res.body).results.map(p => p.name);

  console.log(`Setup: ${names.length} pokémons carregados da API.`);

  return { names };
}

const BASE_URL = 'https://pokeapi.co/api/v2';
const OK = 200;

const params = {
  headers: { 'Content-Type': 'application/json' }
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomId(min = 1, max = 150) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function ({ names }) {
  const resPokemon = http.get(
    `${BASE_URL}/pokemon/${randomItem(names)}`,
    params
  );

  getPokemonDuration.add(resPokemon.timings.duration);
  RatePokemonOK.add(resPokemon.status === OK);

  check(resPokemon, {
    'GET Pokemon - Status 200': () => resPokemon.status === OK,
    'GET Pokemon - Tem campo name': () =>
      JSON.parse(resPokemon.body).name !== undefined,
    'GET Pokemon - Tem campo types': () =>
      Array.isArray(JSON.parse(resPokemon.body).types)
  });

  const resSpecies = http.get(
    `${BASE_URL}/pokemon-species/${randomId()}`,
    params
  );

  getSpeciesDuration.add(resSpecies.timings.duration);
  RateSpeciesOK.add(resSpecies.status === OK);

  check(resSpecies, {
    'GET Species - Status 200': () => resSpecies.status === OK,
    'GET Species - Tem flavor_text': () => {
      const body = JSON.parse(resSpecies.body);
      return (
        Array.isArray(body.flavor_text_entries) &&
        body.flavor_text_entries.length > 0
      );
    }
  });

  const offset = Math.floor(Math.random() * 45) * 20;
  const resList = http.get(
    `${BASE_URL}/pokemon?limit=20&offset=${offset}`,
    params
  );

  getPokemonListDuration.add(resList.timings.duration);
  RatePokemonListOK.add(resList.status === OK);

  check(resList, {
    'GET Pokemon List - Status 200': () => resList.status === OK,
    'GET Pokemon List - Retorna 20 itens': () =>
      JSON.parse(resList.body).results.length === 20
  });
}
