# cqrs-todolist

An example CQRS which provides CRUD operators on a todolist using CQRS.

The CQRS/Event-Sourcing part is abstracted by a module named 'Crumble' (for now - src/crumble.ts).

## Run the server

```
npm install
npm test
npm run server
```

Sample requests to the server can be found in "sample-requests.txt".