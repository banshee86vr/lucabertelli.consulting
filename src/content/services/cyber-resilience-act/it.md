---
key: "cyber-resilience-act"
lang: "it"
title: "Consulenza Cyber Resilience Act (CRA)"
tagline: "SBOM, artefatti firmati, VEX e VDR prodotti dalla pipeline che usate già, così le evidenze richieste dal CRA esistono prima che qualcuno le chieda."
seoTitle: "Consulenza Cyber Resilience Act e conformità CRA | Luca Bertelli"
description: "Consulenza Cyber Resilience Act in Italia: SBOM, firma degli artefatti, VEX e VDR, monitoraggio delle vulnerabilità ed evidenze per la conformità CRA."
order: 6
keywords:
  - "consulenza Cyber Resilience Act"
  - "conformità Cyber Resilience Act"
  - "adeguamento CRA"
  - "conformità CRA"
  - "generazione SBOM"
  - "VEX"
  - "VDR"
  - "firma degli artefatti e provenance"
  - "gestione delle vulnerabilità"
  - "supply chain sicurezza software"
relatedTags: ["devsecops", "cicd", "dependency-management", "renovate", "github-actions"]
credentials: ["gitlab-sa", "vault-professional"]
outcomes:
  - "Una SBOM per ogni rilascio, in formato CycloneDX o SPDX, generata dalla build e non compilata a mano"
  - "Ogni artefatto rilasciato firmato e riconducibile al commit e all'esecuzione di pipeline che lo hanno prodotto"
  - "Nuove CVE confrontate con ciò che è davvero in distribuzione, con dichiarazioni VEX che separano l'esposizione reale dal rumore dello scanner"
  - "Una gestione delle vulnerabilità compatibile con la sequenza di notifica a 24 ore, 72 ore e 14 giorni, perché i dati esistono già"
  - "Documentazione tecnica sempre aggiornata perché rigenerata a ogni rilascio, non riscritta prima di una verifica"
deliverables:
  - "Gap assessment del processo di rilascio rispetto ai requisiti di gestione delle vulnerabilità dell'Allegato I, Parte II"
  - "Generazione della SBOM in pipeline, per artefatto e per rilascio, immagini container incluse"
  - "Firma degli artefatti e attestazioni di provenance lungo il percorso di build, con chiavi di firma tenute fuori dalla pipeline"
  - "Flusso di generazione e pubblicazione di VEX e VDR, con un passaggio di revisione per i giudizi di non esposizione"
  - "Monitoraggio continuo delle SBOM di ogni rilascio ancora supportato, con avvisi indirizzati al team responsabile del componente"
  - "Runbook per la sequenza di notifica sulla piattaforma unica di segnalazione ENISA, con le evidenze già disponibili"
  - "Passaggio di consegne: il team interno gestisce ed estende l'impianto senza di me"
faq:
  - question: "A chi si applica il Cyber Resilience Act?"
    answer: "Ai fabbricanti che immettono sul mercato UE prodotti con elementi digitali: software e hardware in grado di connettersi a una rete, direttamente o indirettamente, e i componenti che li compongono. Importatori e distributori hanno obblighi propri. Il software offerto solo come servizio è in gran parte fuori dal perimetro, coperto dalla NIS2, a meno che non sia un'elaborazione remota senza cui il prodotto non funziona. Stabilire se il vostro prodotto rientra e in quale classe è una domanda per il vostro consulente legale; il mio lavoro comincia quando la risposta è sì."
  - question: "Quali sono le scadenze del Cyber Resilience Act?"
    answer: "Il regolamento, (UE) 2024/2847, è entrato in vigore il 10 dicembre 2024. Gli obblighi di notifica per le vulnerabilità attivamente sfruttate e gli incidenti gravi si applicano dall'11 settembre 2026. Tutti gli altri obblighi, requisiti essenziali e marcatura CE compresi, si applicano dall'11 dicembre 2027. Un processo di gestione delle vulnerabilità ha bisogno di qualche ciclo di rilascio per assestarsi, quindi deve essere operativo ben prima di quella data."
  - question: "Che differenza c'è tra SBOM, VEX e VDR?"
    answer: "La SBOM è l'inventario dei componenti presenti in una versione specifica del prodotto. Una dichiarazione VEX è un giudizio su una vulnerabilità in uno di quei componenti: affetto, non affetto, corretto o in analisi, con la motivazione. Il VDR è il rapporto costruito a partire da quei giudizi, che elenca quali vulnerabilità note riguardano un rilascio e che cosa è stato fatto. La SBOM è l'input, il VEX è l'analisi, il VDR è ciò che si consegna. Il CRA richiede esplicitamente la SBOM; VEX e VDR sono il modo concreto di soddisfare i requisiti di documentazione e divulgazione delle vulnerabilità senza mantenere un foglio di calcolo."
  - question: "Perché la firma degli artefatti conta per il CRA?"
    answer: "Perché una SBOM serve solo se si può dimostrare quale artefatto descrive. Firmare l'artefatto e allegare un'attestazione di provenance, che registra commit, esecuzione di pipeline e input che lo hanno prodotto, crea una catena verificabile dal sorgente a ciò che il cliente esegue. Copre anche il requisito di distribuire in modo sicuro gli aggiornamenti: il cliente può verificare che un aggiornamento arrivi davvero da voi."
  - question: "L'adeguamento al CRA è un progetto una tantum?"
    answer: "No. Gli obblighi durano per tutto il periodo di supporto del prodotto, nella maggior parte dei casi almeno cinque anni. Una SBOM generata una volta per la marcatura CE è vecchia dopo una settimana. La parte che costa è il monitoraggio continuo: nuove CVE contro rilasci datati ma ancora supportati. Per questo il monitoraggio entra fin dall'inizio, e per questo gli avvisi devono arrivare a un team e non a una casella di posta."
  - question: "Fornisci consulenza legale sul Cyber Resilience Act?"
    answer: "No. La classificazione del prodotto, il percorso di valutazione della conformità e il contenuto della dichiarazione di conformità UE sono decisioni che prendete con il vostro consulente legale e, quando la classe lo richiede, con un organismo notificato. Io copro la parte ingegneristica: fare in modo che la pipeline produca gli artefatti e le evidenze su cui quelle decisioni si basano, e che continui a produrli dopo la valutazione."
---

## Il problema che di solito trovo

La maggior parte dei team che incontro su questo tema ha già letto il regolamento, o una sua sintesi, e ha concluso che la parte difficile sia la documentazione. Non lo è. La parte difficile è che gli obblighi descrivono un processo che dura per tutto il periodo di supporto del prodotto, e il processo di rilascio attuale non è mai stato pensato per produrre quel tipo di evidenze in modo continuo.

Il punto di partenza tipico: una SBOM è stata generata una volta, a mano, per il questionario di un cliente, e nessuno sa a quale build si riferisca. Lo scanner delle vulnerabilità in pipeline segnala duecento rilievi per rilascio, per lo più in codice che il prodotto non esegue mai, e il team ha smesso di leggerli. I rilasci non sono firmati, oppure lo sono con una chiave che vive in una variabile della CI. E se domani un cliente chiedesse se una certa CVE riguarda la versione 3.2, qualcuno passerebbe due giorni a scoprirlo.

## Come intervengo

Parto da ciò che la pipeline produce già, non dal testo del regolamento. L'Allegato I, Parte II elenca che cosa un fabbricante deve saper fare con le vulnerabilità: identificarle e documentarle, correggerle senza indebito ritardo, divulgarle, distribuire gli aggiornamenti in modo sicuro. Ognuno di questi punti corrisponde a un passo di build o a un processo che esiste oppure no, e il gap assessment è esattamente questa mappatura.

Il lavoro viene poi ordinato per ritorno. Prima la generazione della SBOM, perché costa poco e tutto il resto dipende da lei: senza un inventario affidabile di ciò che c'è in ogni rilascio, monitoraggio e divulgazione non hanno una base. Poi firma e provenance, così l'inventario può essere legato a un artefatto preciso. Terzo il monitoraggio con i VEX, perché è lì che vive il costo ricorrente ed è lì che il team ha bisogno di un flusso di lavoro e non di un altro strumento.

Gli strumenti arrivano da ciò che usate già. GitLab CI e GitHub Actions offrono entrambi opzioni adeguate per generare SBOM e firmare artefatti; le differenze tra loro contano molto meno del fatto che l'output venga rivisto e conservato.

Ho svolto questo tipo di lavoro per startup, scale-up, grandi imprese e pubblica amministrazione. La dimensione cambia chi approva, quanto durano gli acquisti e quanti prodotti condividono una pipeline; non cambia la sequenza descritta sopra.

## Firma, SBOM, VEX e VDR nella pratica

**Firma e provenance.** Ogni artefatto che esce dalla pipeline, che sia un'immagine container, un pacchetto o un bundle firmware, viene firmato, e un'attestazione di provenance registra commit, esecuzione di pipeline e input che lo hanno prodotto. Le chiavi di firma non vivono nella pipeline: vengono emesse al momento dell'uso o custodite in un secrets manager e usate tramite credenziali a scadenza breve. È lo stesso lavoro che faccio sul fronte [SecDevOps](/it/servizi/consulenza-secdevops-cicd/), applicato tenendo presente il requisito di distribuzione sicura del CRA.

**SBOM.** Generata in fase di build, per artefatto, in CycloneDX o SPDX, e conservata accanto all'artefatto che descrive, con la firma che copre entrambi. Il regolamento chiede almeno le dipendenze di primo livello; nella pratica un inventario transitivo completo non costa nulla in più ed è ciò che rende utile il monitoraggio.

**VEX e VDR.** Uno scanner che confronta una SBOM completa con i database delle vulnerabilità produce un elenco lungo, e in gran parte è rumore: funzioni vulnerabili che il prodotto non chiama mai, componenti presenti ma non usati, problemi che riguardano solo un'altra piattaforma. Una dichiarazione VEX registra il giudizio (affetto, non affetto, corretto, in analisi) insieme alla sua motivazione, così la stessa domanda non viene riaperta ogni settimana. Il VDR viene costruito da quelle dichiarazioni: quali vulnerabilità note riguardano questo rilascio, qual è il loro stato, che cosa deve fare il cliente. Entrambi sono generati dai dati e non scritti in un editor di testo, ed entrambi sono versionati insieme al rilascio.

**Monitoraggio.** Le SBOM di ogni rilascio ancora nel periodo di supporto vengono confrontate in continuo con i nuovi dati sulle vulnerabilità. Quando compare una corrispondenza, l'avviso arriva al team responsabile del componente, con la storia dei VEX allegata. È questo che rende realistiche le scadenze di notifica: quando viene pubblicata una vulnerabilità attivamente sfruttata, la domanda "siamo affetti, e dove" ha già una risposta.

## Che cosa significa per gli obblighi di notifica

Dall'11 settembre 2026 i fabbricanti devono notificare le vulnerabilità attivamente sfruttate e gli incidenti gravi attraverso la piattaforma unica di segnalazione gestita da ENISA: un preallarme entro 24 ore da quando ne vengono a conoscenza, una notifica entro 72 ore e un rapporto finale una volta disponibile la correzione (entro 14 giorni per le vulnerabilità, un mese per gli incidenti). Nessuna di queste finestre si rispetta avviando un'indagine quando parte il cronometro. Si rispettano quando inventario, valutazione dell'esposizione e canale di aggiornamento esistono già e vengono esercitati a ogni rilascio. È quello che il lavoro descritto sopra costruisce.

## Che cosa non faccio

Non classifico il vostro prodotto, non scelgo il percorso di valutazione della conformità e non scrivo la dichiarazione di conformità. Sono decisioni vostre, del vostro consulente legale e, quando la classe lo richiede, di un organismo notificato. Quello di cui mi assicuro è che, quando quelle decisioni vengono prese, la documentazione tecnica su cui si basano sia generata dal vostro processo e descriva ciò che rilasciate davvero.
