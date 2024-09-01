# Testing

The server-test folder contains all the playwright test for end-to-end intigration testing.

## How to run the tests:

First you'll need to build the right containers with:

```bash
docker-compose -f dev.yml -f dev.test.yml build
```

Then to run the playwright tests you can use the following commands:

```bash
# To run the app and test database (detached so you can still use the terminal)
docker-compose -f dev.yml -f dev.test.yml up app test -d

# To change directory into the test folder
cd ./app/server-test/

# To run all the tests
npx playwright test

# Alternitavely, you can run specific tests with
npx playwright test `file name`

# For example
npx playwright test landing.test.ts
```

To run the Jest unit tests you can use the following commands:

```bash
# To run the app and test database (detached so you can still use the terminal)
docker-compose -f dev.yml -f dev.test.yml up test -d

# To change directory into the test folder
cd ./app/server-test/

# To run all the tests
npm run jest

# Alternitavely, you can run specific tests with
npm run jest `file name`

# For example
npm run jest database.test.ts
```

And if you just want to run the app with the developoment database you can simply use: 

```bash
docker-compose -f dev.yml up
```