## Good Smile Company

### Summary

Status: Primary candidate

Good Smile is currently the preferred source for the NendoDex catalog.

Research indicates that the official website provides:

- Catalog browsing without authentication.
- Stable pagination using `limit` and `offset`.
- Product detail pages with rich metadata.
- Coverage including recent releases and early Nendoroids.

### Catalog discovery

Catalog pages load additional products through the endpoint:

/search/list

using:

- limit
- offset

The response is HTML rather than JSON.

Each product card exposes:

- Official product ID
- Product URL
- Product name
- Manufacturer
- Main image
- Display number (when applicable)
- Product labels (Rerelease, Bonus, etc.)

### Product detail pages

Each product page provides significantly more information, including:

- Official name
- Series
- Product number
- Manufacturer
- Description
- Included parts
- Gallery images
- Sculptor
- Production cooperation
- Release history
- Bonus information
- Product specifications

### Product scope

The catalog is broader than standard Nendoroids.

Observed product lines include:

- Nendoroid
- Nendoroid Basic
- Nendoroid Doll
- Nendoroid Doll Outfit Set
- Nendoroid Surprise
- Nendoroid Plus
- Accessories
- Bundled products

A normalization step will classify imported products before they are added to the application database.

### Proposed import architecture

Good Smile
↓
Catalog discovery
↓
Product page extraction
↓
Normalization
↓
Classification
↓
Validation
↓
PostgreSQL
↓
NendoDex

### Decision

Good Smile will be used as the primary catalog source for the first version of NendoDex.

Additional sources (Tenji, NendoGuide, Nendoroid Heaven, etc.) may be used only for validation or to detect missing products in the future.