import sqlite3

DB_PATH = "backend/bharat_twin.db"

def check():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 1. Total counts
    c.execute("select count(*), max(observation_date) from climate_observations")
    obs_count, max_obs_date = c.fetchone()
    print("Total observations:", obs_count)
    print("Max observation date:", max_obs_date)
    
    # 2. Source distribution on max date
    c.execute("select source, count(*) from climate_observations where observation_date = ? group by source", (max_obs_date,))
    print(f"Sources on {max_obs_date}:", c.fetchall())
    
    # 3. Check for 2024-06-20 (LST date)
    c.execute("select source, count(*) from climate_observations where observation_date = '2024-06-20' group by source")
    print("Sources on 2024-06-20:", c.fetchall())
    
    # 4. Check regions
    c.execute("select id, name from regions")
    print("Regions:", c.fetchall())
    
    conn.close()

if __name__ == "__main__":
    check()
