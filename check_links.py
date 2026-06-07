import fitz

doc = fitz.open("Strategic Engineering Roadmap Transitioning from Data Engineering to Agentic AI and Solutions Architecture.pdf")
count = 0
for page_num, page in enumerate(doc):
    links = page.get_links()
    for link in links:
        if 'uri' in link:
            print(f"Page {page_num + 1}: {link['uri']}")
            count += 1

print(f"Total links found: {count}")
