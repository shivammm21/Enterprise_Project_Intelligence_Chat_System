@echo off
echo Running GitHub Token Migration...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run migration
python add_github_token_migration.py

echo.
echo Migration complete! Press any key to exit...
pause > nul
