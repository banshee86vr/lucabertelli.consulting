---
key: "ai-engineering"
lang: "it"
title: "Consulenza AI e governance degli agenti AI"
tagline: "Intelligenza artificiale per aziende, a partire dagli agenti AI: regole chiare, rischio controllato e spesa prevedibile."
seoTitle: "Consulenza AI per aziende: governance agenti AI | Luca Bertelli"
description: "Consulenza AI per aziende in Italia: governance degli agenti AI, obblighi dell'AI Act, sicurezza dei server MCP, policy di utilizzo e controllo dei costi."
order: 8
keywords:
  - "consulenza AI per aziende"
  - "intelligenza artificiale per aziende"
  - "governance agenti AI"
  - "agenti AI per aziende"
  - "adozione agenti AI"
  - "consulenza agenti AI"
  - "consulenza AI Italia"
  - "governance AI aziendale"
  - "AI Act"
  - "sicurezza agenti AI"
  - "sicurezza server MCP"
  - "AI engineering"
  - "Model Context Protocol"
relatedTags: ["mcp", "devsecops", "observability", "kubernetes"]
credentials: ["cka", "vault-professional", "terraform_associate"]
outcomes:
  - "Agenti in produzione con perimetro di azione definito e verificabile"
  - "Spesa di inferenza attribuita per team e caso d'uso, con limiti di spesa automatici"
  - "Accessi degli agenti gestiti come identità, non come chiavi condivise"
  - "Criteri espliciti per decidere dove l'AI serve davvero e dove non conviene"
deliverables:
  - "Valutazione dei casi d'uso, ordinati per valore atteso e rischio"
  - "Policy di utilizzo: dati ammessi, azioni consentite, punti di approvazione umana"
  - "Architettura di integrazione, inclusi server MCP e connessione ai sistemi interni"
  - "Hardening: isolamento dell'esecuzione, gestione dei segreti, tracciamento delle azioni"
  - "Modello di budget e monitoraggio del consumo di token"
faq:
  - question: "Che cosa sono gli agenti AI e che cosa cambia per un'azienda?"
    answer: "Un agente AI è un sistema basato su un modello linguistico che non si limita a rispondere, ma usa strumenti: legge documenti, interroga sistemi interni, apre ticket, esegue codice. Per un'azienda cambia il tipo di rischio: un chatbot sbaglia una risposta, un agente può compiere un'azione sbagliata con credenziali reali. Per questo l'adozione richiede le stesse regole di un servizio in produzione: identità, permessi, tracciamento e un budget."
  - question: "Che cosa comprende una consulenza AI per aziende?"
    answer: "Il ciclo di vita degli agenti AI in un contesto aziendale: selezione dei casi d'uso che giustificano l'investimento, governance e policy di utilizzo, architettura di integrazione con i sistemi interni, hardening di sicurezza e controllo dei costi. Non è consulenza sui modelli, è consulenza sull'infrastruttura e sulle regole che rendono un agente utilizzabile in produzione."
  - question: "Quali sono i rischi di sicurezza specifici degli agenti AI?"
    answer: "I due che considero prioritari sono la prompt injection indiretta e i permessi troppo ampi. Con la prompt injection indiretta, un agente che legge contenuti esterni può essere indotto a compiere azioni non previste. Quanto ai permessi, a un agente vengono spesso concesse credenziali molto più estese di quanto il suo compito richieda. Entrambi si affrontano con il principio del privilegio minimo, lo stesso che si applica ai servizi, più un tracciamento completo delle azioni compiute."
  - question: "Che cos'è il Model Context Protocol e quando conviene usarlo?"
    answer: "MCP è uno standard aperto per esporre dati e strumenti agli agenti AI attraverso un'interfaccia uniforme. Conviene quando più agenti o più client devono accedere agli stessi sistemi interni: invece di scrivere un'integrazione dedicata per ciascuno, si espone un server MCP che centralizza accesso, permessi e tracciamento. Ho pubblicato un articolo su una sua applicazione concreta al monitoraggio di una fleet Kubernetes."
  - question: "Come si mette in sicurezza un server MCP?"
    answer: "Trattandolo come un'API esposta a un client non del tutto affidabile. Ogni chiamata è autenticata e autorizzata. Per i server remoti la specifica MCP basa l'autorizzazione su OAuth 2.1, e i permessi si definiscono per singolo strumento, non per server. I dati in ingresso si validano come per qualsiasi API, i segreti restano fuori dal codice e dalla configurazione del client, e ogni invocazione finisce in un registro con identità, strumento e parametri. C'è poi un rischio specifico: le descrizioni degli strumenti entrano nel contesto del modello, quindi un server di terze parti può iniettare istruzioni (il cosiddetto tool poisoning). Per questo i server esterni vanno trattati come dipendenze della supply chain: versioni fissate, provenienza verificata e nessun accesso oltre lo stretto necessario."
  - question: "Che cosa chiede l'AI Act a un'azienda che usa agenti AI?"
    answer: "Dipende dal ruolo e dalla classe di rischio. Un'azienda che usa un sistema di AI sotto la propria autorità è un deployer; chi lo sviluppa o lo immette sul mercato con il proprio nome è un fornitore e ha obblighi più pesanti. Da febbraio 2025 alcune pratiche di AI sono già vietate, e formare chi usa questi sistemi (l'alfabetizzazione sull'AI di cui parla l'articolo 4) è la base di qualsiasi governance. Alcuni usi sono ad alto rischio secondo l'Allegato III, per esempio la valutazione del merito creditizio delle persone fisiche o il calcolo dei premi nelle assicurazioni vita e malattia. In quei casi il regolamento chiede al deployer tre cose: sorveglianza umana affidata a persone competenti, uso secondo le istruzioni del fornitore e conservazione dei log per almeno sei mesi. Io lavoro sulla parte tecnica che rende questi obblighi verificabili: inventario, perimetro delle azioni, approvazioni e tracciamento. Classificazione e inquadramento giuridico restano compito del vostro consulente legale."
  - question: "Come si tengono sotto controllo i costi di inferenza?"
    answer: "Attribuendoli prima che crescano. Ogni caso d'uso ha un budget, il consumo di token viene tracciato per team e funzionalità, e sono previsti limiti applicati automaticamente. La voce di spesa che sfugge più spesso non è il singolo prompt costoso, ma un agente bloccato in un ciclo di tentativi che nessuno ha limitato."
  - question: "Serve un modello eseguito sui propri server o basta un servizio gestito?"
    answer: "Nella maggior parte dei casi un servizio gestito è adeguato. L'esecuzione in locale ha senso con vincoli reali di riservatezza dei dati o requisiti di sovranità, e va valutata considerando il costo operativo che comporta. La scelta si fa sui vincoli effettivi, non sull'impressione che eseguire in casa sia automaticamente più sicuro."
  - question: "Quando ha senso una consulenza di governance sugli agenti AI?"
    answer: "Quando gli agenti stanno già entrando in azienda senza un perimetro condiviso, oppure quando volete adottarli in modo deliberato prima che proliferino. I segnali tipici sono chiavi API condivise, nessun inventario dei casi d'uso, assenza di limiti di spesa e la domanda \"chi ha autorizzato questo agente a leggere quei dati?\" senza una risposta chiara."
---

## Il problema che di solito trovo

In azienda l'intelligenza artificiale arriva quasi sempre dal basso, sotto forma di agenti AI. Uno sviluppatore prova un assistente, un team automatizza un flusso di supporto, qualcuno collega un modello a un sistema interno per un prototipo. Nel giro di pochi mesi esistono diverse integrazioni che nessuno ha censito, con chiavi API condivise e nessuna idea precisa di quali dati stiano attraversando quale servizio.

Il secondo problema è economico e arriva poco dopo. La spesa di inferenza non ha un profilo prevedibile come quello di una macchina virtuale: dipende da quanto viene usato l'agente e da quanto contesto trascina a ogni chiamata. Senza attribuzione per caso d'uso, la fattura mensile diventa un numero unico che nessuno sa scomporre e quindi nessuno sa ridurre.

## Come intervengo: un framework di governance per gli agenti AI

Si parte dalla selezione dei casi d'uso, che è soprattutto un lavoro di esclusione. Molte attività proposte per l'automazione con AI sono più economiche e più affidabili se risolte con codice ordinario. Il criterio che uso è la tolleranza all'errore: dove una risposta approssimativa ha un costo basso e la verifica è rapida, un agente porta valore; dove serve esattezza deterministica, quasi mai.

Sulle attività che superano il filtro si definisce il perimetro operativo. Quali dati l'agente può leggere, quali azioni può eseguire da solo, quali richiedono approvazione umana. Sembra un adempimento formale ed è invece la parte che determina se il sistema sarà gestibile: senza limiti espliciti si scopre il perimetro reale solo quando qualcosa va storto. L'inventario dei casi d'uso che ne risulta, con perimetri e punti di approvazione documentati, è anche la base tecnica per rispettare gli obblighi dell'AI Act.

## Sicurezza e integrazione

Sul piano tecnico un agente va trattato come un servizio con un'identità propria, non come uno strumento che eredita le credenziali di chi lo invoca. Questo significa permessi minimi e specifici, segreti gestiti tramite Vault invece di chiavi statiche, esecuzione isolata per qualsiasi codice generato, e un registro completo delle azioni compiute.

La prompt injection indiretta merita attenzione particolare perché non ha un equivalente diretto nei modelli di sicurezza tradizionali: un agente che elabora contenuti provenienti dall'esterno può essere indotto a compiere azioni che nessun utente ha richiesto. La mitigazione pratica è la stessa che vale per ogni componente non affidabile, cioè ridurre ciò che può fare, non sperare che interpreti correttamente ciò che legge.

Sull'integrazione, quando più agenti devono accedere agli stessi sistemi interni conviene esporre un server MCP invece di moltiplicare integrazioni dedicate. Centralizza accesso, permessi e tracciamento in un punto solo, che è anche l'unico modo realistico per mantenerli coerenti nel tempo.

MCP ha comunque bisogno di qualcosa di vero da interrogare. Se l'inventario di come funzionano davvero i sistemi sta in migliaia di file e nella testa di poche persone, gli agenti riempiono i buchi con congetture. È un problema di [knowledge graph](/it/servizi/consulenza-knowledge-graph/), non di modello.
