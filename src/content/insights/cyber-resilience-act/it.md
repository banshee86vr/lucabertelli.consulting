---
key: "cyber-resilience-act"
lang: "it"
title: "Cyber Resilience Act: a che punto siamo e da dove cominciare"
subtitle: "Le notifiche sono già obbligatorie, le norme armonizzate non ci sono ancora, e dicembre 2027 è più vicino di quanto suggerisca il calendario dei rilasci"
seoTitle: "Cyber Resilience Act: guida per chi sviluppa software | Luca Bertelli"
date: "2026-09-28"
image: "/insights/cyber-resilience-act/cyber-resilience-act.webp"
relatedServices: ["cyber-resilience-act", "secdevops", "devops", "kubernetes"]
---

## A che punto siamo, settembre 2026

Il Cyber Resilience Act, Regolamento (UE) 2024/2847, è in vigore dal 10 dicembre 2024, e il primo obbligo con conseguenze concrete è arrivato l'**11 settembre 2026**: le notifiche dell'articolo 14. Da quella data un fabbricante che viene a conoscenza di una vulnerabilità attivamente sfruttata in uno dei suoi prodotti, o di un incidente grave che ne compromette la sicurezza, deve inviare un preallarme entro 24 ore, una notifica entro 72 ore e un rapporto finale, attraverso la **piattaforma unica di segnalazione** che ENISA ha aperto lo stesso giorno. L'obbligo copre ogni prodotto in perimetro già sul mercato, non solo quelli immessi dopo il 2027 (articolo 69(3)). Non copre invece lo sfruttamento di cui si era già a conoscenza prima dell'11 settembre: il cronometro parte dalla nuova consapevolezza.

Intorno a quella data alcuni pezzi sono andati a posto:

- **Linee guida della Commissione** (C(2026) 5252, 27 luglio 2026): 84 pagine e 67 esempi pratici su perimetro, elaborazione remota dei dati, open source, modifica sostanziale, periodi di supporto e notifiche. Non vincolanti, ma sono ciò che le autorità di vigilanza leggeranno. Non dicono nulla sul formato della SBOM.
- **Regolamento di esecuzione (UE) 2025/2392** (28 novembre 2025): le descrizioni tecniche delle categorie di prodotti importanti (classe I e II) e critici. È il documento che dice se il vostro prodotto ha bisogno di un organismo notificato.
- **Regolamento delegato (UE) 2026/881**: quando un CSIRT può ritardare la trasmissione della vostra notifica ad altri. Non sposta le vostre scadenze.
- In Italia la **Legge 36/2026** designa l'Agenzia per la Cybersicurezza Nazionale sia come autorità di notifica sia come autorità di vigilanza del mercato, con il CSIRT Italia come coordinatore che riceve le notifiche. Il decreto legislativo che fissa la scala nazionale delle sanzioni è ancora atteso.

Due cose non sono andate a posto. **Nessuna norma armonizzata è stata citata nella Gazzetta ufficiale.** La serie orizzontale EN 40000 (vocabolario, principi, gestione delle vulnerabilità, requisiti di sicurezza generici) è in parte in approvazione e in parte ancora in stesura, la Commissione ha proposto di spostare in avanti le scadenze di normazione, e le prime citazioni non sono attese prima del 2027. Fino ad allora non esiste presunzione di conformità per nessuno, e i prodotti di classe I non possono usare l'autovalutazione. E il **Digital Omnibus**, che propone un punto di ingresso unico per la segnalazione degli incidenti tra NIS2, CRA, GDPR e DORA costruito sopra la piattaforma ENISA, è ancora in Consiglio. Non cambia nessuna data del CRA.

## Che cosa chiede il regolamento, in breve

L'Allegato I ha due parti. La **Parte I** riguarda il prodotto: tredici proprietà, da "nessuna vulnerabilità sfruttabile nota al rilascio" e configurazione sicura per impostazione predefinita fino a cifratura, integrità, minimizzazione dei dati, riduzione della superficie di attacco, registrazione degli eventi di sicurezza e cancellazione sicura, ciascuna applicata secondo una valutazione del rischio documentata. La **Parte II** riguarda il processo del fabbricante: otto doveri, tra cui la SBOM, la correzione delle vulnerabilità senza ritardo, i test regolari, la divulgazione pubblica delle vulnerabilità corrette, una policy di coordinated vulnerability disclosure, un indirizzo di contatto per le segnalazioni, la distribuzione sicura degli aggiornamenti e aggiornamenti di sicurezza gratuiti con un avviso.

Intorno: le informazioni per l'utente (Allegato II, compresa la data di fine supporto e dove segnalare le vulnerabilità), la documentazione tecnica (Allegato VII, compresa la SBOM e la motivazione del periodo di supporto), un periodo di supporto di almeno cinque anni e aggiornamenti di sicurezza che devono restare disponibili per dieci anni dal rilascio. Le sanzioni arrivano a 15 milioni di euro o al 2,5% del fatturato mondiale.

## Tre fraintendimenti che incontro di continuo

**"Siamo SaaS, quindi siamo fuori."** Il servizio in sé è territorio NIS2, ma l'agent edge, l'app mobile, il connettore on-premise e il firmware nel gateway sono prodotti con elementi digitali. Anche l'elaborazione remota senza cui il prodotto non funziona è in perimetro. La maggior parte delle aziende SaaS con cui parlo ha tre o quattro prodotti in perimetro che non aveva contato.

**"La SBOM è il deliverable."** È un punto su ventuno, e da sola produce un lungo elenco di vulnerabilità in codice che il prodotto non esegue mai. Le linee guida della Commissione sono esplicite: un componente vulnerabile il cui codice non è raggiungibile non rende la vulnerabilità del prodotto attivamente sfruttata. Ciò che trasforma l'elenco in evidenza è il giudizio registrato per ogni rilievo (VEX) e il rapporto costruito da quei giudizi (VDR), insieme a un processo che continua a produrli per ogni rilascio supportato.

**"Ce ne occupiamo nel 2027."** L'articolo 14 si applica oggi. La decisione sulla classe determina se serve un organismo notificato, e finora ce ne sono pochissimi; l'articolo 35 chiede agli Stati membri di garantire capacità sufficiente entro l'11 dicembre 2026, il che dice quanto sarà stretta la coda. E il periodo di supporto è di almeno cinque anni dal giorno del rilascio, quindi il processo che gestisce le vulnerabilità su quel rilascio deve esistere quel giorno.

## Come ordinare il lavoro

Non esiste un unico ordine giusto, ma questo ha tenuto in contesti regolati e segue ciò che è già applicabile:

1. **Inventario e classificazione.** Ogni prodotto con elementi digitali, compresi firmware, agent, connettori e componenti di terze parti integrati, mappato su categoria predefinita, importante di classe I o II, o critica. Questo decide il calendario.
2. **Preparazione alle notifiche.** Un punto di contatto unico che gli utenti riescono a trovare, una policy di coordinated vulnerability disclosure, la registrazione sulla piattaforma unica di segnalazione, un criterio scritto per che cosa significa "venire a conoscenza" e dove viene registrato, un runbook per i passi a 24 ore, 72 ore e 14 giorni, e una prova generale.
3. **Evidenze di supply chain.** SBOM per artefatto dalla build, artefatti firmati con provenance, VEX e VDR per ogni rilascio supportato, monitoraggio continuo contro i nuovi dati sulle vulnerabilità. È il lavoro [SecDevOps](/it/servizi/consulenza-secdevops-cicd/) con in più i doveri di conservazione e divulgazione del CRA.
4. **Requisiti di prodotto.** Le proprietà della Parte I che sono decisioni di progetto, affrontate con il team di prodotto e registrate nella valutazione del rischio. Aggiornamenti di sicurezza distribuiti separatamente dalle funzionalità dove possibile.
5. **Documentazione tecnica e percorso di conformità.** L'Allegato VII assemblato dagli output precedenti, poi la decisione tra autovalutazione e organismo notificato presa con il consulente legale.

La pagina sulla [conformità al Cyber Resilience Act](/it/servizi/consulenza-cyber-resilience-act/) descrive che cosa produce ciascuno di questi passi e che cosa copro e non copro.

## Che cosa chiedere a un consulente o a un fornitore

1. Quale rilascio descrive questa SBOM, e come lo dimostrate?
2. Se un ricercatore segnala una vulnerabilità stanotte, dove arriva e chi la legge?
3. Che cosa succede nella vostra organizzazione nelle prime 24 ore dopo aver saputo che una vulnerabilità viene sfruttata?
4. Quali dei vostri rilasci degli ultimi dodici mesi sarebbero contati come modifica sostanziale?
5. Dopo l'intervento, chi nel team interno tiene in piedi tutto questo per i prossimi cinque anni?

Se le risposte sono vaghe, state comprando un documento, non la conformità. Se volete una lettura concreta di dove si trova il vostro prodotto, [scrivete a info@lucabertelli.consulting](mailto:info@lucabertelli.consulting). Il prodotto, la pipeline attuale e la base clienti bastano per cominciare.
