# Documentation public API Chess42

To get started, you need to generate your API key from the settings.
The rate limit is 50 requests per 5 minutes.

## Available Endpoints:
Here is a list of all available endpoints and the arguments required in the request body:

| methods |         endpoint        |                   description                   |           arguments needed           |
|:-------:|:-----------------------:|:-----------------------------------------------:|:------------------------------------:|
| GET     | /api/database/users     |   Returns public information about all users    |                 none                 |
| GET     | /api/database/users/:id | Returns public information of the specified user|                 none                 |
| POST    | /api/database/users     |  Create a new user with the given information   | mandatory: username, password, email |
| PUT     | /api/database/users/:id |     Update the specified user's information     |   optional: username, bio, language  |
| DELETE  | /api/database/users/:id |            Delete the specified user            |                 none                 |

## Usage:
To make a request, you need to put your API key in the header 'X-API-Key' of your request.

You can GET, POST, PUT or DELETE.\
Some methods need arguments:
- POST: username, password AND email are all mandatory to create a user
- PUT: username, bio and language are all optional to update a user

The arguments should be given in JSON format.

The response is either an error or a success message:
- Errors can occur on your end and the codes are clear for you to redo the request properly
- Success messages can be simple text or data that you requested.

In the response header you can find 'X-API-Usages' with the usage you have made since the last reset\
and 'X-API-Reset-Time' with the timestamp in ms when your usage will be reset.


## Example:
Here is a curl command that will update the username and language of the user with ID 3:
```
request:
curl -k -X PUT https://localhost:4443/api/database/users/3 \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"username": "John Doe", "language": "en"}'
```
Response:
```
{"message":"Utilisateur mis a jour"}
```