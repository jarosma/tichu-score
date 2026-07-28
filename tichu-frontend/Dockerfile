# --- Build stage ---
FROM node:22 AS build

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
FROM nginx:1.25

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for outside access
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
