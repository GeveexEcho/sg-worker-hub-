import os
import subprocess

# Base project name
BASE_DIR = "my-review-app"

# Folder structure
folders = [
    "public",
    "src/app/(auth)/login",
    "src/app/(auth)/register",
    "src/app/dashboard/employer",
    "src/app/dashboard/worker",
    "src/app/companies/[id]",
    "src/app/jobs/[id]",
    "src/components",
    "src/lib",
    "src/types",
]

# Files with minimal content
files = {
    "src/app/(auth)/login/page.tsx": "export default function Login() { return <div>Login Page</div>; }",
    "src/app/(auth)/register/page.tsx": "export default function Register() { return <div>Register Page</div>; }",
    "src/app/dashboard/employer/page.tsx": "export default function EmployerDashboard() { return <div>Employer Dashboard</div>; }",
    "src/app/dashboard/worker/page.tsx": "export default function WorkerDashboard() { return <div>Worker Dashboard</div>; }",
    "src/app/companies/page.tsx": "export default function Companies() { return <div>Companies List</div>; }",
    "src/app/companies/[id]/page.tsx": "export default function CompanyDetails() { return <div>Company Details</div>; }",
    "src/app/jobs/page.tsx": "export default function Jobs() { return <div>Job Board</div>; }",
    "src/app/jobs/[id]/page.tsx": "export default function JobDetails() { return <div>Job Details</div>; }",
    "src/app/layout.tsx": "export default function RootLayout({ children }) { return <html><body>{children}</body></html>; }",
    "src/app/page.tsx": "export default function Home() { return <div>Landing Page</div>; }",
    "src/components/Navbar.tsx": "export default function Navbar() { return <div>Navbar</div>; }",
    "src/components/SearchBar.tsx": "export default function SearchBar() { return <input placeholder='Search...' />; }",
    "src/components/CompanyCard.tsx": "export default function CompanyCard() { return <div>Company Card</div>; }",
    "src/components/JobCard.tsx": "export default function JobCard() { return <div>Job Card</div>; }",
    "src/components/ReviewForm.tsx": "export default function ReviewForm() { return <div>Review Form</div>; }",
    "src/lib/supabase.ts": "// Supabase config",
    "src/types/database.types.ts": "// Types",
    ".env.local": "NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=",
    "next.config.js": "module.exports = {};",
    "tailwind.config.ts": "export default {};",
    "package.json": '{ "name": "my-review-app", "version": "1.0.0" }',
}

def create_structure():
    print("Creating folders...")
    for folder in folders:
        path = os.path.join(BASE_DIR, folder)
        os.makedirs(path, exist_ok=True)

    print("Creating files...")
    for file_path, content in files.items():
        full_path = os.path.join(BASE_DIR, file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(content)

def init_git():
    os.chdir(BASE_DIR)
    subprocess.run(["git", "init"])
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "Initial commit"])

def push_to_github(repo_url):
    subprocess.run(["git", "branch", "-M", "main"])
    subprocess.run(["git", "remote", "add", "origin", repo_url])
    subprocess.run(["git", "push", "-u", "origin", "main"])

if __name__ == "__main__":
    create_structure()
    
    # Initialize git
    init_git()

    # 🔴 Replace with your repo URL
    repo_url = "https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    
    # Push to GitHub
    push_to_github(repo_url)

    print("✅ Project created and pushed to GitHub!")
