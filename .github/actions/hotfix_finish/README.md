# Hotfix Node Application Finish

This GitHub Action concludes the hotfix process for a Node.js application. It finalizes the hotfix version, merges the hotfix into the production branch, tags the release, publishes the hotfix, and cleans up the hotfix branch.

## Inputs

| Input  | Description                      | Required |
|--------|----------------------------------|----------|
| `token`| The VENLY_GITHUB_ACTIONS_TOKEN.  | Yes      |

## Runs

This action operates using the "composite" run type and carries out the steps outlined below:

1. **Set HOME environment variable** to define a consistent workspace for the action.
2. **Setup Git Credentials** to ensure access to the repository for operations such as checkout, commit, and push.
3. **Determine Master or Main** to identify the production branch.
4. **Checkout production branch** to apply the hotfix.
5. **Setup Node.js environment** with the specified Node.js version (defaults to 16.x).
6. **Identify the hotfix branch** by fetching remote branches and filtering for the hotfix pattern.
7. **Switch to the hotfix branch** to finalize the version and prepare for merging.
8. **Bump Version and Create Tag** using npm to finalize the hotfix version and prepare for release.
9. **Get npm version for hotfix** to capture the new version number from `package.json`.
10. **Checkout and Merge to Production Branch** to apply the hotfix changes to the production codebase.
11. **Publish Hotfix** using GitHub Releases to distribute the hotfix version.
12. **Switch to Development Branch** to integrate the hotfix changes into the ongoing development work.
13. **Merge to Develop** to synchronize the development branch with the hotfix and production changes.
14. **Push Changes** to both develop and production branches to finalize the hotfix process.
15. **Cleanup Release Branch** by deleting the hotfix branch to clean up the repository.

## Hotfix Flow Info

This action also provides detailed information about the hotfix process, including the workflow name, actor, repository, reference, hotfix version, commit SHA, run ID, and run number.

## Example Usage

```yaml
jobs:
  hotfix_finish_job:
    runs-on: docker-runner
    name: Finish Hotfix Node Application
    steps:
      - name: Hotfix Node App Finish
        uses: ArkaneNetwork/venly-github-workflows/.github/actions/hotfix_java_start@main
        with:
          token: ${{ secrets.VENLY_GITHUB_ACTIONS_TOKEN }}
```
