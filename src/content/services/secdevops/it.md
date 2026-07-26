---
key: "secdevops"
lang: "it"
title: "SecDevOps e CI/CD"
tagline: "Toolchain e pipeline che integrano la sicurezza nel flusso di sviluppo, senza trasformarla in un collo di bottiglia."
seoTitle: "Consulenza SecDevOps e pipeline CI/CD sicure | Luca Bertelli"
description: "Consulenza SecDevOps: composizione della toolchain, pipeline CI/CD sicure, gestione dei segreti con HashiCorp Vault, supply chain del software e conformità NIS2."
order: 5
keywords:
  - "SecDevOps"
  - "DevSecOps"
  - "pipeline CI/CD sicure"
  - "supply chain sicurezza software"
  - "HashiCorp Vault"
  - "consulenza DevSecOps Italia"
relatedTags: ["devsecops", "cicd", "github-actions", "dependency-management", "renovate"]
credentials: ["vault-professional", "vault-associate", "vault-chip", "gitlab-sa"]
outcomes:
  - "Vulnerabilità intercettate in pipeline, quando correggerle costa poco"
  - "Segreti centralizzati e a rotazione, fuori da repository e variabili d'ambiente"
  - "Artefatti tracciabili: si sa che cosa contiene ogni rilascio e da dove proviene"
  - "Evidenze di conformità prodotte dal processo, non ricostruite prima di un audit"
deliverables:
  - "Valutazione della toolchain esistente e scelta motivata degli strumenti mancanti"
  - "Controlli di sicurezza integrati in pipeline: SAST, SCA, scansione delle immagini, IaC"
  - "Gestione dei segreti con HashiCorp Vault e rimozione delle credenziali statiche"
  - "Gestione delle dipendenze automatizzata con Renovate"
  - "Firma degli artefatti e generazione della SBOM"
faq:
  - question: "Che differenza c'è tra DevSecOps e SecDevOps?"
    answer: "Nella pratica indicano lo stesso obiettivo: integrare la sicurezza nel ciclo di sviluppo invece di applicarla alla fine. Uso SecDevOps perché l'ordine delle parole riflette meglio l'idea che la sicurezza sia un requisito di partenza e non un controllo aggiunto dopo la costruzione."
  - question: "Aggiungere controlli di sicurezza rallenta la pipeline?"
    answer: "Se vengono messi tutti in modo bloccante nello stesso punto, sì, e infatti è così che i team imparano a bypassarli. L'impostazione che funziona distribuisce i controlli: quelli rapidi girano a ogni commit e bloccano, quelli lenti girano in modo asincrono o notturno e generano segnalazioni. E si parte bloccando solo le vulnerabilità gravi con una correzione disponibile, altrimenti il rumore rende il segnale inutilizzabile."
  - question: "Come gestite i segreti nelle pipeline?"
    answer: "Con HashiCorp Vault, su cui sono certificato Operations Professional e Implementation Partner. L'obiettivo è eliminare le credenziali statiche a favore di segreti dinamici a scadenza breve, generati al momento della necessità e revocabili singolarmente. Le credenziali che non esistono in modo permanente non possono essere esfiltrate da un repository o da un log."
  - question: "Cosa comporta la conformità NIS2 sul piano tecnico?"
    answer: "Sul piano della delivery comporta soprattutto tracciabilità: sapere che cosa è stato rilasciato, da chi è stato approvato, quali componenti di terze parti contiene e come vengono gestite le vulnerabilità note. Una pipeline che produce SBOM, firma gli artefatti e conserva i log di approvazione genera queste evidenze come effetto normale del proprio funzionamento, invece di richiedere una raccolta manuale prima di ogni verifica."
  - question: "Con quali strumenti CI/CD lavori?"
    answer: "Principalmente GitLab CI e GitHub Actions, con Argo Workflows e Argo CD per l'orchestrazione e il deploy su Kubernetes. Sulla parte di sicurezza integro scanner SAST e SCA, scansione delle immagini container e analisi statica dell'Infrastructure as Code, scegliendoli in base a ciò che il cliente già possiede."
---

## Il problema che di solito trovo

La sicurezza applicativa arriva quasi sempre in ritardo nel ciclo di vita, e questo ne determina il costo. Un penetration test annuale produce un rapporto con trenta rilievi su codice scritto sei mesi prima, da persone che nel frattempo lavorano ad altro. Correggerli significa fermare le attività in corso, e la discussione che ne segue riguarda quali rilievi si possano accettare invece di come evitarli in futuro.

Il secondo tema ricorrente sono i segreti. Nella maggior parte delle organizzazioni con cui inizio a lavorare le credenziali vivono in variabili di configurazione della pipeline, in file non versionati sui server, occasionalmente in un commit vecchio che nessuno ha rimosso dalla cronologia. Sono statiche, condivise, e in pratica non ruotabili: cambiarle richiederebbe di sapere chi le usa, informazione che nessuno possiede.

## Come intervengo

Il primo passo è mappare la toolchain esistente prima di proporre qualsiasi aggiunta. Spesso i controlli ci sono già ma girano in un punto del processo in cui nessuno guarda i risultati, oppure producono così tante segnalazioni da essere stati silenziati. Recuperare ciò che c'è è quasi sempre più rapido che introdurre uno strumento nuovo.

I controlli vengono poi distribuiti lungo la pipeline secondo il loro costo. Analisi statica e verifica delle dipendenze a ogni commit, perché sono veloci e il contesto è fresco. Scansione delle immagini container alla costruzione dell'artefatto. Analisi dell'Infrastructure as Code prima dell'applicazione. Le verifiche più lente restano fuori dal percorso bloccante.

La regola che rende sostenibile l'insieme è la soglia iniziale: si blocca solo su vulnerabilità gravi con una correzione disponibile. Una pipeline che si ferma su qualsiasi rilievo viene aggirata nel giro di due settimane, e a quel punto si è peggiorata la situazione invece di migliorarla.

## Segreti e supply chain

Sulla gestione dei segreti l'obiettivo è passare da credenziali statiche a credenziali generate al momento con scadenza breve. Vault emette l'accesso al database quando il servizio ne ha bisogno, con una validità di ore, e lo revoca dopo. Non è solo una questione di rotazione: una credenziale che non esiste in forma permanente non può finire in un log o in un repository.

Sulla supply chain il lavoro riguarda la tracciabilità di ciò che si rilascia. Firma degli artefatti, generazione della SBOM a ogni build, aggiornamento automatico delle dipendenze con Renovate. Quest'ultimo punto è quello con il ritorno più immediato: la maggior parte delle vulnerabilità che si trovano in produzione riguarda dipendenze per cui la correzione esiste da mesi e semplicemente non è stata applicata.
