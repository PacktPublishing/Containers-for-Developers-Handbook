# __Chapter 12 Labs__

## __Technical requirements__

The following labs will provide examples to put into practice concepts and procedures learned in this chapter. We will use Docker Desktop as container runtime and WSL2 (or you Linux/MacOS terminal) to execute the commands described for the first part of the Labs (Ingress Controller) and then we will start a Minikube environment for the second part (NetworkPolicy resources).

>__IMPORTANT NOTE: Please stop Docker Desktop before creating your Minikube environemnt. Both can run at the same time but they will consume lot of hardware resources and you should choose the right Kubernetes context for your environment.__ 

Ensure you have downloaded the content of this book’s GitHub repository in https://github.com/PacktPublishing/Docker-for-Developers-Handbook.git. For this chapter’s labs we will use the content of Chapter11 directory. 

You can use one of the following Kubernetes Desktop environments:
- Docker Desktop (NetworkPolicy resources are not available at the time of writting this book in this platform)
- Rancher Desktop (supports NetworkPolicy resources)
- Minikube (supports NetworkPolicy resources)
- KinD



We will first move inside our Chapter12 labs directory, localted inside our local Github repository and we change the prompt for easier reading:
```
PS C:\Users\frjaraur\Documents\...\Chapter12> function prompt {"Chapter12$ "}
Chapter12$
```

Chapter12$ minikube delete
🙄  "minikube" profile does not exist, trying anyways.
💀  Removed all traces of the "minikube" cluster.


Chapter12$  minikube start --driver=hyperv --memory=6gb --cpus=2 --cni=calico --addons=ingress,metrics-server
😄  minikube v1.30.1 on Microsoft Windows 10 Pro 10.0.19045.3208 Build 19045.3208
✨  Using the hyperv driver based on user configuration
👍  Starting control plane node minikube in cluster minikube
🔥  Creating hyperv VM (CPUs=2, Memory=6144MB, Disk=20000MB) ...
🐳  Preparing Kubernetes v1.26.3 on Docker 20.10.23 ...
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔗  Configuring Calico (Container Networking Interface) ...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
    ▪ Using image registry.k8s.io/metrics-server/metrics-server:v0.6.3
    ▪ Using image registry.k8s.io/ingress-nginx/kube-webhook-certgen:v20230312-helm-chart-4.5.2-28-g66a760794
    ▪ Using image registry.k8s.io/ingress-nginx/controller:v1.7.0
    ▪ Using image registry.k8s.io/ingress-nginx/kube-webhook-certgen:v20230312-helm-chart-4.5.2-28-g66a760794
🔎  Verifying Kubernetes components...
🔎  Verifying ingress addon...
🌟  Enabled addons: storage-provisioner, metrics-server, default-storageclass, ingress
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default



Chapter12$ kubectl get pods -A
NAMESPACE       NAME                                        READY   STATUS      RESTARTS   AGE
ingress-nginx   ingress-nginx-admission-create-vc2ph        0/1     Completed   0          10m
ingress-nginx   ingress-nginx-admission-patch-n7ntl         0/1     Completed   2          10m
ingress-nginx   ingress-nginx-controller-6cc5ccb977-klrb2   1/1     Running     0          10m
kube-system     calico-kube-controllers-7bdbfc669-8ptnf     1/1     Running     0          10m
kube-system     calico-node-7f8ls                           1/1     Running     0          10m
kube-system     coredns-787d4945fb-66pkm                    1/1     Running     0          10m
kube-system     etcd-minikube                               1/1     Running     0          11m
kube-system     kube-apiserver-minikube                     1/1     Running     0          11m
kube-system     kube-controller-manager-minikube            1/1     Running     0          11m
kube-system     kube-proxy-rqtp8                            1/1     Running     0          10m
kube-system     kube-scheduler-minikube                     1/1     Running     0          11m
kube-system     metrics-server-6588d95b98-wztnc             1/1     Running     0          10m
kube-system     storage-provisioner                         1/1     Running     0          10m


Chapter12$ ls


    Directory: C:\Users\frjaraur\...\Docker-for-Developers-Handbook\Chapter12


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         7/30/2023     16:53                images
d-----         7/30/2023     16:54                simplestlab
-a----         7/18/2023     20:55             30 .gitignore
-a----         7/30/2023     16:58          51925 Readme.md


Chapter12$ kubectl create -f .\simplestlab\ -n simplestlab
deployment.apps/app created
service/app created
secret/appcredentials created
service/db created
statefulset.apps/db created
secret/dbcredentials created
secret/initdb created
configmap/lb-config created
daemonset.apps/lb created
service/lb created
ingress.networking.k8s.io/simplestlab created



Chapter12$ kubectl get pods,svc,ingress -n simplestlab
NAME                      READY   STATUS    RESTARTS   AGE
pod/app-b6bbb5f6c-2x8tv   1/1     Running   0          3m39s
pod/app-b6bbb5f6c-w9qt2   1/1     Running   0          3m39s
pod/app-b6bbb5f6c-wwwrq   1/1     Running   0          3m39s
pod/db-0                  1/1     Running   0          3m39s
pod/lb-xtg7q              1/1     Running   0          3m39s

NAME          TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/app   ClusterIP   10.110.229.92    <none>        3000/TCP   3m39s
service/db    ClusterIP   None             <none>        5432/TCP   3m39s
service/lb    ClusterIP   10.101.139.116   <none>        80/TCP     3m39s

NAME                                    CLASS   HOSTS                   ADDRESS          PORTS   AGE
ingress.networking.k8s.io/simplestlab   nginx   simplestlab.local.lab   172.21.164.139   80      3m38s




kube-prometheus-stack.values.yaml

alertmanager:
  enabled: false

grafana:
  enabled: true
  ingress:
    enabled: true
    ingressClassName: nginx
    hosts:
    - grafana.local.lab
  sidecar:
    datasources:
      enabled: true
      alertmanager:
        enabled: false
      defaultDatasourceEnabled: false
  additionalDataSources:
  - name: local-prometheus
    editable: true
    jsonData:
        tlsSkipVerify: true
    orgId: 1
    type: prometheus
    url: http://prometheus-operated:9090
    version: 1

  - name: local-loki
    editable: true
    jsonData:
        tlsSkipVerify: true
    orgId: 1
    type: loki
    url: http://loki-gateway.logging.svc:9090
    version: 1




Chapter12$ helm install kube-prometheus-stack --namespace monitoring --create-namespace --values .\kube-prometheus-stack.values.yaml .\charts\kube-prometheus-stack\
NAME: kube-prometheus-stack
LAST DEPLOYED: Sun Jul 30 17:36:41 2023
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
NOTES:
kube-prometheus-stack has been installed. Check its status by running:
  kubectl --namespace monitoring get pods -l "release=kube-prometheus-stack"

Visit https://github.com/prometheus-operator/kube-prometheus for instructions on how to create & configure Alertmanager and Prometheus instances using the Operator.




Chapter12$ kubectl --namespace monitoring get pods -n monitoring
NAME                                                        READY   STATUS    RESTARTS   AGE
kube-prometheus-stack-grafana-8554856d99-w6dcg              2/2     Running   0          2m9s
kube-prometheus-stack-kube-state-metrics-58d9cc69bf-h5m5h   1/1     Running   0          2m9s
kube-prometheus-stack-operator-5c7499775d-jmf4s             1/1     Running   0          2m9s
kube-prometheus-stack-prometheus-node-exporter-bszkg        1/1     Running   0          2m9s
prometheus-kube-prometheus-stack-prometheus-0               2/2     Running   0          110s



172.21.164.139 simplestlab.local.lab
172.21.164.139 grafana.local.lab



Access https://grafana.local.lab/ 

admin/prom-operator




loki.values.yaml

loki:
  commonConfig:
    replication_factor: 1
  storage:
    type: filesystem
  auth_enabled: false  
singleBinary:
  replicas: 1

monitoring:
  lokiCanary:
    enabled: false
  selfMonitoring:
    enabled: false
    grafanaAgent:
      installOperator: false

test:
  enabled: false



Chapter12$ helm install loki --namespace logging --create-namespace --values .\loki.values.yaml .\charts\loki\
LAST DEPLOYED: Sun Jul 30 18:28:07 2023
STATUS: deployed
NOTES:
***********************************************************************
 Welcome to Grafana Loki
 Chart version: 5.9.2
 Loki version: 2.8.3
***********************************************************************

Installed components:
* loki




Chapter12$ kubectl get all -n logging
NAME                                READY   STATUS    RESTARTS   AGE
pod/loki-0                          1/1     Running   0          13m
pod/loki-gateway-66f55cfb99-vb6gw   1/1     Running   0          13m

NAME                      TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)             AGE
service/loki              ClusterIP   10.108.205.128   <none>        3100/TCP,9095/TCP   13m
service/loki-gateway      ClusterIP   10.110.246.3     <none>        80/TCP              13m
service/loki-headless     ClusterIP   None             <none>        3100/TCP            13m
service/loki-memberlist   ClusterIP   None             <none>        7946/TCP            13m

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/loki-gateway   1/1     1            1           13m

NAME                                      DESIRED   CURRENT   READY   AGE
replicaset.apps/loki-gateway-66f55cfb99   1         1         1       13m

NAME                    READY   AGE
statefulset.apps/loki   1/1     13m




Chapter12$ helm install promtail --namespace logging --create-namespace .\charts\promtail\
NAME: promtail
LAST DEPLOYED: Sun Jul 30 18:50:03 2023
NAMESPACE: logging
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to Grafana Promtail
 Chart version: 6.11.9
 Promtail version: 2.8.3
***********************************************************************

Verify the application is working by running these commands:
* kubectl --namespace logging port-forward daemonset/promtail 3101
* curl http://127.0.0.1:3101/metrics


Chapter12$ kubectl get all -n logging
NAME                                READY   STATUS    RESTARTS   AGE
pod/loki-0                          1/1     Running   0          22m
pod/loki-gateway-66f55cfb99-vb6gw   1/1     Running   0          22m
pod/promtail-l8dbv                  1/1     Running   0          39s

NAME                      TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)             AGE
service/loki              ClusterIP   10.108.205.128   <none>        3100/TCP,9095/TCP   22m
service/loki-gateway      ClusterIP   10.110.246.3     <none>        80/TCP              22m
service/loki-headless     ClusterIP   None             <none>        3100/TCP            22m
service/loki-memberlist   ClusterIP   None             <none>        7946/TCP            22m

NAME                      DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
daemonset.apps/promtail   1         1         1       1            1           <none>          39s

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/loki-gateway   1/1     1            1           22m

NAME                                      DESIRED   CURRENT   READY   AGE
replicaset.apps/loki-gateway-66f55cfb99   1         1         1       22m

NAME                    READY   AGE
statefulset.apps/loki   1/1     22m



## Adding the postgres exporter 
https://github.com/prometheus-community/postgres_exporter


Chapter12$ kubectl replace -f .\exporters\db.statefulset-with-exporter.yaml
statefulset.apps/db replaced


Chapter12$ kubectl get pods -n simplestlab -o wide
NAME                  READY   STATUS    RESTARTS      AGE    IP               NODE       NOMINATED NODE   READINESS GATES
app-b6bbb5f6c-2x8tv   0/1     Running   2 (47s ago)   155m   10.244.120.83    minikube   <none>           <none>
app-b6bbb5f6c-w9qt2   0/1     Running   2 (47s ago)   155m   10.244.120.85    minikube   <none>           <none>
app-b6bbb5f6c-wwwrq   0/1     Running   2 (47s ago)   155m   10.244.120.84    minikube   <none>           <none>
db-0                  2/2     Running   0             46s    10.244.120.116   minikube   <none>           <none>
lb-xtg7q              1/1     Running   0             155m   10.244.120.81    minikube   <none>           <none>


Chapter12$ kubectl exec -ti lb-xtg7q -n simplestlab -- /bin/sh
/ $ curl 10.244.120.115:9187
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Postgres Exporter</title>
    <style>body {
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,Liberation Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
  margin: 0;
}
header {
  background-color: #e6522c;
  color: #fff;
  font-size: 1rem;
  padding: 1rem;
}
main {
  padding: 1rem;
}
label {
  display: inline-block;
  width: 0.5em;
}

</style>
  </head>
  <body>
    <header>
      <h1>Postgres Exporter</h1>
    </header>
    <main>
      <h2>Prometheus PostgreSQL server Exporter</h2>
      <div>Version: (version=0.13.2, branch=HEAD, revision=8c3604b85e38ae7141e84ecdc318b6015a196c97)</div>
      <div>
        <ul>

          <li><a href="/metrics">Metrics</a></li>

        </ul>
      </div>


    </main>
  </body>
</html>
/ $ curl 10.244.120.115:9187/metrics
# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles.
# TYPE go_gc_duration_seconds summary
go_gc_duration_seconds{quantile="0"} 0
go_gc_duration_seconds{quantile="0.25"} 0
go_gc_duration_seconds{quantile="0.5"} 0
go_gc_duration_seconds{quantile="0.75"} 0
go_gc_duration_seconds{quantile="1"} 0
go_gc_duration_seconds_sum 0
go_gc_duration_seconds_count 0
# HELP go_goroutines Number of goroutines that currently exist.
# TYPE go_goroutines gauge
go_goroutines 12
# HELP go_info Information about the Go environment.
# TYPE go_info gauge
go_info{version="go1.20.6"} 1
# HELP go_memstats_alloc_bytes Number of bytes allocated and still in use.
# TYPE go_memstats_alloc_bytes gauge
go_memstats_alloc_bytes 601960
# HELP go_memstats_alloc_bytes_total Total number of bytes allocated, even if freed.
# TYPE go_memstats_alloc_bytes_total counter
go_memstats_alloc_bytes_total 601960
# HELP go_memstats_buck_hash_sys_bytes Number of bytes used by the profiling bucket hash table.
# TYPE go_memstats_buck_hash_sys_bytes gauge
go_memstats_buck_hash_sys_bytes 4584
# HELP go_memstats_frees_total Total number of frees.
# TYPE go_memstats_frees_total counter
go_memstats_frees_total 261
# HELP go_memstats_gc_sys_bytes Number of bytes used for garbage collection system metadata.
# TYPE go_memstats_gc_sys_bytes gauge
go_memstats_gc_sys_bytes 6.770512e+06
# HELP go_memstats_heap_alloc_bytes Number of heap bytes allocated and still in use.
# TYPE go_memstats_heap_alloc_bytes gauge
go_memstats_heap_alloc_bytes 601960
# HELP go_memstats_heap_idle_bytes Number of heap bytes waiting to be used.
# TYPE go_memstats_heap_idle_bytes gauge
go_memstats_heap_idle_bytes 1.794048e+06
# HELP go_memstats_heap_inuse_bytes Number of heap bytes that are in use.
# TYPE go_memstats_heap_inuse_bytes gauge
go_memstats_heap_inuse_bytes 1.974272e+06
# HELP go_memstats_heap_objects Number of allocated objects.
# TYPE go_memstats_heap_objects gauge
go_memstats_heap_objects 3473
# HELP go_memstats_heap_released_bytes Number of heap bytes released to OS.
# TYPE go_memstats_heap_released_bytes gauge
go_memstats_heap_released_bytes 1.794048e+06
# HELP go_memstats_heap_sys_bytes Number of heap bytes obtained from system.
# TYPE go_memstats_heap_sys_bytes gauge
go_memstats_heap_sys_bytes 3.76832e+06
# HELP go_memstats_last_gc_time_seconds Number of seconds since 1970 of last garbage collection.
# TYPE go_memstats_last_gc_time_seconds gauge
go_memstats_last_gc_time_seconds 0
# HELP go_memstats_lookups_total Total number of pointer lookups.
# TYPE go_memstats_lookups_total counter
go_memstats_lookups_total 0
# HELP go_memstats_mallocs_total Total number of mallocs.
# TYPE go_memstats_mallocs_total counter
go_memstats_mallocs_total 3734
# HELP go_memstats_mcache_inuse_bytes Number of bytes in use by mcache structures.
# TYPE go_memstats_mcache_inuse_bytes gauge
go_memstats_mcache_inuse_bytes 2400
# HELP go_memstats_mcache_sys_bytes Number of bytes used for mcache structures obtained from system.
# TYPE go_memstats_mcache_sys_bytes gauge
go_memstats_mcache_sys_bytes 15600
# HELP go_memstats_mspan_inuse_bytes Number of bytes in use by mspan structures.
# TYPE go_memstats_mspan_inuse_bytes gauge
go_memstats_mspan_inuse_bytes 33280
# HELP go_memstats_mspan_sys_bytes Number of bytes used for mspan structures obtained from system.
# TYPE go_memstats_mspan_sys_bytes gauge
go_memstats_mspan_sys_bytes 48960
# HELP go_memstats_next_gc_bytes Number of heap bytes when next garbage collection will take place.
# TYPE go_memstats_next_gc_bytes gauge
go_memstats_next_gc_bytes 4.194304e+06
# HELP go_memstats_other_sys_bytes Number of bytes used for other system allocations.
# TYPE go_memstats_other_sys_bytes gauge
go_memstats_other_sys_bytes 630440
# HELP go_memstats_stack_inuse_bytes Number of bytes in use by the stack allocator.
# TYPE go_memstats_stack_inuse_bytes gauge
go_memstats_stack_inuse_bytes 425984
# HELP go_memstats_stack_sys_bytes Number of bytes obtained from system for stack allocator.
# TYPE go_memstats_stack_sys_bytes gauge
go_memstats_stack_sys_bytes 425984
# HELP go_memstats_sys_bytes Number of bytes obtained from system.
# TYPE go_memstats_sys_bytes gauge
go_memstats_sys_bytes 1.16644e+07
# HELP go_threads Number of OS threads created.
# TYPE go_threads gauge
go_threads 5
# HELP pg_exporter_last_scrape_duration_seconds Duration of the last scrape of metrics from PostgreSQL.
# TYPE pg_exporter_last_scrape_duration_seconds gauge
pg_exporter_last_scrape_duration_seconds 1.064326886
# HELP pg_exporter_last_scrape_error Whether the last scrape of metrics from PostgreSQL resulted in an error (1 for error, 0 for success).
# TYPE pg_exporter_last_scrape_error gauge
pg_exporter_last_scrape_error 1
# HELP pg_exporter_scrapes_total Total number of times PostgreSQL was scraped for metrics.
# TYPE pg_exporter_scrapes_total counter
pg_exporter_scrapes_total 1
# HELP pg_up Whether the last scrape of metrics from PostgreSQL was able to connect to the server (1 for yes, 0 for no).
# TYPE pg_up gauge
pg_up 0
# HELP postgres_exporter_build_info A metric with a constant '1' value labeled by version, revision, branch, goversion from which postgres_exporter was built, and the goos and goarch for the build.
# TYPE postgres_exporter_build_info gauge
postgres_exporter_build_info{branch="HEAD",goarch="amd64",goos="linux",goversion="go1.20.6",revision="8c3604b85e38ae7141e84ecdc318b6015a196c97",tags="netgo static_build",version="0.13.2"} 1
# HELP postgres_exporter_config_last_reload_success_timestamp_seconds Timestamp of the last successful configuration reload.
# TYPE postgres_exporter_config_last_reload_success_timestamp_seconds gauge
postgres_exporter_config_last_reload_success_timestamp_seconds 0
# HELP postgres_exporter_config_last_reload_successful Postgres exporter config loaded successfully.
# TYPE postgres_exporter_config_last_reload_successful gauge
postgres_exporter_config_last_reload_successful 0
# TYPE process_cpu_seconds_total counter
# HELP process_max_fds Maximum number of open file descriptors.
# TYPE process_max_fds gauge
process_max_fds 1.048576e+06
# TYPE process_open_fds gauge
# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 1.1042816e+07
# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds 1.69073904954e+09
# TYPE process_virtual_memory_bytes gauge
process_virtual_memory_bytes 7.37497088e+08
# HELP process_virtual_memory_max_bytes Maximum amount of virtual memory available in bytes.
# TYPE process_virtual_memory_max_bytes gauge
process_virtual_memory_max_bytes 1.8446744073709552e+19
# HELP promhttp_metric_handler_requests_in_flight Current number of scrapes being served.
# TYPE promhttp_metric_handler_requests_in_flight gauge
promhttp_metric_handler_requests_in_flight 1
# HELP promhttp_metric_handler_requests_total Total number of scrapes by HTTP status code.
# TYPE promhttp_metric_handler_requests_total counter
promhttp_metric_handler_requests_total{code="200"} 0
promhttp_metric_handler_requests_total{code="500"} 0
promhttp_metric_handler_requests_total{code="503"} 0
/ $ exit
command terminated with exit code 130

Chapter12$ kubectl replace -f .\exporters\db.service-with-exporter.yaml
service/db replaced


Chapter12$ kubectl create -f .\exporters\db.serviceMonitor.yaml
servicemonitor.monitoring.coreos.com/db created


Chapter12$ kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
Forwarding from 127.0.0.1:9090 -> 9090
Forwarding from [::1]:9090 -> 9090









## Remove the Minikube environment
We can end this lab session by removing the Minikube environment:
```
Chapter11$ minikube delete
✋  Stopping node "minikube"  ...
🛑  Powering off "minikube" via SSH ...
🔥  Deleting "minikube" in hyperv ...
💀  Removed all traces of the "minikube" cluster.

```

