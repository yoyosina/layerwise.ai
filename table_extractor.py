import pdfplumber
import json

module_titles = [
    "Foundations of Vibe Coding, MCP, and Core Agent Setup",
    "The Elite Coding Gate — Data Structures, Algorithms",
    "High-Performance GenAI System Design & Scalability",
    "Enterprise Data Integration, Advanced RAG, and Vector DBs",
    "Advanced LLMOps, Security Guardrails, and Evaluation",
    "Forward-Deployed Solutions Engineering, GTM & Delivery"
]

modules = []
for i in range(1, 7):
    modules.append({
        "id": i,
        "title": module_titles[i-1],
        "order": i,
        "tasks": []
    })

tasks_extracted = 0

try:
    with pdfplumber.open("Strategic Engineering Roadmap Transitioning from Data Engineering to Agentic AI and Solutions Architecture.pdf") as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if not row or not row[0]:
                        continue
                    day_str = str(row[0]).strip().replace('\\n', '')
                    if day_str.isdigit():
                        day_num = int(day_str)
                        if 1 <= day_num <= 180:
                            title_raw = str(row[1]) if len(row) > 1 and row[1] else "Scheduled Task"
                            title = title_raw.replace('\\n', ' ').strip()
                            mod_idx = (day_num - 1) // 30
                            if mod_idx >= 6: mod_idx = 5
                            
                            # Avoid duplicates
                            if day_num not in [t['day'] for t in modules[mod_idx]["tasks"]]:
                                modules[mod_idx]["tasks"].append({
                                    "id": day_num,
                                    "title": f"Day {day_num}: {title}",
                                    "day": day_num
                                })
                                tasks_extracted += 1
except Exception as e:
    print(f"Error parsing PDF: {e}")

# Ensure exactly 180 days are present
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

print(f"Successfully extracted {tasks_extracted} tasks from tables and saved to curriculum_data.json.")
