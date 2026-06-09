# PRD: AlbumLog

## Overview

AlbumLog is a platform for music lovers to track albums they have listened to, want to hear, favorited, abandoned, or want to revisit.

It works like a mix between Letterboxd and Goodreads, but focused on music and the experience of listening to complete albums.

## Problem

People who consume music by album often:

- Forget which albums they already heard.
- Lose track of albums they want to hear.
- Lose recommendations from friends.
- Lack a history of ratings and reviews.
- Cannot easily follow releases from favorite artists.
- Lack a simple place to share opinions about albums.

Spotify and Apple Music are strong players, but they are not music diaries.

## Product Goal

Allow users to build a personal album library and organize their musical journey over time.

## Value Proposition

A Letterboxd for people who like listening to albums.

## Target Audience

Primary:

- Music fans.
- Album collectors.
- Rock, metal, jazz, and alternative music enthusiasts.
- Users who listen to complete albums.

Secondary:

- Music content creators.
- Bloggers.
- Music critics.
- Podcasters.

## Personas

### The Discoverer

Constantly searches for new artists.

Pain: forgets recommendations.

### The Collector

Listens to hundreds of albums per year.

Pain: lacks an organized history.

### The Social Listener

Likes discovering music through friends.

Pain: lacks a simple social network focused on albums.

## MVP Features

### Account and Login

Spotify login is implemented for the current frontend MVP.

Future account criteria:

- Email and password.
- Google login.
- Basic profile.

### Album Search

User searches by:

- Album name.
- Artist name.

Example future search:

- Album title.
- Artist name.

### Add to Library

User can add an album to their collection.

### Album Status

Available statuses:

- Quero Ouvir.
- Ouvido.
- Favorito.
- Abandonado.
- Reouvir.

### Rating

Scale from `0.5` to `5.0` in half-star increments.

### Review

Free text field persisted in the user's AlbumLog library entry.

Example: `Excelente producao. Atmosfera pesada e emocional.`

### Library

View all albums organized by:

- Status.
- Date.
- Rating.
- Artist.

## Main Flow

1. User searches for an album.
2. User adds the album.
3. User marks it as `Quero Ouvir`.
4. User listens to the album.
5. User changes status to `Ouvido`.
6. User rates it `4.5`.
7. User writes a review.

## Success Metrics

MVP:

- User adds a first album in less than one minute.

Product:

- 10 albums registered per user.
- 50% of users leave ratings.
- 30% of users return weekly.

## Competitive Difference

Spotify helps people listen to music.

AlbumLog helps people build a musical memory.

The focus is not streaming. The focus is the user's relationship with music.
