# .NET 8 SDK ile build aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Proje dosyalarını kopyala ve bağımlılıkları yükle
COPY . . 
RUN dotnet restore
RUN dotnet publish -c Release -o /out

# Runtime ortamını ayarla
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

# Ortam değişkenlerini tanımla (PostgreSQL için)
ENV ASPNETCORE_URLS=http://+:8080

# Railway'in default portunu dinle
EXPOSE 8080

# Uygulamayı başlat
CMD ["dotnet", "backend-employee-management.dll"]
