---
key: "kubernetes"
lang: "it"
title: "Consulenza Kubernetes"
tagline: "Progettazione, messa in sicurezza e gestione di cluster Kubernetes in produzione, da parte di un Certified Kubernetes Administrator."
seoTitle: "Consulente Kubernetes certificato CKA in Italia | Luca Bertelli"
description: "Consulenza Kubernetes in Italia da consulente certificato CKA: architettura dei cluster, multi-tenancy, GitOps con Argo CD, hardening di sicurezza e operatività day-2."
order: 4
keywords:
  - "consulente Kubernetes"
  - "consulenza Kubernetes"
  - "Kubernetes Italia"
  - "consulente CKA certificato"
  - "GitOps Argo CD"
  - "multi-tenancy Kubernetes"
relatedTags: ["kubernetes", "helm", "multi-tenancy", "vcluster", "fleet-management", "drift"]
credentials: ["cka", "capa", "vmware_master", "kong-mesh"]
outcomes:
  - "Cluster progettati per la produzione, non prototipi cresciuti per inerzia"
  - "Isolamento reale tra team e ambienti, con quote e policy di rete applicate"
  - "Deploy dichiarativi in GitOps, con drift rilevato invece che subito"
  - "Operatività day-2 documentata: aggiornamenti, backup, ripristino"
deliverables:
  - "Revisione dell'architettura dei cluster esistenti, con criticità ordinate per gravità"
  - "Provisioning dei cluster in Terraform, riproducibile tra gli ambienti"
  - "Modello di multi-tenancy: namespace, RBAC, quote, network policy"
  - "Continuous delivery in GitOps con Argo CD e Helm o Kustomize"
  - "Hardening di sicurezza e osservabilità con Prometheus e Grafana"
faq:
  - question: "Sei certificato su Kubernetes?"
    answer: "Sì. Sono Certified Kubernetes Administrator (CKA) dal 2020 e Certified Argo Project Associate (CAPA), oltre a VMware Certified Master Specialist in Cloud Native. Le credenziali sono verificabili sui rispettivi badge pubblici Credly, collegati nella sezione certificazioni del sito."
  - question: "Quali sono gli errori più frequenti nei cluster Kubernetes in produzione?"
    answer: "I tre che incontro quasi sempre: assenza di resource request e limit, che rende lo scheduling imprevedibile e provoca contese di risorse tra carichi non correlati; nessuna network policy, per cui ogni pod può parlare con ogni altro pod; e configurazioni applicate a mano sul cluster, che rendono impossibile sapere se l'ambiente corrisponde a quanto descritto nel repository."
  - question: "Meglio Kubernetes gestito o self-managed?"
    answer: "Nella grande maggioranza dei casi, gestito: EKS, AKS o GKE. Gestire il control plane in proprio ha senso solo con vincoli specifici di sovranità del dato, requisiti on-premise o esigenze di personalizzazione che i servizi gestiti non coprono. Il valore che si costruisce sta quasi sempre sopra il control plane, non dentro."
  - question: "Puoi intervenire su cluster già in produzione?"
    answer: "Sì, ed è lo scenario più comune. Si parte da una revisione dell'architettura e della configurazione esistente, con le criticità ordinate per gravità, e si interviene per passi verificabili senza fermare l'attività. Riscrivere da zero un ambiente che funziona è raramente la scelta giusta."
  - question: "Come gestisci ambienti di test su Kubernetes?"
    answer: "Con cluster virtuali effimeri creati per ogni pull request e distrutti alla chiusura. È un approccio che ho documentato in dettaglio in un articolo del blog basato su vCluster e Argo Workflows: dà a ogni sviluppatore un ambiente isolato e realistico senza moltiplicare i cluster reali da mantenere."
---

## Il problema che di solito trovo

Kubernetes viene quasi sempre adottato in due tempi. Prima qualcuno costruisce un cluster per un progetto pilota, con configurazioni prese dalla documentazione e qualche scorciatoia ragionevole per andare in fretta. Poi il pilota va in produzione, altri team ci si appoggiano, e quelle scorciatoie diventano fondamenta.

I sintomi si assomigliano molto tra un cliente e l'altro. Nessuno sa dire con certezza se ciò che gira nel cluster corrisponde a quanto c'è nel repository. Un carico di lavoro che si comporta male degrada le prestazioni di applicazioni che non c'entrano nulla. Gli aggiornamenti di versione vengono rimandati perché nessuno se la sente, e il cluster resta indietro finché l'aggiornamento diventa un progetto a sé.

## Come intervengo

Se il cluster esiste già, si comincia da una revisione strutturata: architettura, configurazione, sicurezza, osservabilità e prassi operative. Il risultato è un elenco di criticità ordinate per gravità e sforzo, non un documento generico di buone pratiche. Quasi sempre le prime tre voci coprono la maggior parte del rischio reale.

Sul piano dell'isolamento, il lavoro consiste nel rendere effettivo ciò che i namespace suggeriscono soltanto. Namespace, RBAC con privilegi minimi, resource quota, limit range e network policy in negazione predefinita: senza queste, la multi-tenancy è una convenzione di denominazione, non una separazione.

La delivery passa a GitOps con Argo CD. Il vantaggio che conta non è l'automazione in sé, è che lo stato desiderato diventa leggibile in Git e ogni scostamento viene rilevato invece che scoperto durante un incidente. Da lì si costruisce l'operatività day-2: strategia di aggiornamento, backup e ripristino provato davvero, allarmi che segnalano problemi reali invece di generare rumore.

## Fleet e ambienti effimeri

Quando i cluster diventano più d'uno, i problemi cambiano natura. La domanda non è più se un cluster è configurato bene, ma se i cluster sono allineati tra loro e quanto sono indietro rispetto alle versioni correnti di immagini e chart. È un tema su cui lavoro spesso e su cui ho scritto pubblicamente, insieme all'uso di cluster virtuali effimeri per dare a ogni pull request un ambiente di test isolato senza moltiplicare l'infrastruttura da mantenere.
