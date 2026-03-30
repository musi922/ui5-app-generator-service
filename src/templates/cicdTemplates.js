const cicdTemplates = {
  github: {
    path: '.github/workflows/ci.yml',
    content: `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    name: Lint & Build
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Build UI5 application
        run: npm run build

      - name: Archive build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-{{projectName}}
          path: dist/
          retention-days: 7

  deploy-dev:
    name: Deploy to DEV
    needs: lint-and-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: development

    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-{{projectName}}
          path: dist/

      - name: Deploy to ABAP system (DEV)
        run: |
          echo "Add your deployment step here (e.g. ui5-task-zipper + abapdeploytool)"
`,
  },

  gitlab: {
    path: '.gitlab-ci.yml',
    content: `stages:
  - lint
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

cache:
  paths:
    - .npm/

lint:
  stage: lint
  image: node:\${NODE_VERSION}-alpine
  script:
    - npm ci
    - npm run lint
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

build:
  stage: build
  image: node:\${NODE_VERSION}-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

deploy-dev:
  stage: deploy
  image: node:\${NODE_VERSION}-alpine
  script:
    - echo "Add your ABAP/BTP deployment script here"
  environment:
    name: development
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

deploy-prod:
  stage: deploy
  image: node:\${NODE_VERSION}-alpine
  script:
    - echo "Add your production deployment script here"
  environment:
    name: production
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  when: manual
`,
  },

  'azure-devops': {
    path: 'azure-pipelines.yml',
    content: `trigger:
  branches:
    include:
      - main
      - develop

pr:
  branches:
    include:
      - main

pool:
  vmImage: ubuntu-latest

variables:
  nodeVersion: '20.x'

stages:
  - stage: CI
    displayName: Lint and Build
    jobs:
      - job: LintAndBuild
        displayName: Lint & Build
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: Setup Node.js

          - script: npm ci
            displayName: Install dependencies

          - script: npm run lint
            displayName: Run ESLint

          - script: npm run build
            displayName: Build application

          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: dist
              ArtifactName: dist-{{projectName}}
            displayName: Publish artifacts

  - stage: DeployDev
    displayName: Deploy DEV
    dependsOn: CI
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    jobs:
      - deployment: DeployDev
        environment: development
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Add ABAP / BTP deployment here"
                  displayName: Deploy to DEV
`,
  },

  jenkins: {
    path: 'Jenkinsfile',
    content: `pipeline {
  agent {
    docker {
      image 'node:20-alpine'
      args '-v /var/run/docker.sock:/var/run/docker.sock'
    }
  }

  environment {
    NPM_CONFIG_CACHE = "\${WORKSPACE}/.npm"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(false)
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
      post {
        success {
          archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }
      }
    }

    stage('Deploy DEV') {
      when {
        branch 'develop'
      }
      steps {
        sh 'echo "Add your ABAP/BTP deployment script here"'
      }
    }

    stage('Deploy PROD') {
      when {
        branch 'main'
      }
      input {
        message 'Deploy to production?'
        ok 'Deploy'
      }
      steps {
        sh 'echo "Add your production deployment script here"'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    failure {
      emailext(
        subject: "Build FAILED: \${env.JOB_NAME} #\${env.BUILD_NUMBER}",
        body: "Check \${env.BUILD_URL}",
        to: '{{authorEmail}}'
      )
    }
  }
}
`,
  },
};

export default cicdTemplates;
