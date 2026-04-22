#!/bin/sh

set -eu

dotnet test tests/TaskFlow.UnitTests/TaskFlow.UnitTests.csproj -c Release --no-restore
dotnet test tests/TaskFlow.IntegrationTests/TaskFlow.IntegrationTests.csproj -c Release --no-restore
