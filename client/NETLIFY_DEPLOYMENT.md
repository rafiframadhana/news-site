# Netlify Deployment Guide

This document explains the setup for deploying the React client to Netlify.

## Dependency Resolution

We've made the following changes to resolve dependency conflicts between React and react-quill:

1. Downgraded React from v19 to v18.2.0 to be compatible with react-quill
2. Added configuration files to help Netlify build the project correctly

## Configuration Files

### netlify.toml
This file configures the Netlify build process with the following settings:
- Uses `--legacy-peer-deps` to resolve peer dependency issues
- Sets Node.js version to 18
- Configures proper redirects for client-side routing

### .npmrc
This file configures npm with:
- `legacy-peer-deps=true` to handle peer dependency conflicts
- `engine-strict=false` to be more flexible with Node.js versions

### _redirects
This file in the public directory ensures that client-side routing works correctly by redirecting all requests to index.html.

## Deploying to Netlify

1. Push these changes to your repository
2. Connect your repository to Netlify
3. Use the following build settings:
   - Build command: `npm install --legacy-peer-deps && npm run build`
   - Publish directory: `dist`
   - Node.js version: 18.x

If you encounter any issues, you can try:
1. Clearing the Netlify cache before rebuilding
2. Using the Netlify CLI for local testing before deployment
3. Checking the build logs for specific errors
