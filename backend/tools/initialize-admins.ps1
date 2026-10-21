$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    & .\mvnw.cmd -q -DskipTests compile org.apache.maven.plugins:maven-dependency-plugin:3.8.1:build-classpath '-Dmdep.outputFile=target/admin-cli-classpath.txt'
    if ($LASTEXITCODE -ne 0) { throw 'Could not prepare the database tool.' }
    $adminClasspath = 'target/classes;' + (Get-Content -Raw target/admin-cli-classpath.txt).Trim()
    & java --class-path $adminClasspath tools/InitializeAdmins.java
    if ($LASTEXITCODE -ne 0) { throw 'Collection initialization did not complete.' }
} finally { Pop-Location }
