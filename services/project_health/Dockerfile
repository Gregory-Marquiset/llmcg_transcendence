FROM alpine:3.20

RUN apk add --no-cache curl postgresql-client

COPY check.sh /check.sh
RUN chmod +x /check.sh

CMD ["sh", "-c", "sleep infinity"]
