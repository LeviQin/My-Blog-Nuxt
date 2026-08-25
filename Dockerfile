FROM node:22-bookworm-slim AS builder

WORKDIR /app

ENV NUXT_TELEMETRY_DISABLED=1

# 完整复制项目
COPY . .

# 安装依赖，同时把 install script 的详细日志输出出来
RUN npm ci --foreground-scripts

# 构建 Nuxt
ENV NODE_ENV=production
RUN npm run build


FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3006
ENV NUXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.output ./.output

EXPOSE 3006

CMD ["node", ".output/server/index.mjs"]