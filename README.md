# canary-sandbox
Area to play with canary tests

## GitHub Actions Canary (migrated from [azure-pipelines-canary](https://github.com/microsoft/azure-pipelines-canary))
This repository is a suite of GitHub Actions workflows built to validate new hosted image releases from [virtual-environments](https://github.com/actions/virutal-environments).  

The workflows that make up the suite of tests are located here: [.github/workflows](.github/workflows)

Only workflows listed in [enabledWorkflows.json](enabledWorkflows.json) will be run as part of the hosted image validation.


| Workflows status (master only) |
| --- |
| ![](https://github.com/bbq-beets/canary-sandbox/workflows/Ruby%20Gems%20Tests/badge.svg) |
| ![](https://github.com/bbq-beets/canary-sandbox/workflows/Ant%20Actions%20Workflow%20Tests/badge.svg) |
| ![](https://github.com/bbq-beets/canary-sandbox/workflows/Node%20Actions%20Workflow%20Tests/badge.svg) |
| ![](https://github.com/bbq-beets/canary-sandbox/workflows/dotNet%20Tests/badge.svg) |
| ![](https://github.com/bbq-beets/canary-sandbox/workflows/Haskell%20GHC%20Tests/badge.svg) |

### Adding new tests

To execute the tests locally you will need to create a PAT for this repository then:
- run `npm install`
- run `node actions-canary-runner.js --token <your GitHub token>`

Add a new workflow for the software package you want to test (e.g. ruby or ant)
Refer to the [ant.yml](.github/workflows/ant.yml) for an example

The trigger for the workflow needs to look similar to this in order to be picked up by the test suite. If the workflow is listed in [enabledWorkflows.json](enabledWorkflows.json), `actions-canary-runner.js` will automatically create a commit with a matching `testRun` file to trigger the workflow.  Additionally, having a trigger for pushes to master sets the badge status for the workflow.

Example:
```
on:
  push:
    branches:
      - 'master'
      - 'testrun/**'
    paths:
      - '.github/workflows/<the yaml file name>.yml'
      - 'testRun_<this value needs to match the entry in enabledWorkflows.json>'
```
Add an entry to [enabledWorkflows.json](enabledWorkflows.json) to add your workflow to the test suite.
