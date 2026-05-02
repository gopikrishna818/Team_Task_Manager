FROM node:20-alpine AS build
ARG CACHE_BUST=1

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build with production API URL from build arg
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build
RUN npm run build

# Production image
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
