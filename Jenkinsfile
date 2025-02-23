pipeline {
    agent any

    environment {
        REGISTRY_IP = '13.49.224.62'
        GATEWAY_IP = '51.20.81.3'
        KAFKA_IP = "13.49.226.45"
        MONGO_IP = "13.49.226.45"
        USER_SERVICE_IP = "51.20.251.106"
        PRODUCT_SERVICE_IP = "13.51.165.5"
        MEDIA_SERVICE_IP = "51.20.132.136"
        FRONTEND_IP = "13.60.220.110"

        DEPLOY_PATH = '/opt/services'
        FRONTEND_DEPLOY_PATH = '/var/www/html'

        SSH_REGISTRY_KEY = "ssh-registry-service-key"
        SSH_GATEWAY_KEY = "ssh-gateway-service-key"

        SSH_USER_KEY = "ssh-user-service-key"
        SSH_PRODUCT_KEY = "ssh-product-service-key"
        SSH_MEDIA_KEY = "ssh-media-service-key"

        SSH_FRONTEND_KEY = "ssh-frontend-service-key"

    }

    stages {
        stage('Build & Test') {
            steps {
                script {
                    echo "Building and testing all services..."

                    // Build and test backend services
                    parallel(
                        "User Service": {
                            dir('api/users') {
                                sh 'mvn clean package -DskipTests=false'
                            }
                        },
                        "Product Service": {
                            dir('api/products') {
                                sh 'mvn clean package -DskipTests=false'
                            }
                        },
                        "Media Service": {
                            dir('api/media') {
                                sh 'mvn clean package -DskipTests=false'
                            }
                        }
                    )

                    // Build and test frontend
                    dir('frontend') {
                        sh 'npm install'
                        sh 'ng test --watch=false'
                        sh 'ng build --prod'
                    }
                }
            }
        }

        stage('Deploy GATEWAY and REGISTRY') {
            steps {
                sshagent([SSH_REGISTRY_KEY, SSH_GATEWAY_KEY]) {
                    // Deploy Registry
                    sh """
                        scp -o StrictHostKeyChecking=no registry-service/target/*.jar ubuntu@${REGISTRY_IP}:${DEPLOY_PATH}/
                        ssh ubuntu@${REGISTRY_IP} 'sudo systemctl restart registry'
                    """

                    // Wait for Registry to initialize
                    sleep(time: 30, unit: 'SECONDS')

                    // Deploy Gateway
                    sh """
                        scp -o StrictHostKeyChecking=no gateway-service/target/*.jar ubuntu@${GATEWAY_IP}:${DEPLOY_PATH}/
                        ssh ubuntu@${GATEWAY_IP} 'sudo systemctl restart gateway'
                    """
                }
            }
        }

        // Stage 3: Deploy Microservices
        stage('Deploy Microservices') {
            steps {
                echo "Deploying microservices..."

                parallel(
                    "User Service": {
                        sshagent([SSH_USER_KEY]) {
                            sh """
                                scp -o StrictHostKeyChecking=no user-service/target/*.jar ubuntu@${USER_SERVICE_IP}:${DEPLOY_PATH}/
                                ssh ubuntu@${USER_SERVICE_IP} 'sudo systemctl restart user'
                            """
                        }
                    },
                    "Product Service": {
                        sshagent([SSH_PRODUCT_KEY]) {
                            sh """
                                scp -o StrictHostKeyChecking=no product-service/target/*.jar ubuntu@${PRODUCT_SERVICE_IP}:${DEPLOY_PATH}/
                                ssh ubuntu@${PRODUCT_SERVICE_IP} 'sudo systemctl restart product'
                            """
                        }
                    },
                    "Media Service": {
                        sshagent([SSH_MEDIA_KEY]) {
                            sh """
                                scp -o StrictHostKeyChecking=no media-service/target/*.jar ubuntu@${MEDIA_SERVICE_IP}:${DEPLOY_PATH}/
                                ssh ubuntu@${MEDIA_SERVICE_IP} 'sudo systemctl restart media'
                            """
                        }
                    }
                )
            }
        }

        // Stage 4: Deploy Frontend
        stage('Deploy Frontend') {
            steps {
                echo "Deploying frontend..."
                sshagent([SSH_FRONTEND_KEY]) {
                    sh """
                        scp -r frontend/dist/* ubuntu@${FRONTEND_IP}:${FRONTEND_DEPLOY_PATH}/
                        ssh ubuntu@${FRONTEND_IP} 'sudo systemctl restart nginx'
                    """
                }
            }
        }
    }

    post {
        success {
            slackSend(message: "Deployment Successful: ${env.JOB_NAME} ${env.BUILD_NUMBER}")
        }
        failure {
            slackSend(message: "Deployment Failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}")
        }
    }
}
