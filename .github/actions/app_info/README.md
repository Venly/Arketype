# Application Info Action

## Description

The "Application Info" GitHub Action is designed to determine and display vital information about your application. It checks the application type (Node.js or Java), extracts the application version, and gathers relevant Git information.

## Inputs

| Input   | Description          | Required |
|---------|----------------------|----------|
| `branch`| Name of the branch   | Yes      |

## Outputs

| Output       | Description              |
|--------------|--------------------------|
| `app_version`| Application Version      |
| `sha_tag`    | The SHA tag              |
| `branch_tag` | The branch tag           |

## Steps

1. **Determine Application Type**: Checks if the application is a Node.js or Java application.
2. **Get NPM Version**: Retrieves the version from `package.json` if the application is a Node.js project.
3. **Extract Version from pom.xml**: Extracts the version from `pom.xml` for Java applications.
4. **Set Application Version**: Sets the application version based on the extracted data.
5. **Set Git Info**: Retrieves and sets information from Git such as SHA tag and branch tag.
6. **Display Application Info**: Displays a comprehensive overview of the application information, including type, branch, version, Git SHA, run ID, job ID, workflow trigger event, timestamp, and more.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Fetch Application Info
  uses: Venly/venly-github-workflows/.github/actions/app_info@main
  with:
    branch: <your-branch-name>
```
