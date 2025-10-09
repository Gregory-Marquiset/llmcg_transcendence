FROM ghcr.io/nginxinc/nginx-unprivileged:alpine

COPY webapp/dist /usr/share/nginx/html
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf
