# Catalog API Research

## Goal

Evaluate external data sources for building the Nendoroid catalog.

The catalog is a core part of Nendodex, so the data source must be evaluated carefully before designing the database schema or implementing the synchronization process.

## Candidate APIs

### Tenji

Tenji is an open-source, unofficial REST API for MyFigureCollection.

MyFigureCollection does not appear to provide a modern official public API, so Tenji exists as a third-party solution to expose MFC data through REST endpoints.

## Questions to Answer

* Is the API public?
* Does it require authentication?
* Can we search specifically for Nendoroids?
* What fields are returned?
* Are images included?
* Are characters, series and manufacturers structured?
* Are release dates available?
* Are there rate limits?
* Does the API fetch live data or serve cached data?
* Is it stable enough for this project?

## Findings

### Tenji

Pros:

* Focused on MyFigureCollection data.
* Open-source.
* Could provide structured figure data.
* Designed specifically to compensate for the lack of an official MyFigureCollection API.

Cons:

* Not official.
* Public documentation appears limited.
* Repository activity seems low.
* It is unclear whether the API fetches live data or serves cached data.
* Stability needs to be verified with real requests.

Current assessment:

Tenji is worth investigating, but it should not be chosen as the main catalog source until real API responses are tested.

## Architecture Considerations

Nendodex should not depend on an external API at runtime for normal user interactions.

Preferred flow:

External source
→ Catalog synchronization process
→ Nendodex PostgreSQL database
→ Nendodex API
→ Web application

This approach allows the application to keep working even if the external API is temporarily unavailable.

## Next Steps

* Find Tenji API documentation.
* Test real API requests.
* Save example responses.
* Check whether recently released Nendoroids are available.
* Decide whether Tenji is reliable enough for catalog synchronization.

## Current Research Direction

Tenji can retrieve item details when a MyFigureCollection item ID is known, but it does not appear to provide a public search endpoint for discovering all Nendoroids.

MyFigureCollection item IDs are not the same as official Nendoroid numbers, so sequential crawling by Nendoroid number is not possible through MFC item URLs.

Good Smile Company appears to provide an official Nendoroid category listing, making it a stronger candidate for discovering catalog items.

Next step:
- Investigate whether Good Smile product listing pages can be used to build the initial catalog.