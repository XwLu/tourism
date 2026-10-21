FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY index.js db.js community.js weixin.js schema.sql ./
EXPOSE 80
CMD ["node", "index.js"]
