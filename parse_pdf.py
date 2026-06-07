import fitz
import json
import re

doc = fitz.open("Strategic Engineering Roadmap Transitioning from Data Engineering to Agentic AI and Solutions Architecture.pdf")
text = ""
for page in doc:
    text += page.get_text()

modules = []
current_module = None

# Fallback module titles if parsing fails
module_titles = [
    "Foundations of Vibe Coding, MCP, and Core Agent Setup",
    "The Elite Coding Gate — Data Structures, Algorithms",
    "High-Performance GenAI System Design & Scalability",
    "Enterprise Data Integration, Advanced RAG, and Vector DBs",
    "Advanced LLMOps, Security Guardrails, and Evaluation",
    "Forward-Deployed Solutions Engineering, GTM & Delivery"
]

for i in range(1, 7):
    modules.append({
        "id": i,
        "title": module_titles[i-1],
        "order": i,
        "tasks": []
    })

lines = text.split('\n')
current_mod_idx = 0

for i, line in enumerate(lines):
    line = line.strip()
    # Try to find "Day X"
    day_match = re.search(r'Day\s+(\d+)[^\w]*(.*)', line, re.IGNORECASE)
    if day_match:
        day_num = int(day_match.group(1))
        if day_num > 180:
            continue
            
        task_title = day_match.group(2).strip()
        # If task title is empty, maybe it's on the next line
        if not task_title and i + 1 < len(lines):
            task_title = lines[i+1].strip()
            
        # Determine which module this day belongs to (1-30 -> Mod 1, 31-60 -> Mod 2...)
        mod_idx = (day_num - 1) // 30
        if mod_idx >= 6:
            mod_idx = 5
            
        # Avoid duplicate days if regex matches weirdly
        existing_days = [t["day"] for t in modules[mod_idx]["tasks"]]
        if day_num not in existing_days:
            modules[mod_idx]["tasks"].append({
                "id": day_num,
                "title": f"Day {day_num}: {task_title}" if task_title else f"Day {day_num}: Scheduled Task",
                "day": day_num
            })

# Fill in any missing days to ensure exactly 180 days
for mod_idx in range(6):
    start_day = mod_idx * 30 + 1
    end_day = start_day + 29
    existing_days = {t["day"]: t for t in modules[mod_idx]["tasks"]}
    
    complete_tasks = []
    for d in range(start_day, end_day + 1):
        if d in existing_days:
            complete_tasks.append(existing_days[d])
        else:
            complete_tasks.append({
                "id": d,
                "title": f"Day {d}: {modules[mod_idx]['title']} Continuation",
                "day": d
            })
    modules[mod_idx]["tasks"] = complete_tasks

with open("backend/curriculum_data.json", "w", encoding="utf-8") as f:
    json.dump({"modules": modules}, f, indent=4)

print("Saved 180 tasks to backend/curriculum_data.json")
