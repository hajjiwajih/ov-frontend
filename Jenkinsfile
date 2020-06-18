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
        sh "ssh PRadmin@192.168.10.14 'cd  && ov-frontend npm install'"
      }
    }
    
    stage('Run') {
      steps {
        sh "ssh PRadmin@192.168.10.14 'cd ov-frontend && npm run prod; sleep 50; exit'"
      }
    }

  }
}
