FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies against the lockfile so the image boots with a
# valid node_modules. The compose file then preserves this directory
# via a named volume so the bind-mounted source does not shadow it.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
