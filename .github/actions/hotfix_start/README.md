# Hotfix Node Application Start

This GitHub Action initiates the hotfix process for a Node.js application. It sets up the environment, configures Git credentials, determines the production branch, and prepares a new hotfix branch with a bumped version based on the semantic versioning from `package.json`.

## Inputs

| Input  | Description                      | Required |
|--------|----------------------------------|----------|
| `token`| The VENLY_GITHUB_ACTIONS_TOKEN.  | Yes      |

## Runs

This action utilizes the "composite" run type to execute the following steps:

1. **Set HOME environment variable** to help with tooling and scripts that might need a HOME directory.
2. **Setup Git Credentials** for subsequent Git operations within the action.
3. **Determine Master or Main** to find the production branch name (either `master` or `main`).
4. **Checkout production branch** to start the hotfix process from the current production codebase.
5. **Setup Node.js environment** using the specified Node.js version (defaults to 16.x).
6. **Bump the application version** in `package.json` to a new prepatch version with `SNAPSHOT` preid, without creating a Git tag.
7. **Extract the semantic version** from `package.json` and prepare it for use in branch naming and tagging.
8. **Create a Hotfix Branch** with the new version and push it to the remote repository.
9. **Switch to the development branch** to prepare for the merge back into the development branch after the hotfix is finalized.
10. **Merge the hotfix changes back into the development branch** after adjusting versioning to avoid merge conflicts.
11. **Display Hotfix Process Info** if the flow is set to 'finish', including workflow name, actor, repository, reference, hotfix branch, commit SHA, run ID, and run number.

## Hotfix Flow Info

At the end of the action, if the flow is set to 'finish', details of the hotfix process are displayed, providing visibility into the workflow execution and important references.

## Example Usage

```yaml
jobs:
  hotfix_start_job:
    runs-on: docker-runner
    name: Start Hotfix Node Application
    steps:
      - name: Hotfix Node App Start
        uses: ArkaneNetwork/venly-github-workflows/.github/actions/hotfix_node_start@main
        with:
          token: ${{ secrets.VENLY_GITHUB_ACTIONS_TOKEN }}
```
