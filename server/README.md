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

## Testing

Run the server unit and e2e tests:

```bash
pnpm test
```

