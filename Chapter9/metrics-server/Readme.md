https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

---
>Important Note
>
>We added --kubelet-insecure-tls argument to the metrics-server deployment.
>
>```
>....
>  template:
>    metadata:
>      labels:
>        k8s-app: metrics-server
>    spec:
>      containers:
>      - args:
>        - --cert-dir=/tmp
>        - --secure-port=4443
>        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
>        - --kubelet-use-node-status-port
>        - --metric-resolution=15s
>        - --kubelet-insecure-tls
>        image: registry.k8s.io/metrics-server/metrics-server:v0.6.3
>....
>```
---