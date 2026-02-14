# Product Rules

## Contact + Analysis Requests

- `name` must contain at least 2 characters.
- `email` must be valid format.
- `message` must contain at least 10 characters.
- `variant` is `contact` or `analysis` (defaults to `contact` on invalid input).

## Anti-Spam Rules

- `company` honeypot field must stay empty.
- Requests submitted too quickly after page load are silently accepted and dropped.
- Rate limit is 6 requests per IP per 60 seconds.

## Origin and Security Rules

- `POST /api/contact` accepts same-origin requests and configured allowed origins.
- Content type must be JSON (`application/json`).

## UX Rules

- Contact form should avoid stealing focus on touch devices.
- Validation errors should be attached to inputs via `aria-describedby`.
- Navigation should preserve keyboard and focus behavior on mobile.
