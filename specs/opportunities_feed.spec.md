# opportunities\_feed.spec.md

## Purpose

Defines the search, filtering, and display logic for listing business opportunities in the Student Portal.

---

## Screen & Route

1. **Opportunities Feed** (`GET /student/opportunities`)

   * **URL**: `/student/opportunities`
   * **API**: `GET /api/opportunities?search={query}&industry={industry}&skills={skills}&compensationType={compType}&duration={duration}`
   * **Query Parameters**:

     * `search` (string): Full-text search on title and description
     * `industry` (string\[]): Multi-select industries
     * `skills` (string\[]): Multi-select required skills
     * `compensationType` (string\[]): Multi-select (e.g., stipend, equity, credit)
     * `duration` (string\[]): Multi-select (e.g., `<4 weeks`, `4–8 weeks`, `>8 weeks`)

---

## UI Elements

* **Search Bar**

  * Placeholder: "Search by keyword or project title"
  * On input debounce (300ms) to update feed

* **Filters Panel** (collapsible):

  * **Industry**: Checkbox list of available industry tags
  * **Skills**: Tag-based multi-select with autosuggest
  * **Compensation Type**: Checkboxes (Stipend, Equity, Course Credit)
  * **Duration**: Checkboxes for predefined ranges
  * **Reset Filters** button

* **Opportunity Cards** (masonry grid or list view):

  * **Card Details**:

    * Title (clickable)
    * Short description (truncate to 2 lines)
    * Industry tag(s)
    * Compensation icon + text
    * Duration
    * “Apply” button disabled if outside apply window
  * **Hover / Focus State**: Elevation shadow via Framer Motion

* **Pagination / Infinite Scroll**

  * Load 10 at a time, “Load More” button or automatic infinite scroll trigger

---

## Data Handling

1. **Initial Load**: Fetch first page of opportunities with default filters (open windows only).
2. **Search & Filters**: On change, cancel previous fetch and request with new query params.
3. **Client-Side Caching**: Cache recent filter results for quick back/forward navigation.
4. **Error States**:

   * **No Results**: Show friendly message with suggestions (“Try broadening your search”).
   * **Fetch Error**: Retry button with error description.

---

## API Contract

* **Endpoint**: `GET /api/opportunities`
* **Response**: `200 OK`

  ```json
  {
    "data": [
      {
        "id": "<uuid>",
        "title": "...",
        "description": "...",
        "industry": ["..."],
        "compensationType": "stipend",
        "compensationValue": "500",
        "duration": "4 weeks",
        "applyWindowStart": "2025-06-01T00:00:00Z",
        "applyWindowEnd": "2025-06-15T23:59:59Z"
      },
      ...
    ],
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 42
    }
  }
  ```

---

## Error Handling & UX

* Display loader while fetching
* Inline error message for network failures
* Disable “Apply” outside valid window and show tooltip: “Applications closed”

---

> *This spec guides the agent in building the search/filter UI and the API route for the opportunities feed.*
