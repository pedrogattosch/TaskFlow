FROM mcr.microsoft.com/dotnet/sdk:10.0 AS restore
WORKDIR /src

COPY src/TaskFlow.API/TaskFlow.API.csproj src/TaskFlow.API/
COPY src/TaskFlow.Application/TaskFlow.Application.csproj src/TaskFlow.Application/
COPY src/TaskFlow.Domain/TaskFlow.Domain.csproj src/TaskFlow.Domain/
COPY src/TaskFlow.Infrastructure/TaskFlow.Infrastructure.csproj src/TaskFlow.Infrastructure/
COPY tests/TaskFlow.UnitTests/TaskFlow.UnitTests.csproj tests/TaskFlow.UnitTests/
COPY tests/TaskFlow.IntegrationTests/TaskFlow.IntegrationTests.csproj tests/TaskFlow.IntegrationTests/

RUN dotnet restore src/TaskFlow.API/TaskFlow.API.csproj
RUN dotnet restore tests/TaskFlow.UnitTests/TaskFlow.UnitTests.csproj
RUN dotnet restore tests/TaskFlow.IntegrationTests/TaskFlow.IntegrationTests.csproj

FROM restore AS build
COPY src/ src/
COPY tests/ tests/
COPY deploy/docker/ deploy/docker/

RUN dotnet publish src/TaskFlow.API/TaskFlow.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM build AS test-runner
RUN chmod +x /src/deploy/docker/run-tests.sh
ENTRYPOINT ["/src/deploy/docker/run-tests.sh"]

FROM build AS migrator
RUN dotnet tool install --tool-path /tools dotnet-ef --version 10.0.5
ENV PATH="/tools:${PATH}"
RUN chmod +x /src/deploy/docker/migrate.sh
ENTRYPOINT ["/src/deploy/docker/migrate.sh"]

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "TaskFlow.API.dll"]
