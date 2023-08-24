#!/bin/bash
MINIKUBEIP=$(minikube ip)

GITLABCA="$(kubectl get secret -n gitlab gitlab-wildcard-tls-ca -o jsonpath='{.data.cfssl_ca}' |base64 -d|awk 'NF {sub(/\r/, ""); if (NR==1) printf "%s\\n",$0;else printf "        %s\\n",$0;}')"

sed -e "s|MINIKUBEIP|${MINIKUBEIP}|g" minikube_install_values.template.yaml >minikube_install_values.yaml

sed -i "s|GITLABCA|${GITLABCA}|g" minikube_install_values.yaml
