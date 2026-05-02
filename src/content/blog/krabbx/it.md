---
title: "Una dashboard self-hosted per Renovate Bot"
subtitle: "Come usare Krabbx per monitorare le versioni delle dipendenze e le PR di aggiornamento aperte nella tua organizzazione GitHub"
category: "DevOps"
lang: "it"
date: "2025-05-01"
tags: ["renovate", "dependency-management", "devsecops", "kubernetes", "observability"]
image: "/blog/krabbx/krabbx.webp"
---

## Perché mai dovremmo averne bisogno?

Ogni progetto moderno dipende da decine di librerie, e tenerle aggiornate è una questione di sicurezza e stabilità. [Renovate Bot](https://docs.renovatebot.com/) automatizza questo processo aprendo PR quando sono disponibili nuove versioni. GitHub offre il proprio Dependabot, ma Renovate supporta una gamma più ampia di package manager, permette di raggruppare gli aggiornamenti in una singola PR, offre regole di automerge granulari e funziona in modo identico su qualsiasi piattaforma Git, non solo GitHub. Renovate si integra inoltre in modo naturale con i workflow assistiti da AI: i custom manager e i post-upgrade command permettono di collegare strumenti AI per correggere automaticamente le breaking change o generare codice di migrazione, mentre il Copilot Autofix di Dependabot è limitato alle patch di sicurezza. Una volta adottato Renovate su un'intera organizzazione, però, emergono nuove domande: *Quali repository usano davvero Renovate? Quante PR di aggiornamento si stanno accumulando? Quali sono le dipendenze più obsolete e trascurate?*

GitHub non offre alcuna vista aggregata dell'attività sulle PR. Bisogna aprire ogni repository, verificare se esiste un file di configurazione, scorrere le PR aperte e ricostruire mentalmente lo stato delle diverse dipendenze. Con 10 repo è tedioso; con 50+ è ingestibile.

**In sintesi:** nessuna dashboard centralizzata per l'adozione di Renovate, nessuna vista cross-repo sulle dipendenze, nessun punteggio di salute che indichi a colpo d'occhio dove si accumula il debito tecnico.

## Una possibile soluzione: Krabbx

[Krabbx](https://github.com/banshee86vr/krabbx) è una dashboard open-source e self-hosted che monitora l'adozione di Renovate Bot e l'attività di aggiornamento delle dipendenze nelle organizzazioni GitHub. Scansiona i repository tramite le API GitHub, rileva se Renovate è configurato (file di configurazione, workflow YAML o evidenze nelle PR), analizza le PR aperte di Renovate per estrarre i dati sulle dipendenze e presenta tutto in un'unica interfaccia con aggiornamenti in tempo reale.

![Vista principale della dashboard Krabbx: card riepilogative, classifica di salute e badge](/blog/krabbx/dashboard.webp)
*Vista principale della dashboard: repository totali, tasso di adozione, dipendenze obsolete, classifica di salute e badge.*

## Cosa ci offre la dashboard?

La pagina **Dashboard** mostra tre card riepilogative in alto: repository totali, tasso di adozione di Renovate e dipendenze obsolete totali con il numero di PR aperte. Sotto, una sezione **Health & achievements** visualizza il trend delle dipendenze obsolete dell'organizzazione in una finestra di 14 giorni.

La **Health leaderboard** classifica i repository con un punteggio di salute da 0 a 100 basato su tre assi: freshness (rapporto di dipendenze obsolete), major discipline (penalità per drift su versioni major) e PR remediation (bonus per PR Renovate attive). I **Badge** evidenziano traguardi come "Zero Major Drift" per i repo senza pacchetti obsoleti su versioni major.

![Repository più obsoleti e le dipendenze più obsolete](/blog/krabbx/dashboard_cards.webp)
*Card inferiori: repository più obsoleti e le dipendenze più obsolete con utilizzo cross-repo.*

Tre card aggiuntive mostrano i **repository più obsoleti** e le **dipendenze più obsolete** (con link alle PR di Renovate in ogni repo che le utilizza).

La pagina **Repositories** elenca tutti i repository sincronizzati con lo stato di adozione ("Adopted" o "Not adopted"), il punteggio di salute, il conteggio delle PR aperte, il numero di dipendenze, l'ultima scansione e i contributori.

![Lista repository con stato di adozione, punteggio di salute e PR aperte](/blog/krabbx/repositories.webp)
*Lista repository: filtra per stato di adozione, ordina per punteggio di salute e accedi al dettaglio di ogni repo.*

Da qui si può accedere alla pagina **Repository Detail**. Questa vista mostra il punteggio di salute delle dipendenze con un grafico radar per i tre assi di scoring, il dettaglio di come viene calcolato il punteggio, il ranking nell'organizzazione e una tabella di tutte le PR Renovate aperte con nome del pacchetto, versione corrente, ultima versione e tipo di aggiornamento (patch, minor, major).

![Dettaglio repository: radar del punteggio di salute, calcolo dello score e PR Renovate aperte](/blog/krabbx/repository_details.webp)
*Dettaglio repository: punteggio di salute con calcolo trasparente, grafico radar e lista delle PR Renovate aperte.*

La pagina **Dependencies** è una vista globale e filtrabile di tutte le dipendenze tracciate nell'organizzazione. Si può filtrare per sole dipendenze obsolete, cercare per nome del pacchetto e filtrare per tipo di aggiornamento. Ogni riga mostra il repository, il tipo di package manager, la versione corrente e l'ultima disponibile, e un link diretto alla PR Renovate su GitHub.

![Vista globale delle dipendenze con ricerca, filtri e link alle PR](/blog/krabbx/dependencies.webp)
*Pagina Dependencies: ricerca tra tutte le dipendenze dell'organizzazione, filtri per stato di obsolescenza e tipo di aggiornamento.*

La **scansione live** avviene in background con avanzamento in tempo reale. Un overlay modale mostra lo stato della scansione in corso (es. "4 of 7 repositories") con una barra di avanzamento, così si sa sempre a che punto è la scansione.

![Modale di scansione live con barra di avanzamento](/blog/krabbx/scanning.webp)

## Requisiti

- Node.js 24+
- pnpm
- Un GitHub Personal Access Token con scope `repo` ([creane uno qui](https://github.com/settings/tokens))
- (Opzionale) PostgreSQL per lo storage persistente
- (Opzionale) Redis per la gestione delle sessioni e lo scaling di Socket.IO

## Step di preparazione

### 1. Clone del repository e installazione delle dipendenze

```bash
git clone https://github.com/banshee86vr/krabbx.git
cd krabbx
pnpm install
```

### 2. Configurazione dell'ambiente

```bash
cp .env.example .env
```

Modificare il file `.env` con le proprie impostazioni:

```env
# Scanner GitHub
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_TARGETS=your-org,your-username

# Auth (disabilitare per demo locale)
AUTH_ENABLED=false
ALLOW_INSECURE_NOAUTH=true

# Storage: memory per quick start, database per persistenza
STORAGE_MODE=memory

# Sessione
SESSION_SECRET=your_random_32_character_secret_string
```

`GITHUB_TARGETS` accetta una lista separata da virgole di nomi di organizzazioni o utenti GitHub. Tutti i repository sotto quei proprietari verranno scansionati.

### 3. Avvio dell'applicazione

```bash
pnpm run dev
```

Il frontend si avvia su `http://localhost:5173` e l'API backend su `http://localhost:3001`. Cliccare **Scan** nella barra superiore e la dashboard inizierà a scansionare i repository, rilevare le configurazioni Renovate e analizzare le PR aperte.

### 4. (Opzionale) Abilitare la modalità database per storage persistente

Per mantenere i dati tra un riavvio e l'altro, avviare un'istanza PostgreSQL:

```bash
docker run --name krabbx-postgres \
  -e POSTGRES_DB=krabbx \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:18
```

Aggiornare il file `.env`:

```env
STORAGE_MODE=database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/krabbx?sslmode=disable
```

Eseguire le migrazioni Prisma e riavviare:

```bash
pnpm run db:generate
pnpm run db:migrate
pnpm run dev
```

### 5. (Opzionale) Abilitare GitHub OAuth per l'accesso multi-utente

Per ambienti team, creare una GitHub OAuth App nelle [GitHub Developer Settings](https://github.com/settings/developers):

- **Application name**: `Krabbx Dashboard`
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:3001/api/auth/callback`

Aggiornare il file `.env`:

```env
AUTH_ENABLED=true
ALLOW_INSECURE_NOAUTH=false
GITHUB_AUTH_CLIENT_ID=your_oauth_client_id
GITHUB_AUTH_CLIENT_SECRET=your_oauth_client_secret
```

Si può opzionalmente restringere l'accesso a uno specifico team GitHub con `GITHUB_AUTH_TEAM_SLUG`.

## Architettura (in breve)

Frontend React 19 + TypeScript con Vite, Tailwind, TanStack Query e Recharts; backend Node.js con Express 5 e TypeScript, Prisma ORM e Socket.IO per gli aggiornamenti in tempo reale. Lo storage ha due modalità: `STORAGE_MODE=memory` per lo sviluppo (Map in-process, zero configurazione), `STORAGE_MODE=database` per la produzione con PostgreSQL. Le sessioni e Socket.IO possono scalare opzionalmente via Redis.

Il motore di scansione utilizza le API GitHub (Octokit) per rilevare l'adozione di Renovate attraverso tre opzioni: presenza di file di configurazione (`renovate.json`, `.renovaterc`, ecc.), marker nei workflow YAML (Renovate GitHub Action, azioni Mend, immagini Docker), ed evidenze nelle PR (PR aperte o chiuse di recente dal bot Renovate). I dati sulle dipendenze vengono estratti analizzando titoli e body delle PR di Renovate.

## Docker Compose

Il modo più rapido per eseguire l'intero stack in modalità produzione:

```bash
cp .env.example .env
# modificare .env con il proprio token GitHub e i target
pnpm run docker:up
```

Questo avvia PostgreSQL, Redis, il backend, un job di migrazione Prisma e un frontend con nginx. I servizi sono disponibili su `http://localhost:5173` (frontend) e `http://localhost:3001` (API).

```bash
pnpm run docker:down  # fermare lo stack
```

## Deploy su Kubernetes

Krabbx include un Helm chart in `helm/renovate-dashboard/` che effettua il provisioning di deployment separati per backend e frontend, StatefulSet opzionali per PostgreSQL e Redis, Ingress con routing basato su path (`/`, `/api`, `/socket.io`), un Job di migrazione e security context non-root. I valori di produzione includono autoscaling, TLS con cert-manager, network policy e PodDisruptionBudget.

```bash
helm install krabbx ./helm/renovate-dashboard \
  --set backend.github.token=your_token \
  --set backend.github.targets="your-org" \
  --set backend.session.secret=your_session_secret
```

## In sintesi

Con `pnpm run dev` hai una dashboard che scansiona la tua organizzazione GitHub, rileva l'adozione di Renovate, traccia ogni dipendenza obsoleta, assegna a ogni repository un punteggio da 0 a 100 e aggiorna in tempo reale. Parti in modalità memory per provarla in pochi minuti, poi passi a PostgreSQL quando serve persistenza. Per chi usa Renovate su più repository, Krabbx è la vista centralizzata che GitHub non fornisce.
