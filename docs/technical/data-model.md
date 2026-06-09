# Data Model

## users

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique user id |
| name | string | Display name |
| email | string | Login email |
| avatar_url | string | Optional profile image |
| created_at | datetime | Creation date |

## albums

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Internal id |
| spotify_id | string | Spotify catalog id |
| title | string | Album title |
| artist | string | Main artist |
| cover_url | string | Album cover |
| release_date | date | Release date |
| genres | string[] | Genre labels |

## user_albums

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Entry id |
| user_id | string | Owner |
| album_id | string | Album reference |
| status | enum | Listening status |
| rating | number | 0.5 to 5.0 |
| review | text | User review |
| listened_at | datetime | Date listened |
| created_at | datetime | Entry creation |
| updated_at | datetime | Entry update |

## follows

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Follow id |
| follower_id | string | User who follows |
| following_id | string | User being followed |
| created_at | datetime | Follow date |

## Album Status Enum

| Value | Label |
| --- | --- |
| want_to_listen | Quero Ouvir |
| listened | Ouvido |
| favorite | Favorito |
| abandoned | Abandonado |
| relisten | Reouvir |

## Rating Rules

- Minimum: `0.5`.
- Maximum: `5.0`.
- Increment: `0.5`.
- Rating can be empty when the album has not been rated yet.
