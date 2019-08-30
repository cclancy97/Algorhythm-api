## Algorhythm: Let's jam!
### _Links / Installation_:
- [Front-End Repo](https://github.com/cclancy97/Algorhythm)
- [Front-End Deployed](https://cclancy97.github.io/Algorhythm/)
- [Fork and clone](https://git.generalassemb.ly/ga-wdi-boston/meta/wiki/ForkAndClone) this repository
- `npm install` to install dependencies
- `npm run server` to run server on `localhost:4741`
---
### _Technologies Used_:
- Express
- Node.JS
- Heroku
- Mongoose
- MongoDB

---
### _Authentication_

| Verb   | URI Pattern            | Controller#Action |
|--------|------------------------|-------------------|
| POST   | `/sign-up`             | `users#signup`    |
| POST   | `/sign-in`             | `users#signin`    |
| PATCH  | `/change-password`     | `users#changepw`  |
| DELETE | `/sign-out`        | `users#signout`   |
---
### _Catalog of Routes:_

Verb         |	URI Pattern
------------ | -------------
GET | /posts
GET | /posts/:id
POST | /posts
PATCH | /posts/:id
DELETE | /posts/:id
GET | /comments
GET | /comments/:id
DELETE | /comments/:id

---
### _ERD:_
  - ![ERD](https://i.imgur.com/rQoKth3.jpg "ERD")
