# Fusion Integrity Report
**Status**: **PASS**

This report verifies that the BHARAT-TWIN platform has successfully fused the $0.25^\circ$ IMD rainfall coordinates and $1.0^\circ$ IMD temperature coordinates using Nearest-Neighbor Climate Cell Fusion.

---

## 1. Metrics for the Latest Available Date (2025-12-31)

| Metric | Count | Remarks |
| :--- | :---: | :--- |
| **Total Fused Climate Twin Cells** | 15 | Complete coordinate grid representing Hyderabad metropolitan area |
| **Cells with Rainfall != NULL** | 15 | VERIFIED — complete precipitation coverage |
| **Cells with Max Temperature != NULL** | 15 | VERIFIED — complete temperature coverage (fused) |
| **Cells with Min Temperature != NULL** | 15 | VERIFIED — complete temperature coverage (fused) |
| **Cells with All 3 Variables Present** | 15 | **FUSION SYNC PASS** (Zero missing fields due to spatial mismatch) |

---

## 2. 10 Sample Fused Cells (Date: 2025-11-05)
The following is a list of 10 sample grid cells showing co-located, non-zero values for precipitation and temperatures:

| Latitude | Longitude | Rainfall (mm) | Max Temperature (°C) | Min Temperature (°C) |
| :---: | :---: | :---: | :---: | :---: |
| 17.00°N | 78.00°E | 0.45 | 31.49 | 21.97 |
| 17.00°N | 78.25°E | 5.26 | 31.49 | 21.97 |
| 17.00°N | 78.50°E | 11.61 | 31.49 | 21.97 |
| 17.00°N | 78.75°E | 13.21 | 31.49 | 21.97 |
| 17.25°N | 78.00°E | 0.42 | 31.49 | 21.97 |
| 17.25°N | 78.25°E | 11.89 | 31.49 | 21.97 |
| 17.25°N | 78.50°E | 17.47 | 31.49 | 21.97 |
| 17.25°N | 78.75°E | 27.36 | 31.49 | 21.97 |
| 17.50°N | 78.25°E | 0.84 | 31.49 | 21.97 |
| 17.50°N | 78.75°E | 8.87 | 31.49 | 21.97 |

---
*Verification status checked automatically from live DB bounds. All tests PASSED.*
