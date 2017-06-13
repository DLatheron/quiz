Next:
x Would be better to resolve the external IP address once and for all;
x Database just holds the game id -> IP/port mapping;
x External IP

Joining a game:
x Open a web socket to the provided IP address;
- Send a join message that contains the gameId - server returns an error if
  the gameId does not match (eliminates old games);
- 

- game creates a lobby server for chatting and the game;
- That is a TCP server...
x Support POST question with form data as well as JSON.
x Ability to create a question from the inventory;
- UUID game id creation/encoding;
- Data validation for question submissions;
- Ability to delete a question (only one of yours?)
- Question creation slide on page?
d Auto-incrementing user Id?

x Local Mongo database for disconnected operation;
- Push Mongo data to Internet database;

Inventory Page
x Table sorter arrows to indicate direction of sort;
- Global sort dropdown(?);
- Limit for page;
- Ajax get request for page - so that page is refresh free;
- Inventory search;
- Dynamic search;

Passport
x Account creation;
x Account logon;
x Account logout;
- Facebook OAuth;
- Twitter OAuth;
- Account settings;

Question Creation
x ID assignment (not BSONID);
x Author - should be the BSONID of the customer NOT their e-mail address;
x Date created;
- Public/private flag;
- Save/Cancel buttons;
- Changes have been made: Save/Cancel dialog;

Round Page
- Name the round;
- Add a question;
- Round settings;
- Remove a question;
- Edit a question (if you can);
- ALL ACTIONS ARE AUTOMATICALLY SAVED TO THE DATABASE...