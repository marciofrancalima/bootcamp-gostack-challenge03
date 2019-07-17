# Challenge 03. Continuing application (Bootcamp)

Developed in the Rocketseat bootcamp. Requirements below:

Improving the Meetapp application of Challenge 02.
```
https://github.com/marciofrancalima/bootcamp-gostack-desafio02
```

## Technologies

This project was developed at the RocketSeat GoStack Bootcamp with the following technologies:

-  [Node.js](https://nodejs.org/en/)
-  [Docker](https://www.docker.com/)
-  [Postgres](https://www.postgresql.org/)
-  [Mongo](https://www.mongodb.com/)
-  [Redis](https://redis.io/)
-  [Sequelize](http://docs.sequelizejs.com/)
-  [Mongoose](https://mongoosejs.com/)
-  [Express](https://github.com/expressjs/express)
-  [Multer](https://github.com/expressjs/multer)

ESLint and EditorConfig were also used to maintain the code pattern.

## Functionalities

The features added to the application are described below:

## File management

Create a file upload route that store the path and file name in a table and returns all data from the file.

## Meetups management

The user can register meetups on the platform with meetup title, description, location, date and time and image (banner). All fields are required. Also add a user_id field that stores the user ID that organizes the event.

It should not be possible to register meetups with dates that have passed.

The user should also be able to edit all meetup data that has not yet happened and that he is an organizer.

Create a route to list meetups that are organized by the logged-in user.

The user should be able to cancel meetups organized by him that have not yet happened. The delete must delete the database meetup.

## Meetup Signup

The user must be able to sign up for meetups that he does not organize.

User can not sign up for meetups that have already happened.

The user can not sign up for the same meetup twice.

The user can not join two meetups that happen at the same time.

Whenever a user signs up for the meetup, send an email to the organizer containing the data related to the registered user.

## List of meetups

Create a route to list filter meetups by date (not by time), results from that listing should be paginated by 10 items per page. Below is an example call for the meetups listing route:

```
http://localhost:3333/meetups?date=2019-07-01&page=2
```

In this example, we will list page 2 of the meetups that will take place on July 1st.

In that list also return the organizer data.

## Listing of subscriptions

Create a route to list the meetups the logged-in user is enrolled in.

List only meetups that have not yet passed and order closer meetups as the first on the list.

---

Made with ♥ by Márcio França Lima. [Contact me](https://www.linkedin.com/in/m%C3%A1rcio-fran%C3%A7a-lima-916454187/)
