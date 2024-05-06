# Project Description:

This project is a web application backed by PostgreSQL, featuring robust authentication with hashed passwords. Its primary functionality revolves around allowing users to input the countries they have visited. Upon input, the respective countries are color-coded on an interactive map. The entered data is securely persisted in the PostgreSQL database, providing users with the ability to track their visited countries over time. Additionally, users have the convenience of undoing entries if needed. With its intuitive interface and seamless database integration, this project offers an engaging and practical solution for tracking travel experiences.

## Project Setup Guide

### Requirements:
- Node.js:
  - Node versions 8.x, 10.x, 12.x, and 14.x or later are supported.
- PostgreSQL:
  - pg@8.2.x or later.

### Cloning the Repository:
- Open a terminal or command prompt.
- Navigate to the directory where you want to clone the project.
- Run the following command:
  ```
  git clone https://github.com/Prakash-Bandapalli/Map-Tracker.git
  ```

### Change Directory:
- Change directory to the cloned project directory:
  ```
  cd Map-Tracker-main
  ```

### Database Setup:
- Create a PostgreSQL database named `world`.
- Within the `world` database, create the following two tables:
  ```sql
  CREATE TABLE login(
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    pass VARCHAR(100) NOT NULL
  );

  CREATE TABLE visitedCountries(
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) NOT NULL,
    login_id INTEGER REFERENCES login(id)
  );
  ```

### Environment Variables:
- Create a `.env` file in the project root directory.
- Add the following environment variables to the `.env` file:
  ```plaintext
  PG_USER=YourUsername
  PG_HOST=localhost
  PG_DATABASE=world
  PG_PASSWORD=YourPassword
  PG_PORT=5432
  ```

### Installing Dependencies:
- Install project dependencies:
  ```
  npm install
  ```

### Starting the Application:
- Once the setup is complete, start the application by running:
  ```
  npm start
  ```
  

### Note:
- Please note that the frontend part of the project is not yet complete. I will be finishing that soon.
