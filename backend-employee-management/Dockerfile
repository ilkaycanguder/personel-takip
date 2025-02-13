# .NET SDK kullanarak build yap
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Proje dosyalarını kopyala
COPY backend-employee-management/*.csproj ./
RUN dotnet restore

# Tüm dosyaları kopyala
COPY backend-employee-management/. ./
RUN dotnet publish -c Release -o /out

# Runtime ortamına geç
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

# Railway'in atadığı PORT'u kullan
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE 8080

CMD ["dotnet", "backend-employee-management.dll"]
