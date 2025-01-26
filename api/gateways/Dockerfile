FROM maven:3-openjdk-17-slim

WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn/ .mvn
RUN ./mvnw dependency:go-offline

COPY src ./src

CMD ["mvn"]

