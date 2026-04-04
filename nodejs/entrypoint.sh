#!/bin/sh
# Tourne en root, fix les permissions, puis drop vers nodejs
chown -R nodejs:nodejs /app/src/server/public/avatars
chmod -R 755 /app/src/server/public/avatars

# Dans entrypoint.sh, avant le exec "$@"
if [ ! -f /app/src/server/ia/ia_engine/ia_engine ]; then
    echo "Compilation du moteur IA..."
    g++ -std=c++17 -O2 -o /app/src/server/ia/ia_engine/ia_engine \
        /app/src/server/ia/ia_engine/main.cpp \
        /app/src/server/ia/ia_engine/minimax.cpp
    chmod +x /app/src/server/ia/ia_engine/ia_engine
fi

exec su-exec nodejs "$@"  # su-exec est dispo sur Alpine
