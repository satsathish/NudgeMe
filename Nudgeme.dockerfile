# Build Angular app

FROM node:20 AS frontend-build
WORKDIR /app/NudgeMeWeb
COPY NudgeMeWeb/package*.json ./
RUN npm ci --legacy-peer-deps
COPY NudgeMeWeb/ .
RUN node node_modules/@angular/cli/bin/ng build --configuration production --output-path=dist

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

# Expose ports
EXPOSE 80

# Create entrypoint script
RUN echo '#!/bin/sh\n\
set -e\n\
echo "Starting .NET backend..."\n\
dotnet /app/NudgeMeAPI/NudgeMeAPI.dll &\n\
API_PID=$!\n\
echo "Starting Nginx..."\n\
exec nginx -g "daemon off;"\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

# Start both backend and Nginx
CMD ["/entrypoint.sh"]
