---
key: "knowledge-graphs"
lang: "it"
title: "Consulenza knowledge graph"
tagline: "Grafi piccoli e deterministici su come funzionano davvero i vostri sistemi, così persone e agenti interrogano fatti invece di operare in maniera spesso inefficiente e poco pianificabile."
seoTitle: "Consulenza knowledge graph | Luca Bertelli"
description: "Consulenza knowledge graph in Italia: grafi leggeri sui sistemi interni, MCP per agenti AI e migrazioni CI/CD che altrimenti restano impensabili."
order: 8
keywords:
  - "consulenza knowledge graph"
  - "knowledge graph aziendale"
  - "knowledge graph leggero"
  - "grafi di conoscenza"
  - "MCP knowledge graph"
  - "migrazione CI/CD"
  - "migrazione piattaforme CI/CD"
  - "agenti AI knowledge graph"
relatedTags: ["mcp", "cicd", "observability"]
credentials: ["cka", "terraform_associate"]
outcomes:
  - "Un inventario interrogabile di come i sistemi funzionano davvero, non una slide di come dovrebbero"
  - "Persone e agenti AI che leggono gli stessi fatti, invece di fare grep e indovinare"
  - "Copertura e lacune visibili prima di partire con una grande migrazione di piattaforma"
  - "Un grafo che il team interno sa ricostruire, non un artefatto che vive solo in consulenza"
deliverables:
  - "Perimetro: quali sorgenti contano, quali domande il grafo deve rispondere, cosa resta fuori"
  - "Schema tipizzato: tipi di nodo e di relazione abbastanza pochi da restare onesti"
  - "Estrattori dai cataloghi, inventari e API che usate già"
  - "Livello di mapping curato, così i primitivi si incontrano sulle capability, non sui nomi"
  - "Superficie di interrogazione per le persone (explorer) e per gli agenti (MCP), più un refresh ripetibile"
faq:
  - question: "Che cos'è un knowledge graph leggero?"
    answer: "Un grafo piccolo e tipizzato di fatti operativi estratti da sistemi che avete già: cataloghi, inventari, repository, API. Nodi e relazioni dirette sono espliciti, il mapping è curato, e una ricostruzione produce lo stesso risultato. Non è un'ontologia aziendale, non è un prodotto di graph database, e non è un progetto che parte modellando tutta l'azienda."
  - question: "In che cosa differisce da Neo4j o da un knowledge graph da data catalogue?"
    answer: "Quei prodotti danno per scontato che sappiate già che cosa mettere nel grafo e che la parte difficile sia lo storage, la ricerca o la governance a scala. Qui la parte difficile è scegliere uno schema abbastanza piccolo da restare vero, collegare estrattori a sorgenti che esistono già, ed esporre gli stessi fatti a persone e ad agenti. Lo store è un dettaglio di implementazione; di solito basta un database incorporabile."
  - question: "Quando vale la pena costruire un knowledge graph leggero?"
    answer: "Quando le risposte che vi servono stanno in migliaia di file, in diversi strumenti e nella testa di poche persone, e quando indovinare costa caro. Segnali tipici: una migrazione di piattaforma che nessuno sa dimensionare, agenti AI che definiscono l'inventario senza certezza, o la stessa domanda con tre risposte diverse a seconda di chi la fai."
  - question: "Come usano il grafo gli agenti AI?"
    answer: "Tramite MCP, così qualsiasi IDE, CLI o assistente compatibile interroga gli stessi fatti che mostra l'explorer. Gli agenti smettono di fare grep sui repository e di riempire i buchi con finzioni plausibili. Per loro il grafo resta in lettura: cercano copertura, blocchi e unità di lavoro simili; le modifiche ai cataloghi sorgente passano dalla review normale del team."
  - question: "Perché senza un grafo le grandi migrazioni CI/CD si arenano molto spesso?"
    answer: "Perché il lavoro non è scrivere le pipeline. È sapere che cosa esiste già, che cosa la piattaforma di destinazione copre già, che cosa manca, e quali unità di lavoro si assomigliano. Senza questo, i team o si bloccano o riscrivono tutto da zero. Migrazioni che al solo conteggio dei file sembravano impossibili diventano un piano sequenziato una volta che copertura e lacune sono interrogabili. In questi casi, un knowledge graph leggero smette di essere opzionale."
  - question: "Che cosa resta dopo l'intervento?"
    answer: "Lo schema, gli estrattori, il mapping, la superficie di interrogazione e il percorso di refresh. Il team interno deve poter ricostruire il grafo dalle sorgenti senza ulteriori consulenze. Se il grafo esiste solo mentre si sta collaborando, l'intervento è fallito."
---

## Il problema che di solito si trova

La mappa di come funziona davvero una piattaforma sta nei posti sbagliati: nella testa di poche persone, in un wiki non aggiornato, e in migliaia di file che nessuno ha voglia di riesaminare. Quando un team chiede "che cosa giriamo, che cosa è già coperto, che cosa bloccherebbe uno spostamento", la risposta onesta è giorni di ricostruzione manuale e tre opinioni in conflitto.

Gli agenti AI rendono il vuoto più rumoroso. Davanti a un repository ricostruiscono a intuito un quadro dell'esistente che si legge bene ed è sbagliato nei punti che contano. Più contesto nel prompt non lo risolve. Servono fatti interrogabili, con tipi e relazioni che non cambiano significato tra una chiamata e l'altra.

## Come intervengo

Si parte dalle domande che il grafo deve rispondere, non da un vocabolario dell'azienda. Quali sorgenti esistono già (cataloghi, inventari, API, repository). Quali tipi di nodo e di relazione bastano. Che cosa rifiutiamo di modellare, perché un grafo che finge di coprire tutto diventa un secondo wiki.

Poi estrattori, non persone che compilano moduli. I fatti arrivano da artefatti che l'organizzazione mantiene già. Un livello di mapping curato unisce quei primitivi sulle capability: lo stesso intento sotto nomi diversi diventa confrontabile. Lo store resta piccolo e ricostruibile. Se non potete rigenerare il grafo dalle sorgenti, non avete un grafo; avete uno snapshot.

Le persone hanno un explorer. Gli agenti hanno gli stessi fatti via MCP. Una sola fonte di verità, due interfacce. Il refresh è una pipeline che si rilancia, non un comitato che coltiva un'ontologia.

## Quando smette di essere opzionale

Una grande migrazione di una piattaforma CI/CD legacy è il caso che continuo a vedere. Il bersaglio non è il problema; la superficie sconosciuta sì. Senza un grafo di unità di lavoro, copertura e lacune, il progetto o si congela o si riscrive da zero, che è il modo in cui si spende un anno a spostare senza saper dire che cosa resta.

Con il grafo, la copertura è una query. Le lacune sono ordinate. Le pipeline simili diventano modelli invece che folklore. Efficienza, sicurezza e tempo di calendario smettono di essere slogan perché potete indicare che cosa è pronto, che cosa è bloccato, e che cosa sarebbe insicuro inventare. Non pretendo che ogni migrazione ne abbia bisogno. Pretendo che, oltre una certa scala, molte restino impensabili senza.

## Che cosa significa "leggero"

Leggero è un vincolo, non uno slogan. Niente suite enterprise di knowledge graph. Niente programma RDF. Niente workshop di ontologia da sei mesi. Uno schema tipizzato che sta in testa, estrattori che si possono leggere, un file di mapping su cui si può dissentire in review, e un refresh che finisce prima che le sorgenti si siano già mosse.
