# __Chapter 4 Labs__

## __Technical requirements__

The following labs will provide examples to put into practice concepts and procedures learned in this chapter. We will use Docker Desktop as container runtime and WSL2 (or you Linux/MacOS terminal) to execute the commands described. 

Ensure you have downloaded the content of this book’s GitHub repository in https://github.com/PacktPublishing/Docker-for-Developers-Handbook.git. For this chapter’s labs we will use the content of Chapter4 directory. 

## Reviewing containers networking concepts 

1. We will first run a container in the background that will be used as reference in other steps. 1.We will run a simple sleep command:
```
$ docker container run -d --name one alpine sleep INF 

025e24a95b6939e025afda09bb9d646651025dfecc30357732e629aced18e66b 
```
2. Now that container one is running, we will run a second one directly with a ping command. We will use one as name, to test the default bridge network DNS existence.  
```
$ docker container run -ti --rm --name two alpine ping -c1 one 

ping: bad address 'one' 
```
We verified that default bridge network doesn’t include a DNS because one name can’t be resolved, but let’s verify if communications exist. We used --rm argument to delete the container right after its execution. 

3. Let’s verify the container’s IP address by using inspect action: 
```
$ docker container inspect one --format="{{ .NetworkSettings.IPAddress }}" 

172.17.0.2 
```
And we test again if container two can reach container one: 
```
$ docker container run -ti --rm --name two --add-host one:172.17.0.2 alpine ping -c1 one 

PING one (172.17.0.2): 56 data bytes 

64 bytes from 172.17.0.2: seq=0 ttl=64 time=0.116 ms 

 --- one ping statistics --- 

1 packets transmitted, 1 packets received, 0% packet loss 

round-trip min/avg/max = 0.116/0.116/0.116 ms 
```
As expected, both containers see each other because they are running in the default bridge network. We remove the reference container to test again using a custom network.   

$ docker container rm --force one 

one 

4. We will repeat the same steps using a custom network, but first we create the new testnet network and we review its IPAM configuration: 
```
$ docker network create testnet 

582fe354cf843270a84f8d034ca9e152ac4bffe47949ce5399820e81fb0ba555 

$ docker network inspect testnet --format="{{ .IPAM.Config }}" 

[{172.18.0.0/16  172.18.0.1 map[]}] 
```
And now we start our reference container attached to this network:  
```
$ docker container run -d --net testnet --name one alpine sleep INF 

027469ad503329300c5df6019cfe72982af1203e0ccf7174fc7d0e242b7999aa 
```
This can also be done by using docker network connect NETWORK CONTAINER if the container is already running (for example if we reused the container from previous steps, attached to the bridge network, we would have been able to also connect the new custom network). 

We will now review the IP addresses assigned to containers in this custom network: 
```
$ docker network inspect testnet --format="{{ .Containers }}" 

map[027469ad503329300c5df6019cfe72982af1203e0ccf7174fc7d0e242b7999aa:{one cc99284ffccb5705605075412b0a058bc58ec2ff5738efbd8d249a45bc5d65df 02:42:ac:12:00:02 172.18.0.2/16 }] 
```
Let’s verify now the DNS resolution inside this custom network by executing a new container attached with a ping command with the first container’s name as target:  
```
$ docker container run -ti --rm --name two --net testnet alpine ping -c1 one 

PING one (172.18.0.2): 56 data bytes 

64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.117 ms 

--- one ping statistics --- 

1 packets transmitted, 1 packets received, 0% packet loss 

round-trip min/avg/max = 0.117/0.117/0.117 ms 
```
As we expected, DNS resolution and communications work when we use a custom network (which is also attached to the docker0 bridge interface by default). 

## Accessing to containers services 

In this lab we will use the created custom network and we will run a simple Nginx webserver.  

1. We run a new container using the nginx:alpine image, attached to the custom network. Notice that we didn't use --it (interactive and pseud-terminal attached) arguments because we will not interact with the Nginx process.   
```
$ docker container run -d --net testnet --name webserver nginx:alpine 

1eb773889e80f06ec1e2567461abf1244fe292a53779039a7731bd85a0f500b8 
```
We verify the running containers by using docker container ls or docker ps:  
```
$ docker ps 

CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS     NAMES 

1eb773889e80   nginx:alpine   "/docker-entrypoint.…"   4 minutes ago    Up 4 minutes    80/tcp    webserver 

027469ad5033   alpine         "sleep INF"              23 minutes ago   Up 23 minutes             one 
```
2. We get into our reference container to install curl package and test the connection to the webserver running in the custom network:  
```
$ docker container exec -ti one /bin/sh 

/ # ps -ef 

PID   USER     TIME  COMMAND 

    1 root      0:00 sleep INF 

    7 root      0:00 /bin/sh 

   26 root      0:00 ps -ef 

/ # apk add --update --no-cache curl 
fetch https://dl-cdn.alpinelinux.org/alpine/v3.17/main/x86_64/APKINDEX.tar.gz
fetch https://dl-cdn.alpinelinux.org/alpine/v3.17/community/x86_64/APKINDEX.tar.gz
(1/5) Installing ca-certificates (20220614-r4)
(2/5) Installing brotli-libs (1.0.9-r9)
(3/5) Installing nghttp2-libs (1.51.0-r0)
(4/5) Installing libcurl (7.88.1-r1)
(5/5) Installing curl (7.88.1-r1)
Executing busybox-1.35.0-r29.trigger
Executing ca-certificates-20220614-r4.trigger
OK: 9 MiB in 20 packages

/ # curl webserver -I 

HTTP/1.1 200 OK
Server: nginx/1.23.4
Date: Thu, 30 Mar 2023 19:23:51 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Tue, 28 Mar 2023 17:09:24 GMT
Connection: keep-alive
ETag: "64231f44-267"
Accept-Ranges: bytes
```

Now that we are already executing a shell within the reference container, we can verify that the reference container’s hostname is the container’s id by default before exiting: 
```
/ # hostname 

027469ad5033 

/ # exit 
```
3. We remove the webserver container because we are going to modify its main page by using a bind mount volume: 
```
$ docker container rm -fv webserver 
```
We will now create the data directory in the current path, and we will just create the index.html file by using a simple echo command: 
```
$ mkdir $(pwd)/data 

$ echo "My webserver" >data/index.html 
```
Now we execute again the webserver container, but this time we add the created directory as volume to include our index.html file: 
```
$ docker container run -d --net testnet -v $(pwd)/data:/usr/share/nginx/html --name webserver nginx:alpine 

b94e7a931d2fbe65fab58848f38a771f7f66ac8306abce04a3ac0ec7e0c5e750 
```
4. And we will test again the webserver service:  
```
$ docker container exec -ti one curl webserver 
My webserver 
```
If we run a new webserver container using the same volume, we will obtain the same result, because this directory provides the persistency for static contentt 
```
$ docker container run -d --net testnet -v $(pwd)/data:/usr/share/nginx/html --name webserver2 nginx:alpine 

$ docker container exec -ti one curl webserver2 
My webserver 
```
We can now change the content of the index.html file and verify the result: 
```
$ echo "My webserver 2" >data/index.html 

$ docker container exec -ti one curl webserver2 
My webserver 2 
```
Notice that we can change the static content with the container in a running state. If your application manages static content, you will be able to verify the changes online while developing; but this may not work for your application if your processes read the information while they start. In these cases, you will need to restart/recreate your containers. 

We finally remove the second webserver: 
```
$ docker container rm -fv webserver2 
webserver2 
```
Notice that we used --fv argument to force remove the container (stop it if it was running) and the associated volumes (in this case we used a bind mount which will never be removed by the container runtime, so don’t worry about this type of mounts).  We will also launch our webserver by using the extended mount definition just to understand its usage: 
```
$ docker container run -d --net testnet –name webserver \ 
--mount type=bind,source=$(pwd)/data,target=/usr/share/nginx/html \ 
nginx:alpine 

b2446c4e77be587f911d141238a5a4a8c1c518b6aa2a0418e574e89dc135d23b 

$ docker container exec -ti one curl webserver 
My webserver 2 
```

5. We will now test the behavior of a named volume:  
```
$ docker container run -d --net testnet -v WWWROOT:/usr/share/nginx/html --name webserver nginx:alpine fb59d6cf6e81dfd43b063204f5fd4cdbbbc6661cd4166bcbcc58c633fee26e86 

$ docker container exec -ti one curl webserver 

<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

As you can verify, Nginx‘s default page is shown. But we can copy our index.html page inside the webserver’s WWWROOT named volume by using cp action:  
```
$ docker cp data/index.html webserver:/usr/share/nginx/html 
```
And we can test again to verify the changes:  
```
$ docker container exec -ti one curl webserver 
My webserver 2 
```
As we have seen in this lab, we can manage persistent data inside containers using volumes and we can send (you can use the same command for retrieving container’s content). We also tested all the internal communications; we didn’t expose any service outside of the container runtime environment. We will remove both webserver containers if they still exist: 
```
$ docker rm -f webserver webserver2 
```
And now we can move to the next lab. 

## Exposing applications 

In this lab, we will expose the application’s containers outside of the container runtime’s internal networks. 

1. We will use --publish-all or -P argument to publish all the image’s defined exposed ports: 
```
$ docker container run -d --net testnet -P -v WWWROOT:/usr/share/nginx/html --name webserver nginx:alpine 
dc658849d9c34ec05394a3d1f41377334261283092400e0a0de4ae98582238a7 

$ docker ps 

CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS                   NAMES 

dc658849d9c3   nginx:alpine   "/docker-entrypoint.…"   14 seconds ago   Up 12 seconds   0.0.0.0:32768->80/tcp   webserver 

027469ad5033   alpine         "sleep INF"              23 hours ago     Up 23 hours                             one 
```
You may have noticed that a NAT port is created. Consecutive host’s ports will be used within the port range 32768-61000.  

2. We will now check the service from our host. We can use either localhost, 127.0.0.1 or 0.0.0.0 as IP address because we didn’t specify any of the host’s IP addresses:  
```
$ curl 127.0.0.1:32768 
My webserver 2 
```
3. Let’s use now the host network:  

>NOTE: If you are using the host network in Linux directly, you will be able to connect directly to your container’s ports, even if they aren’t exposed. This doesn’t work in WSL environments directly, but you will use this behavior in cluster environments.  

As we already have curl installed on one container, we can commit these changes to prepare a new image for running new containers with curl: 
```
$ docker container commit one myalpine 
sha256:6732b418977ae171a31a86460315a83d13961387daacf5393e965921499b446e 
```
Now we can use this new container attaching the host network to verify how network changed:  
```
$ docker container run -d --net host --name two myalpine sleep INF 
885bcf52115653b05645ee10cb2862bab7eee0199c0c1b99e367d8329a8cc601 
```
If we use inspect, we will notice that no IP addresses will be associated with the container via the container runtime. Instead, all host’s network interfaces will be attached to the containers.  
```
$ docker container exec -ti two ip add show|grep "inet " 

    inet 127.0.0.1/8 scope host lo 

    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0 

    inet 192.168.65.4 peer 192.168.65.5/32 scope global eth0 

    inet 172.18.0.1/16 brd 172.18.255.255 scope global br-582fe354cf84 
```
But you should notice that DNS containers resolution doesn’t work in the host network: 
```
$ docker container exec -ti two curl webserver -I 
curl: (6) Could not resolve host: webserver 
```
4. We retrieve the webserver’s IP address to access it via the host network container:  
```
$ docker container inspect webserver --format="{{ .NetworkSettings.Networks.testnet.IPAddress }}" 
172.18.0.3 

$ docker container exec -ti two curl 172.18.0.3 
My webserver 2 
```

## Limiting containers resources usage 

In this lab we will review how to limit the host’s memory inside a container. 

1. First, we will create a custom image including stress-ng application: 
```
$ cat <<EOF|docker build -q -t stress - 
FROM alpine:latest 
RUN apk add --update --no-cache stress-ng 
EOF 

sha256:4158ba4e466c974dee2a13ebc5a32462b38f687b28004a2dd79caf97ae764a08 
```
2. Now we can test how ___stress-ng___ works by using just one worker process and a maximum memory of 1024 megabytes: 
```
$ docker run -d --name stress stress stress-ng  --vm-bytes 1024M  --fork 1 -m 1 
2bea5bcba3a9609e0f47b7c27b24fde9767a75764b4a9bb628ba696f569da001 
```
3. We use docker stats to retrieve the current container’s resources usage: 
```
$ docker stats --no-stream 

CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT     MEM %     NET I/O     BLOCK I/O   PIDS 
2bea5bcba3a9   stress    219.77%   1.017GiB / 9.236GiB   11.01%    836B / 0B   0B / 0B     5 
```
We can wait few seconds and run this command again or simply execute docker stats for retrieve the statistics continuously: 
```
$ docker stats --no-stream 

CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT     MEM %     NET I/O     BLOCK I/O   PIDS 
2bea5bcba3a9   stress    217.13%   1.015GiB / 9.236GiB   10.99%    906B / 0B   0B / 0B     5 
```
4. We will kill the current stress container and run it again limiting its access to host’s memory:   
```
$ docker container kill stress 
stress 

$ docker run -d --name stress-limmited  --memory 128M stress stress-ng --vm-bytes 1024M  --fork 1 -m 1 
238e34215885f5fc20b0ff157f17b18e6559720c7453064a1c7aedb9cb635284 
```
Now we execute again the stats action continuously (to show the output in this book we execute it using --no-stream few times) and we can verify that although stress-ng runs a process with 1024 megabytes, the container never uses that amount of memory:  
```
$ docker stats --no-stream 

CONTAINER ID   NAME              CPU %     MEM USAGE / LIMIT   MEM %     NET I/O       BLOCK I/O   PIDS 

ff3f4797af43   stress-limmited   166.65%   125.1MiB / 128MiB   97.74%    1.12kB / 0B   0B / 0B     4 
```
Waiting few seconds and executing again: 
```
$ docker stats --no-stream 

CONTAINER ID   NAME              CPU %     MEM USAGE / LIMIT   MEM %     NET I/O       BLOCK I/O   PIDS 
ff3f4797af43   stress-limmited   142.81%   127MiB / 128MiB     99.19%    1.12kB / 0B   0B / 0B     5 
```
As we expected, memory usage is limited. You can verify what happened by reviewing the current host’s system log. The container runtime uses cgroups to limit the container’s use of resources and the kernel launched the OOM-Killer feature to kill the processes consuming more memory than expected: 
```
$ dmesg|grep -i oom 

[22893.337110] oom_reaper: reaped process 19232 (stress-ng), now anon-rss:0kB, file-rss:0kB, shmem-rss:32kB 

[22893.915193] stress-ng invoked oom-killer: gfp_mask=0xcc0(GFP_KERNEL), order=0, oom_score_adj=1000 

[22893.915221]  oom_kill_process.cold+0xb/0x10 

[22893.915307] [  pid  ]   uid  tgid total_vm      rss pgtables_bytes swapents oom_score_adj name 

[22893.915316] oom-kill:constraint=CONSTRAINT_MEMCG,nodemask=(null),cpuset=ff3f4797af43980e7ea223cbee27b39921dbaa84b61f22d8dcfb409347ba4a5a,mems_allowed=0,oom_memcg=/docker/ff3f4797af43980e7ea223cbee27b39921db 
```
This kernel feature is killing the stress-ng worker processes, but it launches more (this is the normal stress-ng behavior, but your applications may die in case OOM-Killer is asked to destroy your processes).  

5. We finish this lab by simply removing the used containers: 
```
$ docker container rm --force stress-limmited 
stress-limmited 
```

## Avoid using root user inside containers   

This quick lab will show you how to run a Nginx webserver without root. But first we will review what happens when you change the Nginx default environment: 

1. We review the user that a default nginx:alpine image will use by simply executing a new webserver: 
```
$ docker container run -d --publish 8080:80 --name webserver nginx:alpine 
cbcd52a7ca480606c081edc63a59df5b6a237bb2891a4f4bb2ae68f9882fd0b3 

$ docker container ls 
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                  NAMES 

cbcd52a7ca48   nginx:alpine   "/docker-entrypoint.…"   7 seconds ago   Up 6 seconds   0.0.0.0:8080->80/tcp   webserver 
```

As expected, it is running and serving in host’s port 8080:  
```
$ curl 0.0.0.0:8080 -I 

HTTP/1.1 200 OK
Server: nginx/1.23.4
Date: Fri, 31 Mar 2023 19:28:24 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Tue, 28 Mar 2023 17:09:24 GMT
Connection: keep-alive
ETag: "64231f44-267"
Accept-Ranges: bytes
```
  

And we can retrieve its logs: 
```
$ docker logs webserver 

/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
/docker-entrypoint.sh: Configuration complete; ready for start up
2023/03/31 19:26:57 [notice] 1#1: using the "epoll" event method
2023/03/31 19:26:57 [notice] 1#1: nginx/1.23.4
2023/03/31 19:26:57 [notice] 1#1: built by gcc 12.2.1 20220924 (Alpine 12.2.1_git20220924-r4)
2023/03/31 19:26:57 [notice] 1#1: OS: Linux 5.10.16.3-microsoft-standard-WSL2
2023/03/31 19:26:57 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1048576:1048576
2023/03/31 19:26:57 [notice] 1#1: start worker processes
2023/03/31 19:26:57 [notice] 1#1: start worker process 30
2023/03/31 19:26:57 [notice] 1#1: start worker process 31
2023/03/31 19:26:57 [notice] 1#1: start worker process 32
2023/03/31 19:26:57 [notice] 1#1: start worker process 33
172.17.0.1 - - [31/Mar/2023:19:28:18 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.81.0" "-"
```
The log shows the request we actually do to the published service and all the nginx main process output (standard output and error). We can limit the number of lines shown by using --tail 2 (this will show only the last 2 lines of the container’s log): 
```
$ docker logs webserver --details --timestamps --tail 5 

2023-03-31T19:29:35.362006700Z  172.17.0.1 - - [31/Mar/2023:19:29:35 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.81.0" "-" 

2023-03-31T19:29:39.427574300Z  172.17.0.1 - - [31/Mar/2023:19:29:39 +0000] "HEAD / HTTP/1.1" 200 0 "-" "curl/7.81.0" "-" 
```
Notice that we also used __--timestamp__ to show the container runtime’s included timestamp. This may be very useful when the running application does not provide any timestamp. 

By default, Nginx writes to /var/log/nginx/access.log and /var/log/nginx/error.log. It is very interesting for you to learn how this container’s image developers did the job of making the processes write in /dev/stdout and /dev/stderr. This can be read in the following link github.com/nginxinc/docker-nginx/blob/73a5acae6945b75b433cafd0c9318e4378e72cbb/mainline/alpine-slim/Dockerfile. An extract with the current important lines is show here: 
```
# forward request and error logs to docker log collector 

    && ln -sf /dev/stdout /var/log/nginx/access.log \ 

    && ln -sf /dev/stderr /var/log/nginx/error.log \ 
```

We will now check the user running this instance: 
```
$ docker exec -ti webserver id 

uid=0(root) gid=0(root) groups=0(root),1(bin),2(daemon),3(sys),4(adm),6(disk),10(wheel),11(floppy),20(dialout),26(tape),27(video) 
```

As we already discussed in this chapter, running containers as non-root should always be preferred, so let’s remove this container and create a new safer one (without root): 
```
$ docker container rm webserver --force -v 
webserver 
```

We will try changing the current 0 user (root) for a common 1000 id: 
```
$ docker container run -d --publish 8080:80 --name webserver  --user 1000 nginx:alpine 
6fce3675a104ca658454d33bfa5f38fb48a0c7f71defd56caf70886c94c82e89 
```

As we expected, issues appear because this image isn’t ready for running as non-root user: 
```
$ docker logs webserver 

/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
10-listen-on-ipv6-by-default.sh: info: can not modify /etc/nginx/conf.d/default.conf (read-only file system?)
/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
/docker-entrypoint.sh: Configuration complete; ready for start up
2023/04/01 11:36:03 [warn] 1#1: the "user" directive makes sense only if the master process runs with super-user privileges, ignored in /etc/nginx/nginx.conf:2
nginx: [warn] the "user" directive makes sense only if the master process runs with super-user privileges, ignored in /etc/nginx/nginx.conf:2
2023/04/01 11:36:03 [emerg] 1#1: mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)
nginx: [emerg] mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied) 
```

We can try to modify this image behavior by adding a volume for the problematic path, but even with this change it will not work. Nginx should avoid using port 80 because it is system-restricted or add special capabilities such as NET_BIND_SERVICE. Instead of changing the current image behavior, we will use a new image from Nginx Inc. We can find this image and its information in the following link https://hub.docker.com/r/nginxinc/nginx-unprivileged#!.  
```
$ docker search nginxinc 

NAME                                         DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
nginxinc/nginx-unprivileged                  Unprivileged NGINX Dockerfiles                  90
nginxinc/ingress-demo                        Ingress Demo                                    2
nginxinc/nginx-s3-gateway                    Authenticating and caching gateway based on …   1
nginxinc/amplify-agent                       NGINX Amplify Agent docker repository           1
lqsun666/nginxinc-ingress_ubuntu                                                             0
nginxinc/mra-fakes3                                                                          0
nginxinc/ngx-rust-tool                                                                       0
nginxinc/mra_python_base                                                                     0
nginxinc/nginmesh_proxy_init                                                                 0
marthydavid/nginxinc-ingress                                                                 0
b0nyb0y/nginxinc                                                                             0
juniorh/nginxinc-nginx-ingress                                                               0
nginxinc/nginmesh_proxy_debug                                                                0
impartsecurity/nginxinc-ingress-controller                                                   0
sergeidc/docker-nginx-entrypoint             nginxinc/docker-nginx + entrypoint.sh           0                    [OK]
nginxinc/mra-content-service                                                                 0
nginxinc/mra-album-manager                                                                   0
nginxinc/mra-photouploader                                                                   0
nginxinc/mra-photoresizer                                                                    0
nginxinc/mra-user-manager                                                                    0
nginxinc/mra-auth-proxy                                                                      0
nginxinc/mra-pages                                                                           0
scubakiz/nginxcolordemo                      Based on nginxinc/ingress-demo with differen…   0
dukaan/nginxinc                                                                              0
ohenenyame/nginxinc-nginx-unprivileged       Saleor image                                    0
```
2. We just pull the image from Docker Hub and review the ports and user used: 
```
$ docker image pull nginxinc/nginx-unprivileged:alpine-slim -q 

docker.io/nginxinc/nginx-unprivileged:alpine-slim 
```
We use docker inspect: 
```
$ docker image inspect nginxinc/nginx-unprivileged:alpine-slim --format="{{ .Config.ExposedPorts }} {{ .Config.User }}" 

map[8080/tcp:{}] 101 
```
And we run a container by publishing port 8080 in our host’s port 8080. Notice we used --publish, this option allows us to even use a specific IP address from our host in the format IP:host_port:container_port:   
```
$ docker container run -d --publish 8080:8080 --name webserver nginxinc/nginx-unprivileged:alpine-slim 

369307cbd5e8b74330b220947ec41d4f263ebfe7727efddae3efbcc3a1610e5e 

$ docker container ps 

CONTAINER ID   IMAGE                                     COMMAND                  CREATED          STATUS          PORTS                    NAMES 

369307cbd5e8   nginxinc/nginx-unprivileged:alpine-slim   "/docker-entrypoint.…"   15 seconds ago   Up 13 seconds   0.0.0.0:8080->8080/tcp   webserver 
```
3. We test again our webserver and review the logs:  
```
$ curl 0.0.0.0:8080  -I 

HTTP/1.1 200 OK
Server: nginx/1.23.3
Date: Sat, 01 Apr 2023 11:41:36 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Tue, 13 Dec 2022 18:23:05 GMT
Connection: keep-alive
ETag: "6398c309-267"
Accept-Ranges: bytes

$ docker logs --tail 2 webserver 

2023/04/01 11:40:29 [notice] 1#1: start worker process 32 

172.17.0.1 - - [01/Apr/2023:11:41:36 +0000] "HEAD / HTTP/1.1" 200 0 "-" "curl/7.81.0" "-" 
```

4. We review the webserver’s user: 
```
$ docker exec webserver id 

uid=101(nginx) gid=101(nginx) groups=101(nginx) 
```

As we expected, this webserver application runs using a non-privileged user and it’s safer than the one running as root. You as developer must prioritize the usage of non-privileged users in your applications to improve the components security.   

## Cleaning the container runtime 

To finish this chapter’s labs we will quickly clean all the objects created during the labs by using a combination of commands: 

1. Kill all the running containers (we can also remove them using a single line, but we will only kill them before using prune action): 
```
$ docker ps -q|xargs docker kill 

6f883a19a8f1 
3e37afe57357 
369307cbd5e8 
```
We piped two commands. The first command retrieves the list of all the running containers, but -q argument is used to only show the containers’ ids. Then we pipe the result using xargs command to docker kill. This combination actually kills all the running containers.  

2. Now we can use docker system prune to remove all the objects created. We will use --all to remove all the unused images and the volumes by adding –volumes (you will be asked for confirmation): 
```
$ docker system prune --all --volumes 

WARNING! This will remove: 

  - all stopped containers 

  - all networks not used by at least one container 

  - all volumes not used by at least one container 

  - all images without at least one container associated to them 

  - all build cache 

Are you sure you want to continue? [y/N] y
Deleted Containers:
6f883a19a8f1a32f6dae19c440c4b8b10e554005b548e01c47d5f38e96644baf
3e37afe573570dffa72bc679273c9fc0b0fe64f78436cda2aeb4693ef7598149
369307cbd5e8b74330b220947ec41d4f263ebfe7727efddae3efbcc3a1610e5e
2bea5bcba3a9609e0f47b7c27b24fde9767a75764b4a9bb628ba696f569da001

Deleted Networks:
test

Deleted Volumes:
NGINXCACHE
WWWROOT

Deleted Images:
untagged: alpine:latest
untagged: alpine@sha256:124c7d2707904eea7431fffe91522a01e5a861a624ee31d03372cc1d138a3126
deleted: sha256:9ed4aefc74f6792b5a804d1d146fe4b4a2299147b0f50eaf2b08435d7b38c27e
untagged: stress:latest
deleted: sha256:4158ba4e466c974dee2a13ebc5a32462b38f687b28004a2dd79caf97ae764a08
untagged: nginx:alpine
untagged: nginx@sha256:c94a22b036afa972426b82d5b0a49c959786005b4f6f81ac7467ca5538d0158f
deleted: sha256:8e75cbc5b25c8438fcfe2e7c12c98409d5f161cbb668d6c444e02796691ada70
deleted: sha256:f301a4112756ab559d9c78e8ed3625dab81f91803dfeabbc4f9184c878b1f3b1
deleted: sha256:d794631f2dea08ec92bc28f93ac8c1079c505aef791e86cc2bd5566904d2d581
deleted: sha256:0d2f2fd89d17527e0808abf8debc4d22c1b3670894eeb12ecee580fe05719dec
deleted: sha256:13ec71ce1944eb1de9f7fe3bbee31e4355476075b70f8b395a68d90ca849f111
deleted: sha256:8997729a28eb948a9a00aa56b19143cff03e0ced25280473fff15c461860dfa7
deleted: sha256:193b9708a46833ccb84791d3d58bf0d5428c37fc8fd80c951d3ca15cca5091c6
untagged: nginxinc/nginx-unprivileged:alpine-slim
untagged: nginxinc/nginx-unprivileged@sha256:bf70b7b69e9e5bfa7add429f9d2c869686c9ee86d7ca3a035bc893215ffb24ec
deleted: sha256:67887065954a68df5c2d60ef745bd5268ab9f84aa3bc3e01e503b0798d192188
deleted: sha256:3c10219cfc0924495dc9ab37bcfc5862efcbe307e4042028d6fe2e30428d72ab
deleted: sha256:153e0af61a552ef532893675f035599b0afcf6f7ea74a31643138d5bd3993b8f
deleted: sha256:770d1e3ffbddfcee3b62287720b02ed3368cd53bd97ccbd23df14cde6ce1aa6d
deleted: sha256:1c79ee9c9a13c299f199c20788e07139ef5924b1a65af5a8e78a2c95b35df032
deleted: sha256:7853e2d14c1915cbb19ef835c447a72d73b752a6862e8200419b86eedfd1fe66
deleted: sha256:d08f159b1262280d2dbae95eb2d6a0cd38d0bc1254e18009cc8b1b533e0041ab
deleted: sha256:7cd52847ad775a5ddc4b58326cf884beee34544296402c6292ed76474c686d39

Deleted build cache objects:
j9emy01g8g0t186ee3lt3ruxm
kn2mz16th7sc2j2r7kxvp9c87
viukddoxiz5dxehhfru9eb2b1
tskmxp62cjbmaww3tm8uq60qc

Total reclaimed space: 49.95MB 
```
After few seconds, your system will be clean, and we can start the next chapter’s labs without old objects. We can verify this by executing docker system df: 
```
$ docker system df 

TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE 

Images          0         0         0B        0B 

Containers      0         0         0B        0B 

Local Volumes   0         0         0B        0B 

Build Cache     0         0         0B        0B 
```
In these labs we have covered almost all the content reviewed in this chapter.