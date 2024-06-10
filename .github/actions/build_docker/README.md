# Build Docker Action

## Description

The "Build Container" GitHub Action is designed for building and pushing Docker containers. It includes steps for determining the application type, setting up AWS credentials, logging into Amazon ECR, and executing the Docker build and push process with various options and configurations.

## Inputs

| Input             | Description                         | Required | Default     |
| ----------------- | ----------------------------------- | -------- | ----------- |
| `aws_region`      | AWS region for deployment           | No       | `eu-west-1` |
| `aws_role`        | AWS role to use                     | Yes      |             |
| `branch_tag`      | Branch tag                          | Yes      |             |
| `build_args`      | List of build-time variables        | No       |             |
| `cache_folder`    | Optional cache folder               | No       |             |
| `docker_context`  | Name of the build folder            | Yes      |             |
| `docker_file`     | Path to the Dockerfile              | No       |             |
| `docker_target`   | Name of the Docker file target      | No       |             |
| `ecr_repo`        | Name of the ECR repository          | Yes      |             |
| `push_image`      | Push the image to ECR               | No       | `true`      |
| `sha_tag`         | SHA tag                             | Yes      |             |
| `version_tag`     | Version tag                         | Yes      |             |

## Steps

1. **Determine Application Type**
2. **View Workspace**
3. **Restore Artifacts** (conditional based on application type and cache folder presence)
4. **Configure AWS Credentials**
5. **Login to Amazon ECR**
6. **Extract ECR Region**
7. **Set Current Date**
8. **Set up Docker Buildx**
9. **Docker Metadata Generation**
10. **Create Docker Meta files**
11. **Locally Cache Docker Meta**
12. **Build and Push Docker Image**
13. **Display Build Info**

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Build and Push Container
  uses: ArkaneNetwork/venly-github-workflows/.github/actions/build_docker@main
  with:
    aws_region: "<your-aws-region>"
    aws_role: "<your-aws-role>"
    branch_tag: "<your-branch-tag>"
    build_args: "<your-build-arguments>"
    cache_folder: "<your-cache-folder>"
    docker_context: "<your-docker-context>"
    docker_file: "<path-to-your-dockerfile>"
    docker_target: "<your-docker-target>"
    ecr_repo: "<your-ecr-repository>"
    push_image: "<true-or-false>"
    sha_tag: "<your-sha-tag>"
    version_tag: "<your-version-tag>"
```
