
# __Chapter 3 Labs__

## __Technical requirements__
This book will teach you how to use software containers for improving your applications development. We will use opensource tools for building, sharing and running containers as well as few commercial ones that can run without licensing for non-professional use. We included in this book some labs for helping understand the content presented. These labs are published in following URL https://github.com/PacktPublishing/Docker-For-Developers-Handbook, where you will find some extended explanations, omitted in the book’s content to make chapters easier to follow.
A common laptop or desktop computer with modern CPU (Intel Core i7, i5 or equivalent AMD CPU) with 16 GB of RAM is recommended, although you would probably be able to run labs with less resources but experience may be impacted. You could use either Microsoft Windows operating system or Linux, although Linux will be used as reference. It is expected to have some Linux/Windows operating systems knowledge at user-level and coding experience in common programming languages, although examples are not complicated and will be easy to follow.

In this lab we will install another fully functional development environment for container-based applications, Rancher Desktop. By having to functional environments you will learn that no matter which tools you use, you expect to have the same results when working with containers.

We could use Docker Engine in Linux directly (container runtime only, following this link [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)) or previously installed Docker Desktop for all labs.

The first step for all labs would always be downloading the most updated version of this book’s Github repository in https://github.com/ PacktPublishing /Docker-for-Developers-Handbook.git. To do this, simply execute git clone https://github.com/PacktPublishing/Docker-for-Developers-Handbook.git to download all its content. If you already downloaded before, ensure you have the newest version by executing git pull inside its directory. 

All commands presented in these labs will be executed inside Docker-for-Developers-Handbook/Chapter3 directory. 

## Deploying and using your own local registry 

In this first lab we will deploy a simple unauthenticated and untrusted (HTTP, no HTTPS) registry. We will use the current available Docker official registry image, which is registry:2.8.1 at the time of writing this book. We can review its vulnerabilities in https://hub.docker.com/layers/library/registry/2.8.1/images/sha256-a001a2f72038b13c1cbee7cdd2033ac565636b325dfee98d8b9cc4ba749ef337?context=explore URL: 


We just pull this image: 
```
$ docker image pull docker.io/registry:2.8.1 

... 

Digest: sha256:3f71055ad7c41728e381190fee5c4cf9b8f7725839dcf5c0fe3e5e20dc5db1faStatus: Downloaded newer image for registry:2.8.1 

docker.io/library/registry:2.8.1 
```
We now review its CMD, ENTRYPOINT, VOLUME and EXPOSE keys. These will show us which command will be executed, the port will be used and which directory will be used for persistent data: 
```
$ docker image inspect docker.io/registry:2.8.1 \ 

--format="{{ .Config.Cmd }} {{.Config.Entrypoint }} {{.Config.Volumes }} {{.Config.ExposedPorts }}" 

[/etc/docker/registry/config.yml] [/entrypoint.sh] map[/var/lib/registry:{}] map[5000/tcp:{}] 
```
Port 5000 will be published, and a custom script is launched with a configuration file as argument. The directory /var/lib/registry will be used for our images; hence we will map it to a local folder in this lab. 

If you already downloaded this book’s GitHub repository, change to Chapter3 folder and follow the next steps from there. If you haven’t, please download the repository to your computer by executing git clone https://github.com/ PacktPublishing /Docker-for-Developers-Handbook.git. We will remove the long path in next prompts. 

Create a directory for registry data and execute a container using the registry image previously pulled: 
```
Chapter3$ mkdir registry-data 

Chapter3$ docker container run -P -d --name myregstry \ 

-v $(pwd)/registry-data:/var/lib/registry registry:2.8.1 
```
This command executed a container in background publishing the image’s defined port 5000. It also uses the directory we created for storing all our images by using $(pwd) to get the current directory. Adding volumes into container requires the use of the directory’s full path. 

As we identified our new container as myregistry, we can easily review its status. 
```
$ docker container ls 

CONTAINER ID   IMAGE            COMMAND                  CREATED         STATUS         PORTS                     NAMES 

1c7b40ed71d0   registry:2.8.1   "/entrypoint.sh /etc…"   7 minutes ago   Up 7 minutes   0.0.0.0:32768->5000/tcp   myregistry 
```
From this output we get our host’s port mapped to the container’s port 5000. We used –P to allow container runtime to choose any port available to publish the application’s port, therefore this port may be different in your environment. 
```
$ curl -I 0.0.0.0:32768 

HTTP/1.1 200 OK 

Cache-Control: no-cache 

Date: Sat, 11 Mar 2023 09:18:53 GMT 
```
We are now ready to start using this local registry published in port 32768 (in my example environment). 

 4 Let’s download an alpine container image and uploaded to our registry. First we need to pull this image: 
```
Chapter3$ docker pull alpine 

Using default tag: latest 

... 

Status: Downloaded newer image for alpine:latest 

docker.io/library/alpine:latest 
```
 Now, we retag the image to our repository, published and accesible locally as localhost:32768: 
```
Chapter3$ docker image tag alpine localhost:32768/alpine:0.1 
```
 We can list the local images before pushing to the local registry: 
```
Chapter3$ docker image ls |grep "alpine" 

alpine                        latest      b2aa39c304c2   3 weeks ago    7.05MB 

localhost:32768/alpine        0.1         b2aa39c304c2   3 weeks ago    7.05MB 
```
 Both images are equal, we are using a second tag to name the same image. Now we push it to our localhost:32768 registry: 
```
Chapter3$ docker image push localhost:32768/alpine:0.1 

The push refers to repository [localhost:32768/alpine] 

7cd52847ad77: Pushed 

0.1: digest: sha256:e2e16842c9b54d985bf1ef9242a313f36b856181f188de21313820e177002501 size: 528 
```
As you can see, everything works as if we were pushing to Docker Hub registry, the only difference here is that we didn’t have to login and our registry is using HTTP. We can manage this by adding a Nginx webserver in front. 

Let’s review now how images are distributed in our filesystem. 
```
Chapter3$ ls -lart registry-data/docker/registry/v2/ 

total 16 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 repositories 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 .. 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 blobs 

drwxr-xr-x 4 root root 4096 Mar  6 19:55 . 
```
There are two different directories. The repositories directory manages the metainformation for each image repository, while blobs directory stores all the layers from all container images.  

The blobs directory is distributed in many other directories to be able to manage an enormous number of layers: 
```
Chapter3$ ls -lart registry-data/docker/registry/v2/blobs/sha256/ 

total 20 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 63 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 .. 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 e2 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 b2 

drwxr-xr-x 5 root root 4096 Mar  6 19:55 . 
```
Now we will push a new image into our registry. 

We retag again the original alpine:latest image to localhost:32768/alpine:0.2: 
```
Chapter3$ docker image tag alpine localhost:32768/alpine:0.2 
```
This means that we have a new tag for the original alpine image, hence we expect that only metainformation should be modified. Let’s push the image and review the filesystem changes: 
```
$ docker image push localhost:32768/alpine:0.2 

The push refers to repository [localhost:32768/alpine] 

7cd52847ad77: Layer already exists 

0.2: digest: sha256:e2e16842c9b54d985bf1ef9242a313f36b856181f188de21313820e177002501 size: 528 
```
Notice that our localhost:32768 registry says that the image layers already exist.  
```
Chapter3$ ls -lart registry-data/docker/registry/v2/blobs/sha256/ 

total 20 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 63 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 .. 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 e2 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 b2 

drwxr-xr-x 5 root root 4096 Mar  6 19:55 . 
```
The blobs directory wasn’t changed, but let’s review the repositories directory, where image metainformation is managed: 
```
Chapter3$ ls -lart registry-data/docker/registry/v2/repositories/alpine/_manifests/tags/ 

total 16 

drwxr-xr-x 4 root root 4096 Mar  6 19:55 0.1 

drwxr-xr-x 4 root root 4096 Mar  6 19:55 .. 

drwxr-xr-x 4 root root 4096 Mar  6 19:59 0.2 

drwxr-xr-x 4 root root 4096 Mar  6 19:59 . 
```
A new folder was created to reference the layers already included inside blobs directory for both tags 0.1 and 0.2. Let’s push now a new image with some changes. 

We will now create a modified version of the original alpine.latest image by using it as base image in a new build process. We will use an on-fly build by piping a Dockerfile: 
```
Chapter3$ cat <<EOF | docker build -t localhost:32768/alpine:0.3 - 

FROM docker.io/alpine:latest 

RUN apk add --update nginx 

EXPOSE 80 

CMD ["whatever command"] 

EOF 
```
This is a different way of building images using a Dockerfile. In this case we can’t use the image content and therefore copying files wouldn’t work, but it is fine for this example. 
```
Chapter3$ cat <<EOF | docker build -t localhost:32768/alpine:0.3 - 

FROM> FROM docker.io/alpine:latest 

> RUN apk add --update nginx 

> EXPOSE 80 

> CMD ["whatever command"] 

> EOF 

[+] Building 1.3s (6/6) FINISHED 

... 

=> [1/2] FROM docker.io/library/alpine:latest                                                                              0.0s 

=> [2/2] RUN apk add --update nginx                                                                                        1.2s 

... 

=> => writing image sha256:e900ec26c76b9d779bc3d6a7f828403db07daea66c85b5271ccd94e12b460ccd                                0.0s 

=> => naming to localhost:32768/alpine:0.3 

We now push this new image and review the directories: 

Chapter3$ docker push localhost:32768/alpine:0.3 

The push refers to repository [localhost:32768/alpine] 

33593eed7b41: Pushed 

7cd52847ad77: Layer already exists 

0.3: digest: sha256:1bf4c7082773b616fd2247ef9758dfec9e3084ff0d23845452a1384a6e715c40 size: 739 
```
As you can notice, one new layer is pushed. And now we review the local folders, where image registry is storing data in our host: 
```
Chapter3$ ls -lart registry-data/docker/registry/v2/repositories/alpine/_manifests/tags/ 

total 20 

drwxr-xr-x 4 root root 4096 Mar  6 19:55 0.1 

drwxr-xr-x 4 root root 4096 Mar  6 19:55 .. 

drwxr-xr-x 4 root root 4096 Mar  6 19:59 0.2 

drwxr-xr-x 4 root root 4096 Mar  6 20:08 0.3 

drwxr-xr-x 5 root root 4096 Mar  6 20:08 . 

 Chapter3$ ls -lart registry-data/docker/registry/v2/blobs/sha256/ 

total 32 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 63 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 .. 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 e2 

drwxr-xr-x 3 root root 4096 Mar  6 19:55 b2 

drwxr-xr-x 3 root root 4096 Mar  6 20:08 c1 

drwxr-xr-x 3 root root 4096 Mar  6 20:08 e9 

drwxr-xr-x 3 root root 4096 Mar  6 20:08 1b 

drwxr-xr-x 8 root root 4096 Mar  6 20:08 . 
```
As a result of this new push, new folders are created under both repositories and blobs locations. 

We have seen how images are stored and managed inside our registry. Let’s move now to a new lab in which we will review how to sign images with a new tool, cosign. 

Signing images with Cosign 

For this new lab we are going to use a new tool, Cosign, which can be easily downloaded in different formats.  

We will install Cosign by downloading its binary. 
```
Chapter3$ mkdir bin 

Chapter3$ export PATH=$PATH:$(pwd)/bin 

Chapter3$ curl -sL -o bin/cosign https://github.com/sigstore/cosign/releases/download/v2.0.0/cosign-linux-amd64 

Chapter3$ chmod 755 bin/* 

Chapter3$ cosign --help 

A tool for Container Signing, Verification and Storage in an OCI registry. 

Usage: 

  cosign [command] 

… 
```
Once installed, we will use cosign to create our key-pair for signing images. We will use –out-prefix to ensure our keys have an appropriate name: 
```
Chapter3$ cosign generate-key-pair --output-key-prefix frjaraur 

Enter password for private key: 

Enter password for private key again: 

Private key written to frjaraur.key 

Public key written to frjaraur.pub 
```
Use your own name for your key. You will be asked for a password, use your own and remember that this will be required to sign any image. 

This will create your public and private keys: 
```
Chapter3$ ls -l 

total 12 

-rw------- 1 frjaraur frjaraur  649 Mar  7 19:51 frjaraur.key 

-rw-r--r-- 1 frjaraur frjaraur  178 Mar  7 19:51 frjaraur.pub 
```
We are going to retag to a new image name and after that we will push it: 
```
Chapter3$ docker tag localhost:32768/alpine:0.3 localhost:32768/alpine:0.4-signed 

Chapter3$ docker push localhost:32768/alpine:0.4-signed 

The push refers to repository [localhost:32768/alpine] 

dfdda8f0d335: Pushed 

7cd52847ad77: Layer already exists 

0.4-signed: digest: sha256:f7ffc0ab458dfa9e474f656afebb4289953bd1196022911f0b4c739705e49956 size: 740 
```
And now we can proceed to sign the image: 
```
Chapter3$ cosign sign --key frjaraur.key localhost:32768/alpine:0.4-signed 

Enter password for private key: 

WARNING: Image reference localhost:32768/alpine:0.4-signed uses a tag, not a digest, to identify the image to sign. 

    This can lead you to sign a different image than the intended one. Please use a 

    digest (example.com/ubuntu@sha256:abc123...) rather than tag 

    (example.com/ubuntu:latest) for the input to cosign. The ability to refer to 

    images by tag will be removed in a future release. 

        Note that there may be personally identifiable information associated with this signed artifact. 

        This may include the email address associated with the account with which you authenticate. 

        This information will be used for signing this artifact and will be stored in public transparency logs and cannot be removed later. 

By typing 'y', you attest that you grant (or have permission to grant) and agree to have this information stored permanently in transparency logs. 

Are you sure you would like to continue? [y/N] y 

tlog entry created with index: 14885625 

Pushing signature to: localhost:32768/alpine 
```
Notice the warning message. As we have learned in Chapter 2: Building Docker Images, only the image digest really ensures image uniqueness, and in this example, we are using the tags to reference the image we are signing. We should use the digest to improve the signing process and ensure we sign the right image for production, but for this example, we can continue. 

 We can now verify the signature associated with the image: 
```
Chapter3$ cosign verify --key frjaraur.pub localhost:32768/alpine:0.4-signed 

Verification for localhost:32768/alpine:0.4-signed -- 

The following checks were performed on each of these signatures: 

  - The cosign claims were validated 

  - Existence of the claims in the transparency log was verified offline 

  - The signatures were verified against the specified public key 

[{"critical":{"identity":{"docker-reference":"localhost:32768/alpine"},"image":{"docker-manifest-digest":"sha256:f7ffc0ab458dfa9e474f656afebb4289953bd1196022911f0b4c739705e49956"},"type":"cosign container image signature"},"optional":{"Bundle":{"SignedEntryTimestamp":"MEUCIQCFALeoiF8cs6zZjRCFRy//ZFujGalzoVg1ktPYFIhVqAIgI94xz+dCIVIjyAww1SUcDG22X4tjNGfbh4O4d+iSwsA=","Payload":{"body":"eyJhcGlWZXJzaW9uIjoiMC4wLjEiLCJraW5kIjoiaGFzaGVkcmVrb3JkIiwic3BlYyI6eyJkYXRhIjp7Imhhc2giOnsiYWxnb3JpdGhtIjoic2hhMjU2IiwidmFsdWUiOiI1YTNjNGU1NTc0MWQxMjRiYjI2ODJjYTEwOTZjOGM3YTFmMjNiMWZmNmIyMDkxNjhiZWZkNTU1MGMzZmVjYjM0In19LCJzaWduYXR1cmUiOnsiY29udGVudCI6Ik1FUUNJRGc5a2p0K0hvRlJCa2xZSyt4SHlER1BLRTR3WmlORUc2Y2tuQmtiRWg1Y0FpQXM5TEU4N0ZZQys5a3NqV0dHWlA4SWJ2ZWx4ZmN5UGkzaFFpN3dHZjNvK2c9PSIsInB1YmxpY0tleSI6eyJjb250ZW50IjoiTFMwdExTMUNSVWRKVGlCUVZVSk1TVU1nUzBWWkxTMHRMUzBLVFVacmQwVjNXVWhMYjFwSmVtb3dRMEZSV1VsTGIxcEplbW93UkVGUlkwUlJaMEZGZWtsVGF5c3JORUpzVDBWd1pYUmFSM05vZGtGeVREUXJUVW9yVEFwVmVVZENUV2xOVUhVd2RsUnBUSGh1TURGd1RFbDBaVVZpWnpsM1QwdFBkM1JHY0ROeGRtSlJaR3RUY0dwcVl6aDVWMkV5ZFVWVlNXSjNQVDBLTFMwdExTMUZUa1FnVUZWQ1RFbERJRXRGV1MwdExTMHRDZz09In19fX0=","integratedTime":1678215719,"logIndex":14885625,"logID":"c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d"}}}}] 
```
We can use cosign triangulate to verify if an image is signed: 
```
Chapter3$ cosign triangulate localhost:32768/alpine:0.4-signed 

localhost:32768/alpine:sha256-f7ffc0ab458dfa9e474f656afebb4289953bd1196022911f0b4c739705e49956.sig 
```
This hash is the digest referenced: 
```
Chapter3$ docker image ls --digests |grep "0.4-signed" 

localhost:32768/alpine        0.4-signed   sha256:f7ffc0ab458dfa9e474f656afebb4289953bd1196022911f0b4c739705e49956   c76f61b74ae4   24 hours ago   164MB 
```
Let’s review what happens if we now remove the signature by renaming (tags) the older original localhost:32768/alpine:0.3 image: 
```
Chapter3$ docker tag localhost:32768/alpine:0.3 localhost:32768/alpine:0.4-signed 
```
And now we push it again: 
```
Chapter3$ docker push localhost:32768/alpine:0.4-signed 

The push refers to repository [localhost:32768/alpine] 

33593eed7b41: Layer already exists 

7cd52847ad77: Layer already exists 

0.4-signed: digest: sha256:1bf4c7082773b616fd2247ef9758dfec9e3084ff0d23845452a1384a6e715c40 size: 739 
```
If we now verify again the newly pushed image: 
```
Chapter3$ cosign verify --key frjaraur.pub localhost:32768/alpine:0.4-signed 

Error: no matching signatures: 

 main.go:69: error during command execution: no matching signatures: 
```
This means that the new image doesn’t have any signature. We maintained the image repository and tag, but no signature is attached. We changed the image, and you will notice if you verify the signatures before using container images. Orchestrators such as Kubernetes can improve applications security by validating the images signatures executing a ValidatingWebHook. This will ensure that only images signed (we can also include specific signatures) will be available for creating containers. 

Now that we know how to improve security by signing and verifying their signatures, we can go a step farther by using security scanners to review any possible vulnerability in their content. 

Improving security by using image content vulnerabilities scanners 

For this lab we will use Trivy, from Aquasec. It is a very powerful security scanner for file content, misconfigurations and even Kubernetes resources. It will really help you in your daily DevOps tasks but also as a Developer. We will create our custom Trivy image for offline usage by including the online database. With this example we will also learn how to manage cached content inside our images. 

Inside Chapter3 folder you will find trivy directory, with a Dockerfile ready for you to build the mentioned custom image for this lab. 

First, we will verify the digest for the latest stable version of docker.io/trivy image by using skopeo: 
```
Chapter3$ skopeo inspect docker://aquasec/trivy:0.38.2-amd64|grep -i digest 

    "Digest": "sha256:8038205ca56f2d88b93d804d0407831056ee0e40616cb0b8d74b0770c93aaa9f", 
```
We will use this digest to ensure the right base image for our custom trivy image. We will move inside trivy folder to build our new image. Please review the Dockerfile content and write down the appropriate hash for your base image: 
```
FROM aquasec/trivy:0.38.2-amd64@sha256:8038205ca56f2d88b93d804d0407831056ee0e40616cb0b8d74b0770c93aaa9f 

LABEL MAINTAINER "frjaraur at github.com" 

LABEL TRIVY "0.38.2-amd64" 

ENV TRIVY_CACHE_DIR="/cache"  \ 

    TRIVY_NO_PROGRESS=true 

RUN TRIVY_TEMP_DIR=$(mktemp -d) \ 

  && trivy --cache-dir $TRIVY_CACHE_DIR image --download-db-only \ 

  && tar -cf ./db.tar.gz -C $TRIVY_CACHE_DIR/db metadata.json trivy.db 

ENV TRIVY_SKIP_DB_UPDATE=true 

RUN chmod 777 -R /cache 

USER nobody 

We now build our image: 

Chapter3/trivy$ docker build -t localhost:32768/trivy:custom-0.38.2 . --no-cache 

[+] Building 23.5s (7/7) FINISHED 

=> [internal] load build definition from Dockerfile                                                     0.1s 

... 

=> => writing image sha256:de8c7b30b715d05ab3167f6c8d66ef47f25603d05b8392ab614e8bb8eb70d4b3             0.1s 

=> => naming to localhost:32768/trivy:custom-0.38.2                                                     0.0s 

Now we are ready to run a scan of any image available remotely. We will test our scanner with python:alpine latest image available in Docker Hub. We will only scan for content vulnerability: 

Chapter3/trivy$ docker run -ti localhost:32768/trivy:custom-0.38.2 image python:alpine --scanners vuln --severity HIGH,CRITICAL 

2023-03-08T20:49:21.927Z        INFO    Vulnerability scanning is enabled 

2023-03-08T20:49:26.865Z        INFO    Detected OS: alpine 

2023-03-08T20:49:26.865Z        INFO    Detecting Alpine vulnerabilities... 

2023-03-08T20:49:26.869Z        INFO    Number of language-specific files: 1 

2023-03-08T20:49:26.869Z        INFO    Detecting python-pkg vulnerabilities... 

  

python:alpine (alpine 3.17.2) 

  

Total: 1 (HIGH: 1, CRITICAL: 0) 

  

┌────────────┬───────────────┬──────────┬───────────────────┬───────────────┬────────────────────────────────────────────────────────────┐ 

│  Library   │ Vulnerability │ Severity │ Installed Version │ Fixed Version │                           Title                            │ 

├────────────┼───────────────┼──────────┼───────────────────┼───────────────┼────────────────────────────────────────────────────────────┤ 

│ libcom_err │ CVE-2022-1304 │ HIGH     │ 1.46.5-r4         │ 1.46.6-r0     │ e2fsprogs: out-of-bounds read/write via crafted filesystem │ 

│            │               │          │                   │               │ https://avd.aquasec.com/nvd/cve-2022-1304                  │ 

└────────────┴───────────────┴──────────┴───────────────────┴───────────────┴────────────────────────────────────────────────────────────┘ 
```
We filtered HIGH and CRITICAL severities only to avoid any non-critical output. We used the default table format for the output, but it is possible to use JSON format, for example to include the vulnerability scanner into automated tasks. 

Image scanning will really help us decide which releases to use, or even to fix available issues in our images by understanding the vulnerabilities included in our base images. Scanning processes will usually be included in your building pipelines to ensure your workflow does not produce images with vulnerabilities that can be easily managed. 
