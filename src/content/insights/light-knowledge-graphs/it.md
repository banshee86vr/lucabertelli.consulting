---
key: "light-knowledge-graphs"
lang: "it"
title: "Quando un knowledge graph leggero rende possibile una migrazione di piattaforma"
subtitle: "Persone e agenti AI servono fatti interrogabili. Senza, le grandi migrazioni CI/CD restano tribali e si arenano."
seoTitle: "Knowledge graph per agenti e migrazioni | Luca Bertelli"
date: "2026-08-14"
image: "/insights/light-knowledge-graphs/light-knowledge-graphs.webp"
relatedServices: ["knowledge-graphs", "ai-engineering", "platform-engineering", "devops"]
---

## La migrazione che non parte

La migrazione di una piattaforma CI/CD legacy quasi sempre parte in salita, se non fallisce, quando nessuno sa rispondere a quattro domande senza aver bisogno di ore o giorni per rispondere:

1. Quali use-case copriamo davvero e con quali tecnologie?
2. Cosa copre già la piattaforma e la libreria CI/CD di destinazione?
3. Che cosa manca, e quanto spesso compare?
4. Quali unità di lavoro si assomigliano abbastanza per poter ricondurle ad un modello riusabile?

Anche provando a migrare solo con un agente AI, senza una base di fatti interrogabili, il progetto rischia di diventare inefficiente e troppo costoso: serve comunque una mappa affidabile, e senza di questa sia le persone che gli agenti finiscono per perdere tempo tra congetture e tentativi, rendendo difficile pianificare e stimare davvero il lavoro e i relativi progressi.

È il punto in cui una [consulenza knowledge graph](/it/servizi/consulenza-knowledge-graph/) smette di essere un esercizio di ricerca e diventa la condizione che rende la migrazione sostenibile.

## Fatti, non più contesto

Spesso si parte con centinaia, se non migliaia, di file il cui codice non è stato verificato o mantenuto nel tempo. In questo scenario, gli agenti AI incontrano subito una difficoltà fondamentale: la conoscenza pregressa non è presente nel prompt ma è dispersa tra cataloghi, inventari, repository e nella memoria di poche persone (spesso non più presenti). Aggiungere semplicemente più file nel contesto non porta maggiore copertura, ma solo a congetture più sicure di sé.

Un knowledge graph leggero capovolge l'approccio. I fatti tipizzati vengono estratti dalle sorgenti tramite un processo deterministico e ripetibile, senza coinvolgere agenti AI. Così si ottiene uno schema chiaro fatto di nodi, relazioni dirette e un mapping mantenuto con cura, che permette di riconoscere quando due elementi con nomi diversi rispondono allo stesso intento o scopo. Questo mette le persone e gli agenti AI in condizione di navigarli, anche tramite server MCP dedicati.

Il grafo non migra nulla. Ti dice che cosa è pronto, che cosa è bloccato, e che cosa sarebbe insicuro inventare. Decidono ancora le persone. Gli agenti smettono di riempire i buchi con finzioni.

## Che cosa si intende per "leggero"

Non è un programma enterprise di knowledge graph. Non è Neo4j come scelta tecnologica. Non è RDF (Resource Description Framework), dove i dati sono triplette soggetto-predicato-oggetto tipiche del Semantic Web e delle ontologie formali. Qui parliamo di un approccio pragmatico e leggero, non di un framework semantico. Non è nemmeno un secondo wiki dove si chiede alle persone di tenere allineato a mano. Nodi, proprietà e relazioni si definiscono ad hoc, calati sul contesto del cliente e sugli use-case.

Leggero significa:

- lo schema sta in una review;
- gli estrattori leggono artefatti che l'organizzazione possiede già;
- il mapping è un file su cui si può dissentire, non un modello che inferisce il significato;
- il refresh è gestibile con pochissime risorse e non necessita delle grosse moli tipiche del refresh di RAG o graphRAG.

## Il caso CI/CD, senza folklore

Prendi una piattaforma CI/CD legacy con anni di pipeline, step condivisi, credenziali e script fatti una volta sola. La destinazione ha pezzi riusabili. Sulla carta lo spostamento è ovvio. In pratica non lo sai dimensionare, perché "che cosa abbiamo" e "che cosa coprono" non condividono una chiave di join.

Un mapping per capability è quella join. I primitivi sul lato sorgente (uno step, un task, un CLI) e i provider sul lato destinazione (un workflow riusabile, un template) si incontrano sullo stesso intento. Allora la copertura diventa una semplice query. Le lacune si ordinano per quanto lavoro bloccano. Le pipeline simili diventano modelli riconducibili per capability e use-case coperti.

Senza quello, i team o si congelano o quasi sempre riscrivono tutto da zero. La riscrittura sembra progresso per un trimestre ma poi si ricade ancora nel problema di capire cosa manca e quanti casi sono stati realmente coperti. La sicurezza segue lo stesso taglio. Non puoi sostenere una destinazione più sicura se non sai elencare quali credenziali, quali comandi privilegiati e quali percorsi non mappati verrebbero copiati alla cieca.

## Cosa serve per partire

La [consulenza DevOps](/it/servizi/consulenza-devops/) aiuta a ottenere una buona pratica di delivery: pipeline che funzionano, ownership che non è una sola persona. Il [Platform Engineering](/it/servizi/consulenza-platform-engineering/) può arrivare solo quando è possibile definire dei golden path, una volta identificati i percorsi che vale la pena estrarre. La [governance degli agenti AI](/it/servizi/consulenza-agenti-ai/), quando l'evoluzione verso gli agenti è avvenuta o è in corso, è indispensabile per definire e mantenere policy, identità e costi.

Il grafo è lo strato sotto, quando agenti AI, mappatura dell'esistente e migrazioni servono la stessa verità operativa. MCP senza fatti è un'altra integrazione. Un programma di piattaforma senza inventario rischia di essere un portale fine a sé stesso.

## Quando ha senso

Se sapete rispondere alle quattro domande sopra, probabilmente non vi serve questo. Se rispondervi richiede interrogare uno specifico collega, una catena di grep e una riunione in cui tre mappe non coincidono, [contattatemi](mailto:info@lucabertelli.consulting) per capire insieme lo use-case che volete analizzare (quante unità di lavoro, quali cataloghi esistono, chi o cosa oggi possiede la mappa). La pagina di servizio precisa perimetro, risultati attesi e FAQ: [consulenza knowledge graph](/it/servizi/consulenza-knowledge-graph/).
