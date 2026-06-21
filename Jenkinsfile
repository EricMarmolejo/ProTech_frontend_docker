pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    environment {
        NODE_ENV = 'production'
        DOCKER_IMAGE_NAME = 'protech-frontend'
        DOCKER_REGISTRY = 'docker.io'  // Cambiar según tu registry
    }

    stages {
        stage('Checkout') {
            steps {
                echo '========== Descargando código del repositorio =========='
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '========== Instalando dependencias de npm =========='
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo '========== Construyendo aplicación Angular =========='
                bat 'npm run build'
            }
        }

        stage('Run Tests') {
            steps {
                echo '========== Ejecutando tests =========='
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    bat 'npm test -- --watch=false --code-coverage'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '========== Construyendo imagen Docker =========='
                script {
                    bat "docker build -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} ."
                    bat "docker build -t ${DOCKER_IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Test Docker Container') {
            steps {
                echo '========== Probando contenedor Docker =========='
                script {
                    try {
                        bat "docker run --rm -p 8080:80 --name protech-test-${BUILD_NUMBER} -d ${DOCKER_IMAGE_NAME}:latest"
                        bat 'timeout /t 5'
                        bat "docker stop protech-test-${BUILD_NUMBER}"
                        echo 'Contenedor ejecutado correctamente'
                    } catch (Exception e) {
                        echo "Error en test del contenedor: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
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
                        bat '''
                            docker login -u %DOCKER_USER% -p %DOCKER_PASS%
                            docker tag ${DOCKER_IMAGE_NAME}:latest %DOCKER_REGISTRY%/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}
                            docker push %DOCKER_REGISTRY%/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}
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
            script {
                bat 'docker image prune -f'
            }
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
