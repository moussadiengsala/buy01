pipeline {
    agent any

    stages {
        // Build and Test each microservice
        stage('Build and Test Users Service') {
            steps {
                dir('api/users') { // Navigate to the users microservice directory
                    echo 'Building Users Service...'
                    sh 'mvn clean install'
                    echo 'Testing Users Service...'
                    sh 'mvn test'
                }
            }
        }

        stage('Build and Test Products Service') {
            steps {
                dir('api/products') { // Navigate to the products microservice directory
                    echo 'Building Products Service...'
                    sh 'mvn clean install'
                    echo 'Testing Products Service...'
                    sh 'mvn test'
                }
            }
        }

        stage('Build and Test Media Service') {
            steps {
                dir('api/media') { // Navigate to the media microservice directory
                    echo 'Building Media Service...'
                    sh 'mvn clean install'
                    echo 'Testing Media Service...'
                    sh 'mvn test'
                }
            }
        }

        stage('Build and Test Registry Service') {
            steps {
                dir('api/registry') { // Navigate to the registry microservice directory
                    echo 'Building Registry Service...'
                    sh 'mvn clean install'
                    echo 'Testing Registry Service...'
                    sh 'mvn test'
                }
            }
        }

        stage('Build and Test Gateway Service') {
            steps {
                dir('api/gateways') { // Navigate to the gateway microservice directory
                    echo 'Building Gateway Service...'
                    sh 'mvn clean install'
                    echo 'Testing Gateway Service...'
                    sh 'mvn test'
                }
            }
        }

        // Build and Test Front-End
        stage('Build and Test Front-End') {
            steps {
                dir('front-end') { // Navigate to the front-end directory
                    echo 'Installing Front-End dependencies...'
                    sh 'npm install'
                    echo 'Running Front-End Tests...'
                    sh 'ng test --watch=false --browsers=ChromeHeadless' // Run Angular tests
                    echo 'Building Front-End...'
                    sh 'ng build --prod'
                }
            }
        }
    }

    post {
        success {
            echo 'Build and Test succeeded for all services and the front-end!'
        }
        failure {
            echo 'Build or Test failed for one or more components.'
        }
        always {
            // Publish JUnit results (for backend services)
            junit '**/target/surefire-reports/*.xml'

            // Optionally archive front-end build artifacts
            archiveArtifacts artifacts: 'front-end/dist/**/*', onlyIfSuccessful: true
        }
    }
}
