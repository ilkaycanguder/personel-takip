using backend_employee_management.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace backend_employee_management
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            //Jwt configuration starts here
            var jwtIssuer = builder.Configuration.GetSection("Jwt:Issuer").Get<string>();
            var jwtKey = builder.Configuration.GetSection("Jwt:Key").Get<string>();

            var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

            if (!string.IsNullOrEmpty(databaseUrl))
            {
                databaseUrl = databaseUrl.Replace("postgres://", ""); // "postgres://" kısmını kaldır
                var userPassHostDb = databaseUrl.Split("@"); // Kullanıcı/Parola ile Host/DB'yi ayır
                var userPass = userPassHostDb[0].Split(":"); // Kullanıcı adı ve şifreyi ayır
                var hostDb = userPassHostDb[1].Split("/"); // Host ve DB ismini ayır
                var hostPort = hostDb[0].Split(":"); // Host ve Port'u ayır

                var username = userPass[0];
                var password = userPass[1];
                var host = hostPort[0];
                var _port = hostPort.Length > 1 ? hostPort[1] : "5432"; // Port varsa al, yoksa default 5432
                var database = hostDb[1];

                var connectionStringBuilder = new Npgsql.NpgsqlConnectionStringBuilder
                {
                    Host = host,
                    Port = int.Parse(_port),
                    Username = username,
                    Password = password,
                    Database = database,
                    SslMode = Npgsql.SslMode.Require,
                    TrustServerCertificate = true
                };

                databaseUrl = connectionStringBuilder.ToString();
            }

            var connectionString = databaseUrl ?? builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<EmployeeManagementDbContext>(options =>
                options.UseNpgsql(connectionString));

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
             .AddJwtBearer(options =>
             {
                 options.TokenValidationParameters = new TokenValidationParameters
                 {
                     ValidateIssuer = true,
                     ValidateAudience = true,
                     ValidateLifetime = true,
                     ValidateIssuerSigningKey = true,
                     ValidIssuer = builder.Configuration["Jwt:Issuer"],
                     ValidAudience = builder.Configuration["Jwt:Audience"],
                     IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                 };
             });
            builder.Services.AddControllers();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });



            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var port = Environment.GetEnvironmentVariable("PORT") ?? "8080"; // Railway'in atad��� portu al, yoksa 8080 kullan
            builder.WebHost.UseUrls($"http://+:{port}");

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            //if (app.Environment.IsDevelopment())
            //{
            app.UseSwagger();
            app.UseSwaggerUI();
            //}

            app.UseHttpsRedirection();

            app.UseCors("AllowAllOrigins");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }

    }
}
