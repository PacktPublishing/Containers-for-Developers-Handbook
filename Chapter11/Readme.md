# __Chapter 11 Labs__

## __Technical requirements__

The following labs will provide examples to put into practice concepts and procedures learned in this chapter. We will use Docker Desktop as container runtime and WSL2 (or you Linux/MacOS terminal) to execute the commands described. 

Ensure you have downloaded the content of this book’s GitHub repository in https://github.com/PacktPublishing/Docker-for-Developers-Handbook.git. For this chapter’s labs we will use the content of Chapter11 directory. 

You can use one of the following Kubernetes Desktop environments:
- Docker Desktop (NetworkPolicy resources are not available at the time of writting this book in this platform)
- Rancher Desktop
- Minikube
- KinD

The Ingress Controller Lab will work on any of them. Each Kubernetes desktop or platform implementation manages and presents its own networking infrastructure to the users in a different way.

These are the tasks you will find in this repository:
- We will first deploy the Kubernetes Nginx Ingress Controller (if you don’t have your own Ingress Controller in your labs platform).
- We will deploy all the manifests prepared for simplestlab application, located inside simplestlab folder. We will use kubectl create -f  simplestlab.
- Once all the components are ready, we will create an Ingress resource using the manifest prepared for this task. We will also use a more advanced Ingress manifest with a self-signed certificate and encrypt the client communications.

These labs will definitely help you understand how to improve the security of an application by isolating its components and exposing and publishing only those required for the users and other application’s components.


## Deploying your own Ingress Controller
In this first task, we will deploy our own Ingress Controller. We are using Docker Desktop, which provides a good LoadBalancer service implementation. These Service resources will attach the localhost IP address, which will makeit easy to connect to the published services.

We will use Kubernetes Nginx Ingress Controller (https://kubernetes.github.io). We will use the cloud deployment (https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml) because Docker Desktop provides LoadBalancer services. If you are using a complete baremetal infrastructure, please use the baremetal YAML (https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml) and follow the additional instructions here https://kubernetes.github.io/ingress-nginx/deploy/baremetal/ for NodePort routing.

>NOTE: Local copies are provided in the repository as [kubernetes-nginx-ingress-controller-full-install-cloud.yaml](kubernetes-nginx-ingress-controller-full-install-cloud.yaml) and [kubernetes-nginx-ingress-controller-full-install-baremetal.yaml](kubernetes-nginx-ingress-controller-full-install-baremetal.yaml)


We will just deploy the provided YAML concatenated manifest (CLOUD VERSION FOR DOCKER DESKTOP).
```
Chapter11$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
namespace/ingress-nginx created
serviceaccount/ingress-nginx created
serviceaccount/ingress-nginx-admission created
role.rbac.authorization.k8s.io/ingress-nginx created
role.rbac.authorization.k8s.io/ingress-nginx-admission created
clusterrole.rbac.authorization.k8s.io/ingress-nginx created
clusterrole.rbac.authorization.k8s.io/ingress-nginx-admission created
rolebinding.rbac.authorization.k8s.io/ingress-nginx created
rolebinding.rbac.authorization.k8s.io/ingress-nginx-admission created
clusterrolebinding.rbac.authorization.k8s.io/ingress-nginx created
clusterrolebinding.rbac.authorization.k8s.io/ingress-nginx-admission created
configmap/ingress-nginx-controller created
service/ingress-nginx-controller created
service/ingress-nginx-controller-admission created
deployment.apps/ingress-nginx-controller created
job.batch/ingress-nginx-admission-create created
job.batch/ingress-nginx-admission-patch created
ingressclass.networking.k8s.io/nginx created
validatingwebhookconfiguration.admissionregistration.k8s.io/ingress-nginx-admission created
```

We can review the workload resources created:
```
Chapter11$ kubectl get all -n ingress-nginx
NAME                                            READY   STATUS      RESTARTS   AGE
pod/ingress-nginx-admission-create-9cpnb        0/1     Completed   0          13m
pod/ingress-nginx-admission-patch-6gq2c         0/1     Completed   1          13m
pod/ingress-nginx-controller-74469fd44c-h6nlc   1/1     Running     0          13m

NAME                                         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
service/ingress-nginx-controller             LoadBalancer   10.100.162.170   localhost     80:31901/TCP,443:30080/TCP   13m
service/ingress-nginx-controller-admission   ClusterIP      10.100.197.210   <none>        443/TCP                      13m

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/ingress-nginx-controller   1/1     1            1           13m

NAME                                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/ingress-nginx-controller-74469fd44c   1         1         1       13m

NAME                                       COMPLETIONS   DURATION   AGE
job.batch/ingress-nginx-admission-create   1/1           7s         13m
job.batch/ingress-nginx-admission-patch    1/1           8s         13m
```

Notice that the ingress-nginx-controller serivce is attached to localhost IP address, thus we can check its availability in http://localhost:80 and https://localhost:443 (exposed ports).
```
Chapter11$ curl http://localhost
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx</center>
</body>
</html>

Chapter11$ curl https://localhost
curl: (60) SSL certificate problem: self-signed certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.

Chapter11$ curl -k https://localhost
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

Ingress Controller is deployed and listening, the 404 error indicates that there isn't an associated ingress with localhost host (there isn't even a default one configured, but Ingress Controller responds correclty).


## Publishing the simplelab application on Kubernetes using an Ingress Controller (No TLS)

In this lab we will deploy the simplelab, a very simplified tier-3 application, located in the ___simplestlab___ directory and publish its frontend, __lb__ component.

The manifests for the application are already written for you, we will just have to use kubectl to create an appropriate namespace for the application and then deploy all its resources:
```
Chapter11$ kubectl create ns simplestlab
namespace/simplestlab created

Chapter11$ kubectl create -n simplestlab -f simplestlab/
deployment.apps/app created
service/app created
secret/appcredentials created
service/db created
statefulset.apps/db created
secret/dbcredentials created
secret/initdb created
configmap/lb-config created
daemonset.apps/lb created
service/lb created

Chapter11$ kubectl get all -n simplestlab
NAME                       READY   STATUS    RESTARTS   AGE
pod/app-5f9797d755-5t4nz   1/1     Running   0          81s
pod/app-5f9797d755-9rzlh   1/1     Running   0          81s
pod/app-5f9797d755-nv58j   1/1     Running   0          81s
pod/db-0                   1/1     Running   0          80s
pod/lb-5wl7c               1/1     Running   0          80s

NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/app   ClusterIP   10.99.29.167    <none>        3000/TCP   81s
service/db    ClusterIP   None            <none>        5432/TCP   81s
service/lb    ClusterIP   10.105.219.69   <none>        80/TCP     80s

NAME                DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
daemonset.apps/lb   1         1         1       1            1           <none>          80s

NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/app   3/3     3            3           81s

NAME                             DESIRED   CURRENT   READY   AGE
replicaset.apps/app-5f9797d755   3         3         3       81s

NAME                  READY   AGE
statefulset.apps/db   1/1     80s
```

Our application is ready but innaccessible, the __lb__ component isn't exposed. It is listenning in port 80, but ClusterIP is used, hence the service is only available internally, cluster wide.

We will now create an Ingress resource. There are two manifests in the __ingress__ directory. We will use [simplestlab.ingress.yaml](./ingress/simplestlab.ingress.yaml), which will be deployed without custom TLS encryptation.  
```
Chapter11$ cat ingress/simplestlab.ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: simplestlab
  annotations:
    # nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: simplestlab.local.lab
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: lb
            port:
              number: 80
```

We will just deploy the previously created manifest:
```
Chapter11$ kubectl create -f ingress/simplestlab.ingress.yaml -n simplestlab
ingress.networking.k8s.io/simplestlab created

Chapter11$ kubectl get ingress -n simplestlab
NAME          CLASS   HOSTS                   ADDRESS   PORTS   AGE
simplestlab   nginx   simplestlab.local.lab             80      16s
```
We can check the defined host URL with curl:
```
Chapter11$ curl -H "host: simplestlab.local.lab" http://localhost/
<!DOCTYPE html>
<html>
<head>
    <title>Simplest Lab - (by frjaraur)</title>
    <!-- <meta charset="utf-8" http-equiv="refresh" content="5"> -->
    <script src='Chart.js'></script>

    <style>

        h2 {
            color: grey;
            text-align: left;
            font-family: "Sans-serif", Arial;
            font-style: oblique;
            font-size: 14px;
        }
        li {
            color: black;
            text-align: left;
            font-family: "Sans-serif", Arial;
            font-style: oblique;
            font-size: 10px;
        }
        a {
            color: blue;
        }
        .button {
            float: left;
            background-color: #e7e7e7;
            border: none;
            color: black;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            /*display: inline-block;*/
            font-size: 16px;
        }
        .tweet {background-color: #008CBA;}


    </style>
</head>
<body>
<h2>Auto-Refresh is enabled so a new request will be done every 5 seconds.</h2>
    <h2>Esto es un test de laboratorio</h2>
<ul>
<li>Last Request Server IP: <h2>10.1.0.171</h2></li>
<li>Last Request Server Name: <h2>app-5f9797d755-5t4nz</h2></li>
<li>Load Balancer IP: <h2>10.1.0.167</h2></li>
<li>Active Applicacion Servers: <h2>1</h2></li>
<li>Total Requests: <h2>1</h2></li>
<li>Database Server: <h2>db</h2></li>
</ul>

    <canvas id="appChart" style="display";block;></canvas>


    <script>
        var data = {
            labels: ["10.1.0.171"],
            datasets: [
                {
                    label: "Requests per Backend Server IP",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointRadius: 3,
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [1],
                }
            ]
        };
        var options = {
            animation: {
                duration:5000
            },
            responsive:false,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Hits'
                  },
                  ticks: {
                      min: 0,
                  }
                }]
            }
        };
        var ctx = document.getElementById("appChart").getContext("2d");
        ctx.canvas.width = 800;
        ctx.canvas.height = 300;
        var myNewChart = new Chart(ctx , { type: "line", data: data, options: options,});


    </script>
    <table border=0>
    <tr>
    <td><form action='/' method='post' name='request'><td>
    <button class='button' type='submit' name='action' value='app_reset'>Make Request</button>
    </form></td>
    <td><form action='/reset' method='post' name='reset'><td>
    <button class='button' type='submit' name='action' value='app_reset'>Reset App Data</button>
    </form></td>
<!--    <td>
        <a href="https://twitter.com/intent/tweet?button_hashtag=Dockerbirthday&text=Having%20Fun%20With%20@Docker,%20@Hoplasoftware%20and%20@Microsoft%20Celebrating" class="button tweet" data-related="@HoplaSoftware,user2">Tweet #Dockerbirthday</a> <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
  </td> -->
    </tr>
    </table>
</body>
</html>
</body>
</html>
```

It is available. We can change our /etc/hosts file (or equivalent MS Windows c:\system32\drivers\etc\hosts file), add the following line and open our web browser to access the simplestlab application:
```
127.0.0.1 simplestlab.local.lab
```
This requires root or Administrator access, hence it may be more interesting to use __curl__ with __-H__ or __--header__ arguments to check the application.

>NOTE: You can better use an Extension on your web browser that allows you to modify the headers of your requests. We can simply add ___simple-modify-headers extension___ if you are using MS Edge (you will find equivalent ones for other web browsers and operating systems).
>![Extension1](images/ch11-fig1.PNG)
>We can configure a __Host__ header with the value of the published host, ___simplestlab.local.lab___:
>![Extension2](images/ch11-fig2.PNG)
>Now the application is available in __http://localhost__ (notice that we defined the URL pattern as __http://locahost/*__):
>![AppGui](images/ch11-fig3.PNG)

We will now learn how to add TLS to the Ingress resource to improve our application security.

## Publishing the simplelab application on Kubernetes using an Ingress Controller (TLS)

>__IMPORTANT NOTE: For this lab to work it is required to either use _curl --resolve_ or change your hosts file.__

We will first create a self-signed certificate to use in our Ingress resource manifest.

1 - First we create our own CA, generating its key to self-sign our certificates:
```
Chapter11$ openssl genrsa -out ca.key 2048
```
2 - Now we create the CA certificate.
```
openssl req -new -x509 -days 365 -key ca.key -subj "/C=CN/ST=ES/L=MA/O=Labs/CN=Labs Root CA" -out ca.crt
```
3 - We create a request for our DNS name (___simplestlab.local.lab___):
```
Chapter11$ openssl req -newkey rsa:2048 -nodes -keyout tls.key -subj "/C=CN/ST=ES/L=MA/O=Labs/CN=*.local.lab" -out tls.csr
.+..+....+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*......+.........+.....+......+.+..+............+.........+.+......+..+.......+......+...+..+.........+...+.......+.....+.........+....+...+.....+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*...+..+....+..............+.+...+........+.......+...+............+.....+...+...+.+........+.............+..+.+..............+.+......+...+...+.........+.....+.+........+..........+..+.......+...........+.......+...+.....+....+..+.+..............+.+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
.........+.........+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*.+.....+...+......+....+.....+.+......+...+...+...+...........+....+.....+.+......+........+....+..+.+........+....+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*....+......+......+.+.....+...+....+..+..........+...+........+..........+.....+.............+.....+.+......+.....+.........+...+.......+.....+....+...........+......+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
-----
```

4 - Finally, we use the request and our CA will sign a new generated certificate associated with our ___tls.key___:
```
Chapter11$ openssl x509 -req -extfile <(printf "subjectAltName=DNS:simplestlab.local.lab") -days 365 -in tls.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out tls.crt
Certificate request self-signature ok
subject=C = CN, ST = ES, L = MA, O = Labs, CN = *.local.lab

```

A key and an associated certificate were created:
``` 
Chapter11$ ls *tls*
tls.crt  tls.key
```
And now we will create a secret with the key and certificate created:
```
Chapter11$ kubectl create secret tls -n simplestlab simplestlab-tls \
  --cert=tls.crt \
  --key=tls.key
secret/simplestlab-tls created
```

And now we can replace the old Ingress resouce, without TLS, with the following one:
```
Chapter11$ cat ingress/simplestlab.ingress-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: simplestlab
  annotations:
    # nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: simplestlab.local.lab
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: lb
            port:
              number: 80
  tls:
  - hosts:
      - simplestlab.local.lab
    secretName: simplestlab-tls
```

>NOTE: The Secret and Ingress resources must be included in the same namespace. It is also important to associate correctly the __host__ and the __tls__ sections. 

We can now replace the ___simplestlab___ Ingress resource:
```
Chapter11$ kubectl replace -f ingress/simplestlab.ingress-tls.yaml -n simplestlab
ingress.networking.k8s.io/simplestlab replaced
```

We check again with __curl__:
```
Chapter11$ curl -H "host: simplestlab.local.lab" http://localhost/
<html>
<head><title>308 Permanent Redirect</title></head>
<body>
<center><h1>308 Permanent Redirect</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

We tested port 80, and the Ingress Controller redirects our request to HTTPS.
>NOTE: We can use __-L__ to follow the redirection. This will work if you changed yor __hosts__ file.

We now test the HTTPS port. Notice that we used --resove argument. This will resolve the DNS name to 127.0.0.1 before sending the request. If you still use the header, you will get the "Ingress Fake" certificate because the host name is not read correctly:
``` 
Chapter11$ curl --resolve simplestlab.local.lab:443:127.0.0.1 https://simplestlab.local.lab/ -k -vvv
* Added simplestlab.local.lab:443:127.0.0.1 to DNS cache
* Hostname simplestlab.local.lab was found in DNS cache
*   Trying 127.0.0.1:443...
* Connected to simplestlab.local.lab (127.0.0.1) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* TLSv1.0 (OUT), TLS header, Certificate Status (22):
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS header, Certificate Status (22):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS header, Finished (20):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.2 (OUT), TLS header, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN, server accepted to use h2
* Server certificate:
*  subject: C=CN; ST=ES; L=MA; O=Labs; CN=*.local.lab
*  start date: Jul 18 11:21:28 2023 GMT
*  expire date: Jul 17 11:21:28 2024 GMT
*  issuer: C=CN; ST=ES; L=MA; O=Labs; CN=Labs Root CA
*  SSL certificate verify result: unable to get local issuer certificate (20), continuing anyway.
* Using HTTP2, server supports multiplexing
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* Using Stream ID: 1 (easy handle 0x55bd84061550)
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
> GET / HTTP/2
> Host: simplestlab.local.lab
> user-agent: curl/7.81.0
> accept: */*
>
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* old SSL session ID is stale, removing
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
< HTTP/2 200
< date: Tue, 18 Jul 2023 11:27:28 GMT
< content-type: text/html; charset=UTF-8
< strict-transport-security: max-age=15724800; includeSubDomains
<
<!DOCTYPE html>
<html>
<head>
    <title>Simplest Lab - (by frjaraur)</title>
    <!-- <meta charset="utf-8" http-equiv="refresh" content="5"> -->
    <script src='Chart.js'></script>

    <style>

        h2 {
            color: grey;
            text-align: left;
            font-family: "Sans-serif", Arial;
            font-style: oblique;
            font-size: 14px;
        }
        li {
            color: black;
            text-align: left;
            font-family: "Sans-serif", Arial;
            font-style: oblique;
            font-size: 10px;
        }
        a {
            color: blue;
        }
        .button {
            float: left;
            background-color: #e7e7e7;
            border: none;
            color: black;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            /*display: inline-block;*/
            font-size: 16px;
        }
        .tweet {background-color: #008CBA;}


    </style>
</head>
<body>
<h2>Auto-Refresh is enabled so a new request will be done every 5 seconds.</h2>
    <h2>Esto es un test de laboratorio</h2>
<ul>
<li>Last Request Server IP: <h2>10.1.0.170</h2></li>
<li>Last Request Server Name: <h2>app-5f9797d755-9rzlh</h2></li>
<li>Load Balancer IP: <h2>10.1.0.167</h2></li>
<li>Active Applicacion Servers: <h2>3</h2></li>
<li>Total Requests: <h2>12</h2></li>
<li>Database Server: <h2>db</h2></li>
</ul>

    <canvas id="appChart" style="display";block;></canvas>


    <script>
        var data = {
            labels: ["10.1.0.171","10.1.0.170","10.1.0.169"],
            datasets: [
                {
                    label: "Requests per Backend Server IP",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointRadius: 3,
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [7,4,1],
                }
            ]
        };
        var options = {
            animation: {
                duration:5000
            },
            responsive:false,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Hits'
                  },
                  ticks: {
                      min: 0,
                  }
                }]
            }
        };
        var ctx = document.getElementById("appChart").getContext("2d");
        ctx.canvas.width = 800;
        ctx.canvas.height = 300;
        var myNewChart = new Chart(ctx , { type: "line", data: data, options: options,});


    </script>
    <table border=0>
    <tr>
    <td><form action='/' method='post' name='request'><td>
    <button class='button' type='submit' name='action' value='app_reset'>Make Request</button>
    </form></td>
    <td><form action='/reset' method='post' name='reset'><td>
    <button class='button' type='submit' name='action' value='app_reset'>Reset App Data</button>
    </form></td>
<!--    <td>
        <a href="https://twitter.com/intent/tweet?button_hashtag=Dockerbirthday&text=Having%20Fun%20With%20@Docker,%20@Hoplasoftware%20and%20@Microsoft%20Celebrating" class="button tweet" data-related="@HoplaSoftware,user2">Tweet #Dockerbirthday</a> <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
  </td> -->
    </tr>
    </table>
</body>
</html>
</body>
</html>
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* Connection #0 to host simplestlab.local.lab left intact
```

Notice that we used verbose mode with curl command to verify the certificate presented by the requested url.

Now we try directly, without the defined host,. The Ingress Controller will show us a 404 error again, but we review the certificate of the connection:
````
Chapter11 $ curl https://localhost -k -I -vvv
*   Trying 127.0.0.1:443...
* Connected to localhost (127.0.0.1) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* TLSv1.0 (OUT), TLS header, Certificate Status (22):
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS header, Certificate Status (22):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS header, Finished (20):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.2 (OUT), TLS header, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN, server accepted to use h2
* Server certificate:
*  subject: O=Acme Co; CN=Kubernetes Ingress Controller Fake Certificate
*  start date: Jul 18 15:02:34 2023 GMT
*  expire date: Jul 17 15:02:34 2024 GMT
*  issuer: O=Acme Co; CN=Kubernetes Ingress Controller Fake Certificate
*  SSL certificate verify result: self-signed certificate (18), continuing anyway.
* Using HTTP2, server supports multiplexing
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* Using Stream ID: 1 (easy handle 0x562679acf550)
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
> HEAD / HTTP/2
> Host: localhost
> user-agent: curl/7.81.0
> accept: */*
>
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* old SSL session ID is stale, removing
* TLSv1.2 (IN), TLS header, Supplemental data (23):
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.2 (IN), TLS header, Supplemental data (23):
< HTTP/2 404
HTTP/2 404
< date: Tue, 18 Jul 2023 15:03:41 GMT
date: Tue, 18 Jul 2023 15:03:41 GMT
< content-type: text/html
content-type: text/html
< content-length: 146
content-length: 146
< strict-transport-security: max-age=15724800; includeSubDomains
strict-transport-security: max-age=15724800; includeSubDomains

<
* Connection #0 to host localhost left intact
```

As you can see, we obtained the Ingress Controller common Fake Certificate, included by default in the installation. Of course, this certificate can also be changed, but it will affect all yout Ingress without a specific certificate and its management will be part of the daily tasks of your Kubernetes platform administrators.