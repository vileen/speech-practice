#!/usr/bin/env python3
"""
PDF Conversion Script using OpenDataLoader
Converts PDFs to Markdown/JSON with optional OCR
"""

import argparse
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from services.pdf_converter import convert_pdf, batch_convert


def main():
    parser = argparse.ArgumentParser(
        description='Convert PDFs to text using OpenDataLoader',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s document.pdf output/
  %(prog)s file1.pdf file2.pdf output/ --format json
  %(prog)s scans/ output/ --hybrid --ocr --lang eng,jpn
        """
    )
    
    parser.add_argument(
        'inputs',
        nargs='+',
        help='PDF file(s) or directory to convert'
    )
    
    parser.add_argument(
        'output_dir',
        help='Output directory for converted files'
    )
    
    parser.add_argument(
        '--format',
        choices=['markdown', 'json', 'html', 'text'],
        default='markdown',
        help='Output format (default: markdown)'
    )
    
    parser.add_argument(
        '--hybrid',
        action='store_true',
        help='Use hybrid mode (better for complex/scanned PDFs)'
    )
    
    parser.add_argument(
        '--ocr',
        action='store_true',
        help='Enable OCR for scanned PDFs'
    )
    
    parser.add_argument(
        '--lang',
        default='eng',
        help='OCR languages (comma-separated, e.g., eng,jpn,kor)'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        default=5002,
        help='Hybrid backend port (default: 5002)'
    )
    
    args = parser.parse_args()
    
    # Validate inputs
    for input_path in args.inputs:
        if not os.path.exists(input_path):
            print(f"Error: Path not found: {input_path}", file=sys.stderr)
            sys.exit(1)
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Convert
    try:
        results = batch_convert(
            input_paths=args.inputs,
            output_dir=args.output_dir,
            format=args.format,
            hybrid=args.hybrid,
            ocr=args.ocr,
            lang=args.lang,
            port=args.port
        )
        
        print(f"\n✅ Converted {len(results)} file(s) to {args.output_dir}")
        for result in results:
            status = "✓" if result['success'] else "✗"
            print(f"  {status} {result['input']} → {result['output']}")
        
        # Exit with error if any failed
        if any(not r['success'] for r in results):
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
