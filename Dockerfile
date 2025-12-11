# Build Angular app

FROM node:20 AS frontend-build
WORKDIR /app/NudgeMeWeb
COPY NudgeMeWeb/package*.json ./
RUN npm install
COPY NudgeMeWeb/ .
RUN npm run build:prod -- --output-path=dist

# Build .NET backend

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app/NudgeMeAPI
COPY NudgeMeAPI/*.csproj ./
RUN dotnet restore
COPY NudgeMeAPI/ ./
RUN dotnet publish -c Release -o out
RUN ls -lR /app/NudgeMeAPI

# Runtime image

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=backend-build /app/NudgeMeAPI/out ./NudgeMeAPI
COPY --from=frontend-build /app/NudgeMeWeb/dist ./NudgeMeWeb/dist

# Install Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create Nginx directories and set permissions for non-root user
RUN mkdir -p /var/lib/nginx/body /var/lib/nginx/fastcgi /var/lib/nginx/proxy /var/lib/nginx/scgi /var/lib/nginx/uwsgi && \
    mkdir -p /var/log/nginx && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /run/nginx && \
    chown -R 1000:2000 /var/lib/nginx /var/log/nginx /var/cache/nginx /run/nginx && \
    chmod -R 755 /var/lib/nginx /var/log/nginx /var/cache/nginx /run/nginx

# Expose ports
EXPOSE 80

# Create entrypoint script
RUN echo '#!/bin/sh\n\
exec 2>&1\n\
set -e\n\
echo "Starting .NET backend..."\n\
dotnet /app/NudgeMeAPI/NudgeMeAPI.dll &\n\
DOTNET_PID=$!\n\
sleep 3\n\
echo "Starting Nginx..."\n\
exec nginx -g "daemon off;"\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

# Start both backend and Nginx
CMD ["/entrypoint.sh"]
