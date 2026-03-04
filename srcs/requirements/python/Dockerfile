# Choix d'une image Python officielle
FROM python:3.12-slim

# Définir un répertoire de travail (facultatif)
WORKDIR /usr/src/app

# Créer un utilisateur non-root pour sécurité (facultatif)
RUN adduser --disabled-password appuser
USER appuser

# Démarrage en shell interactif pour que tu puisses utiliser Python
CMD ["python3"]
