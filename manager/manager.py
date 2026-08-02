import os
import sys
import subprocess
import re
import importlib
import socket
import time
import json
import threading

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

ORBIT_AI_PATH = r"C:\BhasaGrid-Application-Project"

def get_orbit_ai_instance():
    """Dynamically loads OrbitAIDebugger from BhasaGrid project."""
    if os.path.exists(ORBIT_AI_PATH):
        if ORBIT_AI_PATH not in sys.path:
            sys.path.append(ORBIT_AI_PATH)
        try:
            orbit_module = importlib.import_module("tools.orbit_ai.orbit_ai")
            return orbit_module.OrbitAIDebugger()
        except Exception as e:
            console.print(f"[dim yellow]Notice: Could not load Orbit AI ({e}).[/dim yellow]")
    return None

def generate_ai_commit_message():
    """Generates a smart git commit message using Orbit AI based on staged git diff."""
    try:
        diff_res = subprocess.run(["git", "diff", "--staged"], cwd=ROOT_DIR, text=True, capture_output=True)
        diff_text = diff_res.stdout.strip()
        
        if not diff_text:
            diff_res = subprocess.run(["git", "diff"], cwd=ROOT_DIR, text=True, capture_output=True)
            diff_text = diff_res.stdout.strip()
            
        if not diff_text:
            status_res = subprocess.run(["git", "status", "--short"], cwd=ROOT_DIR, text=True, capture_output=True)
            diff_text = status_res.stdout.strip()
            
        if not diff_text:
            console.print("[yellow]No changes detected in working tree or staging area.[/yellow]")
            return None
            
        debugger = get_orbit_ai_instance()
        if not debugger:
            console.print("[bold red]Orbit AI not available at C:\\BhasaGrid-Application-Project.[/bold red]")
            return None

        with Status("[bold cyan]🤖 Orbit AI is analyzing git changes and generating commit message...[/bold cyan]", console=console):
            prompt = (
                f"Analyze the following git diff/changes from my personal portfolio project and generate ONE concise, "
                f"professional git commit message using Conventional Commits format (e.g., 'fix(settings): adjust top offset' or 'refactor(sw): clean up sw logic'). "
                f"Return ONLY the commit message text, with no markdown code blocks, no quotes, and no extra commentary.\n\n"
                f"Git Changes:\n{diff_text[:4000]}"
            )
            system_prompt = "You are Orbit AI, BhasaGrid's intelligent Git commit assistant. Provide concise, high-quality conventional commit messages."
            
            raw_message = debugger.query_ai(prompt=prompt, system_prompt=system_prompt)
            
            message = raw_message.strip().strip('"').strip("'").strip('`')
            lines = [line.strip() for line in message.splitlines() if line.strip()]
            if lines:
                message = lines[0]
            if message.lower().startswith("commit message:"):
                message = message[15:].strip()
            return message
    except Exception as e:
        console.print(f"[bold red]Orbit AI Error:[/bold red] {e}")
        return None

def _commit_with_ai():
    """Handles AI-assisted git commit."""
    ai_msg = generate_ai_commit_message()
    if ai_msg:
        console.print(Panel(f"[bold green]Suggested Commit Message:[/bold green]\n\n[bold white]{ai_msg}[/bold white]", title="[bold cyan]Orbit AI Suggestion[/bold cyan]", border_style="cyan"))
        use_ai = Prompt.ask("Use this commit message?", choices=["y", "n", "edit"], default="y").lower()
        if use_ai == "y":
            run_command(["git", "commit", "-m", ai_msg])
        elif use_ai == "edit":
            custom_msg = Prompt.ask("Edit commit message", default=ai_msg).strip()
            if custom_msg:
                run_command(["git", "commit", "-m", custom_msg])
    else:
        _commit_manually()

def _commit_manually():
    """Handles manual git commit."""
    msg = Prompt.ask("Enter commit message manually").strip()
    if msg:
        run_command(["git", "commit", "-m", msg])
    else:
        console.print("[bold red]Commit aborted: Empty commit message.[/bold red]")

def git_menu():
    """Git management menu with Orbit AI assistance."""
    while True:
        table = Table(title="[bold purple]Git Repository Controls (Powered by Orbit AI 🤖)[/bold purple]", show_header=True, header_style="bold magenta")
        table.add_column("Option", style="dim", width=6)
        table.add_column("Action", style="bold cyan")
        
        table.add_row("1", "Check Repository Status (git status)")
        table.add_row("2", "Stage All Changes (git add .)")
        table.add_row("3", "AI-Suggested Commit (Orbit AI 🤖)")
        table.add_row("4", "Manual Commit Staged Changes")
        table.add_row("5", "Auto-Stage & AI Commit (git add . + Orbit AI)")
        table.add_row("6", "Push Changes (git push)")
        table.add_row("7", "Return to Main Menu")
        
        console.print(table)
        choice = Prompt.ask("Select an option", choices=["1", "2", "3", "4", "5", "6", "7"])
        
        if choice == "1":
            run_command(["git", "status"])
        elif choice == "2":
            run_command(["git", "add", "."])
            console.print("[bold green]✔ Added all changes to staging area.[/bold green]")
        elif choice == "3":
            _commit_with_ai()
        elif choice == "4":
            _commit_manually()
        elif choice == "5":
            run_command(["git", "add", "."])
            console.print("[bold green]✔ Staged all changes.[/bold green]")
            _commit_with_ai()
        elif choice == "6":
            run_command(["git", "push"])
        elif choice == "7":
            break

def _try_kill_listening_process(port: int):
    """Attempt to terminate process bound to specified port on Windows."""
    if os.name != 'nt':
        return
    for p in (port, 35729):
        try:
            res = subprocess.run(f'netstat -ano | findstr :{p}', shell=True, capture_output=True, text=True)
            pids = set()
            for line in res.stdout.splitlines():
                parts = line.strip().split()
                if len(parts) >= 5 and parts[3] == "LISTENING":
                    pids.add(parts[-1])
            for pid in pids:
                subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True)
            time.sleep(0.3)
        except Exception:
            pass

def _free_or_find_port(preferred_port: int = 8431) -> int:
    """Ensure port is available by terminating lingering processes or finding next open port."""
    def is_in_use(p: int) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(("127.0.0.1", p)) == 0

    if not is_in_use(preferred_port):
        return preferred_port

    _try_kill_listening_process(preferred_port)

    if not is_in_use(preferred_port):
        return preferred_port

    for port in range(preferred_port + 1, preferred_port + 20):
        if not is_in_use(port):
            return port

    return preferred_port

BROWSER_CHOICE_FILE = os.path.join(ROOT_DIR, "manager", ".browser_choice.json")

def get_preferred_browser_config() -> dict:
    """Retrieve saved BhasaGrid browser configuration."""
    if os.path.exists(BROWSER_CHOICE_FILE):
        try:
            with open(BROWSER_CHOICE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {"browser": "default", "incognito": False}

def set_preferred_browser_config(browser: str, incognito: bool):
    """Save user's preferred BhasaGrid browser configuration."""
    os.makedirs(os.path.dirname(BROWSER_CHOICE_FILE), exist_ok=True)
    try:
        with open(BROWSER_CHOICE_FILE, 'w', encoding='utf-8') as f:
            json.dump({"browser": browser, "incognito": incognito}, f, indent=2)
    except Exception as e:
        console.print(f"[bold red]Failed to save browser config:[/bold red] {e}")

def _get_browser_incognito_flags(browser: str) -> list:
    """Return browser-specific incognito/private command-line flags."""
    if browser in ["chrome", "brave"]:
        return ["--incognito"]
    if browser == "msedge":
        return ["-inprivate"]
    if browser == "firefox":
        return ["-private-window"]
    if browser == "opera":
        return ["--private"]
    return []

def open_url_in_browser(url: str, force_incognito: bool = None) -> bool:
    """Opens a URL using BhasaGrid browser engine preferences."""
    config = get_preferred_browser_config()
    browser = config.get("browser", "default")
    incognito = config.get("incognito", False) if force_incognito is None else force_incognito

    if os.name != 'nt':
        try:
            import webbrowser
            webbrowser.open(url)
            return True
        except Exception:
            return False

    if browser == "default":
        try:
            import webbrowser
            webbrowser.open(url)
            return True
        except Exception:
            subprocess.Popen(["cmd", "/c", "start", "", str(url)], shell=False)
            return True

    flags = _get_browser_incognito_flags(browser) if incognito else []
    try:
        cmd = ["cmd", "/c", "start", "", str(browser)] + flags + [str(url)]
        subprocess.Popen(cmd, shell=False)
        return True
    except Exception as e:
        console.print(f"[bold red]Failed to launch browser {browser}:[/bold red] {e}")
        return False

def configure_browser_menu():
    """BhasaGrid-style Browser Configuration Menu."""
    config = get_preferred_browser_config()
    current_browser = config.get("browser", "default").title()
    current_mode = "ENABLED 🔒" if config.get("incognito", False) else "DISABLED 🌐"

    console.print(Panel(
        f"[bold cyan]Current Preferred Browser:[/bold cyan] [bold white]{current_browser}[/bold white]\n"
        f"[bold cyan]Incognito / Private Mode:[/bold cyan] [bold white]{current_mode}[/bold white]",
        title="[bold magenta]🌐 BhasaGrid Browser Configuration[/bold magenta]",
        border_style="magenta"
    ))

    table = Table(show_header=False, box=None)
    table.add_column("Key", style="bold green")
    table.add_column("Browser", style="white")
    table.add_row("1", "Default System Browser")
    table.add_row("2", "Google Chrome")
    table.add_row("3", "Microsoft Edge")
    table.add_row("4", "Mozilla Firefox")
    table.add_row("5", "Brave")
    table.add_row("6", "Opera")
    table.add_row("7", "Toggle Incognito/Private Mode")
    table.add_row("8", "Open Live Server URL in Configured Browser")
    table.add_row("B", "Back to Main Menu")

    console.print(table)
    choice = Prompt.ask("Select option", choices=["1", "2", "3", "4", "5", "6", "7", "8", "b", "B"]).lower()

    browsers = {"1": "default", "2": "chrome", "3": "msedge", "4": "firefox", "5": "brave", "6": "opera"}
    if choice in browsers:
        set_preferred_browser_config(browsers[choice], config.get("incognito", False))
        console.print(f"[bold green]✔ Browser set to {browsers[choice].title()}[/bold green]")
    elif choice == "7":
        new_incognito = not config.get("incognito", False)
        set_preferred_browser_config(config.get("browser", "default"), new_incognito)
        status = "ENABLED 🔒" if new_incognito else "DISABLED 🌐"
        console.print(f"[bold green]✔ Incognito mode {status}[/bold green]")
    elif choice == "8":
        open_url_in_browser("http://localhost:8431/")
        console.print("[bold green]✔ Opened http://localhost:8431/ in configured browser.[/bold green]")

def open_terminal_menu():
    """BhasaGrid-style Terminal & Environment Management Menu."""
    console.print(Panel(
        "[bold cyan]Terminal & Shell Utilities (Powered by BhasaGrid Engine)[/bold cyan]",
        title="[bold blue]💻 Terminal Options[/bold blue]",
        border_style="blue"
    ))

    table = Table(show_header=False, box=None)
    table.add_column("Key", style="bold green")
    table.add_column("Action", style="white")
    table.add_row("1", "Open Command Prompt in Project Directory")
    table.add_row("2", "Open PowerShell in Project Directory")
    table.add_row("3", "Clear Terminal Screen")
    table.add_row("B", "Back to Main Menu")

    console.print(table)
    choice = Prompt.ask("Select option", choices=["1", "2", "3", "b", "B"]).lower()

    if choice == "1":
        subprocess.Popen(["cmd", "/k", f"cd /d {ROOT_DIR}"], creationflags=subprocess.CREATE_NEW_CONSOLE)
        console.print("[bold green]✔ Launched Command Prompt terminal.[/bold green]")
    elif choice == "2":
        subprocess.Popen(["powershell", "-NoExit", "-Command", f"Set-Location '{ROOT_DIR}'"], creationflags=subprocess.CREATE_NEW_CONSOLE)
        console.print("[bold green]✔ Launched PowerShell terminal.[/bold green]")
    elif choice == "3":
        os.system("cls" if os.name == "nt" else "clear")

def start_server():
    """Starts a local development server with auto-reload and auto-opens browser."""
    port = _free_or_find_port(8431)
    
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
                threading.Thread(target=lambda: (time.sleep(1), open_url_in_browser(f"http://localhost:{port}/")), daemon=True).start()
                subprocess.run([sys.executable, "-m", "http.server", str(port)], cwd=ROOT_DIR)
            except KeyboardInterrupt:
                console.print("\n[bold red][🛑] Server stopped.[/bold red]")
            return

    # Automatically launch preferred browser after 1 second
    threading.Thread(target=lambda: (time.sleep(1), open_url_in_browser(f"http://localhost:{port}/")), daemon=True).start()

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

def _select_pdf_from_root(pdf_files):
    """Prompts user to choose from list of PDF files."""
    console.print("\n[bold cyan]Found multiple PDF files in project root:[/bold cyan]")
    for idx, f in enumerate(pdf_files, 1):
        console.print(f"  [{idx}] {f}")
    
    choice = Prompt.ask("Select resume PDF number", choices=[str(i) for i in range(1, len(pdf_files) + 1)])
    return os.path.join(ROOT_DIR, pdf_files[int(choice) - 1])

def manage_resume():
    """Interactive utility for uploading/updating resume PDF."""
    pdf_files = [f for f in os.listdir(ROOT_DIR) if f.lower().endswith('.pdf') and f.lower() != 'resume.pdf']
    
    if not pdf_files:
        console.print(Panel(
            "[bold yellow]No external PDF files found in project root.[/bold yellow]\n\n"
            "Please place your new resume PDF file (e.g., `Sreyan_Resume.pdf`) into the project root directory and run this option again.",
            title="Upload Resume",
            border_style="yellow"
        ))
        return

    if len(pdf_files) == 1:
        selected_pdf = os.path.join(ROOT_DIR, pdf_files[0])
    else:
        selected_pdf = _select_pdf_from_root(pdf_files)

    resume_dest_dir = os.path.join(ROOT_DIR, "assets", "pdf")
    os.makedirs(resume_dest_dir, exist_ok=True)
    resume_dest_path = os.path.join(resume_dest_dir, "resume.pdf")

    try:
        import shutil
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

def _handle_main_choice(choice: str, status_text: str) -> bool:
    """Dispatches main menu selections. Returns False if exiting."""
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
        configure_browser_menu()
    elif choice == "8":
        open_terminal_menu()
    elif choice == "9":
        orbit_script = r"C:\BhasaGrid-Application-Project\tools\orbit_ai\orbit_ai.py"
        if os.path.exists(orbit_script):
            subprocess.run([sys.executable, orbit_script, "chat"], cwd=ROOT_DIR)
        else:
            console.print(f"[bold red]Orbit AI not found at {orbit_script}[/bold red]")
    elif choice == "10":
        console.print("\n[bold yellow]Exiting Manager. Goodbye![/bold yellow]\n")
        return False
    return True

def main():
    while True:
        status = get_maintenance_status()
        status_text = "[bold yellow]ACTIVE 🛠️[/bold yellow]" if status else "[bold green]INACTIVE 🟢[/bold green]"
        
        is_venv = sys.prefix != sys.base_prefix
        env_text = "[bold green]Virtual Environment (.venv)[/bold green]" if is_venv else "[bold red]Global System Python[/bold red]"
        
        console.print("\n")
        console.print(Panel(
            Align.center(f"[bold white]Portfolio Maintenance & Dev Tool[/bold white]\n\n"
                         f"Python Env: {env_text}\n"
                         f"Maintenance Status: {status_text}"),
            title="[bold green]Manager[/bold green]",
            subtitle="[dim]Kumar Sreyan Pattanayak • BhasaGrid Engine Integrated[/dim]",
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
        table.add_row("7", "🌐 Browser Settings & Options (BhasaGrid Engine)")
        table.add_row("8", "💻 Terminal & Shell Utilities (BhasaGrid Engine)")
        table.add_row("9", "🤖 Launch Orbit AI (Connected to BhasaGrid Engine)")
        table.add_row("10", "Exit")
        
        console.print(table)
        
        choice = Prompt.ask("Select an option", choices=["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"])
        
        if not _handle_main_choice(choice, status_text):
            sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n\n[bold red]Operation cancelled. Exiting...[/bold red]")
        sys.exit(0)
