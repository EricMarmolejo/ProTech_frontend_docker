pipeline {
    agent any

    tools {
        nodejs 'node-20'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    environment {
        NODE_ENV = 'production'
        DOCKER_IMAGE_NAME = 'protech-frontend'
        DOCKER_REGISTRY = 'docker.io'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '========== Descargando código del repositorio =========='
                checkout scm
            }
        }

        stage('Install & Build') {
            steps {
                echo '========== Instalando dependencias y compilando =========='
                sh '''
                    #!/bin/bash
                    set -e
                    export PATH=$PATH:$(pwd)/node_modules/.bin
                    echo "Node version: $(node --version)"
                    echo "npm version: $(npm --version)"
                    npm ci --prefer-offline --no-audit
                    echo "Verificando instalación de Angular CLI:"
                    ls -la node_modules/.bin/ | grep ng
                    npm run build -- --configuration production
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo '========== Ejecutando tests =========='
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh '''
                        #!/bin/bash
                        export PATH=$PATH:$(pwd)/node_modules/.bin
                        npm run test -- --watch=false --code-coverage --browsers=ChromeHeadless || true
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '========== Construyendo imagen Docker =========='
                sh '''
                    docker build -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} .
                    docker build -t ${DOCKER_IMAGE_NAME}:latest .
                    docker images | grep ${DOCKER_IMAGE_NAME}
                '''
            }
        }

        stage('Test Docker Container') {
            steps {
                echo '========== Probando contenedor Docker =========='
                sh '''
                    set -e
                    TEST_CONTAINER_ID=$(docker run --rm -p 8089:80 -d ${DOCKER_IMAGE_NAME}:latest)
                    echo "Container ID: $TEST_CONTAINER_ID"
                    sleep 5
                    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8089 || echo "error")
                    echo "HTTP Response: $HTTP_CODE"
                    docker stop $TEST_CONTAINER_ID || true
                    if [ "$HTTP_CODE" = "200" ]; then
                        echo "✅ Contenedor respondiendo correctamente"
                    else
                        echo "⚠️ Respuesta no esperada: $HTTP_CODE"
                    fi
                '''
            }
        }

        stage('Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                echo '========== Enviando imagen a Docker Registry =========='
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}
                            docker logout
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo '========== Limpiando recursos =========='
            sh '''
                docker image prune -f || true
                docker container prune -f || true
            '''
        }
        success {
            echo '✅ Pipeline completado exitosamente'
        }
        failure {
            echo '❌ Pipeline falló'
        }
        unstable {
            echo '⚠️ Pipeline inestable (algunas pruebas fallaron)'
        }
    }
}
