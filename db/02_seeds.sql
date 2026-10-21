INSERT INTO passengers (first_name, last_name, guardian_name, guardian_phone, address, location) VALUES
('Martín', 'Silva', 'Camila Soto', '+56911223344', 'Calle 1 #100', ST_SetSRID(ST_MakePoint(-73.0500, -36.8200), 4326)),
('Sofía', 'Pérez', 'Rodrigo Pérez', '+56922334455', 'Av. Central #450', ST_SetSRID(ST_MakePoint(-73.0550, -36.8250), 4326)),
('Lucas', 'González', 'Andrea Muñoz', '+56933445566', 'Pasaje Los Robles #12', ST_SetSRID(ST_MakePoint(-73.0600, -36.8180), 4326));

INSERT INTO vehicles (plate_number, capacity, status) VALUES
('ABCD-12', 15, 'available');