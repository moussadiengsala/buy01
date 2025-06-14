pipeline {
    agent any

     environment {
        CHROME_BIN = '/usr/bin/google-chrome'
        MONGODB_URI = "mongodb://rootuser:password@192.168.1.108:27017/buy01?authSource=admin"
        KAFKA_BOOTSTRAP_SERVERS = "192.168.1.108:9092"
        EUREKA_CLIENT = "http://192.168.1.108:8761/eureka/"
     }

    stages {
        stage('Start Required Services') {
            steps {
                script {
                    // Start Docker Compose services if not running
                    sh '''
                    if ! docker ps --format "{{.Names}}" | grep -q "registery"; then
                        docker-compose -f docker-compose.services.yml up -d registery
                    fi
                    if ! docker ps --format "{{.Names}}" | grep -q "mongodb"; then
                        docker-compose -f docker-compose.dep.yml up -d mongodb
                    fi
                    if ! docker ps --format "{{.Names}}" | grep -q "kafka"; then
                        docker-compose -f docker-compose.dep.yml up -d kafka
                    fi
                    if ! docker ps --format "{{.Names}}" | grep -q "gateway"; then
                        docker-compose -f docker-compose.services.yml up -d gateway
                    fi
                    '''
                    sh 'docker ps'
                }
            }
        }

        stage('Test Frontend and Microservices') {
            steps {
                script {
                    // Run tests for frontend
                    dir('front-end') {
                        sh 'npm install'
                        sh 'ng test --no-watch --code-coverage --browsers=ChromeHeadlessCI'
                    }

                    // Run tests for microservices
                    dir('api/users') {
                        sh 'mvn test -Dspring.profiles.active=prod' // -Dspring.data.mongodb.uri=$MONGODB_URI -Dspring.eureka.client.serviceUrl.defaultZone=$EUREKA_CLIENT -Dspring.kafka.bootstrap-servers=$KAFKA_BOOTSTRAP_SERVERS
                    }
                    dir('api/products') {
                        sh 'mvn test -Dspring.profiles.active=prod' // -Dspring.data.mongodb.uri=$MONGODB_URI -Dspring.eureka.client.serviceUrl.defaultZone=$EUREKA_CLIENT -Dspring.kafka.bootstrap-servers=$KAFKA_BOOTSTRAP_SERVERS
                    }
                    dir('api/media') {
                        sh 'mvn test -Dspring.profiles.active=prod' // -Dspring.data.mongodb.uri=$MONGODB_URI -Dspring.eureka.client.serviceUrl.defaultZne=$EUREKA_CLIENT -Dspring.kafka.bootstrap-servers=$KAFKA_BOOTSTRAP_SERVERS
                    }
                }
            }
        }

        stage('Deployment') {
            steps {
                script {
                    echo 'Deploying services with Docker Compose...'

                    def services = ['users', 'products', 'media', 'front-end']

                    services.each { service ->
                        sh "docker-compose -f docker-compose.services.yml up -d --build ${service}"
                    }

                    sh 'docker ps' // Show running containers for verification
                }
            }
        }
    }
}
