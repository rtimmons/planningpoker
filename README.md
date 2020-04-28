Planning Poker
==============

Developing & Testing Locally
----------------------------


```sh
npm install
npm run start
```

Open <http://localhost:3000>


Deployment is done via Heroku.
https://devcenter.heroku.com/articles/heroku-cli#download-and-install
https://devcenter.heroku.com/articles/getting-started-with-nodejs

TODO
----

Features

- Manually add logbook entries
- Newest logbook entries on top
- Edit logbook items
- Some semblance of persistent state: Periodically flush state to disk and reload when starting

- Flashy ice-cream if consensus
- Better "enter your name" UI (at least: better color and `<input>` layout)
- Ability to have more than one concurrent session

- Make it more obvious who hasn't voted
- Record when question was last changed. 
    - Auto-clear it if it hasn't changed in last N hours?
- API already records and vends the "voted at" timestamp but it's unused.
    - Auto-kick users that haven't voted in N hours?

Internals

- Refactor. It's icky
- Automated testing would be nice
- More consistent DOM structure

