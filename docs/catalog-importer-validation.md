# Catalog importer validation

## Tested products

| Good Smile ID | Product | Nendoroid number | Result | Notes |
|---|---|---:|---|---|
| 56111 | Nendoroid Frieren | 2367 | Passed | Modern page, multiple rereleases |
| 56112 | Nendoroid Fern | 2368 | Passed | Modern page, one rerelease |
| 1191 | Nendoroid Neko Arc | 000 | Passed | Legacy page, missing optional fields |
| 1746 | Nendoroid Nozomu Itoshiki 1.5 | 342a | Passed | Alphanumeric Nendoroid number |
| 12619 | Nendoroid Alexander | 2251 | Passed | No rereleases, manufacturer differs from distributor |

## Non-Nendoroid validation

| Good Smile ID | Result |
|---|---|
| 12345 | Rejected correctly; HTML saved and JSON not generated |

## Observed structural differences

- Legacy products may omit `relatedInformation`.
- Legacy products may omit `mainImageUrl`.
- `releaseDates` can be empty.
- Nendoroid numbers must be stored as strings.
- Nendoroid numbers may contain leading zeroes or letter suffixes.
- Manufacturer and distributor may differ.
- Some products have no rereleases.
- Analytics release entries cannot yet be reliably paired with release dates.