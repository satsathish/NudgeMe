# Build Angular app

FROM node:20 AS frontend-build
WORKDIR /app/NudgeMeWeb
COPY NudgeMeWeb/package*.json ./
RUN npm install
COPY NudgeMeWeb/ .
RUN npm run build -- --output-path=dist

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

# Start both backend and Nginx
CMD service nginx start && dotnet NudgeMeAPI/NudgeMeAPI.dll
