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
          when {
            anyOf {
                branch 'develop'
                branch 'master'
                branch 'hotfix-*'
                branch 'release-*'
            }
          }
          steps {
            sh 'ls -l'
            sh 'docker build -t arkanenetwork/arkane-arketype:${BRANCH_NAME} .'
          }
        }
        stage('Docker Push') {
          when {
            anyOf {
                branch 'develop'
                branch 'master'
                branch 'hotfix-*'
                branch 'release-*'
            }
          }
          steps {
            withCredentials([usernamePassword(credentialsId: 'dockerHub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
              sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
              sh "docker push arkanenetwork/arkane-arketype:${BRANCH_NAME} && echo 'pushed'"
            }
          }
        }
    }
}
