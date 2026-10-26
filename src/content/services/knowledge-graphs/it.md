---
key: "knowledge-graphs"
lang: "it"
title: "Consulenza temporal knowledge graph"
tagline: "Grafi piccoli e deterministici su come funzionano davvero i vostri sistemi, e grafi temporali su come cambiano, così persone e agenti interrogano fatti, anche sul passato, invece di tirare a indovinare."
seoTitle: "Consulenza temporal knowledge graph | Luca Bertelli"
description: "Consulenza temporal knowledge graph in Italia: conoscenza operativa, memoria per agenti AI, accesso MCP e migrazioni CI/CD di grande scala."
order: 9
keywords:
  - "consulenza knowledge graph"
  - "knowledge graph temporale"
  - "temporal knowledge graph"
  - "knowledge graph operativo"
  - "memoria agenti AI"
  - "knowledge graph o database vettoriale"
  - "GraphRAG"
  - "MCP knowledge graph"
  - "migrazione CI/CD"
  - "agenti AI knowledge graph"
relatedTags: ["mcp", "cicd", "observability"]
credentials: ["cka", "terraform_associate"]
outcomes:
  - "Un inventario interrogabile di come i sistemi funzionano davvero, non una slide di come dovrebbero"
  - "Persone e agenti AI che leggono gli stessi fatti, invece di fare grep e indovinare"
  - "Copertura e lacune visibili prima di partire con una grande migrazione di piattaforma"
  - "Fatti con una linea temporale: che cosa era vero, quando è cambiato, che cosa un agente può richiamare con certezza"
  - "Un grafo che il team interno sa ricostruire, non un artefatto che vive solo in consulenza"
deliverables:
  - "Perimetro: quali sorgenti contano, a quali domande il grafo deve rispondere, che cosa resta fuori"
  - "Schema tipizzato: tipi di nodo e di relazione abbastanza pochi da restare onesti"
  - "Estrattori dai cataloghi, inventari e API che usate già"
  - "Livello di mapping curato, così gli elementi si collegano in base alla funzione che svolgono, non al nome"
  - "Verifica temporale dove la storia conta: intervalli di validità, interrogazioni a un istante preciso, aggiornamenti incrementali"
  - "Superficie di interrogazione per le persone (explorer) e per gli agenti (MCP), più un refresh ripetibile"
faq:
  - question: "Che cos'è un knowledge graph pragmatico?"
    answer: "Un grafo piccolo e tipizzato di fatti operativi estratti da sistemi che avete già: cataloghi, inventari, repository, API. Nodi e relazioni orientate sono espliciti, il mapping è curato, e una ricostruzione produce lo stesso risultato. Non è un'ontologia aziendale, non è un prodotto di graph database, e non è un progetto che parte modellando tutta l'azienda."
  - question: "In che cosa differisce da un graph database o da un knowledge graph da data catalogue?"
    answer: "Questi approcci danno per scontato che sappiate già che cosa mettere nel grafo e che la parte difficile sia lo storage, la ricerca o la governance a scala. Qui la parte difficile è scegliere uno schema abbastanza piccolo da restare vero, collegare estrattori a sorgenti che esistono già, ed esporre gli stessi fatti a persone e ad agenti. Lo store è un dettaglio di implementazione; di solito basta un database integrato nell'applicazione."
  - question: "Knowledge graph o database vettoriale?"
    answer: "Rispondono a domande diverse e spesso convivono. Un database vettoriale trova i passaggi di testo più simili alla domanda, ed è lo strumento giusto per la RAG (retrieval-augmented generation) su documentazione non strutturata; non sa però che un servizio dipende da un altro, né chi ne era responsabile a marzo. Un knowledge graph rende esplicite entità e relazioni, quindi risponde a domande di struttura, conteggio e tempo con un risultato verificabile. GraphRAG combina i due: il grafo individua le entità e le relazioni pertinenti, la ricerca vettoriale recupera il testo che le descrive."
  - question: "Quando vale la pena costruire un knowledge graph?"
    answer: "Quando le risposte che vi servono stanno in migliaia di file, in diversi strumenti e nella testa di poche persone, e quando indovinare costa caro. Segnali tipici: una migrazione di piattaforma che nessuno sa dimensionare, agenti AI che ricostruiscono l'inventario a intuito, o la stessa domanda che riceve tre risposte diverse a seconda di chi risponde."
  - question: "Che cos'è un temporal knowledge graph?"
    answer: "Un knowledge graph in cui ogni fatto porta con sé le proprie date: quando è diventato vero, quando ha smesso di esserlo e quando il sistema lo ha appreso. Le informazioni nuove non sovrascrivono; invalidano il fatto che contraddicono. Così si può interrogare il grafo a un istante preciso: com'era la piattaforma a marzo, che cosa è cambiato dall'ultimo audit, chi era responsabile quando è successo l'incidente."
  - question: "In che modo un temporal knowledge graph dà memoria agli agenti AI?"
    answer: "Gli agenti ricostruiscono lo stato del mondo a ogni sessione perché tra una chiamata e l'altra non persiste nulla. Con un grafo temporale le nuove osservazioni entrano in modo incrementale come episodi, e le contraddizioni invalidano i fatti vecchi invece di cancellarli. Un agente può così recuperare che cosa è vero adesso, che cosa era vero in un dato momento e come è cambiato. La memoria diventa un insieme di fatti interrogabili con provenienza, non un transcript iniettato nel prompt."
  - question: "Come usano il grafo gli agenti AI?"
    answer: "Tramite MCP, così qualsiasi IDE, CLI o assistente compatibile interroga gli stessi fatti che mostra l'explorer. Gli agenti smettono di fare grep sui repository e di riempire i buchi con finzioni plausibili. Per gli agenti il grafo è in sola lettura: cercano copertura, blocchi e unità di lavoro simili; le modifiche ai cataloghi sorgente passano dalla review normale del team."
  - question: "Perché senza un grafo le grandi migrazioni CI/CD si arenano molto spesso?"
    answer: "Perché il lavoro non è scrivere le pipeline. È sapere che cosa esiste già, che cosa la piattaforma di destinazione copre già, che cosa manca, e quali unità di lavoro si assomigliano. Senza questo, i team o si bloccano o riscrivono tutto da zero. Migrazioni che al solo conteggio dei file sembravano impossibili diventano un piano in fasi una volta che copertura e lacune sono interrogabili. In questi casi, un knowledge graph smette di essere opzionale."
  - question: "Che cosa resta dopo l'intervento?"
    answer: "Lo schema, gli estrattori, il mapping, la superficie di interrogazione e il percorso di refresh. Il team interno deve poter ricostruire il grafo dalle sorgenti senza ulteriori consulenze. Se il grafo esiste solo mentre si sta collaborando, l'intervento è fallito."
---

## Il problema che di solito trovo

La mappa di come funziona davvero una piattaforma sta nei posti sbagliati: nella testa di poche persone, in un wiki non aggiornato, e in migliaia di file che nessuno ha voglia di riesaminare. Quando un team chiede "che cosa abbiamo in esercizio, che cosa è già coperto, che cosa bloccherebbe uno spostamento", la risposta onesta è giorni di ricostruzione manuale e tre opinioni in conflitto.

Gli agenti AI rendono il vuoto più rumoroso. Davanti a un repository ricostruiscono a intuito un quadro dell'esistente che si legge bene ed è sbagliato nei punti che contano. Più contesto nel prompt non lo risolve. Servono fatti interrogabili, con tipi e relazioni che non cambiano significato tra una chiamata e l'altra.

## Come intervengo

Si parte dalle domande a cui il grafo deve rispondere, non da un vocabolario dell'azienda. Quali sorgenti esistono già (cataloghi, inventari, API, repository). Quali tipi di nodo e di relazione bastano. Che cosa rifiutiamo di modellare, perché un grafo che finge di coprire tutto diventa un secondo wiki.

Poi estrattori, non persone che compilano moduli. I fatti arrivano da artefatti che l'organizzazione mantiene già. Un livello di mapping curato collega quegli elementi in base alla funzione che svolgono: lo stesso intento sotto nomi diversi diventa confrontabile. Lo store resta piccolo e ricostruibile. Se non potete rigenerare il grafo dalle sorgenti, non avete un grafo; avete uno snapshot.

Le persone hanno un explorer. Gli agenti hanno gli stessi fatti via MCP. Una sola fonte di verità, due interfacce. L'aggiornamento è una pipeline che si rilancia, non un comitato che coltiva un'ontologia.

## Quando al grafo serve un orologio: la memoria degli agenti AI

Alcune domande non riguardano che cosa è vero, ma che cosa era vero, e quando ha smesso di esserlo. Quale team possedeva questo servizio quando è successo l'incidente. Com'era la piattaforma prima dell'ultima riorganizzazione. Che cosa un agente ha già appreso su un cliente nelle sessioni precedenti. Un grafo a snapshot, per quanto onesto, non può rispondere: ogni ricostruzione butta via il passato.

Un knowledge graph temporale lo conserva. Ogni fatto porta con sé i relativi intervalli di validità: quando è diventato vero, quando ha smesso di esserlo e, separatamente, quando il sistema lo ha appreso. Le nuove osservazioni entrano in modo incrementale come episodi; quando contraddicono un fatto esistente lo invalidano invece di cancellarlo. Il risultato è un grafo interrogabile a un istante nel tempo, e una memoria che gli agenti AI possono usare davvero: richiamare ciò che valeva, vedere come è cambiato, e smettere di ricostruire il mondo da zero a ogni sessione.

Aggiungo questo livello solo dove il dominio lo richiede. Inventari e mappe di copertura restano snapshot ricostruibili; il livello temporale aggiuntivo serve invece per conversazioni, responsabilità (ownership), incidenti e tutto ciò in cui la storia ha un peso determinante. Stessa disciplina del resto: schema tipizzato, relazioni esplicite e nessun prodotto che imponga il modello.

## Quando smette di essere opzionale

Una grande migrazione di una piattaforma CI/CD legacy è il caso che continuo a vedere. La piattaforma di destinazione non è il problema; lo è tutto ciò che non si conosce dell'esistente. Senza un grafo di unità di lavoro, copertura e lacune, il progetto o si blocca o riparte da zero, ed è così che si passa un anno a migrare senza saper dire che cosa manca.

Con il grafo, la copertura è una query. Le lacune sono ordinate. Le pipeline simili diventano modelli invece che folklore. Efficienza, sicurezza e tempi di consegna smettono di essere slogan perché potete indicare che cosa è pronto, che cosa è bloccato e che cosa sarebbe rischioso inventare. Non sostengo che ogni migrazione ne abbia bisogno. Sostengo che, oltre una certa scala, molte siano impensabili senza.

## Un perimetro pragmatico

Pragmatico significa niente suite enterprise di knowledge graph, niente programma RDF e niente workshop di ontologia da sei mesi. Il risultato è uno schema tipizzato che si può tenere a mente, estrattori che si possono leggere, un file di mapping su cui si può dissentire in revisione e un aggiornamento che finisce prima che le sorgenti cambino di nuovo.
