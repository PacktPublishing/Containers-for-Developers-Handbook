# Docker Swarm cluster using Vagrant and Virtualbox

## This repository will create a working Docker Swarm cluster for chapter8.

----
## Requirements (follow each product guide):
 - Install Vagrant (tested on 2.2.7+) - https://www.vagrantup.com/
    - https://www.vagrantup.com/intro/getting-started/install.html
    - https://www.vagrantup.com/downloads


 - Install Virtualbox (tested on 6.0.0+)- https://www.virtualbox.org/
    - https://www.virtualbox.org/wiki/Downloads
 
----

## Basic Usage:

1. Download or clone this respository using git clone if you haven't done yet:
```
[YOUR COMPUTER]$ git clone https://github.com/PacktPublishing/Docker-for-Developers-Handbook.git
```

 
2. Navigate to "environments/swarm" and execute ___vagrant up___ to create a new environment.
```
[YOUR COMPUTER]$ cd Docker-for-Developers-Handbook
[YOUR COMPUTER]/Docker-for-Developers-Handbook/Chapter7/vagrant/
[YOUR COMPUTER]/Docker-for-Developers-Handbook/Chapter7/vagrant$ vagrant up

--------------------------------------------------------------------------------------------
 DOCKER swarm Vagrant Environment
 Engine Version: current
--------------------------------------------------------------------------------------------
Bringing machine 'swarm-node1' up with 'virtualbox' provider...
Bringing machine 'swarm-node2' up with 'virtualbox' provider...
Bringing machine 'swarm-node3' up with 'virtualbox' provider...
==> swarm-node1: Checking if box 'frjaraur/xenial64' version '1.4' is up to date...
==> swarm-node1: Clearing any previously set forwarded ports...
...
...
```

After some minutes (depending on your hosts' free resources), your environment will be up and ready for execting the labs.

Verify virtual platform status executing ___vagrant status___:
```
$ vagrant status
--------------------------------------------------------------------------------------------
 DOCKER swarm Vagrant Environment
 Engine Version: current
--------------------------------------------------------------------------------------------
Current machine states:

swarm-node1          running (virtualbox)
swarm-node2          running (virtualbox)
swarm-node3          running (virtualbox)
swarm-node4          running (virtualbox)

This environment represents multiple VMs. The VMs are all listed
above with their current state. For more information about a specific
VM, run `vagrant status NAME`.

```

3. This will create the nodes defined in **config.yml** with latest Docker Engine installed. This is configurable via [config.yml](./config.yml) among other options, such as the number of nodes. In this case, we will simply comment all the lines regarding an specific __box__.
```
environment:
  # Valid Engine Versions are 'experimental', 'test' and 'current'
  engine_version: "current"
  experimental: true

  base_box: "frjaraur/focal"
  base_box_version: "1.2"
  #proxy: "http://your_proxy_goes_here:with_the_port"

boxes:
- name: "swarm-node1"
  swarm_role: "manager"
  mgmt_ip: "10.10.10.11"
  hostonly_ip: "192.168.56.11"
  mem: "1524"
  cpu: "1"

- name: "swarm-node2"
  swarm_role: "worker"
  mgmt_ip: "10.10.10.12"
  hostonly_ip: "192.168.56.12"
  mem: "1524"
  cpu: "1"

- name: "swarm-node3"
  swarm_role: "worker"
  mgmt_ip: "10.10.10.13"
  hostonly_ip: "192.168.56.13"
  mem: "1524"
  cpu: "1"

- name: "swarm-node4"
  swarm_role: "worker"
  mgmt_ip: "10.10.10.14"
  hostonly_ip: "192.168.56.14"
  mem: "1524"
  cpu: "1"
```



 Default node names:
  * swarm-node1
  * swarm-node2
  * swarm-node3
  * swarm-node4


4. Connect to nodes using vagrant as usual (**vagrant ssh**).
```
$ vagrant ssh swarm-node1

--------------------------------------------------------------------------------------------
 Docker SWARM MODE Vagrant Environment
 Engine Version: current
 Experimental Features Enabled
--------------------------------------------------------------------------------------------
Welcome to Ubuntu 20.04.5 LTS (GNU/Linux 5.4.0-135-generic x86_64)

 * Documentation:  https://help.ubuntu.com

  System information as of Thu 01 Jun 2023 06:42:28 PM CEST

  System load:     0.68              IPv4 address for docker0: 172.17.0.1
  Usage of /:      5.8% of 46.94GB   IPv4 address for enp0s3:  10.0.2.15
  Memory usage:    17%               IPv4 address for enp0s8:  10.10.10.11
  Swap usage:      0%                IPv4 address for enp0s9:  192.168.56.11
  Processes:       115               IPv4 address for enp0s9:  192.168.56.101
  Users logged in: 0


   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

112 updates can be applied immediately.
76 of these updates are standard security updates.
To see these additional updates run: apt list --upgradable

New release '22.04.2 LTS' available.
Run 'do-release-upgrade' to upgrade to it.


Last login: Thu Dec 29 17:45:20 2022
vagrant@swarm-node1:~$ 
```

Then you are "in" your virtual node "swarm-node1" and you can follow all Docker swarm's labs.


>NOTE:
>
>It could be useful to define simple alias:
> alias vssh='vagrant ssh'
>

5. When you have finnished all your labs, simple execute **vagrant destroy -f**. This will delete all virtual nodes.
```
$ vagrant destroy -f
```

---
>## __Additional Notes__
>
>* Deployment will create 2 interfaces on each node.
> * vagrant internal communication (**internal**)
> * internal docker network with IP addresses configured in [config.yml](./config.yml)
>
>
>* [config.yml](./config.yml) will let you configure your environment and the amount of nodes to be deployed. You can change Docker Engine releases and experimental features.

---