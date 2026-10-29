pipeline {
  agent {
    docker {
      // Samakan versinya dengan @playwright/test di package.json
      image 'mcr.microsoft.com/playwright:v1.56.0-noble'
      args '--ipc=host'
    }
  }

  environment {
    CI = 'true'
    npm_config_cache = "${WORKSPACE}/.npm"
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Setup .env') {
      steps {
        withCredentials([file(credentialsId: 'playwright-env', variable: 'ENV_FILE')]) {
          sh 'cp "$ENV_FILE" .env'
        }
      }
    }
    stage('Test') {
      steps {
        sh 'npx playwright test'
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
      publishHTML(target: [
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright Report',
        keepAll: true,
        alwaysLinkToLastBuild: true,
        allowMissing: true
      ])
      archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
      sh 'rm -f .env'
    }
  }
}
