pipeline {
    agent any

    stages {
        stage('Start Required Services') {
            steps {
                script {
                    // Start Docker Compose services if not running
                    sh '''
                    if ! docker ps --format "{{.Names}}" | grep -q "registery"; then
                        COMPOSE_PROFILES="run" docker-compose up -d registery
                    fi
                    if ! docker ps --format "{{.Names}}" | grep -q "mongodb"; then
                        docker-compose up -d mongodb
                    fi
                    if ! docker ps --format "{{.Names}}" | grep -q "kafka"; then
                        docker-compose up -d kafka
                    fi
                    if ! docker ps --format "{{.Names}}" | grep -q "gateway"; then
                        COMPOSE_PROFILES="run" docker-compose up -d gateway
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
                        sh 'ng test'
                    }

                    // Run tests for microservices
                    dir('api/users') {
                        sh './mvnw test'
                    }
                    dir('api/products') {
                        sh './mvnw test'
                    }
                    dir('api/media') {
                        sh './mvnw test'
                    }
                }
            }
        }

        stage('Verify Files') {
            steps {
                script {
                    echo 'Checking cloned files...'
                    sh 'ls -la'
                }
            }
        }

        stage('Simple Command') {
            steps {
                script {
                    echo 'Running a simple shell command...'
                    sh 'echo "Jenkins pipeline is working!"'
                }
            }
        }
    }
}
