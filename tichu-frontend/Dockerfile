# --- Build stage ---
FROM node:22.14.0-bookworm-slim@sha256:1c18d9ab3af4585870b92e4dbc5cac5a0dc77dd13df1a5905cea89fc720eb05b AS build

# Define build arguments for browser configuration
ARG TICHU_PUBLIC_URL=
ARG TICHU_API_BASE_URL=/api

# Set Vite variables during the build process
ENV VITE_PUBLIC_URL=${TICHU_PUBLIC_URL}
ENV VITE_API_BASE_URL=${TICHU_API_BASE_URL}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Production stage ---
FROM nginx:1.27.4-alpine@sha256:4ff102c5d78d254a6f0da062b3cf39eaf07f01eec0927fd21e219d0af8bc0591

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for outside access
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
