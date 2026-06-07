import fitz

doc = fitz.open("Strategic Engineering Roadmap Transitioning from Data Engineering to Agentic AI and Solutions Architecture.pdf")
text = ""
for i in range(min(5, len(doc))):
    text += doc[i].get_text()

with open("pdf_dump.txt", "w", encoding="utf-8") as f:
    f.write(text)
print("Dumped first 5 pages to pdf_dump.txt")
