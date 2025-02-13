# .NET 8 SDK ile build aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Önce sadece .csproj dosyasını kopyala ve restore et
COPY backend-employee-management/*.csproj ./
RUN dotnet restore

# Şimdi tüm dosyaları kopyala ve build yap
COPY backend-employee-management/. ./
RUN dotnet publish -c Release -o /out

# .NET 8 Runtime kullanarak çalıştırma ortamı oluştur
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

# Railway’in atadığı PORT’u kullan
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

CMD ["dotnet", "backend-employee-management.dll"]
