pipeline {
    agent any

    stages {
        stage("Build Services") {
            steps {
                sh 'docker-compose build'
            }
        }

        stage("Testing Services") {
            steps {
                sh 'COMPOSE_PROFILES=test docker-compose up -d'
                sh 'docker ps'
                sh 'docker images'
            }
        }

        stage("Deploy Services") {
            steps {
                sh 'COMPOSE_PROFILES=run docker-compose up -d --force-recreate'
            }
        }

        stage("Health Check") {
            steps {
                sh 'curl -f http://localhost:8082/actuator/health || exit 1'
            }
        }
    }
}
