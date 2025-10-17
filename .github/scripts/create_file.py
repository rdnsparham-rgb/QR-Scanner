#!/usr/bin/env python3
import os, sys, random, string
from github import Github
from github.GithubException import GithubException

def rand_name(n=7):
    return ''.join(random.choices(string.ascii_uppercase, k=n))

def main():
    token = os.environ.get('MY_TOKEN')
    repo_full = os.environ.get('REPO_FULL')
    filename = os.environ.get('FILENAME')
    content = os.environ.get('CONTENT') or ''
    branch = os.environ.get('BRANCH') or 'main'
    prefix = os.environ.get('PREFIX') or 'V1'

    if not token or not repo_full or not filename:
        print("ERROR: missing required env vars", file=sys.stderr)
        sys.exit(2)

    g = Github(token)
    try:
        repo = g.get_repo(repo_full)
    except Exception as e:
        print("ERROR: cannot access repo:", e, file=sys.stderr)
        sys.exit(3)

    rand = rand_name()
    folder = f"{prefix}/{rand}"
    path = f"{folder}/{filename}"

    try:
        res = repo.create_file(path=path, message=f"Create {path}", content=content, branch=branch)
        pages_url = f"https://{repo.owner.login}.github.io/{repo.name}/{path}"
        print("✅ Created file:", path)
        print("Pages URL:", pages_url)
        with open("created_link.txt","w",encoding="utf8") as fh:
            fh.write(pages_url)
    except GithubException:
        # update existing file
        try:
            existing = repo.get_contents(path, ref=branch)
            sha = existing.sha
            res = repo.update_file(path=path, message=f"Update {path}", content=content, sha=sha, branch=branch)
            pages_url = f"https://{repo.owner.login}.github.io/{repo.name}/{path}"
            print("✅ Updated file:", path)
            with open("created_link.txt","w",encoding="utf8") as fh:
                fh.write(pages_url)
        except Exception as e2:
            print("ERROR updating file:", e2, file=sys.stderr)
            sys.exit(4)

if __name__ == "__main__":
    main()
