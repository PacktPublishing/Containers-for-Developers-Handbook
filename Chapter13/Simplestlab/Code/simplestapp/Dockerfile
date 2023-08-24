#Use this for testing the test phase in the pipeline instead of alpine:3.18.3
#FROM alpine

FROM alpine:3.18.0

#Use this for testing the test phase in the pipeline instead of nodejs=18.17.0-r0 npm=9.6.6-r0
#RUN apk --update --no-progress --no-cache  add nodejs npm
RUN apk --update --no-progress --no-cache add nodejs=18.17.1-r0 npm=9.6.6-r0
ENV APPDIR /APP

WORKDIR ${APPDIR}

COPY simplestapp.js simplestapp.js
COPY simplestapp.html simplestapp.html
COPY reset.html reset.html
COPY package.json package.json
COPY dbconfig.json dbconfig.json
RUN npm install

ADD https://github.com/chartjs/Chart.js/releases/download/v2.3.0/Chart.js .
RUN chmod 755 Chart.js
USER 1000

#NODEJS DEFAULT PORT 3000
CMD ["node","simplestapp.js","3000"]
EXPOSE 3000
