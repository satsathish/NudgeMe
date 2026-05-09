using Microsoft.EntityFrameworkCore;
using NudgeMeAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure WebRootPath to use wwwroot from output directory
var outputWwwroot = Path.Combine(AppContext.BaseDirectory, "wwwroot");
builder.Environment.WebRootPath = outputWwwroot;
if (Directory.Exists(outputWwwroot))
{
    builder.Environment.WebRootFileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(outputWwwroot);
}
Console.WriteLine($"WebRootPath set to: {builder.Environment.WebRootPath}");
Console.WriteLine($"Directory exists: {Directory.Exists(outputWwwroot)}");

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Configure Postgres connection from appsettings / environment variables (Kubernetes)
var dbHost = builder.Configuration["Database:Host"] ?? "nudgeme-postgresql";
var dbPort = builder.Configuration["Database:Port"] ?? "5432";
var dbUser = builder.Configuration["Database:Username"] ?? "nudgeme";
var dbPassword = builder.Configuration["Database:Password"] ?? "nudgemepass";
var dbName = builder.Configuration["Database:Name"] ?? "nudgeme";
var connectionString = $"Host={dbHost};Port={dbPort};Username={dbUser};Password={dbPassword};Database={dbName}";
Console.WriteLine($"Connecting to database: Host={dbHost}, Port={dbPort}, Database={dbName}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
);

// CORS: explicit origins (wildcard + credentials is invalid). Use env var ALLOWED_ORIGINS (comma-separated) or fallback list.
const string CorsPolicy = "NudgeMeCors";
var allowedOriginsEnv = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
string[] allowedOrigins = string.IsNullOrWhiteSpace(allowedOriginsEnv)
    ? new[] {
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:8080", // via docker mapped nginx
        "http://127.0.0.1:8080"
      }
    : allowedOriginsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: CorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Ensure database and table exist
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Serve static files first
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("NudgeMeCors");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Map API controllers
app.MapControllers();

// Fallback to index.html for client-side routing (SPA)
app.MapFallbackToFile("index.html");

app.Run();
