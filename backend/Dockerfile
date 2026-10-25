# Build with the same Java version as the application.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml ./
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN groupadd --system clickcart && useradd --system --gid clickcart clickcart \
    && mkdir -p /app/data/attachments /app/data/proofs \
    && chown -R clickcart:clickcart /app
COPY --from=build --chown=clickcart:clickcart /build/target/clickcart-backend-0.0.1-SNAPSHOT.jar /app/app.jar
USER clickcart
ENV SPRING_PROFILES_ACTIVE=prod
ENV SPRING_CONFIG_NAME=application,application-render
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=60 -XX:+ExitOnOutOfMemoryError"
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
