FROM tiltdev/tilt:latest
USER root

RUN apt-get update \
 && apt-get install -y --no-install-recommends docker.io docker-compose-plugin \
 && rm -rf /var/lib/apt/lists/*

ARG DOCKER_GID=999

# crée le groupe avec le même GID que le socket docker de l'hôte
RUN groupadd -g ${DOCKER_GID} dockerhost || true \
    # NB: on met dockerhost en GROUPE PRIMAIRE du user tilt
 && useradd -m -d /home/tilt -s /bin/bash -g dockerhost tilt || true \
 && mkdir -p /home/tilt \
 && chown -R tilt:dockerhost /home/tilt

WORKDIR /app
USER tilt
CMD ["tilt", "up", "--host=0.0.0.0"]
