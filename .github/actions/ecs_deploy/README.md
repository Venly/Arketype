# Deploy ECS Application Action

## Description

The "Deploy ecs Application" Action is designed for deploying applications to AWS Elastic Container Service (ECS). It handles the entire deployment process including setting up AWS credentials, configuring the ECS task definition, deploying to ECS, and tagging resources for better management and tracking.

## Inputs

| Input                        | Description                              | Required | Default     |
| ---------------------------- | ---------------------------------------- | -------- | ----------- |
| `aws_region`                 | AWS region to deploy to                  | No       | `eu-west-1` |
| `aws_role`                   | AWS role to use                          | Yes      |             |
| `aws_ecr_role`               | AWS ECR role to use                      | Yes      |             |
| `cluster_name`               | Name of the ECS cluster                  | Yes      |             |
| `ecr_repo`                   | Name of the ECR repository               | Yes      |             |
| `environment`                | Environment to deploy to                 | Yes      | `qa`        |
| `service_name`               | Name of the service                      | Yes      |             |
| `slack_notification_webhook` | Slack Webhook for notifications          | Yes      |             |
| `tag_to_deploy`              | Name of the tag to deploy                | Yes      |             |
| `token`                      | The VENLY_GITHUB_ACTIONS_TOKEN           | Yes      |             |

## Steps

1. **Checkout Code**: Checks out the necessary code for deployment.
2. **Configure AWS ECR Credentials**: Sets up AWS credentials for ECR.
3. **Login to Amazon ECR**: Logs into Amazon ECR.
4. **Read Docker Labels from Artifact**: Reads Docker labels from the build artifact.
5. **Adapt Task Definition**: Adapts the ECS task definition based on deployment parameters.
6. **Render Task Definition File**: Generates the final task definition file for ECS.
7. **Deploy to Amazon ECS**: Deploys the task definition to the specified ECS service.
8. **Update Tags**: Applies tagging for the service, tasks, and ECS cluster for better resource management and tracking.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Deploy to ECS
  uses: ArkaneNetwork/venly-github-workflows/.github/actions/ecs_deploy@main
  with:
    aws_region: "<aws-region>"
    aws_role: "<aws-role>"
    aws_ecr_role: "<aws-ecr-role>"
    cluster_name: "<ecs-cluster-name>"
    ecr_repo: "<ecr-repository-name>"
    environment: "<deployment-environment>"
    service_name: "<ecs-service-name>"
    slack_notification_webhook: "<slack-webhook-url>"
    tag_to_deploy: "<tag-name>"
    token: "<github-actions-token>"
```
