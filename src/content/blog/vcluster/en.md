---
title: Ephemeral test environments for CI workflows
subtitle: How to use vCluster and Argo Workflow to manage ephemeral test environments
date: 1 April 2024
category: DevOps
image: "/blog/vcluster/vcluster.jpg"
tags: ["vcluster", "argo", "cicd", "devsecops", "kubernetes", "multi-tenancy"]
lang: 'en'
---

## Why do we need it?

Since the early 2000s, it was clear that monolithic applications needed to be more scalable to avoid hindering business growth. After a few years, in 2011, during a workshop of software architects near Venice, a new software architectural style was emerging: microservices. The micro-services architecture model can scale to meet business needs by running multiple copies of each service on as many servers as necessary; with separate teams working on each micro-service, productivity and ownership of the code increase, which can be challenging with a monolithic architecture. Therefore, it is essential to implement a micro-services architecture to enable scalability for the application and the team.
But All that glitters is not gold! Are there any drawbacks to adopting this kind of approach? And what happens if we try it in the cloud-native world using Kubernetes environments?
Everyone who has already followed this journey can witness the risk of building a nightmare called *dependency hell*. 

> Dependency hell is a colloquial term for the frustration of some software users who have installed software packages which have dependencies on specific versions of other software packages.
> The dependency issue arises when several packages have dependencies on the same shared packages or libraries, but they depend on different and incompatible versions of the shared packages. If the shared package or library can only be installed in a single version, the user may need to address the problem by obtaining newer or older versions of the dependent packages. This, in turn, may break other dependencies and push the problem to another set of packages.

During the software development lifecycle, one of the goals of every developer team is to develop and test their application using the correct version of dependencies like other application services or DBs.

How can I obtain a temporary environment to perform all these checks safely?

## So, what's the problem?

This kind of gap is a common scenario that usually requires many infrastructure resources to replicate all the dependencies in a separate environment. Preparing it locally on every developer device is typically impossible, and every team cannot quickly request a different Kubernetes cluster to proceed with all the required tests due to increased infrastructure costs. At the same time, performing all these tests on the primary test environment used by all the teams is not recommended to avoid invalidating other tests conducted at the exact moment.

## Finding a solution: vCluster + Argo Workflow

Deeping dive into this use case, one of the possible solutions is to use [vCluster powered by Loft](https://www.vcluster.com). Using this tool, the user can create a temporary Kubernetes cluster inside an existing one. The virtual cluster has separate control plane APIs that can be exposed differently. VCluster is a valid option when multiple tenants must be managed with a single Kubernetes Cluster, sharing the same infrastructure. It's easy to use and adopt by existing Kubernetes users, as it doesn't require installing anything on your existing clusters. New vCluster users need no training, as they can access a standard Kubernetes API Server endpoint. In this experiment, I enjoy integrating this technology with [Argo Workflow](https://argoproj.github.io/workflows), a popular workflow execution engine for Kubernetes. This engine provides a way to efficiently configure the orchestration of the deployment, testing, and teardown processes. The tool lets the final user define processes drawing DAGs (Directed acyclic graph). This feature also supports complex scenarios where there is a requirement to maximize parallelism when running tasks.
This combination offers a fast, cost-effective, and scalable solution, avoiding many of the day-2 activities required for creating and managing a new dedicated cluster every time.
It's typing time!!!

---

## Demo Project

URL: <https://github.com/banshee86vr/ephemeral-test-environment> \
Project structure:

```plaintext
.
├── argo-workflow
│   └── lang
└── hello-world-app
```

* `argo-workflow`: CI/CD pipeline templates folder
* `lang`: ArgoWorkflow Templates folder for supported languages
* `hello-world-app`: Go Hello world application that prints a beautiful octopus 🐙 in ASCII code

## Requirements

- Minikube
- `kubectl` command-line tool installed and configured to connect to your Kubernetes cluster.
- Helm version `3.x` installed.

## Preparation steps

### 1. Start Minikube and install Argo Workflows using Helm

```bash
minikube start
helm repo add argo https://argoproj.github.io/argo-helm
helm install argo-workflows argo/argo-workflows -n argo --create-namespace
```

This command installs Argo Workflows in the `argo` namespace of your Kubernetes cluster.

### 2. Verify the Installation

To check if the installation was successful, you can run:

```bash
kubectl get pods -n argo
```

You should see a list of pods running with names prefixed with `workflow-controller` and `argo-server`.

### 3. Patch argo-server authentication

As reported on the official documentation: <https://argo-workflows.readthedocs.io/en/latest/quick-start/#patch-argo-server-authentication>

The argo-server (and thus the UI) defaults to client authentication, which requires clients to provide their Kubernetes bearer token to authenticate. For more information, refer to the Argo Server Auth Mode documentation. We will switch the authentication mode to `server` so that we can bypass the UI login for now:

```bash
kubectl patch deployment \
  argo-server \
  --namespace argo \
  --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/args", "value": [
  "server",
  "--auth-mode=server"
]}]'
```

### 4. Access Argo Workflows UI (Optional)

Argo Workflows provides a web-based UI for managing and monitoring workflows. To access the UI, you need to expose it as a service:

```bash
kubectl port-forward svc/argo-server -n argo 2746:2746
```

Now, you can access the Argo Workflows UI by navigating to `http://localhost:2746` in your web browser.

### 5. Add privileges to Argo service accounts

> Add these privileges to the Argo service accounts are recommended only for demo purposes. **IT'S STRONGLY NOT RECOMMENDED TO REPLICATE THIS CONFIGURATION IN PRODUCTION ENVIRONMENTS.**

This command adds `cluster-admin` clusterrole to `argo:argo-server` and `argo:default`. In this way, Argo Workflow can manage every kind of resource in every namespace of the cluster.

```bash
kubectl create clusterrolebinding argo-admin-server --clusterrole=cluster-admin --serviceaccount=argo:argo-server -n argo
kubectl create clusterrolebinding argo-admin-default --clusterrole=cluster-admin --serviceaccount=argo:default -n argo
```

> In production environments, creating a dedicated role for these service accounts is strongly recommended, allowing only required verbs on the resources managed by the workflows.

### 6. Prepare secrets required by the pipelines

Just in case of a private Git repository, you can run this command to allow the clone command executed by the pipeline `ci.yaml`:

```bash
kubectl create secret generic github-token -n argo --from-literal=token=.........
```

This command creates the secret that contains the credentials to push the Docker image to the registry:

```bash
export DOCKER_USERNAME=******
export DOCKER_TOKEN=******
kubectl create secret generic docker-config --from-literal="config.json={\"auths\": {\"https://ghcr.io/\": {\"auth\": \"$(echo -n $DOCKER_USERNAME:$DOCKER_TOKEN|base64)\"}}}"
```

### 7. Add Argo WorkflowTemplate manifests

```bash
git clone https://github.com/banshee86vr/ephemeral-test-environment.git
cd argo/workflow

kubectl apply -f ci.yaml
kubectl apply -f lang/go.yaml
kubectl apply -f cd.yaml
```

## Execution steps

With all prerequisites met and Argo Workflows successfully deployed and configured, you dive into the execution steps to start creating and managing workflows.

### 8. Submit the CI pipeline

The CI pipeline performs these steps inside the [ci.yaml](https://github.com/banshee86vr/ephemeral-test-environment/blob/main/argo-workflow/ci.yaml) manifest:

1. **Cloning Repository**: Fetches the source code from the git repository.
2. **Building Application**: Utilizes the GoLang template [go.yaml](https://github.com/banshee86vr/ephemeral-test-environment/blob/main/argo-workflow/lang/go.yaml) to compile the Go application.
3. **Building and Pushing Docker Image**: Packages the application into a Docker image and pushes it to the registry.

![CI Argo Workflow Flowchart](/blog/vcluster/ci_flowchart.jpg)

To submit the CI pipeline, you can use the [official APIs](https://argo-workflows.readthedocs.io/en/latest/rest-api/):

```plaintext
<ArgoWorkflow URL>/api/v1/workflows/{namespace}/submit
```

Alternatively, you can submit the workflow using the UI:

![Submit CI workflow via UI](/blog/vcluster/ci_submit.png)

After the completion of all steps, you can check the correct status of every step and locate the updated Docker image in your registry:

![CI workflow graph](/blog/vcluster/ci_graph.png)

### 9. Submit the CD pipeline

The CD pipeline performs these steps inside the [cd.yaml](https://github.com/banshee86vr/ephemeral-test-environment/blob/main/argo-workflow/cd.yaml) manifest:

1. **Preparing an ephemeral environment**: Prepares a temporary environment using vCluster where the user can test the application inside an isolated Kubernetes cluster.
2. **Deploy the application**: Deploy the application Helm chart on the vCluster just created.

![CD Argo Workflow Flowchart](/blog/vcluster/cd_flowchart.jpg)

To submit the CD pipeline, you can use the [official APIs](https://argo-workflows.readthedocs.io/en/latest/rest-api/):

```plaintext
<ArgoWorkflow URL>/api/v1/workflows/{namespace}/submit
```

Alternatively, you can submit the workflow using the UI:

![Submit CD workflow via UI](/blog/vcluster/cd_submit.png)

After the completion of all steps, you can check the correct status of every step:

![CD workflow graph](/blog/vcluster/cd_graph.png)

### 10. Access to the application

To check how to access the application deployed on vCluster, you can run these commands to list all vCluster and to access it:

```bash
$ vcluster list
  
         NAME       | CLUSTER  |    NAMESPACE    | STATUS  | VERSION | CONNECTED |            CREATED            |   AGE   | DISTRO  
  ------------------+----------+-----------------+---------+---------+-----------+-------------------------------+---------+---------
    demo-pr-request | minikube | demo-pr-request | Running | 0.19.0  |           | xxxx-xx-xx xx:xx:xx +0100 CET | 1h8m49s | OSS

$ vcluster connect demo-pr-request --namespace demo-pr-request -- kubectl get pod -n demo-pr-request

NAME                                           READY   STATUS    RESTARTS   AGE
demo-pr-request-hello-world-7f6d78645f-bjmjc   1/1     Running   0          7s
```

As reported [here](https://www.vcluster.com/docs/using-vclusters/access), you can expose the ephemeral vCluster created differently.

- **Via Ingress**: An Ingress Controller with SSL passthrough support will provide the best user experience. Ensure your ingress controller is installed and healthy on the cluster hosting your virtual clusters. More details [here](https://www.vcluster.com/docs/using-vclusters/access#via-ingress)
- **Via LoadBalancer service**: The easiest way is to use the flag `--expose` in the vcluster create phase to tell vCluster to use a LoadBalancer service. It depends on the specific implementation of the host Kubernetes cluster.
- **Via NodePort service**: You can also expose the vCluster via a NodePort service. In this case, you must create a NodePort service and change the `values.yaml` file to use for the creation of the vCluster. More details [here](https://www.vcluster.com/docs/using-vclusters/access#via-nodeport-service)
- **From Host Cluster**: To access the virtual cluster from within the host cluster, you can directly connect to the vCluster service. Make sure you can access that service and then create a kube config in the following form:
  
  ```bash
  vcluster connect my-vcluster -n my-vcluster --server=my-vcluster.my-vcluster --insecure --update-current=false
  ```
