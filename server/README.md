# LVZ Server

This directory contains the NestJS API for La Virtual Zone.

## Installing dependencies

Use **pnpm** to install packages:

```bash
pnpm install
```

Running `pnpm install` will create or update `pnpm-lock.yaml`. This lockfile should be committed so that the Dockerfile and CI environments install consistent versions.

## Development

Start the API in watch mode:

```bash
pnpm run start:dev
```

### Connect to Supabase

1. Create a project in **Supabase** and copy its PostgreSQL connection string.
2. Create a `.env` file using the template at the project root and set `DATABASE_URL` to the Supabase string. Also choose a strong value for `JWT_SECRET`.
3. After installing dependencies, run Prisma commands to prepare the database:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Testing

Run the server unit and e2e tests:

```bash
pnpm test
```

