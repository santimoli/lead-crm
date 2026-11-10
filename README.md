# Lead CRM

A small CRM to manage sales leads. You can create, list, edit and delete leads, search them by name or email and filter them by status.

## Running locally

You need Node.js 22 or later.

```bash
git clone https://github.com/santimoli/lead-crm.git
cd lead-crm
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

`prisma migrate dev` creates the SQLite database in `prisma/dev.db` and generates the Prisma client. The app runs on http://localhost:3000.

## Features

- Create, list, edit and delete leads.
- Search by name or email, filter by status.
- Paginated list, newest first.
- Input validation with an error message for each field.
- Emails are unique. A duplicate returns a clear error.

<!-- TODO: add the frontend features (dashboard, form, loading/empty/error states, toasts) -->

## Limitations

- No authentication. Anyone with access to the app can see and change every lead.
- No automated tests. I tested the API by hand in Postman.
- Search ignores case only for letters without accents, because of how SQLite compares text.
- SQLite is fine for local use, but a deployed version would need a database server such as PostgreSQL.

## Technical decisions

I chose Next.js because the UI and the API live in one project, and because I wanted to learn more about it. I had already used React a lot in university projects, so I could focus on the structure of the app instead of a new library.

The database is SQLite through Prisma. SQLite is a single file and needs no setup, so the project runs right after cloning. The trade-off is that it does not suit a production app with several servers. Prisma keeps the model in one file and generates the migrations. Moving to PostgreSQL would mean changing the `provider` in `schema.prisma` and the `DATABASE_URL`.

Zod validates every request. The rules are declarative, similar to Bean Validation annotations in Spring Boot.

Sonner shows short notifications after each action, such as "Lead created".

The code is split in layers, like a controller and a service in Spring Boot. The route handlers only deal with HTTP. The service holds the rules and is the only code that talks to Prisma. When something fails, the service throws an error and `errorResponse` in `lib/http.js` picks the status code, so every route handles errors the same way. This adds a few files for a small app, but each one has a single job.

Email uniqueness is enforced by the database, not by checking first and inserting after, which would let two requests with the same email both pass. Emails are trimmed and lowercased before they are saved.

Status is stored as a `String`, because Prisma does not support enums on SQLite. Zod only accepts the four valid values.

Ids are UUIDs, so they do not reveal how many leads exist.

The list is paginated on the server. This needs an extra `count` query, but the page never loads every lead at once.

<!-- TODO: add frontend decisions -->

## Project structure

```
prisma/
  schema.prisma            Lead model
  migrations/              Database history
src/
  app/api/leads/
    route.js               GET (list) and POST (create)
    [id]/route.js          PATCH (update) and DELETE
  features/leads/
    schema.js              Zod schemas
    service.js             Business rules and database queries
  lib/
    prisma.js              Shared Prisma client
    errors.js              NotFoundError and ConflictError
    http.js                Turns errors into HTTP responses
```

<!-- TODO: add the frontend folders -->

## API

- `GET /api/leads` lists leads, newest first.
- `POST /api/leads` creates a lead and returns 201.
- `PATCH /api/leads/:id` updates one or more fields.
- `DELETE /api/leads/:id` deletes a lead and returns 204.

The list accepts `search`, `status` (`NEW`, `CONTACTED`, `QUALIFIED` or `LOST`), `page` (default 1) and `pageSize` (default 20, max 100). The response looks like this:

```json
{
  "data": [{ "id": "…", "name": "Santi", "email": "santiago@gmail.com", "company": "LDA", "status": "NEW", "createdAt": "…", "updatedAt": "…" }],
  "meta": { "total": 1, "page": 1, "pageSize": 20 }
}
```

`total` counts every lead that matches the filters, not only the current page.

Errors return `{ "error": "message", "fields": { "email": "message" } }`, with 400 for invalid data, 404 for a missing lead and 409 for a duplicate email.

## Approach and tools


