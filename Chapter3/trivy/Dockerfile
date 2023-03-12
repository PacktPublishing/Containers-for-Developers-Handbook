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
