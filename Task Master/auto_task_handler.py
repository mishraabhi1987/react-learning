import openai
import re
import os
import time
from datetime import datetime

# 🔑 Set your OpenAI API key here
openai.api_key = "YOUR_API_KEY_HERE"

# Constants
TASK_FILE = "Tasks.md"
SUPPORTED_EXTENSIONS = [".py", ".js", ".ts", ".java"]

def find_code_files():
    files = []
    for root, _, filenames in os.walk("."):
        for filename in filenames:
            if any(filename.endswith(ext) for ext in SUPPORTED_EXTENSIONS):
                files.append(os.path.join(root, filename))
    return files

def extract_tasks_from_file(file_path):
    with open(file_path, "r") as f:
        lines = f.readlines()
    tasks = []
    for i, line in enumerate(lines):
        match = re.match(r"# Task(?:\(([^)]+)\))?: (.+)", line.strip())
        if match:
            priority = match.group(1) if match.group(1) else "normal"
            description = match.group(2)
            tasks.append((file_path, i, description, priority))
    return tasks, lines

def get_ai_code(task_description):
    print(f"🔍 AI generating code for: {task_description}")
    prompt = f"Write code for the following task:\n{task_description}"
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()

def update_code_files(tasks_by_file):
    for file_path, (lines, tasks) in tasks_by_file.items():
        updated_lines = lines[:]
        offset = 0
        for line_no, task_desc, priority in tasks:
            code = get_ai_code(task_desc)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            insert_line = f"# ⏱️ Completed on {timestamp}\n{code}\n"
            updated_lines.insert(line_no + 1 + offset, insert_line)
            offset += 1
        with open(file_path, "w") as f:
            f.writelines(updated_lines)
        print(f"✅ {file_path} updated.")

def update_tasks_md(all_tasks):
    if not os.path.exists(TASK_FILE):
        print("⚠️ Tasks.md not found.")
        return
    with open(TASK_FILE, "r") as f:
        content = f.read()
    for _, _, task_desc, _ in all_tasks:
        pattern = f"- [ ] {re.escape(task_desc)}"
        replacement = f"- [x] {task_desc} ✅"
        content = re.sub(pattern, replacement, content)
    with open(TASK_FILE, "w") as f:
        f.write(content)
    print("✅ Tasks.md updated with completed tasks.")

def main():
    print("🚀 Auto Task Handler (Advanced) शुरू हो रहा है...\n")
    start_time = time.time()

    all_tasks = []
    tasks_by_file = {}

    for file in find_code_files():
        tasks, lines = extract_tasks_from_file(file)
        if tasks:
            all_tasks.extend([(file, i, d, p) for (_, i, d, p) in tasks])
            tasks_by_file[file] = (lines, [(i, d, p) for (_, i, d, p) in tasks])

    if not all_tasks:
        print("❌ कोई Task नहीं मिला प्रोजेक्ट में")
        return

    # Sort by priority (high > normal > low)
    priority_order = {"high": 1, "normal": 2, "low": 3}
    all_tasks.sort(key=lambda x: priority_order.get(x[3].lower(), 99))

    update_code_files(tasks_by_file)
    update_tasks_md(all_tasks)

    duration = time.time() - start_time
    print(f"🕒 Total time taken: {duration:.2f} seconds")
    print("\n🎉 सभी Task पूरे हो गए और अपडेट हो गए!")

if __name__ == "__main__":
    main()
