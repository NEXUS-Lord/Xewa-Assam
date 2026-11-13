-- Expand the location picker from Tezpur and Nagaon to all Assam districts.
-- Keep id 1 in place so listings already attached to Tezpur remain available
-- under Sonitpur district without changing their foreign keys.
update public.cities
set name = 'Sonitpur'
where id = 1 and name = 'Tezpur';

insert into public.cities (id, name) values
  (3, 'Baksa'),
  (4, 'Barpeta'),
  (5, 'Bajali'),
  (6, 'Biswanath'),
  (7, 'Bongaigaon'),
  (8, 'Cachar'),
  (9, 'Charaideo'),
  (10, 'Chirang'),
  (11, 'Darrang'),
  (12, 'Dhemaji'),
  (13, 'Dhubri'),
  (14, 'Dibrugarh'),
  (15, 'Dima Hasao'),
  (16, 'Goalpara'),
  (17, 'Golaghat'),
  (18, 'Hailakandi'),
  (19, 'Hojai'),
  (20, 'Jorhat'),
  (21, 'Kamrup'),
  (22, 'Kamrup Metropolitan'),
  (23, 'Karbi Anglong'),
  (24, 'Karimganj'),
  (25, 'Kokrajhar'),
  (26, 'Lakhimpur'),
  (27, 'Majuli'),
  (28, 'Morigaon'),
  (29, 'Nalbari'),
  (30, 'Sivasagar'),
  (31, 'South Salmara-Mancachar'),
  (32, 'Tinsukia'),
  (33, 'Tamulpur'),
  (34, 'Udalguri'),
  (35, 'West Karbi Anglong')
on conflict (id) do update set name = excluded.name;

select setval(
  pg_get_serial_sequence('public.cities', 'id'),
  greatest((select coalesce(max(id), 1) from public.cities), 35)
);
