"""
push.py — Latest code GitHub par push karo (Emergent-safe version).

Usage:
    python push.py "commit message"
    python push.py                 # default message: "Update - YYYY-MM-DD HH:MM"
    python push.py --dry-run       # sirf dikhao kya badlega, push nahi hoga
    python push.py --force         # GitHub branch ki history replace karke force push

Env vars:
    GITHUB_TOKEN   — GitHub personal access token (repo "Contents: write" access)
    GITHUB_REMOTE  — repo URL (default: https://github.com/Langenhorner001/azmpr.git)
    GITHUB_BRANCH  — branch (default: main)

Project ka apna .git kabhi delete nahi hota (Emergent history/rollback safe rehti hai).
Push ek alag git folder (~/.azmpr-push.git) se hota hai aur GitHub ki purani history
ke upar naya commit banta hai, is liye normal push mein kuch overwrite nahi hota.
"""
import datetime
import os
import subprocess
import sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.abspath(__file__))
GIT_DIR = os.path.expanduser("~/.azmpr-push.git")
DEFAULT_REMOTE = "https://github.com/Langenhorner001/azmpr.git"

# Never pushed: secrets, local caches, test output
EXCLUDES = [
    ".env", "*.env", ".env.*", "node_modules/", "__pycache__/", ".ruff_cache/",
    "test_reports/", "plan/", "frontend/build/", "backend/static/uploads/",
]
# Kept exactly as on GitHub (the other Emergent account's own environment config)
KEEP_REMOTE = [".emergent"]

GREEN, RED, YELLOW, CYAN, BOLD, RESET = "\033[92m", "\033[91m", "\033[93m", "\033[96m", "\033[1m", "\033[0m"


def _load_dotenv():
    path = os.path.join(ROOT, ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            k, v = k.strip(), v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def _token_from_backend_process():
    """On Emergent the GITHUB_TOKEN secret lives in the running backend's environment."""
    if not os.path.isdir("/proc"):
        return ""
    for pid in filter(str.isdigit, os.listdir("/proc")):
        try:
            with open(f"/proc/{pid}/cmdline", "rb") as f:
                if b"uvicorn" not in f.read():
                    continue
            with open(f"/proc/{pid}/environ", "rb") as f:
                for item in f.read().split(b"\0"):
                    if item.startswith(b"GITHUB_TOKEN="):
                        return item.split(b"=", 1)[1].decode().strip()
        except OSError:
            continue
    return ""


TOKEN = ""


def log(msg, color=RESET):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"{color}[{ts}] {msg}{RESET}")


def mask(text):
    return text.replace(TOKEN, "***") if TOKEN else text


def git(*args, quiet=False):
    cmd = ["git", f"--git-dir={GIT_DIR}", f"--work-tree={ROOT}", *args]
    res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if not quiet:
        for out, color in ((res.stdout, RESET), (res.stderr, YELLOW)):
            if out.strip():
                print(f"  {color}{mask(out.strip())}{RESET}")
    return res


def auth_url(remote):
    if not TOKEN or "@" in remote or not remote.startswith("https://"):
        return remote
    return remote.replace("https://", f"https://x-access-token:{TOKEN}@", 1)


def prepare_git_dir():
    if not os.path.isdir(GIT_DIR):
        git("init", "-q")
    git("config", "user.email", "bot@push.local")
    git("config", "user.name", "ST-BOT")
    git("config", "core.autocrlf", "false")
    os.makedirs(os.path.join(GIT_DIR, "info"), exist_ok=True)
    with open(os.path.join(GIT_DIR, "info", "exclude"), "w") as f:
        f.write("\n".join(EXCLUDES) + "\n")


def stage(url, branch, force):
    """Build the index = this project's files, on top of the GitHub branch (unless force)."""
    exists = bool(git("ls-remote", "--heads", url, branch, quiet=True).stdout.strip())
    if exists:
        if git("fetch", "-q", url, branch).returncode != 0:
            log("GitHub se branch fetch nahi ho saki (token/URL check karein).", RED)
            sys.exit(1)
    git("symbolic-ref", "HEAD", "refs/heads/push-sync", quiet=True)
    if exists and not force:
        git("update-ref", "refs/heads/push-sync", "FETCH_HEAD", quiet=True)
        git("reset", "-q", "--mixed", "FETCH_HEAD", quiet=True)
    else:
        git("update-ref", "-d", "refs/heads/push-sync", quiet=True)
        git("read-tree", "--empty", quiet=True)
    git("add", "-A", quiet=True)
    if exists:
        for path in KEEP_REMOTE:
            git("reset", "-q", "FETCH_HEAD", "--", path, quiet=True)
    return exists


def main():
    global TOKEN
    _load_dotenv()
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    words = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run, force = "--dry-run" in flags, "--force" in flags
    message = words[0] if words else f"Update - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"
    remote = os.environ.get("GITHUB_REMOTE", "").strip() or DEFAULT_REMOTE
    branch = os.environ.get("GITHUB_BRANCH", "").strip() or "main"
    TOKEN = os.environ.get("GITHUB_TOKEN", "").strip() or _token_from_backend_process()

    print(f"\n{BOLD}{GREEN}+==================================+\n    GITHUB PUSH\n+==================================+{RESET}\n")
    log(f"Repo: {remote}  |  Branch: {branch}{'  |  FORCE' if force else ''}{'  |  DRY RUN' if dry_run else ''}", CYAN)
    if not TOKEN and "@" not in remote and not dry_run:
        log("GITHUB_TOKEN set nahi hai! GitHub token ke baghair push nahi ho sakta.", RED)
        sys.exit(1)

    url = auth_url(remote)
    prepare_git_dir()
    exists = stage(url, branch, force)
    base = ["FETCH_HEAD"] if exists and not force else []
    changed = git("diff", "--cached", "--name-only", *base, quiet=True).stdout.splitlines()
    if exists and not force and not changed:
        log("GitHub pehle se isi code par hai — push ki zaroorat nahi.", GREEN)
        return
    stat = git("diff", "--cached", "--shortstat", *base, quiet=True).stdout.strip()
    log(f"Changes: {stat or f'{len(changed)} files'}", CYAN)
    if dry_run:
        for name in changed[:80]:
            print(f"  • {name}")
        if len(changed) > 80:
            print(f"  … +{len(changed) - 80} more")
        log("Dry run — kuch push nahi hua.", YELLOW)
        return

    if git("commit", "-q", "-m", message).returncode != 0:
        log("Commit nahi ban saka.", RED)
        sys.exit(1)
    log("GitHub par push kar raha hoon...", CYAN)
    push_args = ["push", url, f"HEAD:refs/heads/{branch}"] + (["--force"] if force else [])
    res = git(*push_args)
    print(f"\n{BOLD}{CYAN}----------------------------------{RESET}")
    if res.returncode == 0:
        sha = git("rev-parse", "--short", "HEAD", quiet=True).stdout.strip()
        print(f"  {GREEN}✅ GitHub push successful! Commit {sha} → {branch}{RESET}\n")
    else:
        err = res.stderr
        if "403" in err or "denied" in err.lower():
            hint = "Token ke paas is repo par likhne ki ijazat nahi. Repo owner ke account ka token use karein (Contents: Read and write)."
        elif "rejected" in err or "fetch first" in err:
            hint = "GitHub par naye commits aa gaye hain — push.py dobara chalayein."
        else:
            hint = "Upar wala error dekhein."
        print(f"  {RED}❌ GitHub push fail hua! {hint}{RESET}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
