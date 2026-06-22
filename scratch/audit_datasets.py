import os
import hashlib
import time
from datetime import datetime

files = [
    "raw_data/imd_rainfall_2024.nc",
    "raw_data/max_temp_2024.bin",
    "raw_data/min_temp_2024.bin",
    "raw_data/insat_lst_20240620.h5"
]

print("=== RAW DATASET AUDIT ===")
for fpath in files:
    if os.path.exists(fpath):
        size = os.path.getsize(fpath)
        
        # md5
        hasher = hashlib.md5()
        with open(fpath, 'rb') as f:
            buf = f.read(65536)
            while len(buf) > 0:
                hasher.update(buf)
                buf = f.read(65536)
        md5 = hasher.hexdigest()
        
        # timestamp
        c_time = os.path.getctime(fpath)
        c_time_str = datetime.fromtimestamp(c_time).strftime('%Y-%m-%d %H:%M:%S')
        
        print(f"File: {fpath}")
        print(f"  Size: {size} bytes")
        print(f"  MD5 Checksum: {md5}")
        print(f"  Created: {c_time_str}")
    else:
        print(f"File: {fpath} -> NOT FOUND")
