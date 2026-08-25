FROM node:22-alpine AS builder

WORKDIR /app

# 先复制完整 Nuxt 项目
COPY . .

# 安装依赖
RUN npm ci

# 构建 Nuxt
ENV NODE_ENV=production
RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3006

COPY --from=builder /app/.output ./.output

EXPOSE 3006

CMD ["node", ".output/server/index.mjs"]