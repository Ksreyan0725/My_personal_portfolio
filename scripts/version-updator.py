#!/usr/bin/env python3
"""
=============================================================================
Automatic Version Update Script
=============================================================================
Purpose: Automatically scans and updates version numbers across all project files
         ONLY when there are actual code changes in the repository
Author: Kumar Sreyan Pattanayak
Created: December 12, 2025
Last Updated: December 12, 2025 
=============================================================================

Features:
- Checks Git status for actual code changes before updating
- Auto-increments version numbers (e.g., 3.3 → 3.4)
- Updates all version formats (comments, JSON, JS constants, query params)
- Adds current date next to updated versions
- Creates timestamped backups before making changes
- Supports semantic versioning (x.x.x) and simple versioning (x.x)
- Handles various formats: "Version: 3.4.2", "v1.0", etc.
- Scans .md, .html, .js, .py, .json, .txt, .css files
- Excludes .git, node_modules, __pycache__, .agent directories
- Generates detailed summary report
- Shows "No changes done..." if no code modifications detected
"""

import os
import re
import sys
import io

# Force UTF-8 for stdout/stderr to fix display issues on Windows consoles
# This prevents "â€“" characters from appearing when printing unicode symbols
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import os
import re
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple, Optional

# ============================================
# CONFIGURATION
# ============================================

# File extensions to scan
EXTENSIONS = ['.md', '.html', '.js', '.py', '.json', '.txt', '.css']

# Directories to exclude
EXCLUDE_DIRS = {
    '.git', 'node_modules', '__pycache__', '.agent', 'venv', 'env', 
    'backup_', 'version_backups', 'backups', 'pages_backup',
    'version-backups', 'pages-backup'
}

# Files to ignore when checking for code changes (documentation only)
IGNORE_FOR_CHANGES = {
    'README.md',
    'VERSION_UPDATE_GUIDE.md',
    'CHANGELOG.md',
    'LICENSE',
    '.gitignore',
    'update_version.py'  # The script itself
}

# Version patterns to match
VERSION_PATTERNS = [
    # Commented versions
    (r'(//\s*Version:?\s*)([\d\.]+)', r'\g<1>{version}'),
    (r'(<!--\s*Version:?\s*)([\d\.]+)(\s*-->)', r'\g<1>{version}\g<3>'),
    
    # Standalone Version: X.X (in multi-line comments or plain text)
    (r'(Version:\s*)([\d\.]+)', r'\g<1>{version}'),
    
    # JSON format
    (r'("version"\s*:\s*")([\d\.]+)(\")', r'\g<1>{version}\g<3>'),
    
    # JavaScript constants
    (r'(VERSION\s*:\s*["\'])([\d\.]+)(["\'])', r'\g<1>{version}\g<3>'),
    # Cache names - match entire existing version string (greedy digits/dots) to prevent appending
    (r'(CACHE_NAME\s*[=:]\s*["\'][^"\']*?-v)([\d\.]+)(["\'])', r'\g<1>{version}\g<3>'),
    
    # UI Display text
    (r'(Version\s+)([\d\.]+)(\s*[•·])', r'\g<1>{version}\g<3>'),
    (r'(Version\s+)([\d\.]+)(\s+is\s+ready)', r'\g<1>{version}\g<3>'),
    
    # Query parameters
    (r'(\?v=)([\d\.]+)', r'\g<1>{version}'),
    
    # Cache names in service workers (Greedy match to fix corrupted strings)
    (r'(const\s+\w*CACHE\w*\s*=\s*["\'][^"\']*?-v)([\d\.]+)(["\'])', r'\g<1>{version}\g<3>'),
    
    # Generic version patterns
    (r'(v)([\d\.]+)(\s*-)', r'\g<1>{version}\g<3>'),
]

# Date format for version updates
DATE_FORMAT = "%B %d, %Y"  # e.g., "December 12, 2025"

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_current_date() -> str:
    """Get current date in readable format"""
    return datetime.now().strftime(DATE_FORMAT)

def increment_version(version: str, increment_type: str = 'patch') -> str:
    """
    Increment version number
    
    Args:
        version: Current version (e.g., "3.3" or "3.3.0")
        increment_type: Type of increment ('major', 'minor', 'patch')
    
    Returns:
        Incremented version string
    """
    parts = version.split('.')
    
    # Convert to semantic versioning if needed
    if len(parts) == 2:
        parts.append('0')  # Convert 3.4 to 3.4.0
    
    if len(parts) == 3:
        # Semantic versioning (x.x.x)
        major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])
        if increment_type == 'major':
            return f"{major + 1}.0.0"
        elif increment_type == 'minor':
            return f"{major}.{minor + 1}.0"
        else:  # patch
            return f"{major}.{minor}.{patch + 1}"
    
    return version

def calculate_change_percentage(project_dir: Path, filter_files: List[str] = None) -> Tuple[float, Dict]:
    """
    Calculate percentage of code changes using Git diff
    
    Args:
        project_dir: Project root directory
        filter_files: Optional list of specific files to check (ignores others)
    
    Returns:
        Tuple of (change_percentage, stats_dict)
    """
    try:
        # Get diff stats
        cmd = ['git', 'diff', '--stat', 'HEAD']
        
        # If we have a filter list, append only those files to the command
        # This ensures stats ONLY reflect the relevant files
        if filter_files is not None:
             if not filter_files:
                 return 0.0, {} # No relevant files changed
             # Git expects paths relative to root, which filter_files should be
             cmd.extend(filter_files)

        result = subprocess.run(
            cmd,
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            return 0.0, {}
        
        # Parse diff output
        lines = result.stdout.strip().split('\n')
        if not lines or len(lines) < 2:
            return 0.0, {}
        
        # Last line has summary: "X files changed, Y insertions(+), Z deletions(-)"
        summary_line = lines[-1]
        
        # Extract numbers
        files_changed = 0
        insertions = 0
        deletions = 0
        
        import re
        files_match = re.search(r'(\d+)\s+files?\s+changed', summary_line)
        insert_match = re.search(r'(\d+)\s+insertions?\(\+\)', summary_line)
        delete_match = re.search(r'(\d+)\s+deletions?\(-\)', summary_line)
        
        if files_match:
            files_changed = int(files_match.group(1))
        if insert_match:
            insertions = int(insert_match.group(1))
        if delete_match:
            deletions = int(delete_match.group(1))
        
        total_changes = insertions + deletions
        
        # Get total lines in project (approximate)
        total_lines = 0
        for ext in EXTENSIONS:
            for file_path in project_dir.rglob(f'*{ext}'):
                if should_exclude_path(file_path, project_dir):
                    continue
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        total_lines += len(f.readlines())
                except:
                    pass
        
        # Calculate percentage
        if total_lines > 0:
            change_percentage = (total_changes / total_lines) * 100
        else:
            change_percentage = 0.0
        
        stats = {
            'files_changed': files_changed,
            'insertions': insertions,
            'deletions': deletions,
            'total_changes': total_changes,
            'total_lines': total_lines,
            'percentage': change_percentage
        }
        
        return change_percentage, stats
        
    except Exception as e:
        print(f"\n⚠️  Warning: Could not calculate change percentage: {e}")
        return 0.0, {}

def determine_version_increment(change_percentage: float) -> str:
    """
    Determine version increment type based on change percentage
    
    Args:
        change_percentage: Percentage of code changes
    
    Returns:
        'major', 'minor', or 'patch'
    
    Rules:
    - < 10% changes: patch (3.4.0 → 3.4.1)
    - 10-50% changes: minor (3.4.0 → 3.5.0)
    - > 50% changes: major (3.4.0 → 4.0.0)
    """
    if change_percentage >= 50:
        return 'major'
    elif change_percentage >= 10:
        return 'minor'
    else:
        return 'patch'

def detect_current_version(project_dir: Path) -> str:
    """
    Detect current version from manifest.json or other key files
    
    Args:
        project_dir: Project root directory
    
    Returns:
        Current version string
    """
    # Try manifest.json first
    manifest_path = project_dir / 'manifest.json'
    if manifest_path.exists():
        try:
            import json
            with open(manifest_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'version' in data:
                    return data['version']
        except:
            pass
    
    # Fallback: search in index.html
    index_path = project_dir / 'index.html'
    if index_path.exists():
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'Version:?\s*(\d+\.\d+(?:\.\d+)?)', content)
            if match:
                return match.group(1)
    
    return "1.0.0"  # Default fallback

def should_exclude_path(path: Path, project_root: Path) -> bool:
    """
    Check if path should be excluded from scanning
    
    Args:
        path: Path to check
        project_root: Project root directory
    
    Returns:
        True if path should be excluded
    """
    # Check if any parent directory is in exclude list
    try:
        relative_path = path.relative_to(project_root)
        for part in relative_path.parts:
            if part in EXCLUDE_DIRS or part.startswith('.'):
                return True
    except ValueError:
        return True
    
    return False

def is_trivial_change(filename: str, project_dir: Path) -> bool:
    """
    Check if changes in a file are just version/date updates.
    Returns True if changes are trivial (should be ignored).
    """
    try:
        # Get diff for the file
        # Use -U0 to get purely changed lines with 0 context
        diff_result = subprocess.run(
            ['git', 'diff', '-U0', filename],
            cwd=project_dir,
            capture_output=True,
            encoding='utf-8', 
            errors='replace',
            timeout=5
        )
        
        diff_output = diff_result.stdout
        if not diff_output.strip():
            # If empty diff but file marked modified, might be staged? 
            # Try --staged check if needed, but for now typical workflow is unstaged.
            # If no diff output, maybe whitespace? assume trivial or unchanged.
            pass

        # Check line by line
        for line in diff_output.splitlines():
            # Only care about added/removed lines
            if not (line.startswith('+') or line.startswith('-')) or line.startswith('+++') or line.startswith('---'):
                continue
            
            content = line[1:].strip()
            
            # 1. Check if line contains version pattern
            is_version_line = False
            for pattern, _ in VERSION_PATTERNS:
                # We check if the line matches a version pattern 'structure'
                # Simpler: remove the specific version number and compare structure?
                # Or just check if the line *matches* the pattern. 
                # If a line is removed/added and it matches a version pattern, it's likely a version update.
                if re.search(pattern, content):
                    is_version_line = True
                    break
            
            # 2. Check if line contains date pattern
            is_date_line = False
            date_patterns = [
                r'(Last Updated:?\s*)([A-Z][a-z]+\s+\d{1,2},\s+\d{4})',
                r'(Last Modified:?\s*)([A-Z][a-z]+\s+\d{1,2},\s+\d{4})'
            ]
            for dp in date_patterns:
                if re.search(dp, content):
                    is_date_line = True
                    break

            # If a changed line is NOT a version line and NOT a date line, then it's a REAL code change.
            if not is_version_line and not is_date_line:
                return False # Found a non-trivial change
                
        return True # All checked lines were trivial
        
    except Exception as e:
        # print(f"DEBUG: Error checking triviality for {filename}: {e}")
        return False # On error, assume significant

def check_git_changes(project_dir: Path) -> Tuple[bool, List[str]]:
    """
    Check if there are actual code changes in Git repository
    
    Args:
        project_dir: Project root directory
    
    Returns:
        Tuple of (has_code_changes, list of changed files)
    """
    try:
        # Check if Git is available
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode != 0:
            print("\n⚠️  Warning: Not a Git repository or Git not available")
            print("   Proceeding without Git check...")
            return True, []  # Proceed if Git not available
        
        # Parse Git status output
        changed_files = []
        code_changes = False
        
        for line in result.stdout.strip().split('\n'):
            if not line:
                continue
            
            # Git status format: "XY filename"
            # X = index status, Y = working tree status
            status = line[:2].strip()
            filename = line[3:].strip()
            
            # Skip deleted files
            if 'D' in status:
                continue
            
            # Check if file should be ignored
            file_path = Path(filename)
            file_basename = file_path.name
            
            # Ignore specific files
            if file_basename in IGNORE_FOR_CHANGES or filename == 'scripts/version-updator.py':
                continue
            
            # Check if it's in a backup directory
            parts = file_path.parts
            if any(p in EXCLUDE_DIRS or p.startswith('backup_') or p.startswith('version_backup_') for p in parts):
                continue

            # CRITICAL: Check if the change is just an auto-update (version/date)
            if is_trivial_change(filename, project_dir):
                # print(f"   Ignoring trivial update in {filename}") # Optional debug
                continue

            # This is a REAL code change
            changed_files.append(filename)
            code_changes = True
        
        return code_changes, changed_files
        
    except subprocess.TimeoutExpired:
        print("\n⚠️  Warning: Git command timed out")
        return True, []
    except FileNotFoundError:
        print("\n⚠️  Warning: Git not found in system PATH")
        return True, []
    except Exception as e:
        print(f"\n⚠️  Warning: Error checking Git status: {e}")
        return True, []

def check_new_md_files(project_dir: Path) -> Tuple[bool, List[str]]:
    """
    Check for new untracked .md files in Git
    
    Args:
        project_dir: Project root directory
    
    Returns:
        Tuple of (has_new_md_files, list of new .md files)
    """
    try:
        # Get untracked files
        result = subprocess.run(
            ['git', 'ls-files', '--others', '--exclude-standard'],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode != 0:
            return False, []
        
        # Filter for .md files
        new_md_files = []
        for line in result.stdout.strip().split('\n'):
            if not line:
                continue
            
            filename = line.strip()
            
            # Check if it's a .md file
            if filename.endswith('.md'):
                # Skip if in backup directory
                if any(part.startswith('version_backup_') for part in Path(filename).parts):
                    continue
                
                new_md_files.append(filename)
        
        return len(new_md_files) > 0, new_md_files
        
    except Exception as e:
        print(f"\n⚠️  Warning: Error checking for new .md files: {e}")
        return False, []

def prompt_for_md_files(md_files: List[str], project_dir: Path) -> List[str]:
    """
    Prompt user whether to include new .md files in Git (one at a time)
    
    Args:
        md_files: List of new .md files
        project_dir: Project root directory
    
    Returns:
        List of .md files user wants to add to Git
    """
    if not md_files:
        return []
    
    print("\n" + "="*70)
    print("📄 NEW MARKDOWN FILES DETECTED")
    print("="*70)
    print(f"\nFound {len(md_files)} new .md file(s) not tracked by Git.")
    print("Let's review them one by one...\n")
    
    files_to_add = []
    
    for i, md_file in enumerate(md_files, 1):
        print(f"\n[{i}/{len(md_files)}] File: {md_file}")
        
        # Try to show first few lines of the file
        try:
            file_path = project_dir / md_file
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()[:3]  # First 3 lines
                    if lines:
                        print("   Preview:")
                        for line in lines:
                            preview = line.strip()[:60]  # First 60 chars
                            if preview:
                                print(f"   {preview}...")
        except:
            pass
        
        response = input(f"\n   Add '{md_file}' to Git? (y/n): ").strip().lower()
        
        if response == 'y':
            files_to_add.append(md_file)
            print(f"   ✅ Will add to Git")
        else:
            print(f"   ⏭️  Skipped")
    
    # Add separator after all prompts
    if md_files:
        print("\n" + "-"*70)
    
    return files_to_add

def create_backup(project_dir: Path) -> Path:
    """
    Create timestamped backup of entire project
    
    Args:
        project_dir: Project root directory
    
    Returns:
        Path to backup directory
    """
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    
    # Base backup dir
    base_backup_dir = project_dir / "assets" / "backups"
    
    # 1. Version Backups (Full Snapshots)
    version_backup_root = base_backup_dir / "version-backups"
    version_backup_root.mkdir(parents=True, exist_ok=True)
    
    # Ensure legacy backups (underscores) are moved to version-backups
    # Also support moving hyphenated ones if they are in root
    for pattern in ["version_backup_*", "version-backup-*"]:
        for item in project_dir.glob(pattern):
            if item.is_dir():
                print(f"📦 Moving legacy backup {item.name} to assets/backups/version-backups/...")
                try:
                    dest = version_backup_root / item.name
                    if not dest.exists():
                        shutil.move(str(item), str(dest))
                except Exception as e:
                    print(f"⚠️ Could not move {item.name}: {e}")
                
    # Also define pages-backup directory for use later
    pages_backup_root = base_backup_dir / "pages-backup"
    pages_backup_root.mkdir(parents=True, exist_ok=True)
    
    # Create new snapshot with hyphens
    backup_dir = version_backup_root / f"version-backup-{timestamp}"
    
    print(f"\n📦 Creating full backup in: .../version-backups/{backup_dir.name}")
    
    # Create backup directory
    backup_dir.mkdir(exist_ok=True)
    
    # Copy all files except excluded directories
    for item in project_dir.iterdir():
        # Check against both kinds of backup prefixes
        if item.name.startswith(('version_backup_', 'version-backup-')) or item.name in EXCLUDE_DIRS:
            continue
        
        dest = backup_dir / item.name
        if item.is_file():
            shutil.copy2(item, dest)
        elif item.is_dir():
            shutil.copytree(item, dest, ignore=shutil.ignore_patterns(*EXCLUDE_DIRS))
            
    print(f"✅ Backup created successfully!")
    return backup_dir

def update_file_versions(file_path: Path, old_version: str, new_version: str, current_date: str, project_dir: Path = None) -> Tuple[int, List[str]]:
    """
    Update version numbers in a single file
    
    Args:
        file_path: Path to file
        old_version: Current version
        new_version: New version
        current_date: Current date string
        project_dir: Project root (for creating granular backups)
    
    Returns:
        Tuple of (replacement_count, list of changes)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return 0, [f"Error reading file: {e}"]
    
    changes = []
    total_replacements = 0
    new_lines = []
    file_changed = False
    
    # Process line by line to track line numbers
    try:
        for i, line in enumerate(content.splitlines(keepends=True), 1):
            original_line = line
            current_line = line
            line_updated = False
            
            # 1. Check Version Patterns
            for pattern, replacement in VERSION_PATTERNS:
                if re.search(pattern, current_line):
                    new_replacement = replacement.format(version=new_version)
                    
                    # Capture what matched for reporting
                    matches = list(re.finditer(pattern, current_line))
                    for match in matches:
                        old_text = match.group(0).strip()
                        # Preview new text
                        new_text_preview = re.sub(pattern, new_replacement, match.group(0)).strip()
                        changes.append(f"  • Line {i}: '{old_text}' → '{new_text_preview}'")
                        total_replacements += 1
                    
                    current_line = re.sub(pattern, new_replacement, current_line)
                    if current_line != original_line:
                        line_updated = True
            
            # 2. Check Date Patterns
            date_patterns = [
                (r'(Last Updated:?\s*)([A-Z][a-z]+\s+\d{1,2},\s+\d{4})', r'\g<1>' + current_date),
                (r'(Last Modified:?\s*)([A-Z][a-z]+\s+\d{1,2},\s+\d{4})', r'\g<1>' + current_date),
            ]
            
            for pattern, replacement in date_patterns:
                if re.search(pattern, current_line):
                    # Report change
                    matches = list(re.finditer(pattern, current_line))
                    for match in matches:
                         old_date = match.group(2)
                         if old_date != current_date:
                            changes.append(f"  • Line {i}: Updated date '{old_date}' → '{current_date}'")
                            
                    current_line = re.sub(pattern, replacement, current_line)
                    if current_line != original_line:
                        line_updated = True

            new_lines.append(current_line)
            if line_updated:
                file_changed = True
                
    except Exception as e:
         return 0, [f"Error processing lines: {e}"]

    # Write back if changes were made
    if file_changed:
        # Create granular backup if project_dir provided
        if project_dir:
            try:
                timestamp = datetime.now().strftime("%Y%m%d-%H%M%S") # Use hyphen in timestamp too?
                pages_backup_base = project_dir / "assets" / "backups" / "pages-backup" / timestamp
                pages_backup_base.mkdir(parents=True, exist_ok=True)
                
                # Backup file with original name
                shutil.copy2(file_path, pages_backup_base / file_path.name)
            except Exception as e:
                print(f"⚠️ Failed to backup {file_path.name}: {e}")

        new_content = "".join(new_lines)
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
        except Exception as e:
            return 0, [f"Error writing file: {e}"]
    
    return total_replacements, changes

def scan_and_update(project_dir: Path, old_version: str, new_version: str) -> Dict:
    """
    Scan all files and update version numbers
    
    Args:
        project_dir: Project root directory
        old_version: Current version
        new_version: New version
    
    Returns:
        Dictionary with update statistics
    """
    current_date = get_current_date()
    stats = {
        'files_scanned': 0,
        'files_updated': 0,
        'total_replacements': 0,
        'updates': {}
    }
    
    print(f"\n🔍 Scanning project files...")
    
    # Walk through all files
    for file_path in project_dir.rglob('*'):
        # Skip if not a file
        if not file_path.is_file():
            continue
        
        # Skip if excluded
        if should_exclude_path(file_path, project_dir):
            continue
        
        # Skip if wrong extension
        if file_path.suffix not in EXTENSIONS:
            continue
        
        # Skip COMPLETE_MANUAL.txt
        if file_path.name == 'COMPLETE_MANUAL.txt':
            continue
            
        # Check if file is tracked by git
        try:
            relative_path = str(file_path.relative_to(project_dir)).replace('\\', '/')
            result = subprocess.run(
                ['git', 'ls-files', '--error-unmatch', relative_path],
                cwd=project_dir,
                capture_output=True,
                timeout=2
            )
            # If returncode != 0, file is not tracked
            if result.returncode != 0:
                continue
        except Exception:
            # If git check fails, skip the file to be safe
            continue
        
        stats['files_scanned'] += 1
        
        # Update versions in file
        replacements, changes = update_file_versions(file_path, old_version, new_version, current_date, project_dir)
        
        if replacements > 0:
            stats['files_updated'] += 1
            stats['total_replacements'] += replacements
            
            relative_path = file_path.relative_to(project_dir)
            stats['updates'][str(relative_path)] = {
                'replacements': replacements,
                'changes': changes
            }
    
    return stats

def print_summary_report(old_version: str, new_version: str, stats: Dict, backup_dir: Path):
    """
    Print detailed summary report
    
    Args:
        old_version: Old version
        new_version: New version
        stats: Update statistics
        backup_dir: Backup directory path
    """
    print("\n" + "="*70)
    print("📊 VERSION UPDATE SUMMARY REPORT")
    print("="*70)
    
    print(f"\n📌 Version Change: {old_version} → {new_version}")
    print(f"📅 Date: {get_current_date()}")
    print(f"💾 Backup Location: {backup_dir.name}")
    
    print(f"\n📈 Statistics:")
    print(f"  • Files Scanned: {stats['files_scanned']}")
    print(f"  • Files Updated: {stats['files_updated']}")
    print(f"  • Total Replacements: {stats['total_replacements']}")
    
    if stats['updates']:
        print(f"\n📝 Detailed Changes:")
        for file_path, info in stats['updates'].items():
            print(f"\n  📄 {file_path}")
            print(f"     Replacements: {info['replacements']}")
            changelog = info['changes']
            for change in changelog[:10]:
                print(change)
            if len(changelog) > 10:
                print(f"     ... and {len(changelog) - 10} more changes")
    
    # Check for self-update
    script_name = Path(__file__).name
    for file_path in stats['updates'].keys():
        if script_name in str(file_path):
            print("\n" + "="*70)
            print("🤖 Also i have updated myself!")
            break
            
    print("\n" + "="*70)
    print("✅ Version update completed successfully!")
    print("="*70)

def run_git_manager(project_dir: Path):
    """
    Prompt and run git-manager.py
    """
    print("\n" + "="*70)
    print("🔄 OPEN GIT MANAGER")
    print("="*70)
    
    choice = input("\nWould you like to open Git Manager? (y/n): ").strip().lower()
    
    if choice == 'y':
        # Path to git-manager.py (assuming it's in the same scripts/ folder)
        git_manager_path = Path(__file__).parent / "git-manager.py"
        
        # If running from root, it might be in scripts/
        if not git_manager_path.exists():
             git_manager_path = Path("scripts/git-manager.py")
             if not git_manager_path.exists():
                 git_manager_path = project_dir / "scripts" / "git-manager.py"

        if git_manager_path.exists():
            try:
                 # Use the same python executable
                 subprocess.run([sys.executable, str(git_manager_path)], cwd=project_dir)
            except Exception as e:
                 print(f"\n❌ Error running git-manager.py: {e}")
                 print("   You can run it manually: python scripts/git-manager.py")
        else:
            print("\n❌ Could not find scripts/git-manager.py")

def generate_project_structure(project_dir: Path) -> str:
    """
    Generate project structure tree (Tracked files only)
    """
    # Get tracked files from git
    tracked_files = set()
    try:
        # Use simple git ls-files
        result = subprocess.run(
            ['git', 'ls-files'],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            # Normalize paths to forward slashes for matching
            tracked_files = set(f.strip().replace('\\', '/') for f in result.stdout.splitlines() if f.strip())
    except Exception:
        # If git fails, tracked_files stays empty, we might fallback to showing everything 
        # or handle gracefully. Let's assume if git fails we show standard file scan.
        pass

    def build_tree(directory: Path, prefix: str = "", is_last: bool = True) -> List[str]:
        """Recursively build directory tree"""
        lines = []
        
        try:
            items = sorted(directory.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
        except PermissionError:
            return lines
        
        # Filter items
        filtered_items = []
        for item in items:
            if not should_exclude_item(item, project_dir):
                filtered_items.append(item)
        
        items = filtered_items
        
        for i, item in enumerate(items):
            is_last_item = (i == len(items) - 1)
            
            if is_last:
                current_prefix = prefix + "|-- "
                next_prefix = prefix + "    "
            else:
                current_prefix = prefix + "|-- "
                next_prefix = prefix + "|   "
            
            if item.is_dir():
                lines.append(current_prefix + item.name + "/")
                lines.extend(build_tree(item, next_prefix, is_last_item))
            else:
                lines.append(current_prefix + item.name)
        
        return lines
    
    def should_exclude_item(path: Path, root: Path) -> bool:
        """Check if item should be excluded"""
        name = path.name
        
        # Always exclude forbidden dirs/files regardless of git
        if name.startswith('.') or name.startswith('version_backup_') or name in EXCLUDE_DIRS:
            return True
        
        # Explicit file excludes from manual list
        exclude_files = {'version-updator.py', 'txt-to-pdf.py', 'md-to-txt.py', 'COMPLETE_MANUAL.txt', 'COMPLETE_MANUAL.pdf'}
        if name in exclude_files:
            return True

        if name.endswith('.png') or name.endswith('.jpg') or name.endswith('.jpeg') or name.endswith('.ico'):
             return True

        # Git tracking check
        if tracked_files:
            try:
                rel_path = str(path.relative_to(root)).replace('\\', '/')
                
                if path.is_file():
                    if rel_path not in tracked_files:
                        return True
                elif path.is_dir():
                    # Check if any tracked file starts with this directory path
                    # This implies valid children exist
                    dir_prefix = rel_path + '/'
                    has_children = any(f.startswith(dir_prefix) for f in tracked_files)
                    if not has_children:
                        return True
            except ValueError:
                return True
                
        return False
    
    tree_lines = [project_dir.name + "/"]
    tree_lines.extend(build_tree(project_dir))
    
    return "\n".join(tree_lines)

def update_readme_structure(project_dir: Path) -> bool:
    """
    Update project structure section in README.md
    
    Args:
        project_dir: Project root directory
    
    Returns:
        True if updated successfully
    """
    readme_path = project_dir / 'README.md'
    
    if not readme_path.exists():
        print("\n⚠️  README.md not found, skipping structure update")
        return False
    
    try:
        # Read README
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Generate new structure
        structure = generate_project_structure(project_dir)
        
        # Find and replace structure section
        # Look for markers like "## Project Structure" or "## Structure"
        import re
        
        # Pattern to find structure section - updated to handle icons/emojis
        # Matches: "## [optional icon] Project Structure" or "## Structure"
        pattern = r'(##\s*.*(?:Project\s+)?Structure.*?\n\s*)(```(?:text|plaintext|)?\n)(.*?)(```)'
        
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        
        if match:
            # Replace existing structure
            new_section = f"{match.group(1)}{match.group(2)}{structure}\n{match.group(4)}"
            new_content = content[:match.start()] + new_section + content[match.end():]
            
            # Write back
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print("\n✅ Updated project structure in README.md")
            return True
        else:
            print("\n⚠️  No structure section found in README.md")
            print("   Add a section like:")
            print("   ## Project Structure")
            print("   ```")
            print("   (structure will be auto-generated here)")
            print("   ```")
            return False
            
    except Exception as e:
        print(f"\n⚠️  Error updating README structure: {e}")
        return False

# ============================================
# MAIN FUNCTION
# ============================================

def main():
    """Main execution function"""
    print("\n" + "="*70)
    print("🚀 AUTOMATIC VERSION UPDATE SCRIPT")
    print("="*70)
    
    # Get project directory (script's parent's parent directory if in scripts/)
    project_dir = Path(__file__).parent.parent
    
    # Check for new .md files first
    print("\n🔍 Checking for new .md files...")
    has_new_md, new_md_files = check_new_md_files(project_dir)
    
    if has_new_md:
        # Prompt for each .md file
        files_to_add = prompt_for_md_files(new_md_files, project_dir)
        
        if files_to_add:
            # Add selected files to Git
            print(f"\n📦 Adding {len(files_to_add)} file(s) to Git...")
            try:
                for md_file in files_to_add:
                    result = subprocess.run(
                        ['git', 'add', md_file],
                        cwd=project_dir,
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        print(f"   ✅ Added: {md_file}")
                    else:
                        print(f"   ❌ Failed to add: {md_file}")
                
                print("\n✅ Selected .md files added to Git staging area")
            except Exception as e:
                print(f"\n⚠️  Error adding files to Git: {e}")
        
        # Show skipped files
        skipped = set(new_md_files) - set(files_to_add)
        if skipped:
            print(f"\n⏭️  Skipped {len(skipped)} file(s):")
            for skipped_file in skipped:
                print(f"   • {skipped_file}")
            print("\n💡 These files will NOT be committed to Git")
            
            # Add skipped files to .gitignore
            gitignore_path = project_dir / '.gitignore'
            try:
                # Read existing .gitignore
                existing_content = ""
                if gitignore_path.exists():
                    with open(gitignore_path, 'r', encoding='utf-8') as f:
                        existing_content = f.read()
                
                # Check which files need to be added
                files_to_ignore = []
                for skipped_file in skipped:
                    if skipped_file not in existing_content:
                        files_to_ignore.append(skipped_file)
                
                if files_to_ignore:
                    # Append to .gitignore
                    with open(gitignore_path, 'a', encoding='utf-8') as f:
                        f.write("\n# Skipped markdown files (auto-added by version-updator)\n")
                        for file in files_to_ignore:
                            f.write(f"{file}\n")
                    
                    print(f"\n✅ Added {len(files_to_ignore)} file(s) to .gitignore automatically")
                    for file in files_to_ignore:
                        print(f"   • {file}")
            except Exception as e:
                print(f"\n⚠️  Warning: Could not update .gitignore: {e}")
    else:
        print("   No new .md files found")
    
    # Check for Git changes
    print("\n🔍 Checking for code changes...")
    has_changes, changed_files = check_git_changes(project_dir)
    
    if not has_changes:
        print("\n" + "="*70)
        print("ℹ️  NO CODE CHANGES DETECTED")
        print("="*70)
        print("\n📝 No changes done...")
        print("\nOnly documentation or configuration files were modified.")
        print("Version update is not required.")
        print("\nFiles that don't trigger version update:")
        for ignore_file in IGNORE_FOR_CHANGES:
            print(f"  • {ignore_file}")
        print("\n💡 Tip: Make code changes to trigger version update")
        print("="*70)
        
        # New Feature: Allow forced update
        current_ver = detect_current_version(project_dir)
        print(f"\n📌 Current Version: {current_ver}")
        print("Would you like to force a version update anyway?")
        force_choice = input("(y/n): ").strip().lower()
        
        if force_choice != 'y':
            # Run git manager if they don't want to update
            run_git_manager(project_dir)
            return
        
        print("\n⚠️  Forcing version update without code changes...")
        # Proceed with empty changed_files list
    
    # Show changed files
    if changed_files:
        print(f"\n✅ Found {len(changed_files)} code file(s) with changes:")
        for file in changed_files[:10]:  # Show first 10
            print(f"  • {file}")
        if len(changed_files) > 10:
            print(f"  ... and {len(changed_files) - 10} more")
    
    # Calculate change percentage
    print("\n📊 Analyzing change impact...")
    change_percentage, change_stats = calculate_change_percentage(project_dir, filter_files=changed_files)
    
    if change_stats:
        print("\n" + "="*50)
        print("📈 CHANGE STATISTICS")
        print("="*50)
        print(f"  • Files Changed:  {change_stats['files_changed']}")
        print(f"  • Lines Added:    +{change_stats['insertions']}")
        print(f"  • Lines Removed:  -{change_stats['deletions']}")
        print(f"  • Total Changes:  {change_stats['total_changes']}")
        print(f"  • Project Size:   {change_stats['total_lines']} lines")
        print(f"  • Change Impact:  {change_percentage:.2f}%")
        print("="*50)
    
    # Determine version increment type based on change percentage
    increment_type = determine_version_increment(change_percentage)
    
    print(f"\n🎯 Version Increment Strategy:")
    if increment_type == 'patch':
        print(f"  • Type: PATCH (< 10% changes)")
        print(f"  • Reason: Small bug fixes or minor tweaks")
    elif increment_type == 'minor':
        print(f"  • Type: MINOR (10-50% changes)")
        print(f"  • Reason: New features or moderate changes")
    else:  # major
        print(f"  • Type: MAJOR (> 50% changes)")
        print(f"  • Reason: Significant rewrite or breaking changes")
    
    # Detect current version
    old_version = detect_current_version(project_dir)
    print(f"\n📌 Current Version: {old_version}")
    
    # Increment version based on calculated type
    new_version = increment_version(old_version, increment_type=increment_type)
    print(f"📌 New Version: {new_version}")
    
    # Confirm with user or allow manual override
    print(f"\n⚠️  This will update version from {old_version} to {new_version}")
    print("Options:") 
    print(" - Press 'y' or Enter to accept auto-generated version")
    print(" - Press 'n' to cancel")
    print(" - Type a specific version (e.g. 1.1.1) to manually override")
    
    user_input = input("Choice: ").strip()
    
    if user_input.lower() == 'n':
        print("\n❌ Operation cancelled by user.")
        return
        
    if user_input.lower() == 'y' or user_input == '':
        final_version = new_version
    else:
        # Check if input looks like a version
        if re.match(r'^\d+\.\d+(?:\.\d+)?$', user_input):
            final_version = user_input
            if final_version == old_version:
                 print(f"\n⚠️  Warning: The version you entered ({final_version}) is the same as the current version.")
                 print("   Only the date will be updated.")
                 confirm_same = input("   Do you want to proceed? (y/n): ").strip().lower()
                 if confirm_same != 'y':
                     print("\n❌ Operation cancelled.")
                     return
        else:
             print(f"\n❌ Invalid version format: {user_input}")
             return

    print(f"\n🚀 Updating version to {final_version}...")
    
    # Create backup
    backup_dir = create_backup(project_dir)
    
    # Scan and update files
    stats = scan_and_update(project_dir, old_version, final_version)
    
    # Print summary report
    print_summary_report(old_version, final_version, stats, backup_dir)
    
    # Update project structure in README.md
    update_readme_structure(project_dir)
    
    print(f"\n💡 Tip: If anything goes wrong, restore from: {backup_dir.name}")
    print(f"💡 To delete backup: Remove the '{backup_dir.name}' folder")
    
    # Prompt to run Git Manager
    print("\n" + "="*70)
    print("� GIT OPERATIONS")
    print("="*70)
    
    print("\nDo you want to stage and commit these version updates now? (y/n): ", end="")
    try:
        response = sys.stdin.readline().strip().lower()
    except:
        response = 'n'
        
    if response == 'y':
        print("\n📦 Staging changes...")
        subprocess.run(['git', 'add', '.'], cwd=project_dir)
        print("✅ Changes staged.")
        
        commit_msg = f"chore: update version to {final_version}"
        print(f"\n📝 Committing with message: '{commit_msg}'...")
        subprocess.run(['git', 'commit', '-m', commit_msg], cwd=project_dir)
        print("✅ Committed successfully.")
    else:
        print("\nℹ️  Changes are left unstaged.")

    # Always offer generic Git Manager for Pushing or other tasks
    run_git_manager(project_dir)
    
    print("\n✅ All tasks completed!")

if __name__ == "__main__":
    main()
