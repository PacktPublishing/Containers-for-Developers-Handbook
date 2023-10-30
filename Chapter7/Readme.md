# Chapter 7 Labs 

The following labs will help you deploy a simple demo application on top a Docker Swarm cluster to review the most important features provided by this container orchestrator. The code for the labs is available in this book’s Github repository in https://github.com/PacktPublishing/Docker-for-Developers-Handbook.git. Ensure you have the latest revision available by simply executing git clone https://github.com/PacktPublishing/Docker-for-Developers-Handbook.git to download all its content or git pull if you already downloaded the repository before. Additional labs are usually included in GitHub. 

All commands and content used in these labs will be located inside Docker-for-Developers-Handbook/Chapter7 directory. 

We will start by deploying our own Docker Swarm cluster.  

## Deploying a single node Docker Swarm cluster 

In this lab we will create a one node Docker Swarm cluster using the Docker Desktop environment. 

>Important Note 
>
>Deploying a single node cluster is enough for reviewing the most important  features learned in this chapter but of course we wouldn’t be able to move service’s tasks to another node. If you are interested in such situations and want to review advanced containers secheduling locations, you can deploy multiple nodes clusters following any of the methods described in the specific multiple-nodes-cluster.md markdown file located in this chapter’s folder. 


1 - To create a single node Docker Swarm Cluster we will use the docker CLI with the swarm object. In this example we will use default IP address values to initialize a Docker Swam cluster: 
```
$ docker swarm init 

Swarm initialized: current node (pyczfubvyyih2kmeth8xz9yd7) is now a manager. 

To add a worker to this swarm, run the following command: 

    docker swarm join --token SWMTKN-1-3dtlnakr275se9lp7b5gj8rpk97n66jdm7o1tn5cwsrf3g55yu-5ky1xrr61mdx1gr2bywi5v0o8 192.168.65.4:2377 

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions. 
```

2 - We can now verify the current Docker Swarm nodes. 
```
$ docker node ls 

ID                            HOSTNAME         STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION 

pyczfubvyyih2kmeth8xz9yd7 *   docker-desktop   Ready     Active         Leader           20.10.22 
```

3 - Overlay and specific bridge networks were created as we can easely verify listing the available networks: 
```
$ docker network ls 

NETWORK ID     NAME              DRIVER    SCOPE 

75aa7ed7603b   bridge            bridge    local 

9f1d6d85cb3c   docker_gwbridge   bridge    local 

07ed8a3c602e   host              host      local 

7977xslkr9ps   ingress           overlay   swarm 

cc46fa305d96   none              null      local 
```
  

4 - This cluster has one node hence this node is the manager (leader) and also acts as worker (by default). 
```
 $ docker node inspect docker-desktop --format="{{ .Status }}" 

{ready  192.168.65.4} 

  

$ docker node inspect docker-desktop --format="{{ .ManagerStatus }}" 

{true reachable 192.168.65.4:2377} 
```

This cluster is ready to run Docker Swarm services. 

## Review of Main Docker Swarm Service’s Features 

In this lab we are going to review some of the most important services features by running a replicated and a global service. 

1 - We will start by creating a simple webserver service using nginx:alpine Docker Hub’s container image: 
```
$ docker service create --name webserver nginx:alpine 

m93gsvuin5vly5bn4ikmi69sq 

overall progress: 1 out of 1 tasks 

1/1: running   [==================================================>] 

verify: Service converged 
```

After few seconds, the service’s task is running. 
```
$ docker service ls 

ID             NAME        MODE         REPLICAS   IMAGE          PORTS 

m93gsvuin5vl   webserver   replicated   1/1        nginx:alpine 

$ docker service ps webserver 

ID             NAME          IMAGE          NODE             DESIRED STATE   CURRENT STATE                ERROR     PORTS 

l38u6vpyq5zo   webserver.1   nginx:alpine   docker-desktop   Running         Running about a minute ago 
```

Notice that by default the service runs in replicated mode and deploys just one replica. The task is identified as webserver.1, it runs on docker-desktop node, and we can verify the associated container by listing the containers on that node. 
```
$ docker container ls 

CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS     NAMES 

63f1dfa649d8   nginx:alpine   "/docker-entrypoint.…"   3 minutes ago   Up 3 minutes   80/tcp    webserver.1.l38u6vpyq5zo9qfyc70g2411x 
```

It is easy to track the containers associated with services. We can still run containers directly using the container runtime, but those will not be managed by Docker Swarm. 

3 - Let’s now replicate this service by adding a new task. 
```
$ docker service update --replicas 3 webserver 

webserver 

overall progress: 3 out of 3 tasks 

1/3: running   [==================================================>] 

2/3: running   [==================================================>] 

3/3: running   [==================================================>] 

verify: Service converged 
```

4 - And we can verify its status by using docker service ps webserver again: 
```
$ docker service ps webserver 

ID             NAME          IMAGE          NODE             DESIRED STATE   CURRENT STATE               ERROR     PORTS 

l38u6vpyq5zo   webserver.1   nginx:alpine   docker-desktop   Running         Running about an hour ago 

j0at9tnwc3tx   webserver.2   nginx:alpine   docker-desktop   Running         Running 4 minutes ago 

vj6k8cuf0rix   webserver.3   nginx:alpine   docker-desktop   Running         Running 4 minutes ago 
```

5 - Each container gets its own IP address and we will reach each one when we publish the service. We verify that all containers started correctly by reviewing their service’s logs: 
```
$ docker service logs webserver --tail 2 

webserver.1.l38u6vpyq5zo@docker-desktop    | 2023/05/14 09:06:44 [notice] 1#1: start worker process 31 

webserver.1.l38u6vpyq5zo@docker-desktop    | 2023/05/14 09:06:44 [notice] 1#1: start worker process 32 

webserver.2.j0at9tnwc3tx@docker-desktop    | 2023/05/14 09:28:02 [notice] 1#1: start worker process 33 

webserver.2.j0at9tnwc3tx@docker-desktop    | 2023/05/14 09:28:02 [notice] 1#1: start worker process 34 

webserver.3.vj6k8cuf0rix@docker-desktop    | 2023/05/14 09:28:02 [notice] 1#1: start worker process 32 

webserver.3.vj6k8cuf0rix@docker-desktop    | 2023/05/14 09:28:02 [notice] 1#1: start worker process 33 
```

6 - Let’s publish the service and verify how clients will reach the webserver: 
```
$ docker service update \ 
--publish-add published=8080,target=80 webserver 
webserver 
overall progress: 3 out of 3 tasks 

1/3: running   [==================================================>] 

2/3: running   [==================================================>] 

3/3: running   [==================================================>] 
```
We will review the service’s status again and we can notice that the instances are recreated: 
```
$ docker service ps webserver 

ID             NAME              IMAGE          NODE             DESIRED STATE   CURRENT STATE             ERROR     PORTS 

u7i2t7u60wzt   webserver.1       nginx:alpine   docker-desktop   Running         Running 26 seconds ago 

l38u6vpyq5zo    \_ webserver.1   nginx:alpine   docker-desktop   Shutdown        Shutdown 29 seconds ago 

i9ia5qjtgz96   webserver.2       nginx:alpine   docker-desktop   Running         Running 31 seconds ago 

j0at9tnwc3tx    \_ webserver.2   nginx:alpine   docker-desktop   Shutdown        Shutdown 33 seconds ago 

9duwbwjt6oow   webserver.3       nginx:alpine   docker-desktop   Running         Running 35 seconds ago 

vj6k8cuf0rix    \_ webserver.3   nginx:alpine   docker-desktop   Shutdown        Shutdown 38 seconds ago 
```

7 - We can list which port was chosen (we didn’t specify any port for the service hence port 80 was assigned to a random host port). 
```
$ docker service ls 

ID             NAME        MODE         REPLICAS   IMAGE          PORTS 

m93gsvuin5vl   webserver   replicated   3/3        nginx:alpine   *:8080->80/tcp 
```

8 - And now we can test the service with curl: 
```
$ curl localhost:8080 -I 

HTTP/1.1 200 OK 

Server: nginx/1.23.4 

... 

Accept-Ranges: bytes 
```

Repeat this curl command few times to access more than one service’s replica. 

9 - Now we can chek the logs again. 

$ docker service logs webserver --tail 2  
```
... 

webserver.2.afp6z72y7y1p@docker-desktop    | 10.0.0.2 - - [14/May/2023:10:36:11 +0000] "HEAD / HTTP/1.1" 200 0 "-" "curl/7.81.0" "-" 

... 

webserver.3.ub28rsqbo8zq@docker-desktop    | 10.0.0.2 - - [14/May/2023:10:38:11 +0000] "HEAD / HTTP/1.1" 200 0 "-" "curl/7.81.0" "-" 

... 
```

As you may have noticed, multiple replicas were reached hence internal load balancing worked as expected. 

10 - We end this lab removing the created service: 
```
$ docker service rm webserver 

webserver 
```

This lab shows us how to deploy and modify a simple replicated service. It may be interesting for you to deploy your own global service and review the differences between them. 

We will now run a simple application using a compose YAML file. 

## Deploying a complete application with Docker  

In this lab we will run a complete application using a stack object. Take a good look to the YAML file that we will use to deploy our application. 

1 - We will first create a couple of secret objects that we will use in the stack: 
```
$ echo demo|docker secret create dbpasswd.env - 

2tmqj06igbkjt4cot95enyj53 


$ docker secret create dbconfig.json dbconfig.json 

xx0pesu1tl9bvexk6dfs8xspx 
```

We have used echo for the first one to include only the string inside the dbpasswd.env secret while we have included a complete JSON file in the dbconfig.json secret. These secret names can be changed because we will use the full format for referencing them in the compose file. 

2 - To create an initial database with our own data structure we add a new config, init-demo.sh to overwrite the file included in the image: 
```
$ docker config create init-demo.sh init-demo.sh 

zevf3fg2x1a6syze2i54r2ovd 
```


3 - Let’s take a lookup at our final compose YAML file before deploying the demo stack. 
```
version: "3.9" 

services: 

  lb: 

    image: frjaraur/simplestlab:simplestlb 

    environment: # This environment definitions are in clear-text as they don’t manange any sensitive data  

      - APPLICATION_ALIAS=app # We use the service’s names 

      - APPLICATION_PORT=3000 

    networks: 

      simplestlab: 

    ports: 

    - target: 80 

      published: 8080 

      protocol: tcp 

  db: 

    image: frjaraur/simplestlab:simplestdb 

    environment: # Postgres images allows the use of a password file. 

      - POSTGRES_PASSWORD_FILE=/run/secrets/dbpasswd.env 

    networks: 

       simplestlab: 

    secrets: 

    - dbpasswd.env 

    configs: # We load a initdb script to initialize our demo database. 

    - source: init-demo.sh 

      target: /docker-entrypoint-initdb.d/init-demo.sh 

      mode: 0770 

    volumes: 

      - pgdata:/var/lib/postgresql/data 

  app: 

    image: frjaraur/simplestlab:simplestapp 

    secrets: # A secret is used to integrate de database connection into our application. 

    - source: dbconfig.json 

      target: /APP/dbconfig.json 

      mode: 0555 

    networks: 

       simplestlab: # An overlay network is created for this stack to isolate the applciation from other in the cluster 

volumes: 

  pgdata: # This volume should be mounted from a network resource availble to other hosts or the content should be synced between nodes 

networks: 

  simplestlab: 

configs: 

  init-demo.sh: 

    external: true 

secrets:  

  dbpasswd.env: 

    external: true 

  dbconfig.json: 

    external: true 
```

You may notice that all secrets and configs are defined as external resources. This will allow us to create them outside of the stack. It is not a good idea to include the secret's sensitive content in clear in your compose YAML files. 

>Important Note 
>
>We haven’t used a network volume because we are using a single node cluster here, hence it isn’t needed, but if you plan to deploy more nodes in your cluster you must prepare either a network storage or a cluster wide synchronization solution to ensure the data is available wherever the database component is running. Otherwise, your database server won’t be able to start correctly. 

4 - Now we can deploy the compose YAML as a Docker stack: 
```
$ docker stack deploy -c docker-compose.yaml chapter7 

Creating network chapter7_simplestlab 

Creating service chapter7_db 

Creating service chapter7_app 

Creating service chapter7_lb 
```

5 - We verify the status of the deployed stack. 
```
$ docker stack ps chapter7 

ID             NAME             IMAGE                              NODE             DESIRED STATE   CURRENT STATE           ERROR     PORTS 

zaxo9aprs42w   chapter7_app.1   frjaraur/simplestlab:simplestapp   docker-desktop   Running         Running 2 minutes ago 

gvjyiqrudi5h   chapter7_db.1    frjaraur/simplestlab:simplestdb    docker-desktop   Running         Running 2 minutes ago 

tyixkplpfy6x   chapter7_lb.1    frjaraur/simplestlab:simplestlb    docker-desktop   Running         Running 2 minutes ago 
```

6 - And we now review which ports are available for accessing our application: 
```
$ docker stack services chapter7 

ID             NAME           MODE         REPLICAS   IMAGE                              PORTS 

dmub9x0tis1w   chapter7_app   replicated   1/1        frjaraur/simplestlab:simplestapp 

g0gha8n57i7n   chapter7_db    replicated   1/1        frjaraur/simplestlab:simplestdb 

y2f8iw6vcr5w   chapter7_lb    replicated   1/1        frjaraur/simplestlab:simplestlb    *:8080->80/tcp 
```

7 - We can test the chapter7 application stack using our browser (http://localhost:8080): 

![applicationGUI](images/applicationGUI.png)
