# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Features

 - User registration and login
 - URL shortening
 - URL management (create, edit, delete)
 - Track total visits for each URL
 - Track unique visitors for each URL
 - Display visit history (timestamp and visitor ID)

## Final Product

#### Login Page
!["Screenshot of the Login Page"](https://github.com/moastra/tinyapp/blob/main/docs/login-page.png?raw=true)

#### Register Page
!["screenshot of the Register Page"](https://github.com/moastra/tinyapp/blob/main/docs/register-page.png?raw=true)

#### My URLs
!["screenshot of the MyURLs Page"](https://github.com/moastra/tinyapp/blob/main/docs/my-urls-page.png?raw=true)

#### Create URLs
!["screenshot of Create URLs Page"](https://github.com/moastra/tinyapp/blob/main/docs/create-url-page.png?raw=true)

#### Edit URLs
!["screenshot of the Edit URLs Page"](https://github.com/moastra/tinyapp/blob/main/docs/edit-url-page.png?raw=true)


## Dependencies

 - Node.js
 - Express
 - EJS
 - bcryptjs
 - cookie-session
 - method-override
 - nodemon

## Getting Started

- Install all dependencies (using the `npm install <dependency>` command).
- Run the development web server using the `npm start` command once nodemon is installed.
- Open your browser and navigate to [http://localhost:8080/register](http://localhost:8080/register).

## Usage

 - Register a new user.
 - Log in with your credentials.
 - Create new short URLs.
 - Manage your URLs (edit or delete).
 - Track visits and view visit history for each URL.