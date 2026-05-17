FROM node:22-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages

RUN corepack prepare pnpm@11.1.2 --activate
RUN pnpm install --frozen-lockfile

EXPOSE 5173

CMD ["pnpm", "--filter", "shell", "dev", "--host", "0.0.0.0"]

