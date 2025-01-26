#FROM openjdk:17-jdk-alpine
#ARG JAR_FILE=target/*.jar
#COPY ${JAR_FILE} app.jar
#ENTRYPOINT ["java", "-Dspring.profiles.active=docker",  "-jar", "/app.jar"]

FROM maven:3-openjdk-17-slim

WORKDIR /app

COPY pom.xml ./
COPY .mvn .mvn
RUN mvn dependency:go-offline

COPY src ./src

CMD ["mvn"]