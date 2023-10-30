# __Chapter 5 Labs__

## __Technical requirements__

The following labs will help you deploying a simple demo application using by using some of the commands learned in this chapter. The code for the labs is available in this book’s Github repository in https://github.com/ PacktPublishing /Docker-for-Developers-Handbook.git. Ensure you have the latest revision available by simply executing git clone https://github.com/PacktPublishing/Docker-for-Developers-Handbook.git to download all its content or git pull if you already downloaded the repository before. 

All commands and content used in these labs will be located inside Docker-for-Developers-Handbook/Chapter5 directory. 

## Deploying a simple demo application

In this lab we will learn how to deploy an application with 3 components: a load balancer, a frontend and a database.
There are hundreds of good docker compose examples and in fact there are many vendors who provide their applications packaged in compose YAML format even for production. We choose this pretty simple application because we are focused in the Docker command-line and not in the application itself.

If you list the content of the Chapter5 folder you will see a forlder containing this simplestapp. There is a folder for each component and a couple of compose files that will allow us deploy the full application.
The compose YAML file that defines our application contains the following code:
```
version: "3.7"

services:
  # load balancer
  lb:
    build: simplestlb
    image: myregistry/simplest-lab:simplestlb
    environment:
      - APPLICATION_ALIAS=simplestapp
      - APPLICATION_PORT=3000
    networks:
      simplestlab:
          aliases:
          - simplestlb
    ports:
      - "8080:80"
  db:
    build: simplestdb
    image: myregistry/simplest-lab:simplestdb
    environment:
        - "POSTGRES_PASSWORD=changeme"
    networks:
       simplestlab:
        aliases:
          - simplestdb
    volumes:
      - pgdata:/var/lib/postgresql/data
  app:
    build: simplestapp
    image: myregistry/simplest-lab:simplestapp
    environment:
      - dbhost=simplestdb
      - dbname=demo
      - dbuser=demo
      - dbpasswd=d3m0
    networks:
       simplestlab:
        aliases:
          - simplestapp
    depends_on:
      - lb
      - db
volumes:
  pgdata:

networks:
  simplestlab:
    ipam:
      driver: default
      config:
        - subnet: 172.16.0.0/16

```

Only one volume will be used, for the database component. The only service published is the load balancer. We have included this service just to let you have an understanding of how we can integrate a multilayer application and only share one visible component.  


Images will be created locally (you may want to upload to your own registry or DockerHub account).
1 - To build all the images for this project we will use docker-compose build:
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name chapter5 build
[+] Building 0.0s (0/0)
[+] Building 0.1s (0/2)
 => [internal] load build definition from Dockerfile                                                               0.1s
[+] Building 0.4s (2/2)
 => [internal] load build definition from Dockerfile                                                               0.3s
[+] Building 0.7s (2/3)
[+] Building 2.0s (4/6)
 => [internal] load build definition from Dockerfile                                                               0.3s
 => => transferring dockerfile: 191B                                                                               0.0s
 => [internal] load .dockerignore                                                                                  0.2s
[+] Building 2.3s (4/6)
 => [internal] load build definition from Dockerfile                                                               0.3s
 => => transferring dockerfile: 191B                                                                               0.0s
[+] Building 2.4s (4/6)
[+] Building 2.7s (4/6)
[+] Building 3.3s (4/6)
[+] Building 3.9s (4/6)
[+] Building 4.3s (4/6)
[+] Building 5.3s (4/6)
[+] Building 6.6s (4/6)
[+] Building 7.7s (4/6)
[+] Building 8.0s (4/6)
 => [internal] load build definition from Dockerfile                                                               0.3s
 => => transferring dockerfile: 191B                                                                               0.0s
[+] Building 8.6s (4/6)
 => [internal] load build definition from Dockerfile                                                               0.3s
[+] Building 14.8s (7/7) FINISHED
 => [internal] load build definition from Dockerfile                                                               0.3s
 => => transferring dockerfile: 191B                                                                               0.0s
 => [internal] load .dockerignore                                                                                  0.2s
 => => transferring context: 2B                                                                                    0.0s
 => [internal] load metadata for docker.io/library/postgres:alpine                                                 1.5s
 => [internal] load build context                                                                                  0.1s
 => => transferring context: 602B                                                                                  0.0s
 => [1/2] FROM docker.io/library/postgres:alpine@sha256:0ce2f7c363133126dbcb1d3409dc523ecd243c55ca95a19b9b3c73c3  11.4s
 => => resolve docker.io/library/postgres:alpine@sha256:0ce2f7c363133126dbcb1d3409dc523ecd243c55ca95a19b9b3c73c31  0.2s
 => => sha256:0ce2f7c363133126dbcb1d3409dc523ecd243c55ca95a19b9b3c73c31c670b4a 1.65kB / 1.65kB                     0.0s
 => => sha256:07ec36ad2d5ab9250f38c8ef749239b662cf15d03c9ddb7167422edbbdf71156 1.99kB / 1.99kB                     0.0s
 => => sha256:ddc12ac7fa27279bfcc41deaccd1368291ab7d71ca7cee0420b41f9974e9a468 7.97kB / 7.97kB                     0.0s
 => => sha256:f56be85fc22e46face30e2c3de3f7fe7c15f8fd7c4e5add29d7f64b87abdaa09 3.37MB / 3.37MB                     0.5s
 => => sha256:256414453fba6e3cc9af34383da6e5920f6d4ac3399943b8569b68896c645a0e 1.29kB / 1.29kB                     0.4s
 => => sha256:f71699d7795ac5159478a278ffb6af3fcac0141e6a637d71062a601d7cab30c7 147B / 147B                         0.6s
 => => extracting sha256:f56be85fc22e46face30e2c3de3f7fe7c15f8fd7c4e5add29d7f64b87abdaa09                          0.2s
 => => sha256:8eff49387ec9a1f26ada557b4e31f86a45f70ef57c1a45345e5bfbe75e53bcfc 90.71MB / 90.71MB                   7.0s
 => => sha256:7da7fae4e80a5e292219502d2ce432382a68e8d0fb3841807ad70963ec194e7d 9.45kB / 9.45kB                     0.7s
 => => sha256:f33740282c0040003ee1e3c9ec1a68d5eb873795badbbf6103c79cc588760e4a 162B / 162B                         0.8s
 => => extracting sha256:256414453fba6e3cc9af34383da6e5920f6d4ac3399943b8569b68896c645a0e                          0.0s
 => => sha256:b49740a115f2f98ff2414fb5272986655b272d739c878477a6ca541430a41637 193B / 193B                         0.9s
 => => sha256:c36da779701e31511df27033e2a5e1b1ebdd0b7f4032cfab4a04c82139d7337a 0B / 4.79kB                        12.5s
 => => extracting sha256:f71699d7795ac5159478a278ffb6af3fcac0141e6a637d71062a601d7cab30c7                          0.0s
 => => extracting sha256:8eff49387ec9a1f26ada557b4e31f86a45f70ef57c1a45345e5bfbe75e53bcfc                          2.5s
 => => extracting sha256:7da7fae4e80a5e292219502d2ce432382a68e8d0fb3841807ad70963ec194e7d                          0.0s
 => => extracting sha256:f33740282c0040003ee1e3c9ec1a68d5eb873795badbbf6103c79cc588760e4a                          0.0s
 => => extracting sha256:b49740a115f2f98ff2414fb5272986655b272d739c878477a6ca541430a41637                          0.0s
 => => extracting sha256:c36da779701e31511df27033e2a5e1b1ebdd0b7f4032cfab4a04c82139d7337a                          0.0s
 => [2/2] COPY docker-entrypoint-initdb.d /docker-entrypoint-initdb.d                                              1.2s
 => exporting to image                                                                                             0.2s
 => => exporting layers                                                                                            0.1s
 => => writing image sha256:e872ee4e9593dfcab2d4149ec43c6adfedcbd4ab429a269cbd77a3c62cd63dd9                       0.0s
 => => naming to docker.io/myregistry/simplest-lab:simplestdb                                                      0.0s
[+] Building 18.5s (17/17) FINISHED
 => [internal] load build definition from Dockerfile                                                               0.2s
 => => transferring dockerfile: 505B                                                                               0.0s
 => [internal] load .dockerignore                                                                                  0.2s
 => => transferring context: 2B                                                                                    0.0s
 => [internal] load metadata for docker.io/library/alpine:latest                                                   0.4s
 => CACHED [ 1/11] FROM docker.io/library/alpine@sha256:124c7d2707904eea7431fffe91522a01e5a861a624ee31d03372cc1d1  0.0s
 => https://github.com/chartjs/Chart.js/releases/download/v2.3.0/Chart.js                                          0.6s
 => [internal] load build context                                                                                  0.2s
 => => transferring context: 12.11kB                                                                               0.0s
 => [ 2/11] RUN apk --update --no-progress --no-cache  add nodejs npm                                              4.8s
 => [ 3/11] WORKDIR /APP                                                                                           0.2s
 => [ 4/11] COPY simplestapp.js simplestapp.js                                                                     0.2s
 => [ 5/11] COPY simplestapp.html simplestapp.html                                                                 0.1s
 => [ 6/11] COPY reset.html reset.html                                                                             0.2s
 => [ 7/11] COPY package.json package.json                                                                         0.1s
 => [ 8/11] COPY dbconfig.json dbconfig.json                                                                       0.2s
 => [ 9/11] RUN npm install                                                                                        9.6s
 => [10/11] ADD https://github.com/chartjs/Chart.js/releases/download/v2.3.0/Chart.js .                            0.2s
 => [11/11] RUN chmod 755 Chart.js                                                                                 0.7s
 => exporting to image                                                                                             1.3s
 => => exporting layers                                                                                            1.3s
 => => writing image sha256:2d88460e20ca557fcd25907b5f026926b0e61d93fde58a8e0b854cfa0864c3bd                       0.0s
 => => naming to docker.io/myregistry/simplest-lab:simplestapp                                                     0.0s
```

We could have  directly used docker-compose run to build or pull the images and run all containers, but this way we can review the process step by step.

2 - We can take a look at the images created locally.
```
$ docker image ls
REPOSITORY                TAG           IMAGE ID       CREATED         SIZE
myregistry/simplest-lab   simplestapp   2d88460e20ca   8 minutes ago   73.5MB
myregistry/simplest-lab   simplestdb    e872ee4e9593   8 minutes ago   243MB
myregistry/simplest-lab   simplestlb    bab86a191910   8 minutes ago   8.51MB
```
As you may have noticed all the images created follow the names defined in the compose YAML file. Because build key exists, build process is executed instead of pulling images directly.

3 - Let's now create the container for the database service.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name chapter5 create db
[+] Running 3/3
 ⠿ Network chapter5_simplestlab  Created                                                                           0.8s
 ⠿ Volume "chapter5_pgdata"      Created                                                                           0.0s
 ⠿ Container chapter5-db-1       Created                                                                           0.2s
```
All the objects required for the database service were created. It is not running yet, but it is ready for that.

4 - We run this service alone and review its status.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name chapter5 up -d db
[+] Running 1/1
 ⠿ Container chapter5-db-1  Started
```
If you omit the compose or the project's name, we will not get neither the services nor the containers.
```
$ docker-compose ps
no configuration file provided: not found

$ docker-compose --file simplestlab/docker-compose.yaml ps
NAME                IMAGE               COMMAND             SERVICE             CREATED             STATUS              PORTS
```

ensure you always use the aproppriate name and compose file for all the commands related to a project.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name chapter5 ps
NAME                IMAGE                                COMMAND                  SERVICE             CREATED             STATUS              PORTS
chapter5-db-1       myregistry/simplest-lab:simplestdb   "docker-entrypoint.s…"   db                  4 minutes ago       Up 3 minutes        5432/tcp
```

5 - We will now run the ___lb___ and ___app___ services by using __docker-compose up -d__.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name chapter5 up -d
[+] Running 3/3
 ⠿ Container chapter5-lb-1   Started                                                                               2.0s
 ⠿ Container chapter5-db-1   Running                                                                               0.0s
 ⠿ Container chapter5-app-1  Started                                                                               2.9s
```
Your services will quickly change status from Created to Started.

We can now review the status of all our application components and the ports exposed.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name chapter5 ps
NAME                IMAGE                                 COMMAND                  SERVICE             CREATED             STATUS              PORTS
chapter5-app-1      myregistry/simplest-lab:simplestapp   "node simplestapp.js…"   app                 9 minutes ago       Up 9 minutes        3000/tcp
chapter5-db-1       myregistry/simplest-lab:simplestdb    "docker-entrypoint.s…"   db                  16 minutes ago      Up 15 minutes       5432/tcp
chapter5-lb-1       myregistry/simplest-lab:simplestlb    "/entrypoint.sh /bin…"   lb                  9 minutes ago       Up 9 minutes        0.0.0.0:8080->80/tcp
```

6 - We can scale our app component in this example. This option may be complicated or impossible in other deployments as it really depends on your own application code and logic. For example, you should scale a database component without appropriate database internal scale logic (you should review the database server vendor's documentation).
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name chapter5 up --scale app=2 -d
[+] Running 4/4
 ⠿ Container chapter5-db-1   Running                                                                               0.0s
 ⠿ Container chapter5-lb-1   Running                                                                               0.0s
 ⠿ Container chapter5-app-2  Created                                                                               0.2s
 ⠿ Container chapter5-app-1  Recreated                                                                            10.8s
```

7 - We can now review the app service's logs. We will retrieve both containers logs.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name chapter5 logs app
chapter5-app-1  | dbuser: demo dbpasswd: d3m0
chapter5-app-1  | dbhost: simplestdb dbname: demo dbport: 5432
chapter5-app-1  | Can use environment variables to avoid '/APP/dbconfig.js' file configurations.
chapter5-app-1  | [1681677649685]  172.16.0.4 - c0ea4593bd1d
chapter5-app-1  | Server running at http://172.16.0.4:3000/
chapter5-app-1  | dbuser: demo dbpasswd: d3m0
chapter5-app-1  | dbhost: simplestdb dbname: demo dbport: 5432
chapter5-app-1  | Can use environment variables to avoid '/APP/dbconfig.js' file configurations.
chapter5-app-1  | [1681677820580]  172.16.0.4 - c0ea4593bd1d
chapter5-app-1  | Server running at http://172.16.0.4:3000/
chapter5-app-2  | dbuser: demo dbpasswd: d3m0
chapter5-app-2  | dbhost: simplestdb dbname: demo dbport: 5432
chapter5-app-2  | Can use environment variables to avoid '/APP/dbconfig.js' file configurations.
chapter5-app-2  | [1681677651033]  172.16.0.5 - 708f4829f995
chapter5-app-2  | Server running at http://172.16.0.5:3000/
chapter5-app-2  | dbuser: demo dbpasswd: d3m0
chapter5-app-2  | dbhost: simplestdb dbname: demo dbport: 5432
chapter5-app-2  | Can use environment variables to avoid '/APP/dbconfig.js' file configurations.
chapter5-app-2  | [1681677821770]  172.16.0.5 - 708f4829f995
chapter5-app-2  | Server running at http://172.16.0.5:3000/
```

## Deploy another project using the same compose YAML file

In this simple example we will review and learn the problems we can have by running two projects using the same compose YAML file.

1 - Let's create a new project by using a new poject name.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name newdemo create
[+] Running 0/0
 ⠿ Network newdemo_simplestlab  Error                                                                              0.0s
failed to create network newdemo_simplestlab: Error response from daemon: Pool overlaps with other one on this address space
```

As you may notice, we defined a specific network CIDR for our project network. Docker container runtime assigns IP ranges by using its own IPAM and thus it manages any IP overlap automatically for us. By using a specific range we broke the dynamism of the platform. Let's remove the IP address range from our docker-compose definition:
```
version: "3.7"

services:
  # load balancer
  lb:
    build: simplestlb
    image: myregistry/simplest-lab:simplestlb
    environment:
      - APPLICATION_ALIAS=simplestapp
      - APPLICATION_PORT=3000
    networks:
      simplestlab:
          aliases:
          - simplestlb
    ports:
      - "8080:80"
  db:
    build: simplestdb
    image: myregistry/simplest-lab:simplestdb
    environment:
        - "POSTGRES_PASSWORD=changeme"
    networks:
       simplestlab:
        aliases:
          - simplestdb
    volumes:
      - pgdata:/var/lib/postgresql/data
  app:
    build: simplestapp
    image: myregistry/simplest-lab:simplestapp
    environment:
      - dbhost=simplestdb
      - dbname=demo
      - dbuser=demo
      - dbpasswd=d3m0
    networks:
       simplestlab:
        aliases:
          - simplestapp
    depends_on:
      - lb
      - db
volumes:
  pgdata:

networks:
  simplestlab:
    ipam:
      driver: default
```

2 - And now we try it again.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name newdemo create
[+] Running 5/5
 ⠿ Network newdemo_simplestlab  Created                                                                            0.9s
 ⠿ Volume "newdemo_pgdata"      Created                                                                            0.0s
 ⠿ Container newdemo-db-1       Created                                                                            0.2s
 ⠿ Container newdemo-lb-1       Created                                                                            0.2s
 ⠿ Container newdemo-app-1      Created                                                                            0.2s
```

We didn't get any problem now. The volume and network objects were created with the project prefix. We will not be able to reuse the project name because objects names must be unique.

3 - Let's run all the application components now.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name newdemo start
[+] Running 1/2
 ⠿ Container newdemo-db-1  Started                                                                                 1.4s
 ⠸ Container newdemo-lb-1  Starting                                                                                1.4s
Error response from daemon: driver failed programming external connectivity on endpoint newdemo-lb-1 (bb03c1b0a14a90a3022aca3c3a9a9d506b3e312cc864f0dcda6a5360d58ef3d0): Bind for 0.0.0.0:8080 failed: port is already allocated
```

You may notice that we also defined a specific port for our __lb__ service. This seems fine for production but defining a specific port in development, where multiple copies of an application can be expected also breaks the dynamism of container-based components. For this to work we could just simply change this port number, allow the system to choose a random one for us or define a variable that will allow us to define a port for each project.

4 - We change our compose YAML and add LB_PORT variable as the port for exposing our application.
```
version: "3.7"

services:
  # load balancer
  lb:
    build: simplestlb
    image: myregistry/simplest-lab:simplestlb
    environment:
      - APPLICATION_ALIAS=simplestapp
      - APPLICATION_PORT=3000
    networks:
      simplestlab:
          aliases:
          - simplestlb
    ports:
      - "${LB_PORT}:80"
  db:
    build: simplestdb
    image: myregistry/simplest-lab:simplestdb
    environment:
        - "POSTGRES_PASSWORD=changeme"
    networks:
       simplestlab:
        aliases:
          - simplestdb
    volumes:
      - pgdata:/var/lib/postgresql/data
  app:
    build: simplestapp
    image: myregistry/simplest-lab:simplestapp
    environment:
      - dbhost=simplestdb
      - dbname=demo
      - dbuser=demo
      - dbpasswd=d3m0
    networks:
       simplestlab:
        aliases:
          - simplestapp
    depends_on:
      - lb
      - db
volumes:
  pgdata:

networks:
  simplestlab:
    ipam:
      driver: default
```

Now we can test again.
```
$ LB_PORT=8081 docker-compose --file simplestlab/docker-compose.yaml --project-name newdemo up lb
[+] Running 1/1
 ⠿ Container newdemo-lb-1  Recreated
```
And we review the components status.
```
$ docker-compose --file simplestlab/docker-compose.yaml --project-name newdemo ps
WARN[0000] The "LB_PORT" variable is not set. Defaulting to a blank string.
NAME                IMAGE                                COMMAND                  SERVICE             CREATED             STATUS              PORTS
newdemo-db-1        myregistry/simplest-lab:simplestdb   "docker-entrypoint.s…"   db                  11 minutes ago      Up 8 minutes        5432/tcp
newdemo-lb-1        myregistry/simplest-lab:simplestlb   "/entrypoint.sh /bin…"   lb                  46 seconds ago      Up 34 seconds       0.0.0.0:8081->80/tcp

$ docker-compose --file simplestlab/docker-compose.yaml --project-name newdemo up app -d
[+] Running 3/3
 ⠿ Container newdemo-db-1   Running                                                                                0.0s
 ⠿ Container newdemo-lb-1   Running                                                                                0.0s
 ⠿ Container newdemo-app-1  Started                                                                                1.4s
``` 

5 - And we can list the projects deployed in our host along with their number of components.
```
$ docker-compose ls
NAME                STATUS              CONFIG FILES
chapter5            running(4)          /home/frjaraur/labs/Chapter5/simplestlab/docker-compose.yaml
newdemo             running(3)          /home/frjaraur/labs/Chapter5/simplestlab/docker-compose.yaml
```
With this simple example of usual problems you may find while preparing your applications, we will end this chapter’s labs by removing all the objects created. 

## Removing all projects 

1 – We will remove all the deployed projects by using docker-compose down. 
```
$ docker-compose -f  /home/frjaraur/labs/Chapter5/simplestlab/docker-compose.yaml --project-name chapter5 down 

WARN[0000] The "LB_PORT" variable is not set. Defaulting to a blank string. 

[+] Running 5/5 

⠿ Container chapter5-app-2      Removed                                                                           0.1s 

⠿ Container chapter5-app-1      Removed                                                                           0.1s 

⠿ Container chapter5-db-1       Removed                                                                           0.1s 

⠿ Container chapter5-lb-1       Removed                                                                           0.1s 

⠿ Network chapter5_simplestlab  Removed                                                                           0.6s 
```
You may notice that volumes are not listed as removed. We can review the current volumes on your system. 
```
$ docker volume ls 

DRIVER    VOLUME NAME 

local     chapter5_pgdata 

local     newdemo_pgdata 
```
We will remove manually the volume present for project chapter5, but we will use the --volumes argument for removing all the volumes associated with a project. 
```
 $ docker-compose -f  /home/frjaraur/labs/Chapter5/simplestlab/docker-compose.yaml --project-name newdemo down --volumes 

WARN[0000] The "LB_PORT" variable is not set. Defaulting to a blank string. 

[+] Running 5/5 

⠿ Container newdemo-app-1      Removed                                                                            0.0s 

⠿ Container newdemo-lb-1       Removed                                                                            0.1s 

⠿ Container newdemo-db-1       Removed                                                                            0.1s 

⠿ Volume newdemo_pgdata        Removed                                                                            0.1s 

⠿ Network newdemo_simplestlab  Removed                                                                            0.6s 
```
Volume was removed as we can verify now. 
```
$ docker volume ls 

DRIVER    VOLUME NAME 

local     chapter5_pgdata 

Therefore, we remove it manually. 

$ docker volume rm  chapter5_pgdata 

chapter5_pgdata 
```






