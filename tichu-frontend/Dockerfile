# --- Build stage ---
FROM node:22 AS build

# Define build arguments for environment variables
ARG TICHU_HOST_URL
ARG TICHU_BACKEND_PORT
ARG TICHU_HOST_PORT

# Set environment variables during the build process
ENV VITE_HOST_URL=$TICHU_HOST_URL
ENV VITE_BACKEND_PORT=$TICHU_BACKEND_PORT
ENV VITE_HOST_PORT=$TICHU_HOST_PORT

WORKDIR /app

COPY package*.json ./
RUN npm install

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

