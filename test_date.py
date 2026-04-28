from dateutil import parser as dateparser
from datetime import datetime
print(dateparser.parse("05/26", fuzzy=True, dayfirst=True))
print(dateparser.parse("05/26", fuzzy=True, dayfirst=True, default=datetime(2000, 1, 1)))
