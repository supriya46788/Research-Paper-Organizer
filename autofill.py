import PyPDF2

path = "C:\\Users\\Tanisha\\Projects\\major project\\research paper\\Solar energy for future world- A review.pdf"
reader = PyPDF2.PdfReader(path)

print("Number of Pages:", len(reader.pages))
print("\nMetadata:")
for key, value in reader.metadata.items():
    print(f"{key}: {value}")
