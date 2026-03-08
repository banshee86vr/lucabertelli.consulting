---
title: "Una dashboard self-hosted per le GitHub Actions"
subtitle: "Come usare Snorlx per ottenere visibilità centralizzata, metriche DORA e aggiornamenti in tempo reale su tutti i repository"
category: "DevOps"
lang: "it"
date: "2025-03-08"
tags: ["github-actions", "cicd", "devsecops", "kubernetes", "devops-metrics", "observability"]
image: "/blog/snorlx/snorlx.jpg"
---

## Perché mai dovremmo averne bisogno?

Le GitHub Actions sono diventate lo standard de facto per l'automazione CI/CD nell'ecosistema cloud-native. Dai semplici check di linting ai deploy multi-ambiente, la maggior parte dei repository moderni si affida (o dovrebbe farlo 😅) a dei workflow per compilare, testare e rilasciare software. GitHub mostra in maniera efficace le esecuzioni dei workflow all'interno di un singolo repository: si clicca sulla tab Actions, si scorre l'elenco delle run e si verifica il loro stato. Abbastanza semplice e lineare quando si lavora con poche manciate di repository.

Ma cosa succede quando un organizzazione scala raggiungendo 50, 100 o più repository, ognuno contenente più workflow? Improvvisamente ci si ritrova a gestire centinaia di pipeline attive. Quando un deployment in produzione fallisce la prima domanda che ci si pone sarà probabilmente: Quale repository? Quale workflow? Cosa è andato storto? L'interfaccia nativa di GitHub non offre alcuna aggregazione cross-repository, costringendo a navigare tra i repository uno per uno, nella speranza di individuare l'icona rossa.

Oltre al problema operativo, esiste un gap strategico. Il [programma di ricerca DORA](https://dora.dev) ha definito quattro metriche chiave che predicono le performance di delivery del software: Deployment Frequency, Lead Time for Changes, Change Failure Rate e Mean Time to Recovery (MTTR). Queste metriche rappresentano lo standard per poter valutare velocità e affidabilità. Eppure le GitHub Actions non forniscono alcun modo nativo per calcolarle. I team finiscono per scrivere script ad-hoc, esportare dati su spreadsheet o acquistare costose piattaforme SaaS solo per rispondere alla domanda: *stiamo migliorando o peggiorando nella nostra capacità di rilasciare software?*

## Quindi? Qual è il problema?

Analizziamo nel dettaglio i principali punti critici che i team di platform engineering affrontano quotidianamente.

**Nessun pannello di controllo centrale.** GitHub mostra le esecuzioni dei workflow per singolo repository. Non esiste una dashboard unificata a livello di organizzazione. Se si vuole vedere quali workflow sono falliti nell'ultima ora su tutti i repository, bisogna controllare ciascuno individualmente.

**Le metriche DORA non sono visibili.** Deployment Frequency, Lead Time, Change Failure Rate e MTTR devono essere calcolate esternamente. GitHub fornisce i dati grezzi (workflow run con timestamp e risultati), ma nessuno strumento per aggregarli e confrontarli con i benchmark di settore.

**Trasparenza nei costi** GitHub Actions fattura al minuto, ma la dashboard di billing fornisce solo i totali mensili aggregati. Non esiste una ripartizione dei costi per workflow o per repository, rendendo impossibile identificare quali pipeline consumano la maggior parte del budget. Questo problema è diventato ancora più urgente alla luce della vicenda dei prezzi che si è sviluppata tra dicembre 2025 e marzo 2026. A metà dicembre 2025, GitHub ha [annunciato una ristrutturazione dei prezzi delle Actions](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/): i prezzi dei runner hosted sono stati ridotti fino al 39% a partire dal 1° gennaio 2026 (ora in vigore), ma è stata anche annunciata una nuova "cloud platform charge" di $0,002 al minuto, vale a dire una tariffa che avrebbe dovuto applicarsi anche ai runner self-hosted a partire dal 1° marzo 2026. La reazione è stata immediata e violenta. Nell'arco di 24 ore, sviluppatori su Reddit, GitHub Discussions e social media si sono [rivoltati contro l'idea](https://github.com/orgs/community/discussions/182186) di pagare tariffe al minuto per un'orchestrazione eseguita sul proprio hardware. Un utente ha calcolato $3.500 in più al mese sulla propria fattura; laboratori di ricerca hanno avvertito che i progetti finanziati con fondi pubblici sarebbero diventati insostenibili; il consenso della community era che il modello di pricing fosse fondamentalmente inadeguato per i casi d'uso self-hosted. GitHub ha [ritirato la decisione](https://github.com/orgs/community/discussions/182186) il giorno dopo, ammettendo di "aver mancato il bersaglio" e posticipando la tariffa per i self-hosted runner a tempo indeterminato. Ad oggi, superata la scadenza originale del 1° marzo 2026, la tariffa non è mai stata implementata, i runner self-hosted rimangono gratuiti e nessuna nuova data è stata comunicata. Ma GitHub ha chiarito che l'economia di fondo non è cambiata: il control plane delle Actions ha costi reali, e una qualche forma di monetizzazione arriverà. La conclusione? Il panorama dei costi delle GitHub Actions è in uno stato di incertezza attiva. I team che non dispongono di una visibilità per-workflow su dove vengono consumati i minuti si troveranno impreparati quando arriverà il prossimo cambiamento di pricing (e purtroppo prima o poi *arriverà*). Una dashboard che visualizzi in modo chiaro l'utilizzo dei runner per workflow e per repository non è più un optional, ma una necessità anche finanziaria.

Soluzioni commerciali come Datadog CI Visibility, Harness o Buildkite risolvono alcuni di questi problemi, ma comportano costi non trascurabili, vendor lock-in e in alcuni casi anche problematiche di data sovereignty. Per i team che vogliono mantenere la telemetria CI/CD in-house, il panorama è sorprendentemente scarso.

## Una possibile soluzione: Snorlx

[Snorlx](https://github.com/banshee86vr/snorlx) è una dashboard CI/CD open-source e self-hosted progettata specificamente per le GitHub Actions. Aggrega tutte le esecuzioni dei workflow di tutti i repository e le organizzazioni in un'unica interfaccia, calcola automaticamente le metriche DORA, fornisce aggiornamenti in tempo reale via WebSocket e offre il tracking dei costi per workflow e per repository.

![Dashboard](/blog/snorlx/dashboard.png)

L'architettura segue un design pulito a tre livelli:

**Frontend**: React 18 con TypeScript, TanStack Query per il data fetching e il caching, Recharts per le visualizzazioni delle metriche, e Tailwind CSS v4 con supporto completo a tema dark/light.

**Backend**: Go con il router Chi, che fornisce un'API REST, autenticazione GitHub OAuth, elaborazione degli eventi webhook per gli aggiornamenti in tempo reale, e un hub WebSocket che trasmette istantaneamente i cambiamenti di stato delle pipeline a tutti i client connessi.

**Database**: PostgreSQL potenziato con TimescaleDB per l'ottimizzazione delle serie temporali. I workflow run e i job sono salvati in hypertable partizionate per timestamp, con aggregati continui che pre-calcolano automaticamente le metriche giornaliere (tassi di successo, durate, percentili) ogni ora. Una policy di retention impedisce al database di crescere senza limiti eliminando i dati più vecchi di un anno.

Il progetto è utilizzabile in due modalità di storage diverse. Impostando `STORAGE_MODE=memory`, si ottiene una dashboard completamente funzionale, senza dipendenze esterne né database. Questa modalità è pensata lo sviluppo in locale. Quando si è pronti per la produzione, basta passare a `STORAGE_MODE=database` e puntare a PostgreSQL per lo storage persistente.

![Snorlx architecture](/blog/snorlx/architecture.jpg)

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

## Cosa ci offre la dashboard?

Una volta in esecuzione, la dashboard di Snorlx mette a disposizione diverse viste.

La pagina **Dashboard** mostra le card riepilogative per repository totali, workflow e statistiche dei run (tasso di successo, run in corso, confronti con il periodo precedente), grafici ad area per i trend di successo/fallimento degli ultimi 30 giorni, un grafico a torta per la distribuzione dei risultati e una sezione live che mostra le pipeline in esecuzione e in coda. La sezione delle pipeline attive contatta il backend recuperando gli ultimi workflow run direttamente da GitHub per tutti i repository noti prima di restituire i risultati, in modo che le pipeline appena avviate appaiano immediatamente senza attendere una sincronizzazione completa.

La pagina **Metrics** offre un approfondimento sulle metriche DORA con periodi configurabili (7 giorni, 30 giorni, 90 giorni). Ognuna delle quattro metriche (Deployment Frequency, Lead Time, Change Failure Rate, MTTR) viene visualizzata con il proprio valore calcolato e un badge colorato di rating (elite, high, medium, low) basato sui benchmark di settore. Un grafico ad area visualizza i trend dei deployment nel periodo selezionato. Il calcolo delle metriche si basa sui workflow marcati come workflow di deployment tramite un toggle (`is_deployment_workflow`), e un endpoint di backfill marca retroattivamente i run storici affinché le metriche DORA vengano calcolate sul dataset corretto. Anche il calcolo del Lead Time è stato migliorato con un nuovo campo `commit_timestamp` che traccia il timestamp effettivo del commit per misurazioni commit-to-production più accurate.

![Metrics](/blog/snorlx/metrics.png)

La pagina **Runs** offre un elenco filtrabile e paginato di tutti i workflow run su tutti i repository, con filtri per stato, risultato, branch, tipo di evento e attore. La pagina **Run Detail** entra nel dettaglio con la gerarchia completa dei job, lo stato a livello di singolo step, le timeline delle durate, le annotazioni degli errori, un visualizzatore YAML della definizione del workflow e link diretti ai log su GitHub. I dati dei job possono essere aggiornati forzatamente da GitHub tramite `?refresh=true` per evitare risultati cached obsoleti.

![Workflows runs](/blog/snorlx/runs.png)

Il **tracking dei costi** diventa particolarmente rilevante dato l'attuale stato di incertezza del modello di pricing di GitHub. La riduzione dei prezzi dei runner hosted è già in vigore, ma la questione del billing per i self-hosted rimane irrisolta — GitHub ha esplicitamente dichiarato che l'economia di fondo non è scomparsa, solo la timeline. Snorlx fornisce un'analisi dei costi per-workflow e per-repository basata sull'utilizzo dei runner, permettendo di identificare le pipeline più costose, prendere decisioni informate sull'allocazione dei runner (self-hosted vs. GitHub-hosted, ora che i prezzi hosted sono calati significativamente), e — aspetto cruciale — modellare l'impatto di futuri cambiamenti di pricing prima che si riflettano sulla fattura. Quando GitHub annuncerà un modello di pricing rivisto per i self-hosted, i team che utilizzano Snorlx potranno calcolare immediatamente l'esposizione anziché trovarsi a rincorrere i numeri.

## Deploy su Kubernetes

Snorlx include un Helm chart in `helm/snorlx/` che effettua il provisioning di deployment separati per backend e frontend, un StatefulSet TimescaleDB interno opzionale, i Kubernetes secrets, una risorsa Ingress, e security context che impongono l'esecuzione non-root con capabilities eliminate.

L'applicazione segue la [metodologia 12-Factor](https://12factor.net/) end-to-end: configurazione tramite variabili d'ambiente, processi stateless, graceful shutdown su SIGTERM, logging strutturato in JSON, e migrazioni automatiche all'avvio.

## Quindi cosa ci portiamo a casa?

Snorlx colma un vuoto reale nell'ecosistema delle GitHub Actions fornendo il layer di visibilità organizzativa che l'interfaccia nativa di GitHub non offre. Con un singolo comando `pnpm run dev` si ottiene una dashboard completamente funzionale che aggrega tutti i workflow run, calcola le metriche DORA, traccia i costi e fornisce aggiornamenti in tempo reale. Tutto in uno scenario self-hosted, tutto open-source, tutto sotto il proprio controllo.

La vicenda dei prezzi delle GitHub Actions di fine 2025 dove una riduzione del 39% sui runner hosted ora in vigore, accompagnata da una platform charge per i self-hosted annunciata, contestata e ritirata nell'arco di 24 ore ha dimostrato che il costo della CI/CD non è più qualcosa su cui le organizzazioni possono permettersi di essere reattive. La scadenza originale del 1° marzo 2026 è passata senza che la tariffa venisse implementata, ma GitHub ha chiarito che si tratta di una questione di *quando*, non di *se*, una qualche forma di monetizzazione dei runner self-hosted arriverà. I team che dispongono già di una visibilità granulare sull'utilizzo dei runner per workflow e per repository potranno assorbire qualsiasi novità senza ritrovarsi in affanno. Snorlx fornisce esattamente questa visibilità.

La modalità di storage duale rende la valutazione priva di frizioni: si parte con la modalità memory per vedere il valore in cinque minuti, per poi passare a PostgreSQL con TimescaleDB quando si è pronti per la persistenza in produzione. L'Helm chart, la configurazione Docker Compose e la conformità 12-Factor garantiscono un comportamento prevedibile dell'applicazione indipendentemente da dove venga deployata: un laptop, una VM o un cluster Kubernetes.

Per qualsiasi team che utilizzi le GitHub Actions su più di una manciata di repository, Snorlx trasforma l'osservabilità CI/CD da un'attività per singolo repository a una capability organizzativa con risultati DORA misurabili e stimando risultati di costo misurabili.

Tags /

- [github-actions](/it/blog?tag=github-actions)
- [cicd](/it/blog?tag=cicd)
- [devsecops](/it/blog?tag=devsecops)
- [kubernetes](/it/blog?tag=kubernetes)
- [devops-metrics](/it/blog?tag=devops-metrics)
- [observability](/it/blog?tag=observability)