pipeline {
    agent any

    stages {
        stage("verify tools") {
            steps sh '''
              docker version
              docker info
              docker compose version 
              curl --version
              jq --version
            '''
        }
    }
}
