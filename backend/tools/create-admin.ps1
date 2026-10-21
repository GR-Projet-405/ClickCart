$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    & .\mvnw.cmd -q -DskipTests compile org.apache.maven.plugins:maven-dependency-plugin:3.8.1:build-classpath '-Dmdep.outputFile=target/admin-cli-classpath.txt'
    if ($LASTEXITCODE -ne 0) { throw 'Could not prepare the administrator tool.' }
    $adminClasspath = 'target/classes;' + (Get-Content -Raw target/admin-cli-classpath.txt).Trim()
    & java --class-path $adminClasspath tools/CreateAdmin.java
    if ($LASTEXITCODE -ne 0) { throw 'Administrator creation did not complete. See the message above.' }
} finally { Pop-Location }
