FROM node:alpine
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
