# Git & GitHub Guide for Beginners

This guide will help you save your code to the cloud (GitHub) so you never lose your work.

## 1. Install Git
Since you don't have Git installed yet:
1.  **Download it**: Go to [git-scm.com](https://git-scm.com/downloads) and download the Windows installer.
2.  **Install it**: Run the installer. You can click "Next" through all the options (the defaults are fine).
3.  **Restart VS Code**: Once installed, close and reopen your editor so it "sees" the new program.

## 2. Configure Git (First Time Only)
Tell Git who you are (so your name appears on your code history). Run these two commands in your terminal:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## 3. The "Save" Process
Using Git is a 3-step cycle:

### Step A: Initialize (Start)
This turns your current folder into a "Git Repository" (a tracked project). You only do this **once** per project.
```bash
git init
```
*   *Explanation: "Hey Git, start watching this folder for changes."*

### Step B: Add (Stage)
This prepares your files to be saved. It selects *what* you want to save.
```bash
git add .
```
*   *Explanation: The `.` means "Add EVERYTHING in this folder to the waiting list."*

### Step C: Commit (Save)
This takes a snapshot of your code at this specific moment.
```bash
git commit -m "My first backup"
```
*   *Explanation: The `-m` allows you to write a message describing what you did. This saves the snapshot permanently on your computer.*

## 4. Connect to GitHub (The Cloud)
Now that your code is saved locally, let's upload it.

1.  **Create a Repo**: Go to [github.com/new](https://github.com/new).
    *   Name it something like `my-lego-app`.
    *   Click "Create repository".
2.  **Link it**: GitHub will show you a page with commands. Look for the section **"…or push an existing repository from the command line"**. It will look like this:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/my-lego-app.git
    git branch -M main
    git push -u origin main
    ```
3.  **Run those commands**: Copy and paste them into your terminal one by one.

## Summary Checklist
Next time you want to save changes, you just run these three:
1.  `git add .` (Gather changes)
2.  `git commit -m "Added new feature"` (Save snapshot)
3.  `git push` (Upload to cloud)
