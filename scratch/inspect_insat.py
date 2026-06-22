import h5py
import os

h5_path = "raw_data/insat_lst_20240620.h5"
if os.path.exists(h5_path):
    print(f"Inspecting: {h5_path}")
    print(f"Size: {os.path.getsize(h5_path)} bytes")
    try:
        with h5py.File(h5_path, 'r') as f:
            print("Keys (top level):", list(f.keys()))
            for key in f.keys():
                dset = f[key]
                print(f"Dataset Name: {key}")
                print(f"  Shape: {dset.shape}")
                print(f"  Dtype: {dset.dtype}")
                print("  Attributes:")
                for attr_key, attr_val in dset.attrs.items():
                    print(f"    {attr_key}: {attr_val}")
    except Exception as e:
        print(f"Error reading file: {e}")
else:
    print("File does not exist.")
