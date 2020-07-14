Planning Poker
==============

Run Locally
-----------

```sh
npm install
npm run start
```

Open <http://localhost:3000>


Deploy
------

Deployment is done via Heroku.

Setup for deployment:

```sh
brew tap heroku/brew
brew install heroku
heroku login
# Get your own app name when you deploy. See getting started link below.
POKER_APP_NAME=pokerXYZ
git remote add heroku https://git.heroku.com/$POKER_APP_NAME.git
```

Do a deployment:

```sh
git push heroku master
```

References:

- https://devcenter.heroku.com/articles/heroku-cli#download-and-install
- https://devcenter.heroku.com/articles/getting-started-with-nodejs


TODO
----

Voting

- Change vote type (e.g. just thumbs-up/down)
- Option to abstain

- Better "enter your name" UI (at least: better color and `<input>` layout). Really just prompt/alert only if trying to vote.

- Make it more obvious who hasn't voted
- Flashy ice-cream if consensus

Editing State

- Edit logbook items
- Manually add logbook entries

Viewing State

- Newest logbook entries on top

State-Management

- Some semblance of persistent state: Periodically flush state to disk and reload when starting
- Ability to have more than one concurrent session.
- Record when question was last changed. Auto-clear it if it hasn't changed in last N hours?
- API already records and vends the "voted at" timestamp but it's unused. Auto-kick users that haven't voted in N hours?

Internals

- Refactor. It's icky
- Automated testing would be nice
- More consistent DOM structure
