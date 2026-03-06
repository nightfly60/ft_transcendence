# ft_transcendence
Chess.42

Si tu veux mettre le domain name et pas localhost -> sudo nano /etc/hosts et ajouter/remplacer 127.0.0.1 chess42.fr
 pour lance le serveur angular
    ->docker compose up --build angular  
 pour  lance cmd dams conteneur
    ->docker exec -it angular cmd

docker exec -i mariadb mysql -uroot -prootpass transcendence < mariadb/tools/seed.sql
