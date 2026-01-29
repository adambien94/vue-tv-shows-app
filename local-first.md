# TV Shows App

Aplikacja Vue.js do przeglądania seriali TV z wykorzystaniem API TVMaze.

## Uruchomienie

```bash
# Instalacja zależności
npm install

# Tryb deweloperski
npm run dev

# Build produkcyjny (wymagany do testowania Service Worker)
npm run build
npm run preview

# Testy jednostkowe
npm run test:unit

# Sprawdzenie typów TypeScript
npm run type-check
```

**Wymagania:** Node.js ^20.19.0 lub >=22.12.0

---

## Co zostało zaimplementowane?

### 1. Architektura Local-First z IndexedDB

**Problem:** API TVMaze ma limity zapytań (max 20 na 10 sekund) i nie ma endpointu do pobierania seriali po gatunku.

**Rozwiązanie:** Zamiast odpytywać API przy każdej wizycie, pobieramy dane RAZ i przechowujemy je lokalnie w przeglądarce.

```
┌─────────────────────────────────────────────────────────┐
│  Pierwsze uruchomienie:                                  │
│  API TVMaze → IndexedDB (przeglądarka)                  │
│                                                          │
│  Kolejne uruchomienia:                                   │
│  IndexedDB → Aplikacja (natychmiast!)                   │
└─────────────────────────────────────────────────────────┘
```

**Pliki:**

| Plik | Opis |
|------|------|
| [`src/db/index.ts`](src/db/index.ts) | Definicja bazy danych IndexedDB z użyciem biblioteki Dexie.js |
| [`src/services/syncService.ts`](src/services/syncService.ts) | Logika synchronizacji danych z API |
| [`src/composables/useMovies.ts`](src/composables/useMovies.ts) | Composable Vue do dostępu do danych (local-first) |

---

### 2. Grupowanie po gatunkach bez dedykowanego endpointu

**Problem:** API TVMaze NIE ma endpointu typu `/shows?genre=Drama`. Endpoint `/shows` zwraca wszystkie seriale z tablicą gatunków:

```json
{
  "id": 1,
  "name": "Breaking Bad",
  "genres": ["Drama", "Crime", "Thriller"]
}
```

**Rozwiązanie:** Używamy "multi-entry index" w IndexedDB. To specjalny typ indeksu, który dla tablicy `["Drama", "Crime", "Thriller"]` tworzy TRZY wpisy w indeksie - po jednym dla każdego gatunku.

```javascript
// src/db/index.ts
this.version(1).stores({
  shows: 'id, name, *genres, rating.average'
  //                ↑
  //     Gwiazdka (*) = multi-entry index
})
```

**Jak to działa:**

```
Dane w tabeli "shows":
┌────┬───────────────┬─────────────────────────────┐
│ id │ name          │ genres                      │
├────┼───────────────┼─────────────────────────────┤
│ 1  │ Breaking Bad  │ ["Drama", "Crime"]          │
│ 2  │ Friends       │ ["Comedy", "Romance"]       │
└────┴───────────────┴─────────────────────────────┘

Indeks "genres" (automatycznie tworzony):
┌─────────┬──────────────┐
│ Genre   │ Wskazuje na  │
├─────────┼──────────────┤
│ Drama   │ id: 1        │
│ Crime   │ id: 1        │
│ Comedy  │ id: 2        │
│ Romance │ id: 2        │
└─────────┴──────────────┘

Teraz możemy zapytać: "daj mi wszystkie seriale z gatunku Drama"
→ Natychmiastowy wynik z lokalnej bazy!
```

**Plik:** [`src/composables/useMovies.ts`](src/composables/useMovies.ts) - computed `moviesByGenre` grupuje seriale po gatunkach i sortuje po ratingu.

---

### 3. Rate Limiting (ograniczanie liczby zapytań)

**Problem:** TVMaze pozwala na max 20 zapytań na 10 sekund. Przekroczenie = błąd HTTP 429.

**Rozwiązanie:** Kolejka zapytań z automatycznym opóźnieniem i exponential backoff przy błędzie 429.

```
Normalne działanie:
  Zapytanie 1 → 500ms przerwy → Zapytanie 2 → 500ms przerwy → ...

Przy błędzie 429:
  Błąd → czekaj 1s → retry → błąd → czekaj 2s → retry → błąd → czekaj 4s → ...
```

**Plik:** [`src/services/rateLimiter.ts`](src/services/rateLimiter.ts)

```javascript
// Zamiast zwykłego fetch:
const response = await fetch(url)

// Używamy throttledFetch:
import { throttledFetch } from '@/services/rateLimiter'
const response = await throttledFetch(url)
```

---

### 4. Wsparcie trybu offline

Aplikacja działa nawet bez internetu dzięki dwóm mechanizmom:

#### A) Service Worker - cachuje pliki aplikacji

**Co to robi:** Zapisuje HTML, CSS i JavaScript w pamięci przeglądarki. Dzięki temu sama aplikacja może się załadować offline.

**Plik:** [`public/sw.js`](public/sw.js)

```
Online:  Przeglądarka → Internet → Serwer → index.html
Offline: Przeglądarka → Service Worker → Cache → index.html
```

**Rejestracja:** [`src/main.ts`](src/main.ts)

#### B) IndexedDB - cachuje dane seriali

**Co to robi:** Zapisuje dane pobrane z API (lista seriali, szczegóły, wyniki wyszukiwania).

**Pliki:** [`src/db/index.ts`](src/db/index.ts), [`src/services/syncService.ts`](src/services/syncService.ts)

```
┌─────────────────────────────────────────────────────────┐
│            WSPARCIE OFFLINE                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Service Worker          IndexedDB                       │
│  ────────────────        ─────────                       │
│  Cachuje:                Cachuje:                        │
│  • index.html            • Dane seriali                  │
│  • Pliki JavaScript      • Wyniki wyszukiwania           │
│  • Style CSS             • Szczegóły obejrzanych         │
│                                                          │
│  = Aplikacja się         = Aplikacja ma                  │
│    ŁADUJE offline          DANE offline                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### C) Banner offline

Gdy użytkownik jest offline, na górze ekranu pojawia się żółty banner informujący o trybie offline.

**Pliki:**
- [`src/components/OfflineBanner.vue`](src/components/OfflineBanner.vue) - komponent bannera
- [`src/composables/useNetwork.ts`](src/composables/useNetwork.ts) - śledzenie statusu sieci

---

### 5. Wskaźnik synchronizacji

Podczas ładowania danych z API wyświetlany jest pasek postępu.

**Plik:** [`src/components/SyncStatus.vue`](src/components/SyncStatus.vue)

---

## Struktura plików

```
src/
├── db/
│   └── index.ts              # Baza danych IndexedDB (Dexie.js)
│
├── services/
│   ├── rateLimiter.ts        # Kolejka zapytań z rate limiting
│   └── syncService.ts        # Synchronizacja danych z API
│
├── composables/
│   ├── useMovies.ts          # Dostęp do danych seriali (local-first)
│   └── useNetwork.ts         # Śledzenie statusu online/offline
│
├── components/
│   ├── OfflineBanner.vue     # Banner "Jesteś offline"
│   ├── SyncStatus.vue        # Pasek postępu synchronizacji
│   └── ...                   # Pozostałe komponenty UI
│
├── views/
│   ├── HomeView.vue          # Strona główna z gatunkami
│   ├── SearchView.vue        # Wyszukiwarka
│   └── MovieDetailsView.vue  # Szczegóły serialu
│
└── main.ts                   # Rejestracja Service Worker

public/
├── sw.js                     # Service Worker
└── manifest.json             # Manifest PWA
```

---

## Przepływ danych

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Widok Vue  │────▶│  useMovies   │────▶│  IndexedDB   │
│  (HomeView)  │     │ (composable) │     │   (Dexie)    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                            ▼                    │
                     ┌──────────────┐            │
                     │ syncService  │◀───────────┘
                     │              │     (sprawdza czy dane są świeże)
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ rateLimiter  │
                     │              │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  TVMaze API  │
                     │              │
                     └──────────────┘
```

---

## Testowanie trybu offline

1. Zbuduj aplikację produkcyjną:
   ```bash
   npm run build
   npm run preview
   ```

2. Otwórz aplikację w przeglądarce i poczekaj aż dane się zsynchronizują

3. Otwórz DevTools → Application → Service Workers
   - Powinien być widoczny aktywny `sw.js`

4. Otwórz DevTools → Network → zaznacz "Offline"

5. Odśwież stronę - aplikacja powinna działać z danymi z cache!

---

## Użyte technologie

- **Vue 3** + Composition API
- **TypeScript** - typowanie statyczne
- **Dexie.js** - wrapper na IndexedDB (prostsza składnia)
- **Tailwind CSS** - stylowanie
- **Vite** - bundler
- **Vitest** - testy jednostkowe

---

## Dlaczego te decyzje?

| Decyzja | Powód |
|---------|-------|
| **IndexedDB zamiast localStorage** | localStorage ma limit 5MB i nie obsługuje indeksów. IndexedDB może przechowywać setki MB i umożliwia szybkie zapytania. |
| **Dexie.js zamiast raw IndexedDB** | Natywne API IndexedDB jest skomplikowane (callbacks, transakcje). Dexie daje proste Promise-based API. |
| **Local-first zamiast API-first** | Szybsze ładowanie (dane lokalne = natychmiast), mniej zapytań do API (rate limit), działa offline. |
| **Service Worker ręcznie zamiast vite-plugin-pwa** | Pełna kontrola nad strategią cachowania, prostsze do zrozumienia, mniej zależności. |
| **Multi-entry index na genres** | Jedyny sposób na efektywne filtrowanie po gatunkach gdy API nie oferuje takiego endpointu. |
