# *This project has been created as part of the 42 curriculum by aabouyaz, edurance, lemarian and rcini-ha*

# Summary
[1. Description](#1-description)\
[2. Instructions](#2-instructions)\
[3. Resources](#3-resources)\
[4. Usage Documentation](#4-usage-documentation)

## 1. Description
Our Transcendence is about developing an interactive web platorm based on the game of chess. Chess42 allows users to play in different modes: solo, against AI or against other players.
It also includes progression elements and social features to enhance user experience.
To simplify access, authentification is supported through services such as Google and the 42 intranet.

## 2. Instructions

### Prerequisites
Make sure you have at least the following installed on your system:
- Docker
- Docker Compose
- Make

### Environment Variables

Before starting the project, you need to create a `.env` file. An example configuration is provided in `.env.example`.

```
make # docker compose up --build
make down # docker compose down
make status # docker compose ps (with prints)
make fclean # docker compose down & cleans volumes (images and databse)
make re # make fclean & make
```

## 3. Resources

### Documentation and References

The following ressources were used during the developpement of the project:
- [Docker documentation](https://docs.docker.com/) - Containerization and environment managment
- [How Game of Kings is implemented](https://scratch.mit.edu/discuss/topic/248984/?page=5#post-2967632) - Technical references related to chess
- [Chess Programming Wiki](https://www.chessprogramming.org/Main_Page), [The algorithmic flaw to beat a chess AI](https://www.youtube.com/watch?v=0oH-eqODWXI), [API Stockfish-like Wiki](https://chess-api.com/) - References for chess engine concepts
- [Stack Overflow](https://stackoverflow.com) - Forum for dev support

### Use of Artificial Intelligence

Artificial intelligence tools were used during the project as development aids.\
They were mainly used to:
- Clarify technical concepts and documentation
- Explore possible approaches for certain implementation problems
- Assists with debugging and error explanations
- Help improve code readability and documentation writing

AI tools were not used to automatically generate the complete project or major architectural components. All core design decisions, implementation, and interaction were carried out by the projects members.

## 4. Usage Documentation
The following documentation provides information to use and configure the website:
- [.env example](.env.example) - Setup the website
- [API documentation](API-Documentation.md) - Public API usage
