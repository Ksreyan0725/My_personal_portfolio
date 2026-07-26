import os
import sys
import subprocess
import re

# Resolve root path of the project
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(ROOT_DIR, "index.html")

# --- Auto-install and import Rich for beautiful terminal UX ---
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.prompt import Prompt
    from rich.align import Align
    from rich.status import Status
except ImportError:
    print("[📦] Installing 'rich' library for a premium terminal interface...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "rich"], check=True)
        from rich.console import Console
        from rich.panel import Panel
        from rich.table import Table
        from rich.prompt import Prompt
        from rich.align import Align
        from rich.status import Status
    except Exception as e:
        print(f"Failed to install 'rich': {e}. Exiting.")
        sys.exit(1)

# Initialize console
console = Console()

def run_command(command, cwd=ROOT_DIR):
    """Utility to run a system command and print output."""
    try:
        console.print(f"\n[bold blue]> Running:[/bold blue] {' '.join(command)}")
        result = subprocess.run(command, cwd=cwd, text=True, capture_output=False)
        return result.returncode == 0
    except Exception as e:
        console.print(f"[bold red]Error running command:[/bold red] {e}")
        return False

def get_maintenance_status():
    """Reads index.html to check if maintenance mode redirects are active."""
    if not os.path.exists(INDEX_PATH):
        console.print(f"[bold red]Error:[/bold red] {INDEX_PATH} not found.")
        return None
    
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check if the redirection tags are commented or uncommented
    meta_active = re.search(r'(?<!<!--\s)<meta http-equiv="refresh" content="0; url=pages/maintenance.html">', content)
    script_active = re.search(r"(?<!<!--\s)<script>window.location.replace\('pages/maintenance.html'\);</script>", content)
    
    if meta_active or script_active:
        return True
    return False

def toggle_maintenance(enable):
    """Enables or disables maintenance mode by modifying index.html."""
    if not os.path.exists(INDEX_PATH):
        console.print(f"[bold red]Error:[/bold red] {INDEX_PATH} not found.")
        return
    
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Search patterns
    meta_commented = r'<!-- <meta http-equiv="refresh" content="0; url=pages/maintenance.html"> -->'
    meta_uncommented = r'<meta http-equiv="refresh" content="0; url=pages/maintenance.html">'
    
    script_commented = r"<!-- <script>window.location.replace\('pages/maintenance.html'\);</script> -->"
    script_uncommented = r"<script>window.location.replace\('pages/maintenance.html'\);</script>"

    if enable:
        if meta_commented in content:
            content = content.replace(meta_commented, meta_uncommented)
        if script_commented in content:
            content = content.replace(script_commented, script_uncommented)
        status_msg = "ENABLED 🛠️"
        color = "yellow"
    else:
        if meta_uncommented in content and meta_commented not in content:
            content = content.replace(meta_uncommented, meta_commented)
        if script_uncommented in content and script_commented not in content:
            content = content.replace(script_uncommented, script_commented)
        status_msg = "DISABLED 🟢"
        color = "green"

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    
    console.print(Panel(f"[bold {color}]Maintenance mode successfully {status_msg}[/bold {color}]", border_style=color))

def git_menu():
    """Git management menu."""
    while True:
        table = Table(title="[bold purple]Git Repository Controls[/bold purple]", show_header=True, header_style="bold magenta")
        table.add_column("Option", style="dim", width=6)
        table.add_column("Action", style="bold cyan")
        
        table.add_row("1", "Check Repository Status (git status)")
        table.add_row("2", "Stage All Changes (git add .)")
        table.add_row("3", "Commit Staged Changes")
        table.add_row("4", "Push Changes (git push)")
        table.add_row("5", "Return to Main Menu")
        
        console.print(table)
        choice = Prompt.ask("Select an option", choices=["1", "2", "3", "4", "5"])
        
        if choice == "1":
            run_command(["git", "status"])
        elif choice == "2":
            run_command(["git", "add", "."])
            console.print("[bold green]✔ Added all changes to staging area.[/bold green]")
        elif choice == "3":
            msg = Prompt.ask("Enter commit message").strip()
            if msg:
                run_command(["git", "commit", "-m", msg])
            else:
                console.print("[bold red]Commit aborted: Empty commit message.[/bold red]")
        elif choice == "4":
            run_command(["git", "push"])
        elif choice == "5":
            break

def start_server():
    """Starts a local development server with auto-reload."""
    port = 8431
    
    try:
        livereload_module = __import__('livereload')
    except ImportError:
        console.print("\n[bold yellow][📦] 'livereload' library not found. Installing it automatically...[/bold yellow]")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "livereload"], check=True)
            livereload_module = __import__('livereload')
        except Exception as e:
            console.print(f"[bold red]Failed to install livereload library:[/bold red] {e}")
            console.print("[bold yellow]Falling back to standard python http.server (no auto-reload)...[/bold yellow]")
            try:
                subprocess.run([sys.executable, "-m", "http.server", str(port)], cwd=ROOT_DIR)
            except KeyboardInterrupt:
                console.print("\n[bold red][🛑] Server stopped.[/bold red]")
            return

    console.print(Panel(
        f"[bold green]🚀 Live development server starting...[/bold green]\n\n"
        f"URL: [bold underline]http://localhost:{port}/[/bold underline]\n"
        f"Watching: [dim]HTML, CSS, JS modifications[/dim]\n\n"
        f"[bold red][Ctrl+C][/bold red] to stop the server & return to menu.",
        title="[bold cyan]Hot-Reload Server[/bold cyan]",
        border_style="cyan"
    ))
    
    try:
        server = livereload_module.Server()
        server.watch(os.path.join(ROOT_DIR, "*.html"))
        server.watch(os.path.join(ROOT_DIR, "pages", "*.html"))
        server.watch(os.path.join(ROOT_DIR, "assets", "css", "*.css"))
        server.watch(os.path.join(ROOT_DIR, "assets", "js", "*.js"))
        server.watch(os.path.join(ROOT_DIR, "assets", "js", "modules", "*.js"))
        
        server.serve(port=port, host="127.0.0.1", root=ROOT_DIR)
    except KeyboardInterrupt:
        console.print("\n[bold red][🛑] Server stopped.[/bold red]")
    except Exception as e:
        console.print(f"[bold red]Error starting live server:[/bold red] {e}")

def manage_resume():
    """Dynamically detects PDF files in the workspace and handles uploading/replacing the active resume."""
    import shutil
    console.print("\n[bold purple]--- Resume Uploader ---[/bold purple]")
    
    # Destination path
    resume_dest_dir = os.path.join(ROOT_DIR, "assets", "docs")
    resume_dest_path = os.path.join(resume_dest_dir, "kumar-sreyan-pattanayak-resume.pdf")
    
    # Scan root directory for any PDF files
    pdf_files = []
    try:
        for f in os.listdir(ROOT_DIR):
            if f.endswith(".pdf") and os.path.isfile(os.path.join(ROOT_DIR, f)):
                pdf_files.append(f)
    except Exception as e:
        console.print(f"[bold red]Error scanning directory:[/bold red] {e}")
            
    selected_pdf = None
    if pdf_files:
        console.print("[bold green]Found PDF file(s) in your project root:[/bold green]")
        for i, pdf in enumerate(pdf_files, 1):
            console.print(f"  {i}. {pdf}")
        console.print(f"  {len(pdf_files) + 1}. Specify a different path manually")
        console.print(f"  {len(pdf_files) + 2}. Cancel")
        
        choices = [str(i) for i in range(1, len(pdf_files) + 3)]
        choice = Prompt.ask("Choose an option", choices=choices)
        
        if int(choice) <= len(pdf_files):
            selected_pdf = os.path.join(ROOT_DIR, pdf_files[int(choice) - 1])
        elif int(choice) == len(pdf_files) + 1:
            pass
        else:
            console.print("[bold red]Operation cancelled.[/bold red]")
            return
            
    if not selected_pdf:
        path_input = Prompt.ask("Enter the absolute path to your new resume PDF (or drag & drop it here)").strip()
        path_input = path_input.strip('"').strip("'")
        
        if not path_input:
            console.print("[bold red]Operation cancelled: empty path.[/bold red]")
            return
            
        if not os.path.exists(path_input) or not path_input.endswith(".pdf"):
            console.print("[bold red]Error: File does not exist or is not a PDF.[/bold red]")
            return
            
        selected_pdf = path_input

    try:
        os.makedirs(resume_dest_dir, exist_ok=True)
        shutil.copy(selected_pdf, resume_dest_path)
        console.print(Panel(
            f"[bold green]✔ Resume updated successfully![/bold green]\n\n"
            f"Copied from: [dim]{selected_pdf}[/dim]\n"
            f"Active path: [bold underline]{resume_dest_path}[/bold underline]",
            title="Success",
            border_style="green"
        ))
    except Exception as e:
        console.print(f"[bold red]Failed to copy resume file:[/bold red] {e}")

def main():
    while True:
        status = get_maintenance_status()
        status_text = "[bold yellow]ACTIVE 🛠️[/bold yellow]" if status else "[bold green]INACTIVE 🟢[/bold green]"
        
        # Check if running in a virtual environment
        is_venv = sys.prefix != sys.base_prefix
        env_text = f"[bold green]Virtual Environment (.venv)[/bold green]" if is_venv else "[bold red]Global System Python[/bold red]"
        
        console.print("\n")
        console.print(Panel(
            Align.center(f"[bold white]Portfolio Maintenance & Dev Tool[/bold white]\n\n"
                         f"Python Env: {env_text}\n"
                         f"Maintenance Status: {status_text}"),
            title="[bold green]Manager[/bold green]",
            subtitle="[dim]Kumar Sreyan Pattanayak[/dim]",
            border_style="green"
        ))
        
        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("Option", style="dim", width=6)
        table.add_column("Action", style="bold cyan")
        
        table.add_row("1", "Check Maintenance Mode Status")
        table.add_row("2", "Enable Maintenance Mode")
        table.add_row("3", "Disable Maintenance Mode")
        table.add_row("4", "Git Repository Management")
        table.add_row("5", "Upload/Update Resume (PDF)")
        table.add_row("6", "Launch Live Development Server (Port 8431)")
        table.add_row("7", "Exit")
        
        console.print(table)
        
        choice = Prompt.ask("Select an option", choices=["1", "2", "3", "4", "5", "6", "7"])
        
        if choice == "1":
            console.print(Panel(f"Current Status: {status_text}"))
        elif choice == "2":
            toggle_maintenance(enable=True)
        elif choice == "3":
            toggle_maintenance(enable=False)
        elif choice == "4":
            git_menu()
        elif choice == "5":
            manage_resume()
        elif choice == "6":
            start_server()
        elif choice == "7":
            console.print("\n[bold yellow]Exiting Manager. Goodbye![/bold yellow]\n")
            sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n\n[bold red]Operation cancelled. Exiting...[/bold red]")
        sys.exit(0)
