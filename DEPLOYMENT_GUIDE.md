# How to Deploy Imani Children Home Website to Render

## Prerequisites
- GitHub account with your code pushed
- Render account (sign up at https://render.com)

## Step 1: Prepare Your Repository
Make sure your code is pushed to GitHub (already done ✓)

## Step 2: Create a Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Click "Connect GitHub" and authorize Render to access your repositories
4. Find and select your repository: `tituskipkirui087/Imani-Children-s-Home`
5. Configure the settings:
   - **Name**: `imani-childrens-home`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node config/server.js`
   - **Plan**: Free (select the free tier)

## Step 3: Deploy
1. Click "Create Web Service"
2. Wait for the build to complete (may take 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://imani-childrens-home.onrender.com`

## Step 4: Connect Your Domain (Optional)
1. Go to your Render dashboard
2. Click on your web service
3. Click "Settings"
4. Scroll to "Custom Domains"
5. Add your domain: `imanichildrenshome.co.ke`
6. Update your DNS records as instructed by Render

## Step 5: Update Your Website Code
After getting your Render URL, update the payment redirect URLs if needed.

---

## Troubleshooting

**Build fails?**
- Make sure package.json has the correct start script
- Check that all dependencies are in package.json

**Payments not working?**
- The server needs to be running for payments to work
- Make sure the NOWPayment API key is valid

**Website shows blank?**
- Check the Render logs for errors
- Make sure the public folder path is correct in server.js
