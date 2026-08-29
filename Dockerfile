FROM node:22.18.0-bookworm-slim AS builder

WORKDIR /app

RUN npm install -g npm@11

ENV NUXT_TELEMETRY_DISABLED=1

COPY . .

RUN npm ci --foreground-scripts

ENV NODE_ENV=production

RUN npm run typecheck && npm run build


FROM node:22.18.0-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3006
ENV NUXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.output ./.output

EXPOSE 3006

CMD ["node", ".output/server/index.mjs"]
