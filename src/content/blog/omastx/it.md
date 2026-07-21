---
title: "A caccia di fossili nella tua fleet di cluster K8s"
subtitle: "Come usare Omastx per scovare immagini e chart Helm obsoleti"
category: "DevOps"
lang: "it"
date: "2026-07-26"
tags: ["kubernetes", "helm", "drift", "observability", "devsecops", "fleet-management"]
image: "/blog/omastx/omastx.webp"
---

## Perché mai dovremmo averne bisogno?

Gestire un singolo cluster Kubernetes significa già gestire immagini container e release Helm. Gestire una *fleet* moltiplica il problema: ogni namespace porta con sè i propri workload e le proprie chart con le relative versioni, e il dubbio "siamo aggiornati?" diventa una domanda a cui si risponde aprendo dashboard, UI dei registry ed eseguendo comandi `helm list` un cluster alla volta.

I team di platform questo peso lo sentono per primi. La security chiede quali cluster usano ancora un tag Redis deprecato. Il prodotto chiede se i cluster `prod-eu` e `prod-us` sono allineati. Sai che *qualcosa* è indietro, ma non esiste un unico posto che risponda: *Quanto è aggiornata/obsoleta la mia fleet?*

Esistono tool commerciali per la fleet, ma spesso richiedono permessi in scrittura, installano agent su ogni cluster, oppure nascondono i gap di versione dentro un prodotto ops più ampio. Gli script fatti in casa scansionano i registry e producono CSV già obsoleti a pranzo.

**In sintesi:** nessuna vista in sola lettura che confronti continuamente ciò che è *in esecuzione* con ciò che è *latest* upstream, tra immagini e chart Helm, con un grafico navigabile invece di un foglio di calcolo.

## Una possibile soluzione: Omastx

[Omastx](https://github.com/banshee86vr/omastx) è un portale web open-source che scansiona i cluster Kubernetes, scopre immagini container e release Helm, risolve le ultime versioni upstream e mostra il gap come classi di drift navigabili: Current, Patch, Minor, Major, Deprecated e Unknown. È in sola lettura by design: anche se colleghi un kubeconfig da amministratore, Omastx usa solo chiamate di lettura alle API Kubernetes (`get`/`list` su workload e, per le release Helm, sui secrets): mai create, update, delete o altri comandi invasivi.

![Vista Fleet: 50% dei workload aggiornati, barre di drift per cluster e rail di stato](/blog/omastx/fleet.webp)
*Pagina Fleet: percentuale di workload aggiornati in evidenza, barre di drift aggregate per cluster e rail con failure, ultime scan e stato di connessione.*

## Cosa ci offre la dashboard?

La pagina **Fleet** si apre con un unico numero: la quota di workload aggiornati per tutti i cluster connessi. Sotto, ogni cluster è una lane orizzontale di segmenti che riportano tutti i drift. Un click su un segmento apre il ledger degli artifact già filtrato per quel cluster e quella classe di drift. Il rail di destra evidenzia cosa richiede attenzione (cluster degraded, scan fallite), lo storico recente delle scan e lo stato delle connessioni.

Aprendo un cluster viene proposto lo stesso tipo di grafico ma applicato alle **lane per namespace**. Si vedono schedule, API server, ultima scan, un breakdown del drift, un breve trend e il mix tra immagini e chart Helm. Le scan recenti sono cliccabili: ogni link "View artifacts" apre il ledger limitato a quel cluster.

![Dettaglio cluster prod-eu: lane di drift per namespace, breakdown e scan recenti](/blog/omastx/cluster_drift.webp)
*Dettaglio cluster: barre di drift a livello di namespace, card analitiche e storico scan con salto diretto al ledger.*

Non tutti i cluster concedono lo stesso RBAC. Se manca l'accesso ai secrets, Omastx resta utile in modalità **images-only**: in questo caso la discovery Helm viene saltata, il cluster è marcato DEGRADED e compare un banner chiaro sul permesso da aggiungere. Il drift Unknown, invece,  compare quando un registry non è risolvibile (ad esempio un host privato senza credenziali).

![Cluster degraded prod-us: modalità images-only con drift unknown](/blog/omastx/cluster_degraded.webp)
*Cluster degraded: accesso Helm assente, immagini comunque scansionate, segmento Unknown quando un registry non è risolvibile.*

Il ledger **Artifacts** è la lista globale e filtrabile di ogni immagine e chart scoperti, ordinata per quanto è driftata. Si filtra per cluster, kind (image o chart), classe di drift e namespace; si cerca per nome. Ogni riga mostra installed → latest e un badge di drift.

Dalla stessa tabella è possibile esportare il risultato filtrato in formato CSV oppure PDF. I filtri attivi valgono per entrambi i formati: ciò che vedi in tabella è ciò che esce nel file.

![Ledger degli artifact sulla fleet](/blog/omastx/artifacts.webp)
*Pagina Artifacts: ledger con filtri e pulsanti Export CSV / Export PDF.*

Un click sulla singola riga apre il **foglio di dettaglio** dell'artifact: identity, URL del registry o del chart repo, confidence del match Helm, release di ritardo, sparkline dello storico e versioni candidate quando il canale del tag consente il confronto.

![Ledger filtrato e dettaglio artifact per il major drift di ingress-nginx](/blog/omastx/artifact_detail.webp)
*Drill-down: filtro sul major drift in un namespace, poi apertura del foglio con installed → latest, confidence e metadati.*

![Ledger filtrato su prod-eu / platform / major](/blog/omastx/artifacts_filtered.webp)
*Lo stesso ledger dopo aver ristretto a un cluster, un namespace e solo major drift.*

**Connect a cluster** permette tramite un flusso guidato di trascinare o incollare un kubeconfig, scegliendo i context per poi impostare nome e schedule cron per pianificare le scansioni.

![Onboarding Connect cluster con drop zone del kubeconfig](/blog/omastx/connect.webp)
*Flusso Connect: drop o paste di un kubeconfig in sola lettura; Omastx verifica i permessi prima di salvare.*

Le credenziali per i registry privati si possono associare, ad esempio, quando il drift viene classificato come Unknown e l'artefatto punta ad un host che richiede autenticazione.

## Requisiti

- Docker + Compose (via più rapida), **oppure** Go 1.26+ e Node 20+ per lo sviluppo nativo
- PostgreSQL (incluso in Compose; esterno nelle installazioni Helm tipiche)
- Un kubeconfig in sola lettura per cluster (get/list sui workload; secrets per la discovery delle release Helm)
- In produzione: una [GitHub OAuth App](https://github.com/settings/developers) e membership nella GitHub org configurata (o il proprio username per un'installazione personale)

## Step di preparazione

### 1. Clone del repository

```bash
git clone https://github.com/banshee86vr/omastx.git
cd omastx
```

### 2. Avvio locale con Docker Compose

```bash
make dev   # oppure: docker compose -f deploy/docker-compose.yml up --build
```

Aprire http://localhost:8080. In questa modalità si è autenticati automaticamente (nessuna credenziale o file `.env` richiesto).

### 3. (Opzionale) Sviluppo nativo con hot reload

Per il lavoro quotidiano, Postgres in Docker e API + Vite sull'host:

```bash
make dev-local
```

Aprire http://localhost:5173. Vite fa proxy di `/api` sul backend in `:8484` e autentica automaticamente.

### 4. Connettere un cluster ed eseguire una scan

Nella UI, aprire **+ Connect cluster**, trascinare un kubeconfig in sola lettura, selezionare i context da importare, confermare il check dei permessi e impostare lo schedule di scan. Cliccare **Scan now** sulla pagina del cluster (o attendere il cron). A scan terminata, headline e lane di drift sulla Fleet si aggiornano; aprire **Artifacts** per percorrere il ledger.

### 5. (Opzionale) Seed dei dati demo

Per esplorare la UI senza una fleet reale, il repository include un percorso di seed usato per gli screenshot di questo articolo (`make seed` / lo script di capture sotto `docs/screenshots/article/`).

## Architettura (in breve)

![Architettura Omastx: frontend React, backend Go, PostgreSQL, cluster Kubernetes in sola lettura e sorgenti upstream](/blog/omastx/architecture.webp)
*Frontend React, backend Go con provider/resolver pluggable, PostgreSQL, discovery read-only sui cluster e resolve delle versioni da registry OCI, repo Helm e Artifact Hub.*

## Docker Compose

Lo stack Compose in `deploy/docker-compose.yml` esegue la fase di build e avvia Postgres, l'API Go e il frontend con nginx. Le immagini di release sono pubblicate su GitHub Container Registry: `ghcr.io/banshee86vr/omastx-backend` e `ghcr.io/banshee86vr/omastx-frontend`.

```bash
make dev          # build e avvio
# aprire http://localhost:8080
```

## Deploy su Kubernetes

Omastx include un Helm chart in `deploy/chart/omastx`. Si crea un Secret con master key, credenziali GitHub OAuth, gate dell'org, base URL e database URL, poi si installa con `existingSecret` (i values non templano mai i secret inline).

Registrare una GitHub OAuth App con callback `${OMASTX_BASE_URL}/api/auth/github/callback`. Solo i membri di `OMASTX_GITHUB_ORG` possono accedere.

```bash
kubectl create secret generic omastx \
  --from-literal=OMASTX_MASTER_KEY=$(openssl rand -hex 32) \
  --from-literal=OMASTX_GITHUB_CLIENT_ID=... \
  --from-literal=OMASTX_GITHUB_CLIENT_SECRET=... \
  --from-literal=OMASTX_GITHUB_ORG=your-org \
  --from-literal=OMASTX_BASE_URL=https://omastx.example.com \
  --from-literal=DATABASE_URL=postgres://user:pass@host:5432/omastx

helm install omastx deploy/chart/omastx --set existingSecret=omastx
```

Per un'installazione di prova con Postgres incluso:

```bash
helm install omastx deploy/chart/omastx \
  --set existingSecret=omastx --set postgres.internal.enabled=true
```

Il chart esegue container non-root con security context hardening; il prodotto non richiede mai permessi di scrittura Kubernetes sui cluster che monitora.

## In sintesi

Con `make dev` hai un portale che risponde a una sola domanda per l'intera fleet: quanti fossili troveremo sui nostri cluster? Colleghi kubeconfig in sola lettura, scansiona periodicamente, verifichi la tipologia di drift sul grafico e scendi nel dettaglio di ogni immagine e chart Helm nel ledger. Open-source e nessun percorso di scrittura sui tuoi cluster. Per chi gestisce più di un ambiente Kubernetes, Omastx è la vista sul drift che `kubectl` e `helm list` non aggregano mai.
