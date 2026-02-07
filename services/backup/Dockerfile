FROM postgres:17-alpine

RUN apk add --no-cache bash coreutils tzdata gzip

WORKDIR /app

COPY backup.sh /app/backup.sh
COPY restore.sh /app/restore.sh
COPY cron.sh /app/cron.sh

RUN chmod +x /app/backup.sh /app/restore.sh /app/cron.sh

CMD ["/app/backup.sh"]
