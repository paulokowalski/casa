FROM --platform=linux/arm64/v8 nginx:latest
COPY build /app/casa
COPY nginx/nginx.conf /etc/nginx/nginx.conf
