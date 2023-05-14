
FROM alpine:latest
RUN apk add --update --no-progress --no-cache nginx

#We well ensure that errors and access go to standard error/ouput

RUN ln -sf /dev/stdout /var/log/nginx/access.log

RUN ln -sf /dev/stderr /var/log/nginx/error.log

ENV APPLICATION_ALIAS "simplestapp" \
    APPLICATION_PORT 3000

COPY nginx.conf /etc/nginx/nginx.conf

COPY entrypoint.sh /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]

CMD nginx -g 'pid /run/nginx.pid; daemon off;'
