# OpenDataLoader PDF Integration

## Installation

```bash
# Install OpenDataLoader PDF
pip install opendataloader-pdf

# For OCR and hybrid mode (recommended)
pip install "opendataloader-pdf[hybrid]"
```

## Requirements

- Java 11+ (required)
- Python 3.10+
- For hybrid mode: Optional GPU support

### Check Java version:
```bash
java -version
```

If not installed, get JDK 11+ from [Adoptium](https://adoptium.net/).

## Usage

### Basic Conversion (Digital PDFs)

```bash
# Convert single PDF
python scripts/convert_pdf.py input.pdf output/

# Convert multiple PDFs
python scripts/convert_pdf.py file1.pdf file2.pdf output/

# Convert directory
python scripts/convert_pdf.py pdfs/ output/
```

### With OCR (Scanned PDFs)

```bash
# Start hybrid backend
opendataloader-pdf-hybrid --port 5002 --force-ocr

# In another terminal, convert with OCR
python scripts/convert_pdf.py --hybrid --ocr input.pdf output/
```

### Output Formats

- `markdown` (default) - Clean text for LLM context
- `json` - Structured data with bounding boxes
- `html` - Web display

## Python API

```python
from services.pdf_converter import convert_pdf

# Convert to markdown
result = convert_pdf("document.pdf", output_format="markdown")

# Convert to JSON with bounding boxes
result = convert_pdf("document.pdf", output_format="json")

# OCR mode for scanned documents
result = convert_pdf("scanned.pdf", output_format="markdown", use_ocr=True)
```

## Comparison with pdf-ocr

| Feature | OpenDataLoader | pdf-ocr (ours) |
|---------|---------------|----------------|
| Speed | 100+ pages/s | ~1-2 pages/s |
| Tables | ✅ Complex tables | ❌ Basic only |
| OCR | ✅ 80+ languages | ✅ Tesseract |
| Formulas | ✅ LaTeX | ❌ |
| Structure | ✅ Headings, lists | ❌ Plain text |
| Bounding boxes | ✅ | ❌ |
| AI Safety | ✅ | ❌ |

Use **OpenDataLoader** for:
- Complex PDFs with tables
- Scientific papers with formulas
- Documents needing structure preservation
- Production workloads

Use **pdf-ocr** for:
- Simple text extraction
- Lightweight deployments
- Basic OCR needs
- No Java dependency

## Configuration

Add to your `.env.local`:
```
# OpenDataLoader settings
OPENDATALOADER_MODE=fast  # fast or hybrid
OPENDATALOADER_OCR_LANG=eng  # eng, jpn, kor, etc.
OPENDATALOADER_HYBRID_PORT=5002
```

## Performance Tips

1. **Batch processing**: Convert multiple files in one call
2. **Hybrid mode**: Use for complex/scanned PDFs only
3. **Format selection**: Use `markdown` for LLM context, `json` for citations
4. **Structure trees**: Enable `use_struct_tree` for tagged PDFs

## License

OpenDataLoader PDF is Apache 2.0 licensed.
