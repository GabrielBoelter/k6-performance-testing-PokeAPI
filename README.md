# Grafana K6 Performance Testing

## GitHub Actions + SonarCloud

[![K6 Performance Testing](https://github.com/ugioni/k6-performance-testing/actions/workflows/node.js.yml/badge.svg)](https://github.com/ugioni/k6-performance-testing/actions/workflows/node.js.yml)

</br>

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ugioni_playwright-e2e&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ugioni_playwright-e2e)

## Getting Started

In order to execute this project you must follow the steps below:

1. Install [Node JS](https://nodejs.org/) (version >= 22.x)
1. Install [Grafana K6](https://dl.k6.io/msi/k6-latest-amd64.msi)
1. Run `npm i --save-dev` to install all the project dependencies
1. Run `npm run ci` to execute the entire test suite

All execution reports can be found in `src/output`.

---

## Project Structure

```
src/
├── tests/
│   └── pokeapi-load-test.js   # Main test script
└── output/
    ├── index.html             # HTML report (k6-reporter)
    └── dashboard.html         # Web dashboard export
```

---

## Test Target

This project runs performance tests against the [PokéAPI](https://pokeapi.co/), a free and open Pokémon REST API.

The list of Pokémons used in the tests is fetched dynamically from the API at runtime via the `setup()` function — no hardcoded data in the test script.

### Endpoints under test

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pokemon/{name}` | Fetch a Pokémon by name |
| GET | `/pokemon-species/{id}` | Fetch species data by ID |
| GET | `/pokemon?limit=20&offset={n}` | Paginated Pokémon list |

---

## Load Stages

| Stage | Duration | Target VUs |
|-------|----------|------------|
| Ramp-up | 10s | 2 |
| Load | 20s | 5 |
| Peak | 10s | 10 |
| Ramp-down | 10s | 0 |

---

## Thresholds

Calibrated from real test runs. Values use `p(95)` — more stable than `p(99)` against the occasional spikes of a public API with no SLA.

| Metric | Threshold |
|--------|-----------|
| `http_req_failed` | `rate < 5%` |
| `get_pokemon` | `p(95) < 800ms` |
| `get_species` | `p(95) < 800ms` |
| `get_pokemon_list` | `p(95) < 700ms` |
| `pokemon_OK` | `rate > 95%` |
| `species_OK` | `rate > 95%` |
| `pokemon_list_OK` | `rate > 95%` |

---

## Custom Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `get_pokemon` | Trend | Response time for `/pokemon/{name}` |
| `get_species` | Trend | Response time for `/pokemon-species/{id}` |
| `get_pokemon_list` | Trend | Response time for the paginated list |
| `pokemon_OK` | Rate | % of requests that returned HTTP 200 |
| `species_OK` | Rate | % of requests that returned HTTP 200 |
| `pokemon_list_OK` | Rate | % of requests that returned HTTP 200 |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `ci` | `npm run ci` | Format, verify and run tests |
| `test` | `npm run test` | Run tests with web dashboard |
| `format` | `npm run format` | Auto-format with Prettier |
| `verify` | `npm run verify` | Check formatting with Prettier |
