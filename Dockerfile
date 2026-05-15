# Stackit server image. Builds @stackit/server out of the pnpm
# workspace. Used by Railway for the `server` service. The `db`
# service uses the apache/age image directly and is unaffected.

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app


FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY server/package.json ./server/
COPY web/package.json ./web/
RUN pnpm install --frozen-lockfile


FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY server ./server
COPY db ./db
RUN pnpm --filter @stackit/server build


FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules            ./node_modules
COPY --from=build /app/server/node_modules     ./server/node_modules
COPY --from=build /app/server/dist             ./server/dist
COPY --from=build /app/server/src              ./server/src
COPY --from=build /app/server/package.json     ./server/package.json
COPY --from=build /app/server/tsconfig.json    ./server/tsconfig.json
COPY --from=build /app/db                      ./db
COPY --from=build /app/pnpm-workspace.yaml     ./pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml          ./pnpm-lock.yaml
COPY --from=build /app/package.json            ./package.json
WORKDIR /app/server
EXPOSE 3000
CMD ["node", "dist/index.js"]
