# Release Node Application Action

## Description

The "Release Node Application" Action automates the release process for Node.js applications. It covers both starting and finishing release flows, incorporating version management, changelog generation, merging, and tagging.

## Inputs

| Input       | Description                         | Required |
| ----------- | ----------------------------------- | -------- |
| `flow`      | Release flow, can be 'start' or 'finish' | Yes    |
| `token`     | The VENLY_GITHUB_ACTIONS_TOKEN      | Yes      |

## Steps

1. **Checkout Code**: Checks out the code from the development branch.
2. **Setup Node.js**: Sets up the Node.js environment for the build process.
3. **Release Flow Start**: If the `flow` input is 'start', it initiates the release process by creating a new release branch and bumping the version.
4. **Release Flow Finish**: If the `flow` input is 'finish', it finalizes the release process, including merging changes to the production branch, creating a release, and updating the development branch.
5. **Build Changelog**: Generates a changelog for the release using the release-changelog-builder action.
6. **Publish Release**: Creates a GitHub release with the new version number and the generated changelog.
7. **Cleanup**: Deletes the release branch after the release is finished.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Release Node Application
  uses: ArkaneNetwork/venly-github-workflows/.github/actions/release_node@main
  with:
    flow: "<start/finish>"
    token: "<github-actions-token>"
```
