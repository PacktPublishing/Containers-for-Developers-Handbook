#!/bin/bash
MINIKUBEIP=$(minikube ip)

sed -e "s|MINIKUBEIP|${MINIKUBEIP}|g" minikube_install_values.template.yaml >minikube_install_values.yaml