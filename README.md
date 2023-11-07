# Containers for Developers Handbook 

<a href="https://www.packtpub.com/product/containers-for-developers-handbook/9781805127987?utm_source=github&utm_medium=repository&utm_campaign=9781786461629"><img src="https://github.com/PacktPublishing/Containers-for-Developers-Handbook/blob/main/Tools/Cover.jpg" alt="" height="256px" align="right"></a>

This is the code repository for [Containers for Developers Handbook](https://www.packtpub.com/product/containers-for-developers-handbook/9781805127987?utm_source=github&utm_medium=repository&utm_campaign=9781786461629), published by Packt.

**A practical guide to developing and delivering applications using software containers**

## What is this book about?
This book is for developers and DevOps engineers looking to learn about the implementation of containers in application development, especially DevOps engineers who deploy, monitor, and maintain container-based applications running on orchestrated platforms. In general, this book is for IT professionals who want to understand Docker container-based applications and their deployment. A basic understanding of coding and frontend-backend architectures is needed to follow the examples presented in this book.

This book covers the following exciting features:
* Find out how to build microservices-based applications using containers
* Deploy your processes within containers using Docker features
* Orchestrate multi-component applications on standalone servers
* Deploy applications cluster-wide in container orchestrators
* Solve common deployment problems such as persistency or app exposure using best practices
* Review your application’s health and debug it using open-source tools
* Discover how to orchestrate CI/CD workflows using containers

If you feel this book is for you, get your [copy](https://www.amazon.com/dp/1805127985) today!

<a href="https://www.packtpub.com/?utm_source=github&utm_medium=banner&utm_campaign=GitHubBanner"><img src="https://raw.githubusercontent.com/PacktPublishing/GitHub/master/GitHub.png" 
alt="https://www.packtpub.com/" border="5" /></a>

## Instructions and Navigations
All of the code is organized into folders. For example, Chapter02.

The code will look like the following:
```
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: replicated-webserver
spec:
  replicas: 3
  selector:
    matchLabels:
      application: webserver
  template:
     metadata:
         application: webserver
     spec:
       containers:
       - name: webserver-container
         image: docker.io/nginx:alpine
```

**Following is what you need for this book:**
Software containers are the new lightweight and platform-independent application artifacts used to run the processes of an app’s components on standalone or orchestrated distributed environments. This book shows you how to create, share, and run your apps within containers using best practices and security standards with the help of different labs.

With the following software and hardware list you can run all code files present in the book (Chapter 1-13).
### Software and Hardware List
| Chapter | Software required | OS required |
| -------- | ------------------------------------ | ----------------------------------- |
| 1-13 | Docker and other software container tools | Windows, macOS, or Linux |
| 1-13 | Docker Swarm orchestrator | Windows, macOS, or Linux |
| 1-13 | Kubernetes orchestrator desktop environments, such | Windows, macOS, or Linux |
| 1-13 | Tools for monitoring, logging, and tracing, such as | Windows, macOS, or Linux |


### Related products
* The Ultimate Docker Container Book - Third Edition [[Packt]](https://www.packtpub.com/product/the-ultimate-docker-container-book-third-edition/9781804613986?utm_source=github&utm_medium=repository&utm_campaign=9781804613986) [[Amazon]](https://www.amazon.com/dp/1804613983)

* Building and Delivering Microservices on AWS [[Packt]](https://www.packtpub.com/product/building-and-delivering-microservices-on-aws/9781803238203?utm_source=github&utm_medium=repository&utm_campaign=9781803238203) [[Amazon]](https://www.amazon.com/dp/1803238208)


## Get to Know the Author
**Francisco Javier Ramírez Urea**
has been working in the IT industry since 1999 after receiving his bachelor’s degree in physical sciences. He worked as a systems administrator for years before specializing in the monitoring of networking devices, operating systems, and applications. In 2015, he started working with software container technologies as an application architecture consultant and has developed his career and evolved with these technologies ever since. He became a Docker Captain in 2018 alongside being a Docker and Kubernetes teacher with various certifications (CKA, CKS, Docker DCA and MTA, and RedHat RHCE/RHCSA). He currently works at the European Union Satellite Centre as a SecDevOps officer.

## Other books by the author
* Building and Delivering Microservices on AWS [[Packt]](https://www.packtpub.com/product/docker-certified-associate-dca-exam-guide/9781839211898) [[Amazon]](https://www.amazon.com/Delivering-Microservices-AWS-architecture-microservices/dp/1803238208)



