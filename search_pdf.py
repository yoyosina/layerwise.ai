import fitz
import re

doc = fitz.open("Strategic Engineering Roadmap Transitioning from Data Engineering to Agentic AI and Solutions Architecture.pdf")
text = ""
for page in doc:
    text += page.get_text()

lines = text.split('\n')
found_module = False
count = 0

for i, line in enumerate(lines):
    if "Module 1" in line:
        print("FOUND MODULE 1:")
        for j in range(i, min(i+50, len(lines))):
            print(f"{j}: {lines[j].strip()}")
        break
