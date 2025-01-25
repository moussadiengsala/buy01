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
        stage('Start services') {
          steps {
            sh 'docker compose up -f docker-compose.dep.yml -d'
            sh 'docker compose ps'
          }
        }
    }
}
