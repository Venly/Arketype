pipeline {
    agent any
    environment {
        GITHUB_CREDS = credentials('GITHUB_CRED')
    }
    options {
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
    }
    stages {
        stage('Docker Build') {
          steps {
            sh 'ls -l'
            sh 'docker build -t fundrequestio/arkane-arketype:${BRANCH_NAME} .'
          }
        }
        stage('Docker Push') {
          steps {
            withCredentials([usernamePassword(credentialsId: 'dockerHub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
              sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
              sh "docker push fundrequestio/arkane-arketype:${BRANCH_NAME} && echo 'pushed'"
            }
          }
        }
        stage('Test') {
          steps {
            browserstack(credentialsId: '173f1b06-fe19-4ee3-bb13-a4e6ca83bf46') {
              sh 'bash ./runTests.sh'
            }
          }
        }
    }
}