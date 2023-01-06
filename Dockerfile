FROM node:18-alpine
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN mkdir -p /var/www/authenticator
WORKDIR /var/www/authenticator
ADD . /var/www/authenticator
RUN npm install
CMD npm start