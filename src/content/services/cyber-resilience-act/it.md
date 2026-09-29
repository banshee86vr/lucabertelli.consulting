---
key: "cyber-resilience-act"
lang: "it"
title: "Consulenza Cyber Resilience Act (CRA)"
tagline: "La parte ingegneristica del CRA: evidenze di security by design, un processo di gestione delle vulnerabilità che dura tutto il periodo di supporto, documentazione tecnica generata dalla pipeline e un team in grado di rispettare le 24 ore di notifica."
seoTitle: "Consulenza Cyber Resilience Act e conformità CRA | Luca Bertelli"
description: "Consulenza Cyber Resilience Act in Italia: gap assessment sull'Allegato I, gestione delle vulnerabilità, SBOM, aggiornamenti sicuri, documentazione e notifiche."
order: 6
keywords:
  - "consulenza Cyber Resilience Act"
  - "conformità Cyber Resilience Act"
  - "adeguamento CRA"
  - "conformità CRA"
  - "gap assessment CRA"
  - "gestione delle vulnerabilità"
  - "generazione SBOM"
  - "VEX"
  - "VDR"
  - "coordinated vulnerability disclosure"
  - "documentazione tecnica CRA"
  - "supply chain sicurezza software"
relatedTags: ["devsecops", "cicd", "dependency-management", "renovate", "github-actions"]
credentials: ["gitlab-sa", "vault-professional"]
outcomes:
  - "Una mappa chiara di quali prodotti rientrano nel perimetro, in quale classe, e che cosa manca a ciascuno rispetto all'Allegato I"
  - "Un processo di gestione delle vulnerabilità che funziona: ricezione, triage, correzione, avviso e aggiornamento, su ogni rilascio supportato"
  - "SBOM, artefatti firmati e VEX/VDR generati dalla build, così la documentazione tecnica descrive ciò che rilasciate davvero"
  - "Aggiornamenti di sicurezza che arrivano agli utenti attraverso un canale verificabile, separati dai rilasci funzionali"
  - "Un team che sa cosa fare nelle prime 24 ore dopo essere venuto a conoscenza di una vulnerabilità attivamente sfruttata"
  - "Documentazione tecnica dell'Allegato VII tenuta aggiornata dal processo di rilascio, non ricostruita prima di una valutazione"
deliverables:
  - "Inventario dei prodotti e gap assessment: perimetro, classificazione (predefinita, importante di classe I o II, critica), stato attuale rispetto all'Allegato I, Parti I e II"
  - "Contributo ingegneristico alla valutazione del rischio di cibersicurezza: superficie di attacco, configurazione sicura per impostazione predefinita, logging, cancellazione dei dati, mitigazioni degli exploit, mappati sui requisiti della Parte I"
  - "Processo di gestione delle vulnerabilità: punto di contatto unico, policy di coordinated vulnerability disclosure, ricezione, triage con VEX, obiettivi di correzione, segnalazione a monte per i componenti di terze parti"
  - "Generazione della SBOM in pipeline (CycloneDX o SPDX), per artefatto e per rilascio, con VDR pubblicato accanto a ogni versione supportata"
  - "Firma degli artefatti e attestazioni di provenance, più un canale di aggiornamento sicuro: aggiornamenti di sicurezza separati da quelli funzionali, avvisi in formato leggibile da macchina, aggiornamenti conservati per il periodo richiesto"
  - "Monitoraggio continuo di ogni rilascio ancora nel periodo di supporto, con avvisi indirizzati al team responsabile"
  - "Preparazione alle notifiche: criteri di consapevolezza, runbook a 24 ore / 72 ore / 14 giorni, registrazione sulla piattaforma unica di segnalazione, modelli per informare gli utenti e un'esercitazione tabletop"
  - "Documentazione tecnica dell'Allegato VII assemblata dagli output della pipeline: versioni, architettura, processi, SBOM, rapporti di test, motivazione del periodo di supporto"
  - "Classificazione dei rilasci, così il team distingue un aggiornamento di manutenzione da una modifica sostanziale prima di pubblicarlo"
  - "Passaggio di consegne: il team interno gestisce ed estende tutto senza di me"
faq:
  - question: "A chi si applica il Cyber Resilience Act?"
    answer: "Ai fabbricanti che immettono sul mercato UE prodotti con elementi digitali: software e hardware in grado di connettersi a una rete, direttamente o indirettamente, e i componenti che li compongono, indipendentemente da dove il fabbricante sia stabilito. Importatori e distributori hanno obblighi propri. Il software offerto solo come servizio è fuori dal perimetro, coperto dalla NIS2, a meno che non sia un'elaborazione remota senza cui il prodotto non può svolgere le proprie funzioni. Il software libero e open source sviluppato al di fuori di un'attività commerciale non è coperto; le organizzazioni che sostengono questi progetti possono essere 'open source steward', con un regime alleggerito. Le linee guida della Commissione del 27 luglio 2026 (C(2026) 5252) percorrono questi confini con esempi concreti. Stabilire se il vostro prodotto rientra e in quale classe è una domanda per il vostro consulente legale; il mio lavoro comincia quando la risposta è sì."
  - question: "Quali sono le scadenze del Cyber Resilience Act?"
    answer: "Il Regolamento (UE) 2024/2847 è entrato in vigore il 10 dicembre 2024. Il Capo IV, sugli organismi notificati, si applica dall'11 giugno 2026. Gli obblighi di notifica dell'articolo 14 si applicano dall'11 settembre 2026 e riguardano ogni prodotto in perimetro già sul mercato, non solo quelli nuovi. Tutto il resto, requisiti essenziali, valutazione della conformità, marcatura CE e documentazione tecnica, si applica dall'11 dicembre 2027 ai prodotti immessi sul mercato da quella data, e ai prodotti precedenti solo se subiscono una modifica sostanziale. Il pacchetto Digital Omnibus non ha cambiato queste date."
  - question: "Che cosa richiede davvero il CRA oltre alla SBOM?"
    answer: "Due gruppi di requisiti essenziali nell'Allegato I. La Parte I riguarda il prodotto: nessuna vulnerabilità sfruttabile nota al rilascio, configurazione sicura per impostazione predefinita, aggiornamenti di sicurezza installabili automaticamente, controllo degli accessi, cifratura dei dati a riposo e in transito, protezione dell'integrità, minimizzazione dei dati, disponibilità sotto attacco di tipo denial of service, superficie di attacco ridotta, mitigazioni degli exploit, registrazione degli eventi di sicurezza e cancellazione sicura dei dati, ciascuno applicato sulla base di una valutazione del rischio documentata. La Parte II riguarda i processi del fabbricante: identificare e documentare vulnerabilità e componenti (è qui che vive la SBOM), correggerle senza ritardo, testare regolarmente, divulgare pubblicamente le vulnerabilità corrette, adottare una policy di coordinated vulnerability disclosure, fornire un contatto per le segnalazioni, distribuire gli aggiornamenti in modo sicuro e rilasciare gli aggiornamenti di sicurezza gratuitamente con un avviso. La SBOM è un punto su ventuno."
  - question: "In quale classe rientra il mio prodotto, e cambia il percorso di valutazione della conformità?"
    answer: "La maggior parte dei prodotti rientra nella categoria predefinita e può essere autovalutata. L'Allegato III elenca i prodotti 'importanti' in due classi, con le descrizioni tecniche nel Regolamento di esecuzione (UE) 2025/2392: la classe I comprende sistemi operativi, browser, password manager, VPN, sistemi di gestione della rete, SIEM, router e switch, dispositivi di sicurezza per la casa intelligente; la classe II comprende hypervisor e container runtime, firewall e sistemi di rilevamento delle intrusioni, microprocessori resistenti alle manomissioni. L'Allegato IV elenca i prodotti 'critici', come i moduli di sicurezza hardware e i gateway per contatori intelligenti. Classe II e prodotti critici richiedono un organismo notificato o uno schema europeo di certificazione. La classe I può essere autovalutata solo applicando una norma armonizzata, e nessuna norma armonizzata CRA è ancora stata citata nella Gazzetta ufficiale, quindi per ora anche la classe I significa in pratica organismo notificato. È la decisione che incide di più su tempi e budget, e va presa presto."
  - question: "Esiste un formato obbligatorio per la SBOM?"
    answer: "No. Il regolamento chiede un formato di uso comune e leggibile da macchina che copra almeno le dipendenze di primo livello, e dà alla Commissione il potere di specificare formato ed elementi con un atto di esecuzione, non ancora esercitato. Nella pratica significa CycloneDX o SPDX. Il riferimento più concreto sui contenuti oggi è la linea guida tecnica tedesca BSI TR-03183-2, a cui le autorità di vigilanza tenderanno ad appoggiarsi; costruire su quella asticella evita rilavorazioni quando una norma verrà citata. La SBOM non deve essere pubblica: entra nella documentazione tecnica e viene consegnata all'autorità di vigilanza su richiesta motivata."
  - question: "Che differenza c'è tra SBOM, VEX e VDR, e perché servono tutti e tre?"
    answer: "La SBOM è l'inventario dei componenti presenti in una versione specifica del prodotto. Una dichiarazione VEX è un giudizio su una vulnerabilità in uno di quei componenti: affetto, non affetto, corretto o in analisi, con la motivazione. Il VDR è il rapporto costruito da quei giudizi, che elenca quali vulnerabilità note riguardano un rilascio e che cosa è stato fatto. La SBOM da sola produce un lungo elenco di corrispondenze, per lo più non sfruttabili nel vostro prodotto; le stesse linee guida della Commissione osservano che un componente vulnerabile il cui codice non è raggiungibile non rende la vulnerabilità del prodotto 'attivamente sfruttata'. Il VEX è il modo di registrare quel giudizio una volta sola invece di riaprirlo ogni settimana, e il VDR è ciò che si consegna a un cliente o a un'autorità."
  - question: "Che cosa fa partire le 24 ore per la notifica?"
    answer: "Venire a conoscenza di una vulnerabilità attivamente sfruttata nel proprio prodotto, o di un incidente grave che ne compromette la sicurezza. Le linee guida della Commissione leggono 'conoscenza' come aver raggiunto un ragionevole grado di certezza dopo una valutazione iniziale, e la piattaforma unica di segnalazione non registra quel momento per voi: servono evidenze proprie di quando la valutazione si è conclusa. Da lì: preallarme entro 24 ore, notifica entro 72 ore, rapporto finale entro 14 giorni dalla disponibilità di una misura correttiva (un mese per gli incidenti), tutto tramite la piattaforma ENISA, con il CSIRT coordinatore dello Stato del vostro stabilimento principale come destinatario. Separatamente vanno informati gli utenti coinvolti. Le vulnerabilità di cui già sapevate lo sfruttamento prima dell'11 settembre 2026 non vanno notificate retroattivamente."
  - question: "Quanto durano gli obblighi?"
    answer: "Per il periodo di supporto, che il fabbricante stabilisce in base al tempo d'uso previsto e che deve essere di almeno cinque anni, salvo che il prodotto sia destinato a un uso più breve. In quel periodo le vulnerabilità vanno gestite e gli aggiornamenti di sicurezza forniti; ogni aggiornamento di sicurezza deve poi restare disponibile per almeno dieci anni o per il resto del periodo di supporto, se più lungo. La data di fine supporto va indicata nelle informazioni per l'utente. Un processo di gestione delle vulnerabilità che copre solo l'ultimo rilascio non basta."
  - question: "Che cos'è una modifica sostanziale, e perché conta per il software che rilascia in continuo?"
    answer: "Una modifica successiva all'immissione sul mercato che incide sulla conformità ai requisiti della Parte I o cambia la finalità prevista per cui il prodotto è stato valutato. Quando accade, il prodotto modificato conta come nuovamente immesso sul mercato e deve ripetere la valutazione della conformità. Aggiornamenti di sicurezza e rilasci di manutenzione non sono modifiche sostanziali; un rilascio che aggiunge il controllo delle macchine connesse a un cruscotto di monitoraggio lo è, per citare uno degli esempi della Commissione. I team che rilasciano ogni settimana hanno bisogno di un modo per classificare ogni rilascio rispetto a questo criterio prima di pubblicarlo, non dopo."
  - question: "Quali sono le sanzioni, e chi vigila sul CRA in Italia?"
    answer: "Fino a 15 milioni di euro o al 2,5% del fatturato mondiale annuo per la violazione dei requisiti essenziali o degli obblighi dei fabbricanti negli articoli 13 e 14; massimali più bassi per le altre violazioni e per la fornitura di informazioni fuorvianti alle autorità. L'applicazione è nazionale. In Italia la Legge 36/2026 designa l'Agenzia per la Cybersicurezza Nazionale (ACN) sia come autorità di notifica per gli organismi di valutazione della conformità sia come autorità di vigilanza del mercato, e il CSIRT Italia, gestito da ACN, è il CSIRT coordinatore che riceve le notifiche dell'articolo 14. Il decreto legislativo attuativo che fissa la scala nazionale delle sanzioni è ancora atteso."
  - question: "Fornisci consulenza legale sul Cyber Resilience Act?"
    answer: "No. La classificazione del prodotto, il percorso di valutazione della conformità, la decisione sul periodo di supporto e il contenuto della dichiarazione di conformità UE sono decisioni che prendete con il vostro consulente legale e, quando la classe lo richiede, con un organismo notificato. Io copro la parte ingegneristica: fare in modo che prodotto, pipeline e team producano le evidenze su cui quelle decisioni si basano, e continuino a produrle dopo la valutazione."
---

## Il problema che di solito trovo

La maggior parte dei team che incontro su questo tema ha già letto il regolamento, o una sua sintesi, e spesso ha concluso che la parte difficile sia la documentazione. Non lo è. La parte difficile è che il CRA descrive un processo che dura per tutto il periodo di supporto di ogni prodotto, e il processo di rilascio attuale non è mai stato pensato per produrre quel tipo di evidenze in modo continuo.

Di conseguenza probabilmente nessuno ha un elenco completo di quali prodotti, versioni e componenti integrati siano davvero in perimetro. Una SBOM è stata generata una volta, a mano, per il questionario di un cliente, e nessuno sa a quale build si riferisca. Lo scanner delle vulnerabilità segnala duecento rilievi per rilascio, per lo più in codice che il prodotto non esegue mai, e il team ha smesso di leggerli. Le correzioni di sicurezza viaggiano dentro i rilasci funzionali, quindi il cliente che non può prendere la funzionalità non riceve nemmeno la correzione. Non esiste un indirizzo pubblicato a cui segnalare una vulnerabilità, e se un ricercatore scrivesse domani alla casella commerciale ci vorrebbero giorni perché arrivasse a un ingegnere. E dall'11 settembre 2026 il cronometro delle notifiche corre già per prodotti venduti anni fa.

## Come intervengo

Parto da ciò che il prodotto e la pipeline fanno già, non dal testo del regolamento. L'Allegato I elenca tredici proprietà che il prodotto deve avere e otto cose che il fabbricante deve saper fare con le vulnerabilità. Ciascuna corrisponde a una scelta di progetto, ad uno step di build o ad un processo ancora da definire, e il gap da verificare è proprio quella mappatura insieme alla sua classificazione che decide se entra in gioco un organismo notificato.

Il lavoro viene poi ordinato per ciò che è già applicabile e per ritorno. Prima il processo di gestione delle vulnerabilità e la preparazione alle notifiche, perché l'articolo 14 si applica oggi e copre i prodotti già sul mercato. Poi le evidenze di supply chain, SBOM, firma, aggiornamenti sicuri, perché tutto ciò che segue dipende dal sapere che cosa c'è in ogni rilascio. Poi i requisiti di prodotto della Parte I, che sono soprattutto lavoro di progettazione con il team di prodotto e alimentano la valutazione del rischio. La documentazione tecnica non è una fase a sé: viene assemblata dagli output delle tre precedenti, così descrive ciò che si rilascia e resta aggiornata a ogni versione.

Gli strumenti arrivano da ciò che si usa già. GitLab CI e GitHub Actions, ad esempio, offrono entrambi opzioni adeguate per generare SBOM, firmare artefatti e pubblicare avvisi; le differenze tra loro contano molto meno del fatto che l'output venga rivisto, conservato e sia raggiungibile quando un'autorità lo chiede.

## Che cosa copre il lavoro ingegneristico

**Perimetro e classificazione.** Un inventario dei prodotti con elementi digitali, compresi firmware, software on-premise, agent e componenti edge dei prodotti SaaS, e i componenti di terze parti che vengono integrati. Ogni prodotto riceve una classe (predefinita, importante di classe I o II, critica) usando le descrizioni tecniche del Regolamento di esecuzione 2025/2392, perché è quella a decidere il percorso di valutazione della conformità e quindi il calendario.

**Gestione delle vulnerabilità (Allegato I, Parte II).** Un punto di contatto unico che tutti gli utenti riescono a trovare, una policy di vulnerability disclosure e una notifica che arriva al team dedicato. Triage registrato come dichiarazioni VEX, così la stessa domanda non viene indagata due volte. Obiettivi di correzione ordinati in base alla gravità. Segnalazione a monte quando la vulnerabilità è in un componente di terze parti, come richiede l'articolo 13(6). Aggiornamenti di sicurezza costruiti e distribuiti separatamente da quelli funzionali dove tecnicamente possibile, con avvisi in formato leggibile da macchina.

**Evidenze di supply chain.** SBOM generata in fase di build, per artefatto, in CycloneDX o SPDX, conservata accanto all'artefatto che descrive, con la firma che copre entrambi. Attestazioni di provenance che legano l'artefatto al commit e all'esecuzione di pipeline che lo hanno prodotto. Un VDR per ogni rilascio supportato, generato dalla storia dei VEX. Chiavi di firma tenute fuori dalla pipeline e usate tramite credenziali a scadenza breve, lo stesso lavoro che faccio sul fronte [SecDevOps](/it/servizi/consulenza-secdevops-cicd/).

**Distribuzione sicura degli aggiornamenti.** Un canale attraverso cui gli utenti possono verificare che un aggiornamento arrivi da una fonte riconosciuta e verificata, aggiornamenti di sicurezza diffusi senza ritardo e gratuitamente, e un piano di conservazione perché ogni aggiornamento resti disponibile per i dieci anni richiesti dal regolamento.

**Monitoraggio continuo.** Le SBOM di ogni rilascio ancora nel periodo di supporto vengono confrontate in continuo con i nuovi dati sulle vulnerabilità. Le corrispondenze arrivano al team responsabile del componente, con la storia dei VEX allegata, e alimentano la valutazione di consapevolezza che può far partire il cronometro delle notifiche.

**Preparazione alle notifiche.** Registrazione sulla piattaforma unica di segnalazione, un criterio scritto per che cosa significa "venire a conoscenza" nella vostra organizzazione e dove quel momento viene registrato, un runbook per il preallarme a 24 ore, la notifica a 72 ore e il rapporto finale, modelli per informare gli utenti coinvolti e un'esercitazione tabletop.

**Documentazione tecnica (Allegato VII).** Versioni rilevanti per la conformità, architettura, il processo di gestione delle vulnerabilità con la sua SBOM e la policy di divulgazione, la valutazione del rischio, la motivazione del periodo di supporto, i rapporti di test e la dichiarazione di conformità, assemblati dagli output della pipeline a ogni rilascio invece di essere scritti una volta prima della valutazione.

## Situazioni tipiche

- Un fabbricante di dispositivi connessi il cui firmware è costruito da un fornitore, e che deve rispondere della SBOM, del canale di aggiornamento e del periodo di supporto senza possedere la build. 
- Un produttore di software indipendente che consegna software on-premise a clienti a loro volta in perimetro, che già chiedono SBOM e policy di divulgazione nei capitolati. 
- Un'azienda SaaS convinta di essere fuori perimetro finché non ha contato agent edge, app mobili e connettori on-premise. 
- Un prodotto costruito su Kubernetes che distribuisce un container runtime. Un fornitore della pubblica amministrazione le cui risposte alle gare ora includono domande sul CRA. 

In ogni caso il regolamento è lo stesso; cambia da dove devono arrivare le evidenze.

## Che cosa non faccio

Non classifico il vostro prodotto ne mi sostituisco a nessun consulente legale per il percorso di valutazione della conformità e la stesura della sua dichiarazione. Quello di cui mi assicuro è che, quando quelle decisioni vengono prese, il prodotto, il processo e la documentazione su cui si basano esistano davvero, siano prodotti dalla vostra pipeline e descrivano ciò che rilasciate.
