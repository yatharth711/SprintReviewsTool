
# SprintReviews a Peer Review and Evaluation System by Sprint Runners

This file will provide all information regarding the setup process to build and run the SprintReviews application

## How to use 
## Prerequisites

- Install [Docker Desktop](https://docs.docker.com/get-docker) for Mac, Windows, or Linux. Docker Desktop includes Docker Compose as part of the installation.
Sure, here are the prerequisites for a Next.js, Node.js, MySQL application:

**Environment Setup:**
1. [Node.js](https://nodejs.org/en/download/prebuilt-installer/current) : You need to have Node.js installed on your system. The recommended version is 18 or later.
2. [Git](https://git-scm.com/downloads) : Git is essential for version control. Make sure it is installed¹.

**Project Setup:**
1. [**Next.js**](https://nextjs.org/docs/getting-started/installation): You'll be using Next.js as the React framework for building the user interface.
2. [**MySQL**](https://dev.mysql.com/downloads/): MySQL is the database used for storing data.
3. [**mysql2**](https://www.npmjs.com/package/mysql2): mysql2 is a database client library specific to MySQL. It's the underlying connector library used by Sequelize for MySQL.

**Installation:**
1. Clone your project repository to your local system using Git.
2. Navigate to your project directory.
3. Install the required packages for your application using `npm install` or `yarn install` command.

## Development
This is to be used for local server development. For Docker Deployed Server use **Production**
First, run the development MySQL server:

```bash
# Docker creates and manages the custom network, which allows containers to communicate via the internal port
# For development only the Database is needed to be running on Docker.

# Build the development containers. ONLY run this command if you wish to build testing containers as well!
docker compose -f dev.yml build 

# To Build Only the containers required for running the LOCAL web server, USE:
docker compose -f dev.yml build app
# This will build the app container, network connection, and MySQL Server ONLY.

# Run the MySQL Server and Database Init
docker compose -f dev.yml up db 
#If you wish to continue using the console add: "-d" to the end
```
Now run the Next Dev server on Localhost

```bash
# Navigate to the app directory:
cd app

#Run dev server:
npm run dev

# (Optional) If any dependancies are missing or version changes, update package contents in the app directory:
npm install
```
Development server uses the default localhost, and database port (:3000 and :3306 respectively)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The server landing page defaults to `pages/index.tsx`. The page auto-updates as you edit the file.

For Test Configuration please refer to README in 'app/server-test/README.md'


## Production

Multistage builds are highly recommended in production. Combined with the Next [Output Standalone](https://nextjs.org/docs/advanced-features/output-file-tracing#automatically-copying-traced-files) feature, only `node_modules` files required for production are copied into the final Docker image.

The Production Server is to be used for full server deployment via Docker, and may not include Testing or Dynamic Refresh.
To Start the Production Server on Docker:
```bash
# Docker creates and manages the custom network, which allows containers to communicate via the internal port
# For Production the Database and App are both required to be running on Docker.

# Build the server containers. ONLY run this command if you wish to build testing containers as well!
docker compose -f dev.yml build 

# (RECOMMENDED) To Build Only the containers required for running the deployed web server, USE:
docker compose -f prod.yml build
# This will build the app container, network connection, and MySQL Server ONLY.

# Run the MySQL and App Servers
docker compose -f prod.yml up
#If you wish to continue using the console add: "-d" to the end
```
The Deployed Server Host uses a custom port for client connection, while the default port is used for internal container communication
To View the App Open [http://localhost:3001](http://localhost:3001).

To run testing please see README in the 'Server-test' directory
## Useful commands

```bash
# Stop all running containers
docker kill $(docker ps -aq) && docker rm $(docker ps -aq)

# Free space
docker system prune -af --volumes


```
### Below is used to handle changes in the init.sql
The volume name `team-3-capstone-sprint-runners_db_data` is the one Docker has created for your database. This is the volume you need to remove. 

You can remove this volume with the following command:

```bash
docker volume ls \\ this should give you the name of the volume remove that 

```

```bash
docker volume rm team-3-capstone-sprint-runners_db_data
```

Please remember that this operation will delete all data in the MySQL database. Make sure to backup any important data before you proceed.

After removing the volume, you can recreate the Docker containers with the updated `init.sql` file using the following command:

```bash
docker compose -f dev.yml up db 
```
<hr>
About us:

Contributing Members:

- [Brendan Michaud](https://github.com/ThatOth3rGuy)
- [Eric Harrison](https://github.com/EricHarrison72)
- [Tithi Soni](https://www.linkedin.com/in/tithi-soni/)
- [Yatharth Mathur ](https://yatharth711.github.io/)

![image](https://github.com/user-attachments/assets/1e22a1fd-d8af-4463-b886-de392d1c8d93)


