@REM Maven Wrapper startup batch script
@echo off
setlocal
set "MVNW_PROJECTBASEDIR=%~dp0"
set "MVNW_PROJECTBASEDIR=%MVNW_PROJECTBASEDIR:~0,-1%"
set "MVNW_WRAPPER_JAR=%MVNW_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
if not exist "%MVNW_WRAPPER_JAR%" (
  echo Maven wrapper JAR is missing: %MVNW_WRAPPER_JAR%
  exit /b 1
)
java %MAVEN_OPTS% -classpath "%MVNW_WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MVNW_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal
