#!/usr/bin/env python3
"""
=============================================================================
Automatic Version Update Script
=============================================================================
Purpose: Automatically scans and updates version numbers across all project files
Author: Kumar Sreyan Pattanayak
Created: December 12, 2025
=============================================================================

Features:
- Auto-increments version numbers (e.g., 3.3 → 3.4)
- Updates all version formats (comments, JSON, JS constants, query params)
- Adds current date next to updated versions
- Creates timestamped backups before making changes
- Supports semantic versioning (x.x.x) and simple versioning (x.x)
- Handles various formats: "Version: 1.0.0", "v1.0", etc.
- Scans .md, .html, .js, .py, .json, .txt, .css files
- Excludes .git, node_modules, __pycache__, .agent directories
- Generates detailed summary report
"""

import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple

# ============================================
# CONFIGURATION
# ============================================

# File extensions to scan
EXTENSIONS = ['.md', '.html', '.js', '.py', '.json', '.txt', '.css']

# Directories to exclude
EXCLUDE_DIRS = {'.git', 'node_modules', '__pycache__', '.agent', 'venv', 'env', 'backup_', 'version_backups'}

# Version patterns to match
VERSION_PATTERNS = [
    # Commented versions
    (r'(//\s*Version:?\s*)(\d+\.\d+(?:\.\d+)?)', r'\g<1>{version}'),
    (r'(<!--\s*Version:?\s*)(\d+\.\d+(?:\.\d+)?)(\s*-->)', r'\g<1>{version}\g<3>'),
    
    # JSON format
    (r'("version"\s*:\s*")(\d+\.\d+(?:\.\d+)?)(")', r'\g<1>{version}\g<3>'),
    
    # JavaScript constants
    (r'(VERSION\s*:\s*["\'])(\d+\.\d+(?:\.\d+)?)(["\'])', r'\g<1>{version}\g<3>'),
    (r'(CACHE_NAME\s*[=:]\s*["\'][^"\']*-?v?)(\d+\.\d+(?:\.\d+)?)(["\'])', r'\g<1>{version}\g<3>'),
    
    # UI Display text
    (r'(Version\s+)(\d+\.\d+(?:\.\d+)?)(\s*[•·])', r'\g<1>{version}\g<3>'),
    (r'(Version\s+)(\d+\.\d+(?:\.\d+)?)(\s+is\s+ready)', r'\g<1>{version}\g<3>'),
    
    # Query parameters
    (r'(\?v=)(\d+\.\d+(?:\.\d+)?)', r'\g<1>{version}'),
    
    # Cache names in service workers
    (r'(const\s+\w*CACHE\w*\s*=\s*["\'][^"\']*-?v?)(\d+\.\d+(?:\.\d+)?)(["\'])', r'\g<1>{version}\g<3>'),
    
    # Generic version patterns
    (r'(v)(\d+\.\d+(?:\.\d+)?)(\s*-)', r'\g<1>{version}\g<3>'),
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
    
    if len(parts) == 2:
        # Simple versioning (x.x)
        major, minor = int(parts[0]), int(parts[1])
        if increment_type == 'major':
            return f"{major + 1}.0"
        else:  # minor/patch
            return f"{major}.{minor + 1}"
    
    elif len(parts) == 3:
        # Semantic versioning (x.x.x)
        major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])
        if increment_type == 'major':
            return f"{major + 1}.0.0"
        elif increment_type == 'minor':
            return f"{major}.{minor + 1}.0"
        else:  # patch
            return f"{major}.{minor}.{patch + 1}"
    
    return version

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

def create_backup(project_dir: Path) -> Path:
    """
    Create timestamped backup of entire project
    
    Args:
        project_dir: Project root directory
    
    Returns:
        Path to backup directory
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = project_dir / f"version_backup_{timestamp}"
    
    print(f"\n📦 Creating backup: {backup_dir.name}")
    
    # Create backup directory
    backup_dir.mkdir(exist_ok=True)
    
    # Copy all files except excluded directories
    for item in project_dir.iterdir():
        if item.name.startswith('version_backup_') or item.name in EXCLUDE_DIRS:
            continue
        
        dest = backup_dir / item.name
        if item.is_file():
            shutil.copy2(item, dest)
        elif item.is_dir():
            shutil.copytree(item, dest, ignore=shutil.ignore_patterns(*EXCLUDE_DIRS))
    
    print(f"✅ Backup created successfully!")
    return backup_dir

def update_file_versions(file_path: Path, old_version: str, new_version: str, current_date: str) -> Tuple[int, List[str]]:
    """
    Update version numbers in a single file
    
    Args:
        file_path: Path to file
        old_version: Current version
        new_version: New version
        current_date: Current date string
    
    Returns:
        Tuple of (replacement_count, list of changes)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return 0, [f"Error reading file: {e}"]
    
    original_content = content
    changes = []
    total_replacements = 0
    
    # Apply all version patterns
    for pattern, replacement in VERSION_PATTERNS:
        # Find all matches first
        matches = list(re.finditer(pattern, content))
        
        if matches:
            # Replace with new version
            new_replacement = replacement.format(version=new_version)
            content = re.sub(pattern, new_replacement, content)
            
            # Count replacements
            count = len(matches)
            total_replacements += count
            
            # Record changes
            for match in matches:
                old_text = match.group(0)
                changes.append(f"  • '{old_text}' → '{re.sub(pattern, new_replacement, old_text)}'")
    
    # Update "Last Updated" dates if present
    date_patterns = [
        (r'(Last Updated:?\s*)([A-Z][a-z]+\s+\d{1,2},\s+\d{4})', r'\g<1>' + current_date),
        (r'(Last Modified:?\s*)([A-Z][a-z]+\s+\d{1,2},\s+\d{4})', r'\g<1>' + current_date),
    ]
    
    for pattern, replacement in date_patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes.append(f"  • Updated date to: {current_date}")
    
    # Write back if changes were made
    if content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
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
        
        stats['files_scanned'] += 1
        
        # Update versions in file
        replacements, changes = update_file_versions(file_path, old_version, new_version, current_date)
        
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
            for change in info['changes']:
                print(change)
    
    print("\n" + "="*70)
    print("✅ Version update completed successfully!")
    print("="*70)

# ============================================
# MAIN FUNCTION
# ============================================

def main():
    """Main execution function"""
    print("\n" + "="*70)
    print("🚀 AUTOMATIC VERSION UPDATE SCRIPT")
    print("="*70)
    
    # Get project directory (script's parent directory)
    project_dir = Path(__file__).parent
    print(f"\n📁 Project Directory: {project_dir}")
    
    # Detect current version
    old_version = detect_current_version(project_dir)
    print(f"📌 Current Version: {old_version}")
    
    # Increment version
    new_version = increment_version(old_version, increment_type='minor')
    print(f"📌 New Version: {new_version}")
    
    # Confirm with user
    print(f"\n⚠️  This will update version from {old_version} to {new_version}")
    confirm = input("Continue? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("\n❌ Operation cancelled by user.")
        return
    
    # Create backup
    backup_dir = create_backup(project_dir)
    
    # Scan and update files
    stats = scan_and_update(project_dir, old_version, new_version)
    
    # Print summary report
    print_summary_report(old_version, new_version, stats, backup_dir)
    
    print(f"\n💡 Tip: If anything goes wrong, restore from: {backup_dir.name}")
    print(f"💡 To delete backup: Remove the '{backup_dir.name}' folder")

if __name__ == "__main__":
    main()
