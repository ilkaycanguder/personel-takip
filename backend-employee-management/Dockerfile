# .NET SDK kullanarak build işlemi yap
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Önce yalnızca proje dosyalarını kopyala (bu adım .csproj dosyasını kopyalar)
COPY backend-employee-management/*.csproj ./

# Bağımlılıkları yükle
RUN dotnet restore

# Şimdi tüm proje dosyalarını kopyala
COPY backend-employee-management/. ./

# Build işlemi yap
RUN dotnet publish -c Release -o /out

# Runtime ortamına geç
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

# Railway’in atadığı PORT’u kullan
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

CMD ["dotnet", "backend-employee-management.dll"]
