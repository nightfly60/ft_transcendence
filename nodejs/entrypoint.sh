#!/bin/sh
# Tourne en root, fix les permissions, puis drop vers nodejs
chown -R nodejs:nodejs /app/src/server/public/avatars
chmod -R 755 /app/src/server/public/avatars

if [ -f /app/src/server/ia/ia_engine/main.cpp ]; then
    echo "Compilation du moteur IA..."
    g++ -std=c++17 -O2 -o /app/src/server/ia/ia_engine/ia_engine \
        /app/src/server/ia/ia_engine/main.cpp \
        /app/src/server/ia/ia_engine/minimax.cpp
    chmod +x /app/src/server/ia/ia_engine/ia_engine
fi

if [ -f /app/dist/server/ia/ia_engine/main.cpp ]; then
    echo "Compilation du moteur IA..."
    g++ -std=c++17 -O2 -o /app/dist/server/ia/ia_engine/ia_engine \
        /app/dist/server/ia/ia_engine/main.cpp \
        /app/dist/server/ia/ia_engine/minimax.cpp
    chmod +x /app/dist/server/ia/ia_engine/ia_engine
fi

exec su-exec nodejs "$@"
