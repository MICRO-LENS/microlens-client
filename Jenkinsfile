pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-northeast-2'
        AWS_ACCOUNT_ID = sh(script: 'aws sts get-caller-identity --query Account --output text', returnStdout: true).trim()
        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_TAG      = "${env.GIT_COMMIT[0..6]}"
        INFRA_REPO     = 'https://github.com/MICRO-LENS/microlens-infra.git'
    }

    stages {
        stage('ECR Login') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION \
                      | docker login --username AWS --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Build & Push') {
            steps {
                sh """
                    docker build \
                      --build-arg VITE_API_BASE_URL= \
                      -t $ECR_REGISTRY/microlens-client:$IMAGE_TAG .
                    docker push $ECR_REGISTRY/microlens-client:$IMAGE_TAG
                """
            }
        }

        stage('Update Manifests') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-pat',
                                  usernameVariable: 'GIT_USER',
                                  passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
                        rm -rf /tmp/microlens-infra

                        git clone https://$GIT_TOKEN@github.com/MICRO-LENS/microlens-infra.git /tmp/microlens-infra

                        cd /tmp/microlens-infra/k8s/overlays/phase2

                        kustomize edit set image \
                          microlens-client=$ECR_REGISTRY/microlens-client:$IMAGE_TAG

                        git config user.email "jenkins@microlens"
                        git config user.name "Jenkins CI"
                        git add kustomization.yaml
                        git commit -m "ci: update microlens-client image tag to $IMAGE_TAG [skip ci]"

                        git push https://$GIT_TOKEN@github.com/MICRO-LENS/microlens-infra.git main
                    '''
                }
            }
        }
    }

    post {
        success { echo "Build & Deploy manifest update 완료: $IMAGE_TAG" }
        failure { echo "Pipeline 실패" }
    }
}
