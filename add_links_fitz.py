import fitz
import json
import re

with open("backend/curriculum_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

task_map = {}
for mod in data["modules"]:
    for t in mod["tasks"]:
        task_map[t["day"]] = t

doc = fitz.open("Strategic Engineering Roadmap Transitioning from Data Engineering to Agentic AI and Solutions Architecture.pdf")

mapped_count = 0
for page in doc:
    links = page.get_links()
    for link in links:
        if 'uri' in link:
            rect = link['from']
            # create a horizontal band across the page
            band_rect = fitz.Rect(0, rect.y0 - 2, page.rect.width, rect.y1 + 2)
            band_text = page.get_textbox(band_rect)
            
            lines = band_text.split('\n')
            day_num = None
            for line in lines:
                line = line.strip()
                if line.isdigit():
                    day_num = int(line)
                    break
            
            if day_num and 1 <= day_num <= 180:
                if day_num in task_map:
                    # avoid overwriting if a better match is needed, or just overwrite
                    task_map[day_num]["resource_link"] = link['uri']
                    mapped_count += 1

print(f"Successfully mapped {mapped_count} links!")

with open("backend/curriculum_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)
