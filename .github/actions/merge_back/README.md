# Merge Back to Development Action

## Description

The "Merge Back to Development" Action automates the process of merging changes from a specified branch back into the development branch. This action is typically used in continuous integration workflows to ensure that feature branches or release branches are correctly merged back after completion.

## Inputs

| Input     | Description                         | Required |
| --------- | ----------------------------------- | -------- |
| `branch`  | The branch to merge into develop    | Yes      |
| `token`   | The VENLY_GITHUB_ACTIONS_TOKEN      | Yes      |

## Steps

1. **Branch Identification**: Identifies and echoes the branch to be merged.
2. **Checkout Code**: Checks out the code from the specified branch.
3. **Git Credentials Setup**: Configures Git credentials for push operations.
4. **Merge Operation**: Performs the merge operation from the specified branch to the development branch.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Merge Back to Development
  uses: ArkaneNetwork/venly-github-workflows/.github/actions/merge_back@main
  with:
    branch: "<branch-name>"
    token: "<github-actions-token>"
```
