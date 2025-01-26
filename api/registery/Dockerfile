FROM maven:3-openjdk-17-slim

WORKDIR /app

COPY pom.xml ./
COPY .mvn .mvn
RUN mvn dependency:go-offline

COPY src ./src

#CMD ["mvn"]

CMD ["mvn", "spring-boot:run"]
