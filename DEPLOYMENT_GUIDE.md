# Deploying Job Tracker to GitHub Pages Securely

Because this application relies on the Notion API via an integration token, it is **critical** not to expose the token directly in the source code on GitHub Pages, where anyone could find it and gain access to your Notion workspace.

To achieve a secure, zero-cost deployment, we use **GitHub Pages** for hosting the frontend (`index.html`), and a **Cloudflare Worker** as a secure proxy to talk to Notion.

## Step 1: Deploy the Cloudflare Worker

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) (create a free account if you don't have one).
2. On the left sidebar, click on **Workers & Pages**.
3. Click **Create Application** -> **Create Worker**.
4. Name it something like `notion-job-proxy` and click **Deploy**.
5. Click **Edit Code**.
6. Replace the default code with the contents of the `worker.js` file located in this project directory.
7. Important: In the code you pasted, update the `ALLOWED_ORIGINS` array to include your GitHub Pages URL (e.g., `https://bansalsahil.github.io`).
8. Click **Deploy** in the top right.
9. After deploying, go back to the Worker's settings page, go to **Settings** -> **Variables**.
10. Under **Environment Variables**, add two variables:
    * `NOTION_TOKEN`: Paste your token (e.g., `ntn_...`). Click the "Encrypt" button to hide it.
    * `NOTION_DB_ID`: `53bf892d0bc5469baca9827ef5f38470`.

## Step 2: Configure the Frontend

1. Open `index.html`.
2. Locate the `PROXY` variable at around line `1290`.
3. Update it to point to your new Cloudflare Worker URL. It will look something like `https://notion-job-proxy.YOUR-SUBDOMAIN.workers.dev`. Do NOT put a trailing slash.

## Step 3: Initialize Git and Commit Your Code

Open your terminal, navigate to the folder containing your Job Tracker project (`/Users/sahil/Desktop/Projects/Job Tracker`), and run these commands to track your files:

```bash
git init
git add index.html
git commit -m "Initial commit: Job Application Tracker"
```

*(Note: You do not need to commit `worker.js` if you don't want to, as it's already deployed to Cloudflare, but it's good to keep it around.)*

## Step 4: Create a Repository and Push to GitHub

1. Go to [GitHub.com](https://github.com/new) and create a **New Repository**.
2. Name it something like `job-tracker`.
3. Leave it **Public** (required for the free tier of GitHub Pages on personal accounts) or **Private** (if you have GitHub Pro/Teams). Since your Notion token is securely hidden in Cloudflare, a public repo is perfectly safe.
4. **Do NOT** check the box to add a README, `.gitignore`, or license. Create an empty repository.
5. Copy the commands from the GitHub screen under the heading **"…or push an existing repository from the command line"** and run them in your terminal. They will look exactly like this:

```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/job-tracker.git
git push -u origin main
```

## Step 5: Enable GitHub Pages

1. On your GitHub repository page, click the **Settings** tab (the gear icon at the top right).
2. On the left sidebar, scroll down and click on **Pages**.
3. Under the **"Build and deployment"** section:
   - For **Source**, select **Deploy from a branch**.
   - Under **Branch**, change `None` to **`main`** (or `master`), and leave the folder as **`/ (root)`**.
4. Click **Save**.

Wait about 1–2 minutes. If you refresh that same Settings -> Pages screen, you will see a banner at the top saying: 
**"Your site is live at `https://your-username.github.io/job-tracker/`"**

Your dashboard is now live, secure, and will seamlessly push and pull edits/archives to Notion!
