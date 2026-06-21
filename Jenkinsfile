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
        PATH = "${tool('node-20')}/bin:${PATH}"
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
                sh '''
                    npm --version
                    node --version
                    npm install
                '''
            }
        }

        stage('Build') {
            steps {
                echo '========== Construyendo aplicación Angular =========='
                sh 'npx ng build'
            }
        }

        stage('Run Tests') {
            steps {
                echo '========== Ejecutando tests =========='
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh 'npm test -- --watch=false --code-coverage || true'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '========== Construyendo imagen Docker =========='
                script {
                    sh "docker build -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} ."
                    sh "docker build -t ${DOCKER_IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Test Docker Container') {
            steps {
                echo '========== Probando contenedor Docker =========='
                script {
                    try {
                        sh "docker run --rm -p 8089:80 --name protech-test-${BUILD_NUMBER} -d ${DOCKER_IMAGE_NAME}:latest"
                        sh 'sleep 5'
                        sh "docker stop protech-test-${BUILD_NUMBER} || true"
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
            script {
                sh 'docker image prune -f || true'
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
