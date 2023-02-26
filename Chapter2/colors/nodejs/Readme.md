
## Building

~~~
	git clone https://github.com/frjaraur/colors.git

	docker build -t codegazers/colors:VERSION .

	docker build -t frjaraur/colors:VERSION .
~~~

Simple Usage (Random):

~~~
docker service create --name colors \
	--publish target=3000,published=8000 \
	frjaraur/colors:VERSION
~~~

To access pages just curl on service port.
For text version use
~~~
	curl http://localhost:8000/text
~~~

For health check use
~~~
	curl http://localhost:8000/health
~~~

## We can include '/tmp/down' inside container to set 'down' app status.
## Headers will change status too (AppStatus will change from UP to DOWN).
~~~
$ curl -vvv 0.0.0.0:8000/health
*   Trying 0.0.0.0...
* Connected to 0.0.0.0 (127.0.0.1) port 8000 (#0)
> GET /health HTTP/1.1
> Host: 0.0.0.0:8000
> User-Agent: curl/7.47.0
> Accept: */*
> 
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=UTF-8
< AppStatus: DOWN
< Date: Thu, 06 Sep 2018 15:38:46 GMT
< Connection: keep-alive
< Transfer-Encoding: chunked
< 
I am DOWN, thanks for asking
* Connection #0 to host 0.0.0.0 left intact
~~~


## Docker EE Interlock Demo
~~~
version: "3.3"
# A Docker Compose file for configuration of the development environment

services:
  red:
    image: frjaraur/colors:1.4
    environment:
      - COLOR=red
    deploy:
     replicas: 1
     labels:
        com.docker.lb.hosts: red.example.com
        com.docker.lb.network: colors
        com.docker.lb.port: 3000
    networks:
      - colors


  blue:
    image: frjaraur/colors:1.4
    environment:
      - COLOR=blue
    deploy:
     replicas: 1
     labels:
        com.docker.lb.hosts: blue.example.com
        com.docker.lb.network: colors
        com.docker.lb.port: 3000
    networks:
      - colors

networks:
  colors:
~~~

## We then use 
~~~
$ curl -vvv -H "host: blue.example.com" http://<YOUR_UCP_FQDN>:<YOUR_UCP_INTERLOCK_HTTP_PORT>
~~~