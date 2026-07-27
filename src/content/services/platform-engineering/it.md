---
key: "platform-engineering"
lang: "it"
title: "Platform Engineering"
tagline: "Progettazione di Internal Developer Platform che riducono il carico cognitivo degli sviluppatori invece di spostarlo altrove."
seoTitle: "Consulenza Platform Engineering e Internal Developer Platform | Luca Bertelli"
description: "Consulenza di Platform Engineering: progettazione di Internal Developer Platform, golden path, self-service su Kubernetes e misurazione dell'adozione da parte dei team."
order: 3
keywords:
  - "platform engineering"
  - "consulenza platform engineering"
  - "internal developer platform"
  - "IDP"
  - "golden path"
  - "developer experience"
relatedTags: ["kubernetes", "multi-tenancy", "cicd", "vcluster"]
credentials: ["cka", "capa", "terraform_associate", "kong-konnect"]
outcomes:
  - "Uno sviluppatore nuovo arriva in produzione in giorni, non in settimane"
  - "Percorsi standard che sono la strada più semplice, quindi vengono scelti spontaneamente"
  - "Il team di piattaforma smette di essere un ticket desk e torna a costruire"
  - "Standard di sicurezza e conformità applicati per costruzione, non per revisione"
deliverables:
  - "Ricerca sugli utenti interni: dove si perde davvero tempo nel ciclo di sviluppo"
  - "Disegno della piattaforma e definizione dei golden path"
  - "Template self-service per creazione servizi, ambienti e pipeline"
  - "Portale per sviluppatori e catalogo dei servizi"
  - "Metriche di adozione e ciclo di feedback con i team consumatori"
faq:
  - question: "Che cos'è il Platform Engineering?"
    answer: "È la disciplina che tratta l'infrastruttura interna come un prodotto, con utenti reali che sono gli sviluppatori dell'azienda. Invece di chiedere a ogni team di comporre da sé Kubernetes, pipeline, segreti e osservabilità, una piattaforma interna offre percorsi già pronti e sicuri per le attività ricorrenti, lasciando aperta la possibilità di uscirne quando serve."
  - question: "Che differenza c'è tra Platform Engineering e DevOps?"
    answer: "DevOps descrive un insieme di pratiche e una cultura di collaborazione tra sviluppo e operations. Il Platform Engineering è una risposta organizzativa a un problema che il DevOps ha generato su larga scala: chiedere a ogni team di padroneggiare l'intero stack non scala oltre un certo numero di team. La piattaforma incapsula quella complessità dietro interfacce stabili."
  - question: "Serve davvero una Internal Developer Platform alla mia azienda?"
    answer: "Sotto i tre o quattro team di sviluppo, quasi mai: il costo di costruirla e mantenerla supera il beneficio. Diventa sensata quando la stessa configurazione viene ricreata da più team in modo leggermente diverso ogni volta, quando l'onboarding di un servizio richiede settimane, o quando il gruppo infrastrutturale passa la maggior parte del tempo a rispondere a richieste ripetitive."
  - question: "Usate Backstage o strumenti simili?"
    answer: "Backstage è una scelta valida per il catalogo e il portale, ma è solo la parte visibile. La sostanza sta in ciò che il portale attiva: template di scaffolding, provisioning degli ambienti, policy applicate automaticamente. Ho lavorato anche con Krateo PlatformOps, di cui sono stato co-fondatore, e la scelta dello strumento viene sempre dopo la definizione dei golden path."
  - question: "Come si misura se la piattaforma sta funzionando?"
    answer: "Con l'adozione volontaria, che è l'unico indicatore onesto: se i team usano i percorsi standard senza che sia imposto, la piattaforma sta risolvendo un problema reale. Accanto a quello guardo il tempo dal primo commit al primo deploy in produzione per un servizio nuovo, e la quota di richieste al team di piattaforma che sono diventate self-service."
---

## Il problema che di solito trovo

Quando un'organizzazione supera i tre o quattro team di sviluppo, la promessa "ogni team è autonomo sul proprio stack" comincia a incrinarsi. Ogni team ha configurato Kubernetes a modo suo, ha scritto le proprie pipeline, ha scelto il proprio modo di gestire i segreti. Nessuna di queste scelte è sbagliata presa singolarmente; l'insieme è ingestibile.

A quel punto succede una di due cose. O il gruppo infrastrutturale diventa un ticket desk, sommerso da richieste ripetitive che lo consumano interamente, oppure gli sviluppatori si arrangiano e la superficie di rischio cresce in silenzio. In entrambi i casi il tempo che serve a portare un servizio nuovo in produzione si misura in settimane, e nessuno sa spiegare con precisione perché.

## Come intervengo

La prima fase non è tecnica. Parlo con gli sviluppatori che dovranno usare la piattaforma e ricostruisco che cosa fanno davvero in una settimana di lavoro: quali passaggi ripetono, dove aspettano qualcun altro, quali configurazioni copiano da un progetto all'altro senza capirle fino in fondo. Una piattaforma costruita su ipotesi invece che su osservazione finisce per automatizzare i problemi sbagliati.

Da lì si definiscono i golden path: i percorsi standard per le attività ricorrenti, dalla creazione di un servizio nuovo alla promozione tra ambienti. La caratteristica che li rende efficaci non è l'imposizione, è il fatto di essere la strada più semplice. Se il percorso standard è anche il più comodo, viene scelto senza bisogno di policy.

Serve però che sia sempre possibile uscirne. Le piattaforme che falliscono sono quasi sempre quelle che hanno tolto agli sviluppatori la possibilità di fare qualcosa di non previsto: il primo caso legittimo che il modello non copre le trasforma da acceleratore a ostacolo.

## Costruire per gradi

Non consiglio quasi mai di partire da un portale. Il portale è l'ultima cosa, quando c'è già qualcosa da esporre. Si parte dal caso d'uso che fa perdere più tempo a più persone, lo si rende self-service davvero, e lo si mette a disposizione. Poi il successivo.

Questo approccio ha un effetto collaterale utile: obbliga a verificare l'adozione a ogni passo, invece di scoprire dopo un anno di lavoro che la piattaforma non risolve i problemi che i team hanno veramente.
