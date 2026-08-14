---
key: "cloud"
lang: "it"
title: "Consulenza Cloud e migrazione"
tagline: "Adozione del cloud e migrazione di applicazioni e infrastruttura, con costi sotto controllo e senza riscrivere tutto dal primo giorno."
seoTitle: "Consulente Cloud e migrazione in Italia | Luca Bertelli"
description: "Consulenza cloud in Italia: strategia di adozione, migrazione di applicazioni e infrastruttura verso AWS, Azure e Google Cloud, governance e controllo dei costi."
order: 2
keywords:
  - "consulente cloud"
  - "consulenza cloud"
  - "migrazione cloud"
  - "cloud adoption"
  - "consulente cloud Italia"
  - "governance costi cloud"
relatedTags: ["kubernetes", "observability", "fleet-management", "helm"]
credentials: ["vmware_master", "terraform_associate", "cka", "vault-professional"]
outcomes:
  - "Una strategia di migrazione ordinata per rischio e valore, non un big bang"
  - "Ambienti cloud coerenti tra loro e ricostruibili da codice"
  - "Spesa cloud prevedibile, attribuita ai team e ai progetti che la generano"
  - "Nessun lock-in involontario: le scelte vincolanti sono esplicite e motivate"
deliverables:
  - "Assessment del portafoglio applicativo e classificazione dei carichi di lavoro"
  - "Piano di migrazione per ondate, con criteri di uscita per ciascuna"
  - "Landing zone e struttura degli account/subscription in Terraform"
  - "Modello di governance: naming, tagging, budget e allarmi di spesa"
  - "Migrazione assistita dei primi carichi, come riferimento per i successivi"
faq:
  - question: "Da dove si comincia una migrazione in cloud?"
    answer: "Da un inventario onesto di ciò che si ha. Prima di scegliere un provider o un'architettura serve capire quali applicazioni esistono, come sono accoppiate tra loro, quali dati trattano e quali vincoli normativi le riguardano. Solo a quel punto ha senso decidere che cosa spostare così com'è, che cosa rivedere e che cosa conviene lasciare dov'è."
  - question: "Conviene sempre migrare tutto in cloud?"
    answer: "No, e dirlo fa parte del lavoro. Alcuni carichi hanno un profilo di utilizzo costante e prevedibile per cui il cloud pubblico è semplicemente più caro. Altri sono legati a hardware o licenze che rendono la migrazione sproporzionata rispetto al beneficio. Un piano credibile include anche ciò che resta dov'è."
  - question: "Con quali cloud provider lavori?"
    answer: "AWS, Microsoft Azure e Google Cloud, oltre a scenari ibridi e on-premise basati su Kubernetes. L'approccio è di mantenere gli automatismi il più possibile portabili con Terraform e strumenti CNCF, e di rendere esplicita ogni dipendenza specifica dal provider."
  - question: "Come si evita che i costi cloud sfuggano di mano?"
    answer: "Rendendoli visibili prima che diventino un problema. Significa una convenzione di tagging applicata dal primo giorno, budget e allarmi per ambiente, dimensionamento delle risorse rivisto periodicamente e spegnimento automatico degli ambienti non produttivi. La maggior parte degli sprechi che incontro non deriva da scelte sbagliate, ma da risorse che nessuno sa più a chi appartengano."
  - question: "Quanto dura una migrazione cloud?"
    answer: "Le prime ondate di carichi non critici si completano tipicamente in poche settimane dopo la preparazione della landing zone. Un portafoglio applicativo esteso richiede più mesi. Lavorare per ondate serve proprio a rendere disponibile valore in modo continuo, invece di attendere la fine di un progetto unico."
---

## Il problema che di solito trovo

Il cloud raramente arriva per decisione unitaria. Nella maggior parte delle organizzazioni con cui lavoro è entrato in modo frammentario: un team che ha aperto un account per un prototipo, un fornitore che ha portato con sé la propria infrastruttura, una migrazione parziale interrotta a metà. Il risultato è un ambiente ibrido non progettato, con account che nessuno governa e una spesa che cresce senza che sia chiaro chi la produca.

La seconda variante che incontro spesso è opposta: il "lift and shift" completato ma mai finito davvero. Le macchine virtuali sono state spostate, l'architettura è rimasta quella di prima, e adesso si pagano le stesse risorse di prima con in più il margine del provider. Il cloud viene percepito come un fallimento quando in realtà non è mai stato adottato, solo affittato.

## Come intervengo

Il punto di partenza è la classificazione dei carichi di lavoro. Ogni applicazione viene valutata su quanto è accoppiata all'infrastruttura sottostante, quali dati tratta, quali vincoli normativi la riguardano e quanto è variabile il suo profilo di utilizzo. Da questa griglia emerge in modo abbastanza naturale che cosa vada spostato così com'è, che cosa vada rivisto durante la migrazione e che cosa convenga lasciare dov'è.

Prima di spostare qualsiasi cosa si prepara la landing zone: struttura degli account, rete, identità e permessi, gestione dei segreti, convenzioni di naming e tagging. Tutto descritto in Terraform, perché un ambiente cloud costruito a mano riproduce nel giro di due anni esattamente il disordine da cui si voleva uscire.

La migrazione procede poi per ondate, partendo da carichi a basso rischio che servono a validare gli automatismi. Ogni ondata ha criteri di uscita espliciti, e le prime vengono eseguite insieme al team interno perché diventino il modello per quelle successive.

## La governance dei costi, dal primo giorno

Il controllo della spesa non è una fase finale di ottimizzazione, è una proprietà da costruire fin dall'inizio. Se il tagging è coerente dal primo deploy, attribuire i costi a un team o a un progetto è immediato; se lo si introduce dopo, diventa un lavoro di ricostruzione su risorse di cui si è persa la traccia.

In pratica significa budget e allarmi per ambiente, revisione periodica del dimensionamento, spegnimento automatico di ciò che non serve fuori orario, e una regola semplice: ogni risorsa deve avere un proprietario identificabile.
