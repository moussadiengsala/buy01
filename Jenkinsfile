pipeline {
    agent any

    stages {
        stage("verify tooling") {
          steps {
            sh '''
              docker version
              docker info
              docker-compose version 
              curl --version
            '''
          }
        }

        stage("building registery") {
            steps {
                dir('api/registery') { // Navigate to the products microservice directory
                    echo 'Building Registery Service...'
                    sh 'mvn clean install'
                }
            }
        }

        // stage('Prune Docker data') {
        //   steps {
        //     sh 'docker system prune -a --volumes -f'
        //   }
        // }
        stage('Start services') {
          steps {
            sh 'docker-compose -f docker-compose.dep.yml up -d'
            sh 'docker ps'
          }
        }

        stage("building users service") {
            steps {
                dir('api/users') { // Navigate to the products microservice directory
                    echo 'Building Users Service...'
                    sh 'mvn clean install'
                }
            }
        }

        stage("building products") {
            steps {
                dir('api/products') { // Navigate to the products microservice directory
                    echo 'Building Products Service...'
                    sh 'mvn clean install'
                }
            }
        }

        stage("building media") {
            steps {
                dir('api/media') { // Navigate to the products microservice directory
                    echo 'Building Media Service...'
                    sh 'mvn clean install'
                }
            }
        }
    }
}
