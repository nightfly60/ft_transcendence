FROM nginx:alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/ssl/private /etc/ssl/certs

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout /etc/ssl/private/private-key.pem \
	-out /etc/ssl/certs/selfsigned-cert.pem \
	-subj "/CN=localhost"

# Plus de COPY /browser — Angular est servi dynamiquement par ng serve

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

EXPOSE 443

CMD ["nginx"]
