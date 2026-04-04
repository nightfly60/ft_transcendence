# *This project has been created as part of the 42 curriculum by aabouyaz, edurance, lemarian and rcini-ha*

# Summary
[1. Description](#1-description)\
[2. Instructions](#2-instructions)\
[3. Resources](#3-resources)\
[4. Usage Documentation](#4-usage-documentation)\
[5. Team Information](#5-team-information)\
[6. Project Management](#6-project-management)\
[7. Technical Stack](#7-technical-stack)\
[8. Database Schema](#8-database-schema)\
[9. Features List](#9-features-list)\
[10. Modules](#10-modules)\
[11. Individual Contributions](#11-individual-contributions)

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

Before starting the project, you need to create a `.env` file.\
An example configuration is provided in `.env.example` in the [Usage Documentation](#4-usage-documentation) section.

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
- [Google OAuth](https://medium.com/@aswathyraj/google-oauth-in-node-js-express-and-react-js-6cb2e23e82e5) - OAuth implementation
- [JSON Web Tokens](https://www.jwt.io/introduction#what-is-json-web-token-structure) - JWT autentification token
- [Bonjour-Angular](https://apprendre.bonjour-angular.com/cest-quoi/angular/) - Angular community documentation
- [Stack Overflow](https://stackoverflow.com) - Forum for dev support
- [Socket.io](https://socket.io/docs/v4/) - Socket.io library documentation

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

## 5. Team Information

### edurance - Product Owner and developer
- Sets product direction and decides which features matter most.
- Codes critical parts and checks that implementation match the vision.
- Implements assigned features and contributes to overall system development.

### aabouyaz - Project Manager and developer
- Keeps the team on track and resolve blockers.
- Helps develop features and ensures deadlines are met.
- Implements assigned features and contributes to overall system development.

### lemarian - Project Manager and developer
- Assists in planning, coordination tasks and tracking process.
- Implements assigned features and contributes to overall system development.

### rcini-ha - Technical Lead and developer
- Designs the system and database structure.
- Guides team on technical choices.
- Implements assigned features and contributes to overall system development.

## 6. Project Management

### How the team organized the work ?
We devided the tasks based on roles and interests, assigning features and responsabilities individually. Regular check-ins were held during in-person meetings at school to coordinate progress.

### Tools used for project management
We used Git/Github to manage our code, track changes and collaborate on development. We also used Trello to help us visualize tasks and sprint workflow.

### Communication channels used
Daily communication was done via Discord, while important planning and discussions were held during school meetings.

## 7. Technical Stack

### Frontend:
Built with Angular, using TypeScript, HTML and CSS for structure and styling. Angular was chosen for its modularity, two-way data biding, and strong community support.

### Backend:
Implemented with Express using Node.js, providing a lightweight, fast and scalable REST API. C++ was also used for the chess AI engine for move generation and evaluation.

### Database:
Used MariaDB/MySQL in a containerized environment. Chosen for reliability, relational data support and ease of integration with Node.js.

### Justification of Major Choices:
- **Angular**: Facilitates structured frontend with reusable components.
- **Node.js/Express**: Enables fast server-side development with JavaScript consistency across frontend and backend.
- **MariaDB/MySQL**: Provides robust relational database support and easy container deployment for testing and production.

## 8. Database Schema:



## 9. Features List

### User Experience
- Custom error pages (Elena)
- Privacy and Terms policies (Elena)
- Responsive rendering
- Public API to interact with the database (Anas)
- Gamification system with Elo, XP and achievements (Anas and Elena)
- Game statistics and match history (wins, losses, rankings, match details) (Anas)

### Social features
- Basic multiplayer game chat and private messages (Gaël)
- Access to user profiles (Elena)
- Friends (view, add and remove) (Elena)
- Leaderboard integration (Renaud)

### User Management
- Register / Login system (Anas)
- Remote authentication / OAuth 2.0 (Google and 42 Intranet) (Anas)
- 2FA (Anas)
- Profile (view and edit) (Elena)
- Player Search with filters (Renaud)

### Gameplay
- Real-time matches between two players (Renaud)
- Chess rules enforced: valid moves, check/checkmate and win/loss conditions (Renaud)
- 2D board rendering (Renaud)
- Smooth user experience for gameplay (handle network latency and disconnections) (Renaud)
- Reconnection logic (Renaud)
- AI engine implemented in C++ for fast move computation (Elena)
- Adjustable difficulty levels (Elena)

## 10. Modules

### [WEB] Use a framework for both the frontend and backend (everyone)
- Major module (2 pts)
- We used Angular for the frontend framework and Express (Node.js) for the backend framework.
- We chose this module because using frameworks facilitates building a website environment and for their modularity.

### [WEB] Real-time features using WebSockets or similar technology (Gaël and Renaud)
- Major module (2 pts)
- The module was implemented using WebSockets to enable real-time communication between players. This allows users to start games with others and interact through a chat system. The server manages events such as game start, player actions and chat messages ensuring that all connected clients receive their updates instantly.

### [WEB] Allow users to interact with other users (Gaël and Elena)
- Major module (2 pts)
- This module allows users to interact with each other by providing a basic chat system, a profile system and a friends system. 
- Theses features were implemented to make the platform more interactive and enjoyable for the users.

### [WEB] A public API to interact with the database with a secured API key (Anas)
- Major module (2 pts)
- The public API provides GET, POST, PUT, and DELETE endpoints to interact with the database. You can see the documentation [here](#4-usage-documentation).
- We wanted to provide a secure and reliable way for external users or applications access and manage database efficiently.

### [WEB]Advanced search functionality with filters, sorting, and pagination (Renaud)
- Minor module (1 pt)
- On the leaderboard page, advanced search functionality was implemented to allow users to search for a player, filter by ELO or XP, and navigate results efficiently with sorting pagination.
- This helps users quickly find specific players and compare rankings, improving overall usability of the leaderboard.

### [User Management] Standard user management and authentication (Elena)
- Major module (2 pts)
- This module allows users to update their profile informations (username and bio), upload an avatar, add friends, see their friends' online status and view a profile page displaying all their informations.
- These features were implemented to provide personalized and social experience, enabling users to manage their profiles and connect with friends easily.

### [User Management] Game statistics and match history (Anas)
- Minor module (1 pt)
- This module tracks user data such as wins, losses, ranking and level. It displays match history for 1v1 games and shows achievements progression on user profiles. We also integrated the leaderboard.
- This provides players with insights into their performance and progression.

### [User Management] Remote authentication with OAuth 2.0 (Anas)
- Minor module (1 pt)
- It was implemented with the Google and the 42 intranet API.
- We wanted to facilitate user connexion to our platform.

### [User Management] Complete 2FA system for the users (Anas)
- Minor module (1 pt)
- This module added a "Settings" section on Chess42, with the possibility to add 2FA with a QR Code.
- We wanted to facilitate user connexion to our platform.

### [Artificial Intelligence] AI Opponent for games (Elena)
- Major module (2 pts)
- This module allows users to play against a chess engine. The chess engine was implemented in C++ for optimization reasons. The chess engine can be executed with a position (in fen format), a depth and an error chance.
- We wanted to allow players to train against an AI to improve their level.

### [Gaming and user experience] Complete web-based game where users can play against each other (Renaud)
- Major module (2 pts)
- We implemented this module by making a 2D chess game where users can play with others, in solo or against an AI.
- This is the base of our product. We wanted to allow users to play on a good chess platform.

### [Gaming and user experience] Remote players - two players can play the same game in real-time (Renaud)
- Major module (2 pts)
- We implemented this module with WebSockets.
- This module allows players to have a smooth and enjoyable gameplay.

### [Gaming and user experience] Gamification system to reward users for their actions (Anas and Elena)
- Minor module (1 pt)
- This system tracks ELO, XP, and achievements, displays a level progress bar on the user profile, and provides visual feedback for progression. All data is stored persistently in the database and clearly integrated into the profile interface.
- These features motivate users, provide clear progression, and make the platform more engaging through visible rewards and achievements.

### Total score : 21 points 🎉

## 11. Individual Contributions

### Gaël (lemarian)
- **User interaction**: Implemented chat widget for multiplayer games, as well as a direct messaging system to communicate outside of games.
- **Real-time features**: Implemented a hybrid Websocket/REST architecture, allowing for real-time message delivery and room management, with full data persistence for both direct messages and game chat conversations.
- **Challenges overcome**: Learning Angular and database interactions through Node.js, re-evaluating design choices mid-development to meet deadlines while maintaining a working chat system.

### Renaud (rcini-ha)
- **Gameplay core**: Implemented the complete 2D chess board rendering and enforced all chess rules, including valid move generation, check/checkmate detection and win/loss conditions.
- **Real-time multiplayer**: Built the real-time game system using WebSockets, enabling two players to play against each other, handling network latency.
- **Reconnection logic**: Designed and implemented a reconnection system allowing players to seamlessly resume an ongoing game after a connection loss, preserving game state server-side.
- **Leaderboard and search**: Implemented the leaderboard page with advanced search functionality, including player filtering by ELO and XP, sorting options and pagination for efficient navigation.
- **Challenges overcome**: Designing a robust game state synchronization model over WebSockets while managing edge cases such as simultaneous moves, disconnections and race conditions; implementing chess rule enforcement from scratch with correctness and performance in mind.

### Anas (aabouyaz)
- **User management**: Implemented log system with email+password and added 2FA and OAuth2.0 with 42Intra and Google.
- **Database API**: Implemented a system of API linked in settings to address requests directly to the database on 5 endpoints.
- **Gamification system**: Co-Implemented XP, ELO, achievements and progress bars on profile to provide visual feedback and reward users.
- **Game Statistics and History**: Implemented the last parties played on the user profile and linked statistics by game.
- **Challenges overcome**: Learning how to implemente 2FA and OAuth2.0 with documentation from Google, and how to implemente on a well designed webpage

### Elena (edurance)
- **User interaction module**: Implemented profile system and friends system.
- **Standart user management**: Implemented profile updates, avatars, friends management, online status and profile / profile-edit pages.
- **AI Opponent for games**: Integrated C++ chess engine to allow users to play against AI with configurable difficulty.
- **Gamification system**: Co-Implemented XP, ELO, achievements and progress bars on profile to provide visual feedback and reward users.
- **Custom error pages & Privacy/Terms policies**: Developed pages for user guidance and legal compliance (only front).
- **Challenges overcome**: Optimized the chess engine in C++ for performance, learned Angular routing and page structure to implement profile and custom pages efficiently.
