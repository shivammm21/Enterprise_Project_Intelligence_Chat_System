"""
Migration script to add github_token column to users table.
Run this script to update the database schema.
"""
import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def add_github_token_column():
    async with AsyncSessionLocal() as db:
        try:
            # Check if column exists
            result = await db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='github_token'
            """))
            exists = result.fetchone()
            
            if exists:
                print("✓ github_token column already exists")
            else:
                # Add the column
                await db.execute(text("""
                    ALTER TABLE users ADD COLUMN github_token TEXT
                """))
                await db.commit()
                print("✓ Successfully added github_token column to users table")
        except Exception as e:
            print(f"✗ Error: {e}")
            await db.rollback()

if __name__ == "__main__":
    print("Running migration: Add github_token to users table")
    asyncio.run(add_github_token_column())
    print("Migration complete!")
