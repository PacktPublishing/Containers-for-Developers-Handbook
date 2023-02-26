
# __Chapter 1 Labs__

## __Technical requirements__
This book will teach you how to use software containers for improving your applications development. We will use opensource tools for building, sharing and running containers as well as few commercial ones that can run without licensing for non-professional use. We included in this book some labs for helping understand the content presented. These labs are published in following URL https://github.com/PacktPublishing/Docker-For-Developers-Handbook, where you will find some extended explanations, omitted in the book’s content to make chapters easier to follow.
A common laptop or desktop computer with modern CPU (Intel Core i7, i5 or equivalent AMD CPU) with 16 GB of RAM is recommended, although you would probably be able to run labs with less resources but experience may be impacted. You could use either Microsoft Windows operating system or Linux, although Linux will be used as reference. It is expected to have some Linux/Windows operating systems knowledge at user-level and coding experience in common programming languages, although examples are not complicated and will be easy to follow.

In this lab we will install another fully functional development environment for container-based applications, Rancher Desktop. By having to functional environments you will learn that no matter which tools you use, you expect to have the same results when working with containers.

We could use Docker Engine in Linux directly (container runtime only, following this link [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)) or previously installed Docker Desktop for all labs.

## __Installing Rancher Desktop__

This first part of the lab will guide you through the easy process of installing Rancher Desktop by following the steps documented in the following link https://docs.docker.com/get-docker/. Rancher Desktop on windows will fully integrate with WSL2 (Windows Subsystem for Linux). We will use “Ubuntu” WSL distribution for both, Docker Desktop and Rancher Desktop. You just have to be aware that only one of them should be used at time.

Let’s continue with Docker Desktop installation. Download the installer from the following URL https://docs.docker.com/get-docker/.
![Docker URL](./images/ch1_lab4.png) 
Once downloaded, execute the “Docker Desktop Installer.exe” binary. You will be asked to choose between Hyper-V or WSL2 backend virtualization and we will choose WSL2.
![Docker Desktop WSL2](./images/ch1_lab5.png)

After clicking “OK” button, installation process will begging uncompressing required files (libraries, binaries, default configurations, ...etc). This could take some time (1-3 minutes) depending on your host’s disk speed and compute resources.
![Docker Desktop Installation](./images/ch1_lab5.png)

As final step, we will be asked to logout and login again because our user was added to new system groups (docker) to enable access to remote docker daemon via operating system pipes (similar to Unix sockets).
![Docker Desktop Installed](./images/ch1_lab6.png)

Once we login, we can execute Docker Desktop using the newly added application icon. We can enable Docker Desktop execution on start and this could be very useful for you but it may slow down your computer if you are short of resources. I recommend start Docker Desktop only when we are going to use it.
We accept redacted Docker Subscription license terms and Docker Desktop will start. This may take a minute.
![Docker Desktop Starting](./images/ch1_lab7.png)

You can skip the quick guide that will appear when Docker Desktop is running, because we will learn more in next chapters, deep diving in container images building and containers execution. 
We will get following screen, showing us that Docker Desktop is ready.
![Docker Desktop Started](./images/ch1_lab8.png)

But we will need to enable WSL2 integration with our favorite Linux distribution.
![Docker Desktop WSL2 Integration](./images/ch1_lab9.png)

After this step, we are finally ready to work with Docker Desktop. We will open a terminal using our “Ubuntu” distribution and execute “docker” and after that, “docker info”.
![Docker Desktop WSL2 Terminal](./images/ch1_lab10.png)

As you can see, we have a fully functional Docker client command-line associated with Docker Desktop WSL2 server.

We will end this lab executing an Alpine container (small Linux distribution), reviewing its process tree and the list of its root file system.
![Docker Desktop WSL2 Docker Info](./images/ch1_lab11.png)

This container execution left changes in Docker Desktop; we can review the current images present in our container runtime.
 ![Docker Desktop Alpine Image](./images/ch1_lab13.png)

And the container, already dead because we exited by simple executing “exit” inside its shell.
![Docker Desktop Alpine Container](./images/ch1_lab13.png)

Docker Desktop works and we are ready to follow next labs by using our WSL2 “Ubuntu” Linux distribution.


---
The following labs will provide examples to put into practice concepts and procedures learned in this chapter. We will use either Docker Desktop or any other container runtime. We will use different tools such as Podman, Nerdctl to show you some of the possibilities you have at hand; although some of the features required for specific labs may be only available on a specific tool (or it has a more friendly interface). In these cases, we will ask you to use a specific command-line interface.
First step for all labs would always be downloading the most updated version of this book’s Github repository in https://github.com/frjaraur/Docker-for-Developers-Handbook.git. To do this, simply execute git clone https://github.com/frjaraur/Docker-for-Developers-Handbook.git to download all its content. If you already downloaded before, ensure you have the newest version by executing git pull inside its directory.
We will start this section with a simple lab about using caching to speed up the building process. All commands presented in these labs will be executed inside Docker-for-Developers-Handbook/Chapter2 directory.


>NOTE: For the mere purpose of show you different tools for working with containers, we will use in these labs nerdctl, podman or docker clients to run commands against containerd or docker container runtimes. Each tool has its own features and particularities but most of the work within containers will execute similar. We will explicitly notify you if some command shown requires a specific tool. Follow the specific instructions for installing each tool you will find in this book’s github code repository.

In the first lab we are going to review the importance of caching to speed up the building process. We are going to use nerdctl, but docker or podman will work, as well as buildah (https://buildah.io), which is another opensource tool prepared specifically for enhancing the build process.

1 - We will build a simple nodejs application I prepared for quick demos years ago. Its only purpose is showing some information regarding the container in which it runs, requests headers and its version. It would be interesting to better understand the load balancing processes within container orchestrators later on in this book, but we should focus on the build process now.
We will move inside Chapter2/colors folder and execute a simple build using ch2lab1:first as image name and tag. The Dockerfile we are going to use in this process is the following:
```
$ cat nodejs/Dockerfile
FROM docker.io/node:18.14.2-alpine3.16
LABEL org.opencontainers.image.authors=frjaraur
LABEL org.opencontainers.image.vendor="Docker for Developers"
LABEL org.opencontainers.artifact.description="Simple Dockerfile"
LABEL language="NodeJS"
ENV APPDIR /APP
WORKDIR ${APPDIR}
COPY package.json package.json
RUN apk add --no-cache --update curl \
&& rm -rf /var/cache/apk \
&& npm install
COPY app.js app.js
COPY index.html index.html
CMD ["node","app.js","3000"]
EXPOSE 3000
```

Notice that we separated here the content copy in three lines; although we could have used just one with all the content, for example by using COPY . . .


>NOTE: As you should have noticed, this Dockerfile does not include any USER directive, but it application runs without any privileges because it is very simple and doesn’t use any Linux capability or privileged port. Anyway, it is good practice to include USER directive and you may add it in your own local repository. Everything described in the next steps will work. 
We will add time to the build command to measure the time the build process takes.
```
$ time nerdctl build -t ch2lab1:first --label nodejs=18.14.2 --label=base=alpine3.16 nodejs  --progress plain
#1 [internal] load .dockerignore
#1 transferring context: 2B done
#1 DONE 0.0s

#2 [internal] load build definition from Dockerfile
#2 transferring dockerfile: 311B done
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/node:18.14.2-alpine3.16
#3 DONE 1.1s

#4 [internal] load build context
#4 transferring context: 90B done
#4 DONE 0.0s

#5 [1/6] FROM docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe
#5 resolve docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe 0.0s done
#5 DONE 0.1s

#5 [1/6] FROM docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe
#5 sha256:aef46d6998490e32dcd27364100923d0c33b16165d2ee39c307b6d5b74e7a184 0B / 2.35MB 0.2s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 0B / 47.30MB 0.2s
#5 sha256:ef5531b6e74e7865f5d142926b572d742ad47c153211de707903b4f5dd8d9e77 0B / 2.81MB 0.2s
#5 sha256:aef46d6998490e32dcd27364100923d0c33b16165d2ee39c307b6d5b74e7a184 1.05MB / 2.35MB 0.3s
#5 sha256:aef46d6998490e32dcd27364100923d0c33b16165d2ee39c307b6d5b74e7a184 2.10MB / 2.35MB 0.5s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 3.15MB / 47.30MB 0.8s
#5 sha256:ef5531b6e74e7865f5d142926b572d742ad47c153211de707903b4f5dd8d9e77 1.05MB / 2.81MB 0.9s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 7.34MB / 47.30MB 1.2s
#5 sha256:ef5531b6e74e7865f5d142926b572d742ad47c153211de707903b4f5dd8d9e77 2.10MB / 2.81MB 1.4s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 11.53MB / 47.30MB 1.7s
#5 extracting sha256:ef5531b6e74e7865f5d142926b572d742ad47c153211de707903b4f5dd8d9e77 0.1s done
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 14.68MB / 47.30MB 2.0s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 17.83MB / 47.30MB 2.3s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 22.02MB / 47.30MB 2.6s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 25.17MB / 47.30MB 2.9s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 29.36MB / 47.30MB 3.2s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 32.51MB / 47.30MB 3.5s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 35.65MB / 47.30MB 3.8s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 40.89MB / 47.30MB 4.2s
#5 sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 45.09MB / 47.30MB 4.5s
#5 extracting sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9
#5 extracting sha256:2ee5eed78815ddaf19f0b33934c04c2a4cb0ed846965c0d785d2ae8e42af0db9 1.0s done
#5 DONE 5.8s

#5 [1/6] FROM docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe
#5 extracting sha256:aef46d6998490e32dcd27364100923d0c33b16165d2ee39c307b6d5b74e7a184 0.0s done
#5 extracting sha256:6973845f2d4c66a6dd4cbf94112fe879fecef90ee90a4f37ff324c50390f6444 done
#5 DONE 5.8s

#6 [2/6] WORKDIR /APP
#6 DONE 0.2s

#7 [3/6] COPY package.json package.json
#7 DONE 0.0s

#8 [4/6] RUN apk add --no-cache --update curl && rm -rf /var/cache/apk && npm install
#0 0.115 fetch https://dl-cdn.alpinelinux.org/alpine/v3.16/main/x86_64/APKINDEX.tar.gz
#8 0.273 fetch https://dl-cdn.alpinelinux.org/alpine/v3.16/community/x86_64/APKINDEX.tar.gz
#8 0.503 (1/5) Installing ca-certificates (20220614-r0)
#8 0.526 (2/5) Installing brotli-libs (1.0.9-r6)
#8 0.563 (3/5) Installing nghttp2-libs (1.47.0-r0)
#8 0.573 (4/5) Installing libcurl (7.83.1-r6)
#8 0.601 (5/5) Installing curl (7.83.1-r6)
#8 0.618 Executing busybox-1.35.0-r17.trigger
#8 0.620 Executing ca-certificates-20220614-r0.trigger
#8 0.637 OK: 10 MiB in 21 packages
#8 3.247
#8 3.247 added 3 packages, and audited 4 packages in 2s
#8 3.247
#8 3.247 found 0 vulnerabilities
#8 3.248 npm notice
#8 3.248 npm notice New patch version of npm available! 9.5.0 -> 9.5.1
#8 3.248 npm notice Changelog: <https://github.com/npm/cli/releases/tag/v9.5.1>
#8 3.248 npm notice Run `npm install -g npm@9.5.1` to update!
#8 3.248 npm notice
#8 DONE 3.3s

#9 [5/6] COPY app.js app.js
#9 DONE 0.0s

#10 [6/6] COPY index.html index.html
#10 DONE 0.0s

#11 exporting to oci image format
#11 exporting layers
#11 exporting layers 0.2s done
#11 exporting manifest sha256:7f63598f21445e5c6a051c9eca9c89367152dd59a4f1af366dc3291ae3e01930 done
#11 exporting config sha256:bd160dd9aa860794d2556f85c0489eb98470c73b3f55001c16b0ed863cc1bef7 done
#11 sending tarball
#11 sending tarball 0.6s done
#11 DONE 0.8s
unpacking docker.io/library/ch2lab1:first (sha256:7f63598f21445e5c6a051c9eca9c89367152dd59a4f1af366dc3291ae3e01930)...
Loaded image: docker.io/library/ch2lab1:first
real    0m12.588s
user    0m0.009s
sys     0m0.000s
```
The time the process tooks to build this image was 12.588 seconds; which is not bad, but as far as I remember, this project has few dependencies and NodeJS is a “Just In Time” code language. Imagine this process if we need to download code dependencies and compile it to obtain some binaries. It can take minutes or even more. 

2 - Let’s execute a new build after making some small changes in our code. We will just modify the version variable, line 30 in nodejs/app.js file. 
Change from var APP_VERSION="1.0"; to any other value, for example 
var APP_VERSION="1.1";.
Execute again the first step with a new tag. And notice the CACHED lines in the output.
```
$ time nerdctl build -t ch2lab1:second --label nodejs=18.14.2 --label=base=alpine3.16  nodejs  --progress plain
#1 [internal] load .dockerignore
#1 transferring context: 2B done
#1 DONE 0.0s

#2 [internal] load build definition from Dockerfile
#2 transferring dockerfile: 311B done
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/node:18.14.2-alpine3.16
#3 DONE 0.4s

#4 [internal] load build context
#4 transferring context: 3.28kB done
#4 DONE 0.0s

#5 [1/6] FROM docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe
#5 resolve docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe 0.0s done
#5 DONE 0.0s

#6 [2/6] WORKDIR /APP
#6 CACHED

#7 [3/6] COPY package.json package.json
#7 CACHED

#8 [4/6] RUN apk add --no-cache --update curl && rm -rf /var/cache/apk && npm install
#8 CACHED

#9 [5/6] COPY app.js app.js
#9 DONE 0.0s

#10 [6/6] COPY index.html index.html
#10 DONE 0.0s

#11 exporting to oci image format
#11 exporting layers 0.0s done
#11 exporting manifest sha256:bfffba0cd2d7cc82f686195b0b996731d0d5a49e4f689a3d39c7b0e6c57dcf0e done
#11 exporting config sha256:e71303d10fe345f77985bad5dbd520f3f77212b2a6a492550d88708d1e3f749d done
#11 sending tarball
#11 sending tarball 0.6s done
#11 DONE 0.7s
unpacking docker.io/library/ch2lab1:second (sha256:bfffba0cd2d7cc82f686195b0b996731d0d5a49e4f689a3d39c7b0e6c57dcf0e)...
Loaded image: docker.io/library/ch2lab1:second
real    0m1.272s
user    0m0.007s
sys     0m0.000s
```

All steps before copying our app.js file (step 9), used the cached layers. Starting from step 9, everything has to be recreated. But because we used the appropriate logic in our Dockerfile, everything worked as expected. If you copy all the content of your code folder at once, any change will trigger a new layer, hence if we change cosmetics in index.html or our simple code in app.js, all the packages will be downloaded again. 

3 - Let’s repeat the process by changing the copy process in our Dockerfile.
```
FROM docker.io/node:18.14.2-alpine3.16
LABEL org.opencontainers.image.authors=frjaraur
LABEL org.opencontainers.image.vendor="Docker for Developers"
LABEL org.opencontainers.artifact.description="Simple Dockerfile"
LABEL language="NodeJS"
ENV APPDIR /APP
WORKDIR ${APPDIR}
COPY . .
RUN apk add --no-cache --update curl \
&& rm -rf /var/cache/apk \
&& npm install
CMD ["node","app.js","3000"]
EXPOSE 3000
```

We execute the build process again. We expect it to last less than 12 seconds because the base image is already in our host.
```
$ time nerdctl build -t ch2lab1:third --label nodejs=18.14.2 --label=base=alpine3.16  nodejs  --progress plain
#1 [internal] load .dockerignore
#1 transferring context: 2B done
#1 DONE 0.0s

#2 [internal] load build definition from Dockerfile
#2 transferring dockerfile: 243B done
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/node:18.14.2-alpine3.16
#3 DONE 0.8s

#4 [internal] load build context
#4 DONE 0.0s

#5 [1/4] FROM docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe
#5 resolve docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe 0.0s done
#5 DONE 0.0s

#6 [2/4] WORKDIR /APP
#6 CACHED

#4 [internal] load build context
#4 transferring context: 3.89kB done
#4 DONE 0.0s

#7 [3/4] COPY . .
#7 DONE 0.0s

#8 [4/4] RUN apk add --no-cache --update curl && rm -rf /var/cache/apk && npm install
#0 0.109 fetch https://dl-cdn.alpinelinux.org/alpine/v3.16/main/x86_64/APKINDEX.tar.gz
#8 0.228 fetch https://dl-cdn.alpinelinux.org/alpine/v3.16/community/x86_64/APKINDEX.tar.gz
#8 0.507 (1/5) Installing ca-certificates (20220614-r0)
#8 0.538 (2/5) Installing brotli-libs (1.0.9-r6)
#8 0.573 (3/5) Installing nghttp2-libs (1.47.0-r0)
#8 0.584 (4/5) Installing libcurl (7.83.1-r6)
#8 0.610 (5/5) Installing curl (7.83.1-r6)
#8 0.628 Executing busybox-1.35.0-r17.trigger
#8 0.629 Executing ca-certificates-20220614-r0.trigger
#8 0.646 OK: 10 MiB in 21 packages
#8 2.760
#8 2.760 added 3 packages, and audited 4 packages in 2s
#8 2.761
#8 2.761 found 0 vulnerabilities
#8 2.761 npm notice
#8 2.761 npm notice New patch version of npm available! 9.5.0 -> 9.5.1
#8 2.761 npm notice Changelog: <https://github.com/npm/cli/releases/tag/v9.5.1>
#8 2.761 npm notice Run `npm install -g npm@9.5.1` to update!
#8 2.761 npm notice
#8 DONE 2.8s

#9 exporting to oci image format
#9 exporting layers
#9 exporting layers 0.1s done
#9 exporting manifest sha256:b38074f0ee5a9e6c4ee7f68e90d8a25575dc7df9560b0b66906b29f3feb8741c done
#9 exporting config sha256:c5ec1480ff37eaf15bb291b7f08935f299471d4234ff8648f0f614b6b4eaacdc done
#9 sending tarball
#9 sending tarball 0.6s done
#9 DONE 0.8s
unpacking docker.io/library/ch2lab1:third (sha256:b38074f0ee5a9e6c4ee7f68e90d8a25575dc7df9560b0b66906b29f3feb8741c)...
Loaded image: docker.io/library/ch2lab1:third
real    0m4.634s
user    0m0.004s
sys     0m0.003s
```
It took 4.634 seconds, which is not bad, but remember that this is an example.

4 - Change again the APP_VERSION to a new value variable to see what happens if we build again. Change from var APP_VERSION="1.1"; to var APP_VERSION="1.2";: 
```
$ grep APP_VERSION  nodejs/app.js
var APP_VERSION="1.2";
```
And execute the build process again:
```
$ time nerdctl build -t ch2lab1:fourth --label nodejs=18.14.2 --label=base=alpine3.16  nodejs  --progress plain
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 243B done
#1 DONE 0.0s

#2 [internal] load .dockerignore
#2 transferring context: 2B done
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/node:18.14.2-alpine3.16
#3 DONE 0.7s

#4 [1/4] FROM docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe
#4 resolve docker.io/library/node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe 0.0s done
#4 DONE 0.0s

#5 [internal] load build context
#5 transferring context: 3.48kB done
#5 DONE 0.0s

#6 [2/4] WORKDIR /APP
#6 CACHED

#7 [3/4] COPY . .
#7 DONE 0.0s

#8 [4/4] RUN apk add --no-cache --update curl && rm -rf /var/cache/apk && npm install
#0 0.084 fetch https://dl-cdn.alpinelinux.org/alpine/v3.16/main/x86_64/APKINDEX.tar.gz
#8 0.172 fetch https://dl-cdn.alpinelinux.org/alpine/v3.16/community/x86_64/APKINDEX.tar.gz
#8 0.307 (1/5) Installing ca-certificates (20220614-r0)
#8 0.320 (2/5) Installing brotli-libs (1.0.9-r6)
#8 0.335 (3/5) Installing nghttp2-libs (1.47.0-r0)
#8 0.341 (4/5) Installing libcurl (7.83.1-r6)
#8 0.350 (5/5) Installing curl (7.83.1-r6)
#8 0.358 Executing busybox-1.35.0-r17.trigger
#8 0.360 Executing ca-certificates-20220614-r0.trigger
#8 0.376 OK: 10 MiB in 21 packages
#8 3.433
#8 3.433 added 3 packages, and audited 4 packages in 3s
#8 3.433
#8 3.433 found 0 vulnerabilities
#8 3.434 npm notice
#8 3.434 npm notice New patch version of npm available! 9.5.0 -> 9.5.1
#8 3.434 npm notice Changelog: <https://github.com/npm/cli/releases/tag/v9.5.1>
#8 3.434 npm notice Run `npm install -g npm@9.5.1` to update!
#8 3.434 npm notice
#8 DONE 3.5s

#9 exporting to oci image format
#9 exporting layers 0.1s done
#9 exporting manifest sha256:75ba902c55459593f792c816b8da55a673ffce3633f1504800c90ec9fd214d26 done
#9 exporting config sha256:64c7d3a84839ebb8f41a5249a2bfc6b58260c8dfbdac9a35c4bc8883338701fb done
#9 sending tarball
#9 sending tarball 0.6s done
#9 DONE 0.8s
unpacking docker.io/library/ch2lab1:fourth (sha256:75ba902c55459593f792c816b8da55a673ffce3633f1504800c90ec9fd214d26)...
Loaded image: docker.io/library/ch2lab1:fourth
real    0m5.210s
user    0m0.007s
sys     0m0.000s
```
As you can see, it takes the same time as previous execution due to the fact that container runtime can’t identify and isolate the small changes and reuse the layers created before.
In this lab we reviewed how layers cache works and how to avoid build problems by choosing the right logic for our application’s Dockerfile. 
In the next lab we are going to simply execute a multistage build process using an empty layer for the final image. This is a very interesting use case thanks to the fact that our code is in Go language, and we included static dependencies.

---
1 - We will move to Chapter2/colors folder, and we will use the go sub-folder this time. The multistage Dockerfile looks like the following code:
```
FROM golang:1.20-alpine3.17 AS builder
WORKDIR /src
COPY ./src/* .
RUN mkdir bin && go build -o bin/webserver /src/webserver.go
  
FROM scratch
LABEL org.opencontainers.image.authors=frjaraur
LABEL org.opencontainers.image.vendor="Docker for Developers"
LABEL org.opencontainers.artifact.description="Multistage Example"
LABEL language="Go"
WORKDIR /app
COPY --from=builder /src/bin/webserver .
CMD ["/app/webserver"]
USER 1000
EXPOSE 3000
```

We use a golang:1.20-alpine3.17 image to compile our code and the compiled binary is copied from “builder” image to our final image.
```
$ nerdctl build -t ch2lab1:go.1 --label golang=1.20 --label=base=alpine3.17  go  --progress plain
#1 [internal] load .dockerignore
#1 transferring context: 2B done
#1 DONE 0.0s

#2 [internal] load build definition from Dockerfile
#2 transferring dockerfile: 293B done
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/golang:1.20-alpine3.17
#3 DONE 1.6s

#4 [stage-1 1/2] WORKDIR /app
#4 DONE 0.0s

#5 [internal] load build context
#5 transferring context: 363B done
#5 DONE 0.0s

#6 [builder 1/4] FROM docker.io/library/golang:1.20-alpine3.17@sha256:48f336ef8366b9d6246293e3047259d0f614ee167db1869bdbc343d6e09aed8a
#6 resolve docker.io/library/golang:1.20-alpine3.17@sha256:48f336ef8366b9d6246293e3047259d0f614ee167db1869bdbc343d6e09aed8a 0.0s done
#6 extracting sha256:a2d21d5440ebff5aaaaeb115a003f7a4a3897f1866a87de95bc4a21436fc563c 0.0s done
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 0B / 100.63MB 0.2s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 5.24MB / 100.63MB 0.3s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 10.49MB / 100.63MB 0.5s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 15.73MB / 100.63MB 0.6s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 20.97MB / 100.63MB 0.8s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 26.21MB / 100.63MB 0.9s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 31.46MB / 100.63MB 1.1s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 36.70MB / 100.63MB 1.2s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 41.94MB / 100.63MB 1.4s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 52.43MB / 100.63MB 1.7s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 61.87MB / 100.63MB 2.0s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 67.11MB / 100.63MB 2.1s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 72.35MB / 100.63MB 2.3s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 77.59MB / 100.63MB 2.4s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 82.84MB / 100.63MB 2.6s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 88.08MB / 100.63MB 2.7s
#6 sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 93.32MB / 100.63MB 2.9s
#6 DONE 3.2s

#6 [builder 1/4] FROM docker.io/library/golang:1.20-alpine3.17@sha256:48f336ef8366b9d6246293e3047259d0f614ee167db1869bdbc343d6e09aed8a
#6 extracting sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d
#6 extracting sha256:752c438cb1864d6b2151010a811031b48f0c3511c7aa49f540322590991c949d 1.6s done
#6 extracting sha256:07244a03b3147bcdf5c1256e62110d50e31af7af76ef53aae3bcc9da8410dcdc done
#6 DONE 4.8s

#7 [builder 2/4] WORKDIR /src
#7 DONE 0.2s

#8 [builder 3/4] COPY ./src/* .
#8 DONE 0.0s

#9 [builder 4/4] RUN mkdir bin && go build -o bin/webserver /src/webserver.go
#9 DONE 3.3s

#10 [stage-1 2/2] COPY --from=builder /src/bin/webserver .
#10 DONE 0.0s

#11 exporting to oci image format
#11 exporting layers
#11 exporting layers 0.2s done
#11 exporting manifest sha256:527a2d2f49c7ea0083f0ddba1560e0fc725eb26ade22c3990bb05260f1558b0b done
#11 exporting config sha256:b58c49c4a041b4fff5d0785445ccf24863f9078fbcde414f1e35ee91d59942ef done
#11 sending tarball 0.1s done
#11 DONE 0.3s
unpacking docker.io/library/ch2lab1:go.1 (sha256:527a2d2f49c7ea0083f0ddba1560e0fc725eb26ade22c3990bb05260f1558b0b)...
Loaded image: docker.io/library/ch2lab1:go.1
```

The final image is really small because it contains only our applications code.
```
$ nerdctl image ls
REPOSITORY    TAG       IMAGE ID        CREATED              PLATFORM       SIZE         BLOB SIZE
ch2lab1       one     7f63598f2144    2 hours ago          linux/amd64    186.6 MiB    51.7 MiB
ch2lab1       go.1      527a2d2f49c7    4 minutes ago        linux/amd64    6.3 MiB      3.6 MiB
```

You can compare in this output the different sizes we obtained (sizes may change because some updates may be expected in the code in github book’s repository).
Images from scratch using binaries can be very tricky to make, but definitely they are the best way of delivering our applications.
This lab showed you how you can create a container image from scratch by using static build binaries, which indeed are the best application images you can create.
For the next labs we are going to use Docker’s buildx features and therefore, we will use docker command-line. If you followed the lab with Rancher Desktop, WSL and nerdctl command-line, please exit Rancher Desktop and launch Docker Desktop (or your own docker engine implementation).

---
>NOTE: __Podman__ and __Nerdctl__ also provide multiplatform on new releases and multi-architecture build is commonly available, hence any of these tools will be right for this lab.

You will notice that when you change from one container runtime to another, the list of images is completely different. Each container runtime manages its own environment as expected.
We continue this lab inside Chapter2/colors folder. We are going to build the image for multiple architectures, amd64 and arm64.

1 - We will use buildx with –platform argument with arm64. But first, we will ensure that we can build images for other architectures by executing docker buildx ls command:
```
$ docker buildx ls
NAME/NODE     DRIVER/ENDPOINT STATUS  BUILDKIT PLATFORMS
default *     docker
  default     default         running 20.10.22 linux/amd64, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6
```

2 - Now we are ready to execute the arm64 architecture build:
```
$ docker buildx build -t ch2lab1:six \
  --label nodejs=18.14.2 \
  --label=base=alpine3.16 \
  nodejs --progress plain \
  --platform arm64
  --load –no-cache
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 32B done
#1 DONE 0.0s
 
#2 [internal] load .dockerignore
#2 transferring context: 2B done
#2 DONE 0.0s
 
#3 [internal] load metadata for docker.io/library/node:alpine
#3 DONE 1.5s
 
#4 [1/6] FROM docker.io/library/node:alpine@sha256:667dc6ed8fc6623ccd21cb5fa355c90f848daaf5d6df96bc940869bfdf91c19a
#4 DONE 0.0s
 
#5 [2/6] WORKDIR /APP
#5 CACHED
 
#6 [internal] load build context
#6 transferring context: 90B done
#6 DONE 0.0s
 
#7 [3/6] COPY package.json package.json
#7 DONE 0.0s
 
#8 [4/6] RUN apk add --no-cache --update curl && rm -rf /var/cache/apk && npm install
#8 0.348 fetch https://dl-cdn.alpinelinux.org/alpine/v3.17/main/aarch64/APKINDEX.tar.gz
#8 0.753 fetch https://dl-cdn.alpinelinux.org/alpine/v3.17/community/aarch64/APKINDEX.tar.gz
#8 1.204 (1/5) Installing ca-certificates (20220614-r4)
…
…
#8 1.341 Executing busybox-1.35.0-r29.trigger
#8 1.366 Executing ca-certificates-20220614-r4.trigger
#8 1.618 OK: 12 MiB in 22 packages
#8 9.044
#8 9.044 added 3 packages, and audited 4 packages in 5s
#8 9.048
#8 9.048 found 0 vulnerabilities
#8 9.051 npm notice
#8 9.053 npm notice New patch version of npm available! 9.5.0 -> 9.5.1
…
#8 9.055 npm notice Run `npm install -g npm@9.5.1` to update!
#8 9.055 npm notice
#8 DONE 9.1s
 
#9 [5/6] COPY app.js app.js
#9 DONE 0.0s
 
#10 [6/6] COPY index.html index.html
#10 DONE 0.0s
 
#11 exporting to image
#11 exporting layers 0.1s done
#11 writing image sha256:2588e9451f156ca179694c5c5623bf1c80b9a36455e5f162dae6b111d8ee00fd
#11 writing image sha256:2588e9451f156ca179694c5c5623bf1c80b9a36455e5f162dae6b111d8ee00fd done
#11 naming to docker.io/library/ch2lab1:six done
#11 DONE 0.1s
```
As you may notice, arm64 Alpine image was used even though we used the same Dockerfile from previous labs.

3 - We verify this image architecture by using docker inspect:
```
$ docker image inspect ch2lab1:six
[
    {
        "Id": "sha256:2588e9451f156ca179694c5c5623bf1c80b9a36455e5f162dae6b111d8ee00fd",
        "RepoTags": [
            "ch2lab1:six"
        ],
        "RepoDigests": [],
        "Parent": "",
        "Comment": "buildkit.dockerfile.v0",
        "Created": "2023-02-25T19:58:49.189637361Z",
        "Container": "",
        "ContainerConfig": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": null,
            "Cmd": null,
            "Image": "",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": null
        },
        "DockerVersion": "",
        "Author": "",
        "Config": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "3000/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NODE_VERSION=19.7.0",
                "YARN_VERSION=1.22.19",
                "APPDIR=/APP"
            ],
            "Cmd": [
                "node",
                "app.js",
                "3000"
            ],
            "ArgsEscaped": true,
            "Image": "",
            "Volumes": null,
            "WorkingDir": "/APP",
            "Entrypoint": [
                "docker-entrypoint.sh"
            ],
            "OnBuild": null,
            "Labels": {
                "base": "alpine3.16",
                "nodejs": "18.14.2"
            }
        },
        "Architecture": "arm64",
        "Os": "linux",
        "Size": 180164042,
        "VirtualSize": 180164042,
        "GraphDriver": {
            "Data": {
                "LowerDir": "/var/lib/docker/overlay2/ptru5oz9bczi71joek4p2s2fk/diff:/var/lib/docker/overlay2/r8gmqcsr7m9qmahsxuvsqec4f/diff:/var/lib/docker/overlay2/swlwpy01ddu8timbz0ssyfsfm/diff:/var/lib/docker/overlay2/jcpdoo7v3qevig62utakaxael/diff:/var/lib/docker/overlay2/d6f661d0fae7b8f7dedf52f615a88917c0272a5cd926ca2f8d448005711af125/diff:/var/lib/docker/overlay2/3b824ca4ee172275bb493a998c974d1243e31cf00ade318f9eb9e7b86ad632ba/diff:/var/lib/docker/overlay2/7de94f9b0fb5eb9235ac985f185a2be7856fab54432bb42c82428f7c7f561e9c/diff:/var/lib/docker/overlay2/5034bfc97d9d6d2878cfd260270d41fc01962c668dd0aad92772c3f24ac8bbcd/diff",
                "MergedDir": "/var/lib/docker/overlay2/zf56wa969f1pj0fmi7qte0kcj/merged",
                "UpperDir": "/var/lib/docker/overlay2/zf56wa969f1pj0fmi7qte0kcj/diff",
                "WorkDir": "/var/lib/docker/overlay2/zf56wa969f1pj0fmi7qte0kcj/work"
            },
            "Name": "overlay2"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:edf70074bd40c0b1216367c29c18d453b43cc69e5123268ba66dd45d86a9e8a8",
                "sha256:fe3516b3bd7c17c94eafedf279073f4d0a49aa117d7230093c08151c374e99b9",
                "sha256:f3d76c8a1bb5d1870c9cfbf93c9bc30237337b71f456d889a906bca5da6589d3",
                "sha256:fcc2e8e52b6ce29e841df07d0be7206a63e832ef464310986d33f8a9f57f6a25",
                "sha256:3df15f8f070f6734fc7873d314efa4d64ffbb7a7c3ca51619258943855148dea",
                "sha256:51bb50c92081d613fb4f320d786f4810d143b0a99734385b27c2565eca9bc0df",
                "sha256:caeee56e7f34c944b6aabb7cb9b59515b08d5fe26d7d7cd91d96b4e16dd534e1",
                "sha256:beab781484aa56d3b672cb385d1529f39d54b362f4eb5af7adc0592727669173",
                "sha256:0c51a7f9e5698b84f443e157decbce0f89da1b2ce8116c7f95892fb3be81d9d3"
            ]
        },
        "Metadata": {
            "LastTagTime": "0001-01-01T00:00:00Z"
        }
    }
]
```
Filtering the specific architecture value:
``` 
$ docker image inspect ch2lab1:six --format='{{.Architecture}}'
arm64
```

The final image is prepared for arm64 architectures and can be used for example in some QNAP NAS platforms.
In this build process we also used __--load__ and __--no-cache__. The first argument is used to load the image built into our container runtime. If we don’t use this with docker buildx, image in used as cache for new builds only by default. To avoid any cached layer within this build process, we used –no-cache and this ensures the complete execution of each step defined in the Dockerfile. 
This lab showed you that you can prepare your images for any available architecture using a unified Dockerfile and executing the build process with __--platform__ argument.