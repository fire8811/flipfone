# Using Git
For this project, we are using Git, a version control system.

## How to use git with branches
To create a branch locally, run this command.
```bash
git checkout -b <branch name>
```
Once you have a branch, you can merge dev into it by using.
```bash
git pull origin dev
```
To merge your changes into dev, follow these steps:
Once you have a branch, you can merge dev into it by using
```bash
git checkout dev
```
This switches to our dev branch.
```bash
git pull
```
This pulls the dev branch from Github, grabbing everyone's work.
```bash
git merge <my branch>
```
This merges your branch into the branch you are in (dev). At this point, you may need to resolve merge conflicts. In VSCode, you will be prompted to resolve conflicts if there are any. This pulls the dev branch from Github, grabbing everyone's work.
