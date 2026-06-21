pipeline {
    agent any

    tools {
        // Debe coincidir EXACTAMENTE con el nombre que configuraste
        // en Manage Jenkins > Tools > NodeJS Installations
        nodejs 'node-20'
    }

    environment {
        // Karma necesita un Chrome/Chromium "headless" porque el
        // contenedor de Jenkins no tiene interfaz gráfica.
        CHROME_BIN = '/usr/bin/chromium'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Descargando código fuente...'
                checkout scm
            }
        }

        stage('Verificar herramientas') {
            steps {
                sh '''
                    echo "Node version:"
                    node -v
                    echo "NPM version:"
                    npm -v
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Instalando dependencias...'
                sh 'npm ci'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo '🧪 Ejecutando pruebas unitarias...'
                sh 'npm run test -- --watch=false --browsers=ChromeHeadlessCI --code-coverage'
            }
        }
    }

    post {
        always {
            echo '📊 Publicando resultados de pruebas...'
            // Requiere el plugin "JUnit" y que karma.conf.js genere
            // un reporte JUnit (ver instrucciones más abajo).
            junit allowEmptyResults: true, testResults: 'test-results/**/*.xml'

            // Requiere el plugin "Cobertura" o "HTML Publisher",
            // dependiendo de cómo se configure el reporter de coverage.
            archiveArtifacts allowEmptyArchive: true, artifacts: 'coverage/**', fingerprint: true
        }
        success {
            echo '✅ Pruebas completadas exitosamente.'
        }
        failure {
            echo '❌ Las pruebas fallaron. Revisa el Console Output.'
        }
    }
}