#!/bin/sh
# Tourne en root, fix les permissions, puis drop vers nodejs
chown -R nodejs:nodejs /app/src/server/public/avatars
exec su-exec nodejs "$@"  # su-exec est dispo sur Alpine
