"""
PDF Converter Service using OpenDataLoader
Provides high-quality PDF to text/Markdown/JSON conversion
"""

import subprocess
import json
import os
from pathlib import Path
from typing import List, Dict, Union, Optional


class PDFConverterError(Exception):
    """Raised when PDF conversion fails"""
    pass


def check_opendataloader() -> bool:
    """Check if OpenDataLoader is installed"""
    try:
        result = subprocess.run(
            ['python3', '-c', 'import opendataloader_pdf'],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except Exception:
        return False


def check_java() -> bool:
    """Check if Java 11+ is installed"""
    try:
        result = subprocess.run(
            ['java', '-version'],
            capture_output=True,
            text=True
        )
        # Java outputs version to stderr
        output = result.stderr or result.stdout
        if 'version' in output:
            # Extract version number
            import re
            version_match = re.search(r'version "?(\d+)', output)
            if version_match:
                version = int(version_match.group(1))
                return version >= 11
        return False
    except Exception:
        return False


def convert_pdf(
    input_path: str,
    output_dir: str,
    format: str = 'markdown',
    hybrid: bool = False,
    ocr: bool = False,
    lang: str = 'eng',
    port: int = 5002
) -> Dict:
    """
    Convert a single PDF file
    
    Args:
        input_path: Path to PDF file
        output_dir: Output directory
        output_format: 'markdown', 'json', 'html', or 'text'
        use_hybrid: Use hybrid mode for complex/scanned PDFs
        use_ocr: Enable OCR
        ocr_languages: Comma-separated OCR languages
        hybrid_port: Port for hybrid backend
    
    Returns:
        Dict with 'success', 'input', 'output', 'error' keys
    """
    input_path = Path(input_path)
    output_dir = Path(output_dir)
    
    if not input_path.exists():
        return {
            'success': False,
            'input': str(input_path),
            'output': None,
            'error': f'File not found: {input_path}'
        }
    
    # Generate output filename
    output_ext = {
        'markdown': 'md',
        'json': 'json',
        'html': 'html',
        'text': 'txt'
    }.get(format, 'md')
    
    output_file = output_dir / f"{input_path.stem}.{output_ext}"
    
    # Build command
    cmd = [
        'python3', '-c',
        f'''
import opendataloader_pdf
import os

os.makedirs("{output_dir}", exist_ok=True)

opendataloader_pdf.convert(
    input_path=["{input_path}"],
    output_dir="{output_dir}",
    format="{format}"
)
        '''
    ]
    
    # Add hybrid mode options
    if hybrid:
        hybrid_options = ',\n    hybrid_mode="full"' if ocr else ''
        cmd = [
            'python3', '-c',
            f'''
import opendataloader_pdf
import os

os.makedirs("{output_dir}", exist_ok=True)

opendataloader_pdf.convert(
    input_path=["{input_path}"],
    output_dir="{output_dir}",
    format="{format}",
    hybrid="docling-fast"{hybrid_options}
)
            '''
        ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode == 0:
            return {
                'success': True,
                'input': str(input_path),
                'output': str(output_file),
                'error': None
            }
        else:
            return {
                'success': False,
                'input': str(input_path),
                'output': None,
                'error': result.stderr or 'Unknown error'
            }
            
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'input': str(input_path),
            'output': None,
            'error': 'Conversion timeout (5 minutes)'
        }
    except Exception as e:
        return {
            'success': False,
            'input': str(input_path),
            'output': None,
            'error': str(e)
        }


def batch_convert(
    input_paths: List[str],
    output_dir: str,
    format: str = 'markdown',
    hybrid: bool = False,
    ocr: bool = False,
    lang: str = 'eng',
    port: int = 5002
) -> List[Dict]:
    """
    Convert multiple PDFs
    
    Args:
        input_paths: List of PDF files or directories
        output_dir: Output directory
        output_format: Output format
        use_hybrid: Use hybrid mode
        use_ocr: Enable OCR
        ocr_languages: OCR languages
        hybrid_port: Hybrid backend port
    
    Returns:
        List of result dicts
    """
    results = []
    
    # Expand directories to files
    all_files = []
    for path in input_paths:
        path_obj = Path(path)
        if path_obj.is_dir():
            all_files.extend(path_obj.glob('*.pdf'))
        else:
            all_files.append(path_obj)
    
    # Convert each file
    for pdf_file in all_files:
        result = convert_pdf(
            input_path=str(pdf_file),
            output_dir=output_dir,
            format=format,
            hybrid=hybrid,
            ocr=ocr,
            lang=lang,
            port=port
        )
        results.append(result)
    
    return results


def get_pdf_info(input_path: str) -> Dict:
    """
    Get information about a PDF (page count, structure, etc.)
    
    Args:
        input_path: Path to PDF file
    
    Returns:
        Dict with PDF metadata
    """
    try:
        cmd = [
            'python3', '-c',
            f'''
import opendataloader_pdf
import json

result = opendataloader_pdf.analyze("{input_path}")
print(json.dumps(result))
            '''
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return {'error': result.stderr}
            
    except Exception as e:
        return {'error': str(e)}


# Export main functions
__all__ = [
    'convert_pdf',
    'batch_convert',
    'get_pdf_info',
    'check_opendataloader',
    'check_java',
    'PDFConverterError'
]
