#FROM openjdk:17-jdk-alpine
#ARG JAR_FILE=target/*.jar
#COPY ${JAR_FILE} app.jar
#ENTRYPOINT ["java","-jar","/app.jar"]


# Étape 1 : Construction
FROM maven:3.8.5-openjdk-17 AS builder
WORKDIR /app
COPY . /app
RUN mvn clean package

# Étape 2 : Exécution
FROM openjdk:17-jdk-alpine
ARG JAR_FILE=target/*.jar
COPY --from=builder /app/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
