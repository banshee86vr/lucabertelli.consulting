---
key: "devops"
lang: "it"
title: "Consulente DevOps"
tagline: "Consulenza DevOps freelance per team che vogliono rilasciare più spesso, con meno incidenti e senza dipendere da una sola persona."
seoTitle: "Consulente DevOps freelance in Italia | Luca Bertelli"
description: "Consulente DevOps freelance in Italia: automazione della delivery, pipeline CI/CD, Infrastructure as Code e pratiche operative per team Fintech, Insurtech e industriali."
order: 1
keywords:
  - "consulente DevOps"
  - "consulenza DevOps"
  - "DevOps freelance"
  - "consulente DevOps Italia"
  - "consulente DevOps freelance"
  - "automazione CI/CD"
  - "Infrastructure as Code"
  - "consulenza CI/CD"
relatedTags: ["cicd", "devsecops", "github-actions", "kubernetes"]
credentials: ["cka", "terraform_associate", "capa", "gitlab-sa"]
outcomes:
  - "Rilasci frequenti e ripetibili, senza finestre notturne e senza passaggi manuali"
  - "Tempi di build e di deploy ridotti, con feedback agli sviluppatori in minuti anziché ore"
  - "Infrastruttura descritta in codice, versionata e ricostruibile da zero"
  - "Conoscenza operativa distribuita nel team, non concentrata in una sola persona"
deliverables:
  - "Assessment dello stato attuale di delivery e operations, con priorità di intervento motivate"
  - "Pipeline CI/CD implementate sul vostro stack (GitLab CI, GitHub Actions, Argo)"
  - "Moduli Terraform riutilizzabili e struttura degli ambienti"
  - "Runbook operativi e documentazione delle scelte architetturali"
  - "Affiancamento al team interno durante l'adozione"
faq:
  - question: "Che cosa fa concretamente un consulente DevOps?"
    answer: "Un consulente DevOps interviene sul modo in cui il software passa dal repository alla produzione: automazione delle pipeline CI/CD, gestione dell'infrastruttura come codice, standardizzazione degli ambienti, osservabilità e pratiche operative. L'obiettivo non è introdurre strumenti, ma ridurre il tempo e il rischio di ogni rilascio, lasciando al team interno la capacità di mantenere ciò che è stato costruito."
  - question: "Lavori come freelance o tramite società di consulenza?"
    answer: "Lavoro come consulente freelance indipendente con partita IVA italiana. Questo significa un interlocutore tecnico unico, che partecipa direttamente all'implementazione invece di limitarsi alla supervisione."
  - question: "Quanto dura un intervento di consulenza DevOps?"
    answer: "Dipende dal perimetro. Un assessment mirato si esaurisce in poche giornate e produce una lista di priorità. Un percorso di adozione completo, con implementazione delle pipeline e affiancamento del team, si articola su più mesi con obiettivi verificabili a ogni tappa. In entrambi i casi il perimetro viene definito prima di iniziare."
  - question: "Lavori da remoto o in sede?"
    answer: "Prevalentemente da remoto, con la possibilità di giornate in sede quando servono workshop, sessioni di design o formazione al team. Opero principalmente con clienti in Italia e nell'Unione Europea."
  - question: "Su quali tecnologie DevOps sei specializzato?"
    answer: "Kubernetes e l'ecosistema CNCF, Terraform per l'Infrastructure as Code, GitLab CI e GitHub Actions per la continuous integration, Argo CD e Argo Workflows per GitOps e automazione, HashiCorp Vault per la gestione dei segreti, Prometheus e Grafana per l'osservabilità."
---

## Il problema che di solito trovo

Quasi sempre la richiesta arriva nello stesso modo: i rilasci fanno paura. Si accumulano per settimane, richiedono una finestra concordata, coinvolgono una persona sola che "sa come si fa" e ogni tanto qualcosa si rompe in produzione senza che sia chiaro perché.

Sotto quella superficie trovo quasi sempre le stesse cause. Gli ambienti di test non somigliano alla produzione, quindi i problemi emergono tardi. L'infrastruttura è stata creata a mano nel tempo e nessuno sa ricostruirla. Le pipeline esistono ma sono lente, non affidabili, e il team ha imparato a rilanciarle finché non passano. I segreti sono sparsi tra variabili d'ambiente e file di configurazione.

Nessuno di questi è un problema di strumenti. Sono problemi di processo, che gli strumenti da soli non risolvono.

## Come intervengo

Parto sempre da un assessment, perché installare tooling prima di capire come lavora il team è il modo più veloce per aggiungere complessità inutile. Guardo il flusso reale che porta una modifica dal commit alla produzione, misuro dove si perde tempo e dove nascono gli incidenti, e ne ricavo una lista di interventi ordinata per rapporto tra impatto e sforzo.

Da lì si lavora in modo incrementale. Prima si stabilizza la continuous integration, perché una pipeline di cui il team non si fida rende inutile tutto il resto. Poi si porta l'infrastruttura sotto controllo con Terraform, in modo che gli ambienti siano ricostruibili e confrontabili. Infine si automatizza la delivery, tipicamente con un approccio GitOps in cui lo stato desiderato del sistema vive in Git e la riconciliazione è continua.

L'ultima fase è quella che conta di più a distanza di un anno: il trasferimento di competenze. Documentazione delle scelte, runbook per le operazioni ricorrenti, sessioni di lavoro con il team. Una consulenza DevOps riuscita è quella dopo la quale il cliente non ha più bisogno del consulente.

## L'esperienza da cui arrivo

Ho lavorato su questi problemi dal 2018, prima come DevOps Engineer, poi come Cloud Native Engineering Manager e oggi come consulente indipendente. I settori in cui ho maturato più esperienza sono Fintech, Insurtech e industriale: contesti in cui il vincolo non è solo tecnico, ma anche di conformità, auditabilità e continuità del servizio.

Questa origine spiega l'approccio. In un ambiente regolamentato non basta che il deploy funzioni: deve essere tracciabile, ripetibile e spiegabile a chi lo verifica.
