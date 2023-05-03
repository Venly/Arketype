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
        stage('Bump version') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'hotfix-*'
                    branch 'release-*'
                }
            }
            steps {
                sh "git config --global user.email \"jenkins@venly.io\""
                sh "git config --global user.name \"Jenkins\""
                sh "npm version prerelease --preid=develop"
            }
        }
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
        stage('Push bumped version to GitHub') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'hotfix-*'
                    branch 'release-*'
                }
            }
            steps {
                withCredentials([gitUsernamePassword(credentialsId: 'GITHUB_CRED', gitToolName: 'Default')]) {
                    sh 'git push origin HEAD:${BRANCH_NAME}'
                    sh 'git push --tags'
                }
            }
        }
    }
    post {
        failure {
            script {
                def packageFile = readJSON file: 'package.json'
                env.BUMPED_VERSION = packageFile.version
                sh 'git tag -d v${BUMPED_VERSION}'
            }
        }
        cleanup {
            cleanWs(deleteDirs: true, patterns: [[pattern: '.git', type: 'INCLUDE']])
        }
    }
}
