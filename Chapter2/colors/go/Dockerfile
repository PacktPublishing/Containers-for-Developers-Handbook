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
