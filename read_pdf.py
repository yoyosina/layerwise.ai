import fitz

doc = fitz.open("Strategic Engineering Roadmap Transitioning from Data Engineering to Agentic AI and Solutions Architecture.pdf")
text = ""
for page in doc:
    text += page.get_text()

lines = text.split('\n')
for line in lines:
    if "Module" in line or "Month" in line:
        print(line)
