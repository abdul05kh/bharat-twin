-- Insert Hyderabad Metropolitan Region with bounding box (Lat: 17.10 to 17.65, Lon: 78.10 to 78.80)
INSERT INTO regions (name, bounding_box)
VALUES (
    'Hyderabad Metropolitan Region',
    ST_GeomFromText('POLYGON((78.10 17.10, 78.80 17.10, 78.80 17.65, 78.10 17.65, 78.10 17.10))', 4326)
)
ON CONFLICT (name) DO UPDATE 
SET bounding_box = EXCLUDED.bounding_box;
