# GitHub Integration Setup Guide

This guide will help you set up GitHub integration for importing repositories into your AI Knowledge Assistant.

## Prerequisites

- GitHub account
- Application running locally or deployed

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the details:
   - **Application name**: `AI Knowledge Assistant` (or your preferred name)
   - **Homepage URL**: `http://localhost:5173` (or your production URL)
   - **Authorization callback URL**: `http://localhost:5173/github/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

## Step 2: Configure Backend

1. Open `backend/.env`
2. Add the following lines:
   ```env
   GITHUB_CLIENT_ID=your-github-oauth-client-id
   GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
   ```
3. Replace with your actual Client ID and Client Secret

## Step 3: Configure Frontend

1. Create `frontend/.env` (if it doesn't exist)
2. Add the following line:
   ```env
   VITE_GITHUB_CLIENT_ID=your-github-oauth-client-id
   ```
3. Replace with your actual Client ID (same as backend)

## Step 4: Run Database Migration

Run this SQL command in your PostgreSQL database:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_token TEXT;
```

Or use the migration file:
```bash
psql -U postgres -d knowledge_assistant -f backend/migrations/add_github_token.sql
```

## Step 5: Restart Services

1. Restart the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Restart the frontend (if needed):
   ```bash
   cd frontend
   npm run dev
   ```

## How to Use

1. **Login** as an admin user
2. **Navigate** to any project
3. **Click** the **GitHub** tab
4. **Click** "Connect GitHub Account"
5. **Authorize** the application on GitHub
6. **Select** a repository and click **Import**
7. **Wait** for the import to complete
8. **Chat** with your code using the AI assistant!

## Supported File Types

The following code file types are automatically indexed:
- Python: `.py`
- JavaScript/TypeScript: `.js`, `.jsx`, `.ts`, `.tsx`
- Java: `.java`
- C/C++: `.c`, `.cpp`, `.h`
- C#: `.cs`
- Go: `.go`
- Ruby: `.rb`
- PHP: `.php`
- Swift: `.swift`
- Kotlin: `.kt`
- Rust: `.rs`
- Markdown: `.md`
- Text: `.txt`

## Excluded Directories

The following directories are automatically skipped during import:
- `.git`
- `node_modules`
- `__pycache__`
- `venv`
- `dist`
- `build`

## Troubleshooting

### "GitHub OAuth not configured" error
- Make sure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in `backend/.env`
- Restart the backend server

### "Failed to authenticate with GitHub" error
- Verify the Client ID and Client Secret are correct
- Check that the callback URL matches exactly: `http://localhost:5173/github/callback`

### "GitHub account not connected" error
- Complete the OAuth flow by clicking "Connect GitHub Account"
- Check browser console for errors during redirect

### Import fails or takes too long
- Large repositories may take several minutes to import
- Check backend logs for specific errors
- Ensure you have sufficient disk space

## Security Notes

- GitHub tokens are stored in the database (consider encrypting them in production)
- Tokens have `repo` scope, allowing read access to all repositories
- Users can disconnect their GitHub account at any time
- Imported code is stored as document chunks in the vector database
