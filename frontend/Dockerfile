FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@11.1.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/shell/package.json ./apps/shell/
COPY packages/ui-kit/package.json ./packages/ui-kit/

RUN pnpm fetch
RUN pnpm install -r --offline --frozen-lockfile

COPY . .

RUN pnpm --filter shell build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=base /app/apps/shell/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]