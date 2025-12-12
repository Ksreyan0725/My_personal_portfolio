# 🚀 Version Update Script - User Guide

## 📋 Overview

This Python script automatically updates version numbers across your entire project in a single run. It handles all version formats, creates backups, and provides detailed reports.

## ✨ Features

- ✅ **Auto-increment version** (e.g., 3.3 → 3.4)
- ✅ **Updates all occurrences** across all files
- ✅ **Adds current date** next to updated versions
- ✅ **Creates timestamped backups** before making changes
- ✅ **Supports multiple version formats**:
  - Comments: `// Version 3.3`, `<!-- Version 3.3 -->`
  - JSON: `"version": "3.3"`
  - JavaScript: `VERSION: '3.3'`, `CACHE_NAME: 'portfolio-v3.3'`
  - UI Display: `Version 3.3 • Made with ❤️`
  - Query params: `?v=3.3`
- ✅ **Scans file types**: `.md`, `.html`, `.js`, `.py`, `.json`, `.txt`, `.css`
- ✅ **Excludes directories**: `.git`, `node_modules`, `__pycache__`, `.agent`
- ✅ **Detailed summary report** showing all changes

## 🎯 Usage

### Basic Usage

```bash
# Navigate to your project directory
cd c:\Users\sreya\OneDrive\Desktop\personal_portfolio_website\personalportfolio\My_personal_portfolio

# Run the script
python update_version.py
```

### What Happens

1. **Detection**: Script detects current version (3.3)
2. **Increment**: Auto-increments to next version (3.4)
3. **Confirmation**: Asks for your confirmation
4. **Backup**: Creates timestamped backup folder
5. **Update**: Updates all version occurrences
6. **Report**: Shows detailed summary of changes

### Example Output

```
======================================================================
🚀 AUTOMATIC VERSION UPDATE SCRIPT
======================================================================

📁 Project Directory: C:\Users\sreya\...\My_personal_portfolio
📌 Current Version: 3.3
📌 New Version: 3.4

⚠️  This will update version from 3.3 to 3.4
Continue? (yes/no): yes

📦 Creating backup: version_backup_20251212_170000
✅ Backup created successfully!

🔍 Scanning project files...

======================================================================
📊 VERSION UPDATE SUMMARY REPORT
======================================================================

📌 Version Change: 3.3 → 3.4
📅 Date: December 12, 2025
💾 Backup Location: version_backup_20251212_170000

📈 Statistics:
  • Files Scanned: 45
  • Files Updated: 12
  • Total Replacements: 38

📝 Detailed Changes:

  📄 manifest.json
     Replacements: 1
     • '"version": "3.3"' → '"version": "3.4"'

  📄 sw.js
     Replacements: 3
     • '// Version 3.3' → '// Version 3.4'
     • 'portfolio-v3.3' → 'portfolio-v3.4'

  📄 index.html
     Replacements: 15
     • 'Version: 3.3' → 'Version: 3.4'
     • 'Version 3.3 •' → 'Version 3.4 •'
     • '?v=3.3' → '?v=3.4'
     • Updated date to: December 12, 2025

  ... (and more files)

======================================================================
✅ Version update completed successfully!
======================================================================

💡 Tip: If anything goes wrong, restore from: version_backup_20251212_170000
```

## 📂 Files Updated

The script automatically updates versions in:

- `manifest.json`
- `sw.js`
- `service-worker.js`
- `index.html`
- `contact.html`
- `assets/js/constants.js`
- All CSS files with `?v=` parameters
- All JS files with `?v=` parameters
- README files
- And any other files containing version numbers

## 🔄 Backup & Restore

### Backup Location

Backups are stored in folders named: `version_backup_YYYYMMDD_HHMMSS`

Example: `version_backup_20251212_170000`

### Restore from Backup

If something goes wrong:

1. Delete the current files
2. Copy files from the backup folder
3. Paste them back to the project root

Or use Git to revert:
```bash
git checkout .
```

### Delete Backups

Once you're satisfied with the update:

```bash
# Delete specific backup
rmdir /s version_backup_20251212_170000

# Or delete all backups
rmdir /s version_backup_*
```

**Note**: Backup folders are automatically excluded from Git (via `.gitignore`)

## 🛠️ Advanced Usage

### Custom Version Increment

Edit the script to change increment type:

```python
# In update_version.py, line ~380
new_version = increment_version(old_version, increment_type='minor')  # Default

# Options:
# 'major' : 3.3 → 4.0
# 'minor' : 3.3 → 3.4 (default)
# 'patch' : 3.3.0 → 3.3.1
```

### Manual Version Override

You can manually specify the new version by editing the script:

```python
# Replace this line:
new_version = increment_version(old_version, increment_type='minor')

# With:
new_version = "4.0"  # Your desired version
```

## 📋 Git Integration

After running the version update:

```bash
# Stage all changes
git add .

# Commit with version message
git commit -m "chore: update version to 3.4"

# Push to remote
git push origin main
```

## ⚠️ Important Notes

1. **Always review changes** before committing to Git
2. **Backups are created automatically** - don't delete them immediately
3. **Test your site** after version update to ensure everything works
4. **The script is safe** - it only updates text patterns, doesn't modify functionality

## 🐛 Troubleshooting

### Script doesn't find current version
- Check if `manifest.json` or `index.html` exists
- Ensure version format matches patterns (e.g., "3.3" not "v3.3")

### Some files not updated
- Check if file extension is in `EXTENSIONS` list
- Verify file is not in excluded directories
- Check if version format matches the patterns

### Want to add more patterns
Edit the `VERSION_PATTERNS` list in the script to add custom patterns.

## 📞 Support

For issues or questions, contact: sreyanpattanayak@zohomail.com

---

**Made with ❤️ by Kumar Sreyan Pattanayak**
