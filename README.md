# Six Degrees of Kevin Bacon

This was created during my time as a student at Code Chrysalis.

## Goal

### MVP

1.  The user inputs two actors' names.
1.  The backend calculates the connections between the two actors and sends a response.
1.  The "connection" is displayed as a graph on a white page.

## Data

### Data model

The data is represented in a graph. There are two kinds of nodes:

* person (actors, directors, etc.)
* work (movie, tv show)

An edge between nodes implies that the _person_ appeared in the _movie_.

![screenshot of simple graph](./images/screenshot-simple-example.png "screenshot of simple graph")

### Data Source

Data comes from [The Movie Database API](https://developers.themoviedb.org/3). We use three main queries:

* [GET /search/person](https://developers.themoviedb.org/3/search/search-people) - Get a person_id from the String that is entered on the web form.
* [GET /person/{person_id}/movie_credits](https://developers.themoviedb.org/3/people/get-person-movie-credits) - Get the movies that a person was in.
* [GET /search/movie](https://developers.themoviedb.org/3/search/search-movies) - Get a movie_id from the String that is entered on the web form.
* [GET /movie/{movie_id}/credits](https://developers.themoviedb.org/3/movies/get-movie-credits) - Get the people that were in a movie.
