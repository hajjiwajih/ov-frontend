pipeline {
  agent any
  stages {
    
    stage('Prepare') {
      steps {
        sh "ssh PRadmin@192.168.10.14 'cd ov-frontend && git pull origin master'"
      }
    }
    
    stage('Build') {
      steps {
        sh "ssh PRadmin@192.168.10.14 'cd ov-frontend && npm install'"
      }
    }

  }
post {
        always {
            script {
                if (currentBuild.currentResult == 'FAILURE') { // Other values: SUCCESS, UNSTABLE
                    // Send an email only if the build status has changed from green/unstable to red
                    emailext subject: '$DEFAULT_SUBJECT',
                        body: '$DEFAULT_CONTENT',
                        replyTo: '$DEFAULT_REPLYTO',
                        from: 'contact@ditriot.tn',
                        to: '$DEFAULT_RECIPIENTS'
                }
            }
        }
    }


}
