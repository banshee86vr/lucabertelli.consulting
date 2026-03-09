---
title: "Una dashboard self-hosted per le GitHub Actions"
subtitle: "Come usare Snorlx per ottenere visibilità centralizzata e aggiornamenti in tempo reale su tutti i repository"
category: "DevOps"
lang: "it"
date: "2025-03-08"
tags: ["github-actions", "cicd", "devsecops", "kubernetes", "observability"]
image: "/blog/snorlx/dashboard.png"
---

## Perché mai dovremmo averne bisogno?

Le GitHub Actions sono lo standard per l'automazione CI/CD. GitHub mostra bene le run *dentro* un singolo repository, ma quando un'organizzazione ha 50, 100 o più repo con decine di workflow, non c'è alcuna vista aggregata: per capire cosa è fallito bisogna aprire repo per repo. Di conseguenza i team spessono devono arrangiarsi con script custom o prodotti SaaS costosi.

**In sintesi:** nessuna vista centralizzata e nessuna ripartizione dei costi per workflow/repository (GitHub fattura al minuto ma mostra solo totali mensili). Le soluzioni commerciali esistono ma con costi non trascurabili e portano inveitabilmenet vendor lock-in. 

## Una possibile soluzione: Snorlx

[Snorlx](https://github.com/banshee86vr/snorlx) è una dashboard CI/CD open-source e self-hosted per le GitHub Actions: aggrega tutte le run in un'unica interfaccia, fornisce aggiornamenti in tempo reale via WebSocket, tracking costi per workflow e repository, e il **repository scoring** (punteggio per repo su Security, Testing, CI/CD, Documentation, Code Quality, Maintenance, Community con tier gold/silver/bronze).

![Vista principale della dashboard Snorlx: card riepilogative, trend e pipeline attive](/blog/snorlx/dashboard.png)
*Vista principale della dashboard: card riepilogative, trend successo/fallimento e pipeline in esecuzione.*

## Cosa ci offre la dashboard?

La pagina **Dashboard** mostra card per repository, workflow e statistiche run (tasso di successo, run in corso, confronti con il periodo precedente), grafici per i trend degli ultimi 30 giorni, distribuzione risultati, una sezione live con pipeline in esecuzione e in coda, e la media del punteggio dei repository e il numero di repo “graded”.

![Sonrlx dashboard](/blog/snorlx/dashboard.png)
![Scanning dei reposity all'interno della GitHub Organization](/blog/snorlx/scanning.png)

La pagina **Repositories** elenca i repository sincronizzati; per ognuno puoi vedere il **repository score** (se calcolato): un punteggio complessivo in percentuale e un tier (gold, silver, bronze) basato su sette categorie: Security, Testing, CI/CD, Documentation, Code Quality, Maintenance e Community ricavate dai dati GitHub (branch protection, Dependabot, code scanning, README, file di config, community profile, ecc.). Lo score viene calcolato durante la sync o on-demand con “Refresh grade” dalla pagina di dettaglio del repository; nel dettaglio trovi il grafico a radar per le sette dimensioni e l’elenco dei check pass/fail.

![Sonrlx dashboard](/blog/snorlx/repositories.png)

![Scoring dei repository](/blog/snorlx/scoring.png)

La pagina **Runs** è un elenco filtrabile e paginato di tutti i workflow run; la **Run Detail** mostra la gerarchia dei job, stato degli step, timeline, annotazioni errori, YAML del workflow e link ai log su GitHub. I dati si possono aggiornare da GitHub con `?refresh=true`.

![Ricerca tra tutti i workflow della organization](/blog/snorlx/workflows.png)

![Elenco delle run con filtri per stato, branch, evento](/blog/snorlx/runs.png)
*Elenco run con filtri e paginazione; da qui si accede al dettaglio di ogni run.*

![Dettagli e log della run specifica](/blog/snorlx/run_details.png)

Il **tracking dei costi** per workflow e per repository permette di identificare le pipeline più costose e modellare l'impatto di eventuali cambi di pricing. Con `STORAGE_MODE=memory` si può provare tutto senza database; per la produzione si passa a `STORAGE_MODE=database` e PostgreSQL con TimescaleDB.

## Requisiti

- Go 1.21+
- Node.js 20+
- pnpm (consigliato) o npm
- Una GitHub OAuth App ([creane una qui](https://github.com/settings/developers))
- PostgreSQL 14+ con TimescaleDB (solo per la modalità database)

## Step di preparazione

### 1. Clone del repository e installazione delle dipendenze

```bash
git clone https://github.com/banshee86vr/snorlx.git
cd snorlx
pnpm install
```

### 2. Creazione di una GitHub OAuth App

Accedere alle [GitHub Developer Settings](https://github.com/settings/developers), cliccare **OAuth Apps** → **New OAuth App** e compilare:

- **Application name**: `Snorlx Dashboard`
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:8080/api/auth/callback`

Copiare il **Client ID** e generare un **Client Secret**.

### 3. Configurazione dell'ambiente

```bash
cp env.example .env
```

Modificare il file `.env` con le proprie credenziali:

```env
# Modalità sviluppo
DEV_MODE=true

# Modalità storage: memory per quick start, database per persistenza
STORAGE_MODE=memory

# GitHub OAuth
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret

# Sicurezza sessione (generare con: openssl rand -base64 32)
SESSION_SECRET=your_random_32_character_secret_string

# URL
PORT=8080
FRONTEND_URL=http://localhost:5173
```

### 4. Avvio dell'applicazione

```bash
# Dalla root del progetto: avvia contemporaneamente frontend e backend
pnpm run dev
```

L'applicazione si avvierà su due porte: il frontend su `http://localhost:5173` e l'API backend su `http://localhost:8080`. Effettuare il login con GitHub e la dashboard inizierà a sincronizzare i repository, i workflow e i run.

### 5. (Opzionale) Abilitare la modalità database per storage persistente

Per mantenere i dati tra un riavvio e l'altro, avviare un'istanza TimescaleDB:

```bash
docker run --name snorlx-postgres \
  -e POSTGRES_DB=snorlx \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d timescale/timescaledb:latest-pg16
```

Aggiornare il file `.env`:

```env
STORAGE_MODE=database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/snorlx?sslmode=disable
```

Riavviare l'applicazione: le migrazioni vengono eseguite automaticamente all'avvio.

## Architettura (in breve)

Frontend React 18 + TypeScript con TanStack Query e Recharts; backend Go (Chi router) con OAuth GitHub, webhook e WebSocket per gli aggiornamenti in tempo reale; PostgreSQL con TimescaleDB per le serie temporali, hypertable e aggregati continui. Due modalità: `STORAGE_MODE=memory` per sviluppo/quick start, `STORAGE_MODE=database` per produzione.

![Schema dell'architettura a tre livelli: frontend, backend, database](/blog/snorlx/architecture.jpg)
*Architettura a tre livelli: frontend, backend, database.*

## Deploy su Kubernetes

Snorlx include un Helm chart in `helm/snorlx/` che effettua il provisioning di deployment separati per backend e frontend, StatefulSet TimescaleDB opzionale, secrets, Ingress e security context non-root.

## In sintesi

Con `pnpm run dev` hai una dashboard che aggrega le run di tutti i repo, traccia i costi, assegna uno score a ogni repository (gold/silver/bronze) e aggiorna in tempo reale: self-hosted, open-source, sotto il tuo controllo. Parti in modalità memory per provarla in pochi minuti, poi passi a PostgreSQL quando serve persistenza. Per chi usa GitHub Actions su molti repository, Snorlx è la vista centrale che GitHub non fornisce.

Tags /

- [github-actions](/it/blog?tag=github-actions)
- [cicd](/it/blog?tag=cicd)
- [devsecops](/it/blog?tag=devsecops)
- [kubernetes](/it/blog?tag=kubernetes)
- [observability](/it/blog?tag=observability)