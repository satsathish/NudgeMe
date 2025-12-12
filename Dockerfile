# Build Angular app

FROM node:20 AS frontend-build
WORKDIR /app/NudgeMeWeb
COPY NudgeMeWeb/package*.json ./
RUN npm install
COPY NudgeMeWeb/ .
RUN node node_modules/@angular/cli/bin/ng build --configuration production
RUN ls -la /app/NudgeMeWeb/dist/NudgeMeWeb/browser

# Build .NET backend

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app/NudgeMeAPI
COPY NudgeMeAPI/*.csproj ./
RUN dotnet restore --source https://api.nuget.org/v3/index.json
COPY NudgeMeAPI/ ./
RUN dotnet publish -c Release -o out

# Runtime image

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=backend-build /app/NudgeMeAPI/out .
COPY --from=frontend-build /app/NudgeMeWeb/dist/NudgeMeWeb/browser ./wwwroot

# Expose port
EXPOSE 8080

# Start backend (now serves frontend too)
CMD ["dotnet", "NudgeMeAPI.dll"]
