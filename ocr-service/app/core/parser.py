import re
from typing import List, Optional
from datetime import date, datetime
from dateutil import parser as dateparser

DATE_PATTERNS = [
    # DD/MM/YYYY or DD-MM-YYYY
    r"(?:0[1-9]|[12]\d|3[01])[-/.\s](?:0[1-9]|1[0-2])[-/.\s](?:20\d{2}|\d{2})",
    # MM/YYYY or MM-YYYY
    r"(?:0[1-9]|1[0-2])[-/.\s](?:20\d{2}|\d{2})",
    # YYYY-MM-DD
    r"(?:20\d{2})[-/.\s](?:0[1-9]|1[0-2])[-/.\s](?:0[1-9]|[12]\d|3[01])",
    # Mon YYYY or Month YYYY
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-/.\s]*\d{2,4}",
]

def parse_expiry_candidates(text: str) -> List[str]:
    """
    Extracts potential expiry dates from the text using regex.
    Prioritizes dates found near context keywords (EXP, USE BEFORE, BEST BEFORE).
    """
    if not text:
        return []
        
    text_lower = text.lower()
    
    # Context keywords that strongly indicate an expiry date
    context_keywords = [
        "exp", "expiry", "use before", "best before", "valid up to", "valid until"
    ]
    
    candidates: List[str] = []
    
    # 1. First, search for dates near context keywords
    for keyword in context_keywords:
        # Find keyword and look for dates within the next ~30 characters
        pattern_near = rf"{keyword}.{{0,30}}?(" + "|".join(DATE_PATTERNS) + r")"
        matches = re.findall(pattern_near, text_lower)
        candidates.extend(matches)
        
    # 2. If contextual dates are found, return those to avoid picking Mfg dates
    if candidates:
        return candidates
        
    # 3. Fallback: Search the entire text if no contextual clues were found
    for pattern in DATE_PATTERNS:
        candidates.extend(re.findall(pattern, text_lower))
        
    return candidates

def normalize_date(date_str: str) -> Optional[date]:
    """
    Normalizes a detected date string into a standard datetime.date object.
    Defaults to the 1st of the month if day is missing.
    """
    try:
        dt = dateparser.parse(date_str, fuzzy=True, dayfirst=True, default=datetime(2000, 1, 1))
        return date(dt.year, dt.month, dt.day)
    except Exception:
        return None

def extract_batch_code(text: str) -> Optional[str]:
    """
    Extracts the batch code using common identifiers.
    """
    if not text:
        return None
        
    pattern = r"(?:batch(?:\s*number|\s*no\.?)?|lot|b\.?no\.?)[:#\s]*([A-Za-z0-9\-_\/]{3,24})"
    match = re.search(pattern, text, flags=re.IGNORECASE)
    
    if match:
        return match.group(1).strip()
    return None

def extract_medicine_name(text: str) -> Optional[str]:
    """
    Identifies the medicine name using heuristics (capitalized words before dosage).
    """
    if not text:
        return None
        
    patterns = [
        r"([A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]*)*)\s+(?:\d+\s*(?:mg|ml|g))",
        r"([A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]*)*)\s+(?:Tablets|Capsules|Syrup|Injection)"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
            
    return None
