import pdfplumber
import json

def rectangles_overlap(r1, r2):
    # r = (x0, top, x1, bottom)
    return not (r1[2] < r2[0] or r1[0] > r2[2] or r1[3] < r2[1] or r1[1] > r2[3])

with open("backend/curriculum_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# flatten tasks to a dict
task_map = {}
for mod in data["modules"]:
    for t in mod["tasks"]:
        task_map[t["day"]] = t

try:
    with pdfplumber.open("Strategic Engineering Roadmap Transitioning from Data Engineering to Agentic AI and Solutions Architecture.pdf") as pdf:
        for page in pdf.pages:
            tables = page.find_tables()
            links = page.hyperlinks
            for table in tables:
                for row_cells in table.cells:
                    if not row_cells or not row_cells[0]: continue
                    day_cell = row_cells[0]
                    # Check day cell text
                    day_text = page.crop(day_cell).extract_text()
                    if day_text:
                        day_str = day_text.strip().replace('\n', '')
                        if day_str.isdigit():
                            day_num = int(day_str)
                            # Get the resource cell, usually index 2 or 3
                            resource_cell = row_cells[2] if len(row_cells) > 2 else None
                            if not resource_cell and len(row_cells) > 1:
                                resource_cell = row_cells[1]
                                
                            found_link = None
                            if resource_cell and links:
                                for link in links:
                                    link_rect = (link['x0'], link['top'], link['x1'], link['bottom'])
                                    if rectangles_overlap(resource_cell, link_rect):
                                        found_link = link['uri']
                                        break
                                        
                            if found_link and day_num in task_map:
                                task_map[day_num]["resource_link"] = found_link
                                
except Exception as e:
    print(f"Error: {e}")

# save back
with open("backend/curriculum_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

count = sum(1 for t in task_map.values() if "resource_link" in t)
print(f"Successfully mapped {count} resource links to days.")
