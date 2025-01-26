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

        // stage('Prune Docker data') {
        //   steps {
        //     sh 'docker system prune -a --volumes -f'
        //   }
        // }
        stage('Testing services') {
          steps {
            sh 'COMPOSE_PROFILES=test docker-compose up -d'
            sh 'docker ps'
            sh 'docker images'
          }
        }
    }
}
