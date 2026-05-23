# Run GitHub Token Migration

You need to add the `github_token` column to the `users` table. Choose one of the methods below:

## Method 1: Using Python Script (Recommended)

1. Activate your virtual environment:
   ```bash
   # Windows
   cd backend
   venv\Scripts\activate
   
   # macOS/Linux
   cd backend
   source venv/bin/activate
   ```

2. Run the migration script:
   ```bash
   python add_github_token_migration.py
   ```

## Method 2: Using psql (Direct SQL)

1. Connect to your database:
   ```bash
   psql -U postgres -d knowledge_assistant
   ```

2. Run the SQL command:
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS github_token TEXT;
   ```

3. Verify the column was added:
   ```sql
   \d users
   ```

## Method 3: Using pgAdmin or any PostgreSQL GUI

1. Open your PostgreSQL GUI tool
2. Connect to the `knowledge_assistant` database
3. Run this SQL:
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS github_token TEXT;
   ```

## Verify Migration

After running the migration, restart your backend server and the GitHub integration should work.
