FROM maven:3-openjdk-17-slim

WORKDIR /app

COPY mvn pom.xml ./
COPY .mvn/ .mvn
RUN ./mvn dependency:go-offline -a

COPY src ./src

CMD ["mvn"]
