pipeline {
  agent any
  stages {
    
    stage('Prepare') {
      steps {
        sh "ssh BUadmin@192.168.10.19 'cd ov-frontend && git checkout package-lock.json'"
        sh "ssh BUadmin@192.168.10.19 'cd ov-frontend && git pull origin backup'"
      }
    }
    
    stage('Build') {
      steps {
        sh "ssh BUadmin@192.168.10.19 'cd ov-frontend && npm install'"
      }
    }
    

  }
 post {
        changed {
            script {
                if (currentBuild.currentResult == 'FAILURE') { // Other values: SUCCESS, UNSTABLE
                    // Send an email only if the build status has changed from green/unstable to red
                    emailext subject: '$DEFAULT_SUBJECT',
                        body: '$DEFAULT_CONTENT',
                        recipientProviders: [
                            [$class: 'CulpritsRecipientProvider'],
                            [$class: 'DevelopersRecipientProvider'],
                            [$class: 'RequesterRecipientProvider']
                        ], 
                        replyTo: '$DEFAULT_REPLYTO',
                        to: '$DEFAULT_RECIPIENTS'
                }
            }
        }
    }

}
