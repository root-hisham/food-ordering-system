-- seed.sql — local dev only. Test creds:
--   admin@foodcourt.test / Passw0rd!
--   owner.burger@foodcourt.test / Passw0rd!
--   owner.tea@foodcourt.test / Passw0rd!
--   customer1@foodcourt.test / Passw0rd!

insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@foodcourt.test', crypt('Passw0rd!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'owner.burger@foodcourt.test', crypt('Passw0rd!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'owner.tea@foodcourt.test', crypt('Passw0rd!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'customer1@foodcourt.test', crypt('Passw0rd!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');

insert into profiles (id, role, full_name, mobile_number) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Platform Admin', '9000000001'),
  ('00000000-0000-0000-0000-000000000002', 'stall_owner', 'Burger Point Owner', '9000000002'),
  ('00000000-0000-0000-0000-000000000003', 'stall_owner', 'Tea Corner Owner', '9000000003'),
  ('00000000-0000-0000-0000-000000000004', 'customer', 'Test Customer', '9000000004');

insert into admins (id) values ('00000000-0000-0000-0000-000000000001');
insert into customers (id) values ('00000000-0000-0000-0000-000000000004');

insert into stalls (id, name, description, category, status, created_by) values
  ('10000000-0000-0000-0000-000000000001', 'Burger Point', 'Juicy burgers and crispy fries', 'Fast Food', 'active', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Tea Corner', 'Chai, coffee and light snacks', 'Beverages', 'active', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Fresh Juice', 'Cold-pressed juices and shakes', 'Beverages', 'active', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004', 'Biryani House', 'Authentic biryanis and curries', 'Meals', 'active', '00000000-0000-0000-0000-000000000001');

insert into stall_owners (id, stall_id) values
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002');

insert into menu_categories (id, stall_id, name, sort_order) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Burgers', 1),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Sides', 2);

insert into menu_items (stall_id, category_id, name, description, price, is_veg, is_available) values
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Classic Veg Burger', 'Potato patty, lettuce, cheese', 89.00, true, true),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Chicken Burger', 'Grilled chicken patty, mayo', 129.00, false, true),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'French Fries', 'Crispy salted fries', 59.00, true, true);

insert into menu_categories (id, stall_id, name, sort_order) values
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Hot Beverages', 1),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Snacks', 2);

insert into menu_items (stall_id, category_id, name, description, price, is_veg, is_available) values
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Masala Chai', 'Spiced Indian tea', 20.00, true, true),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Filter Coffee', 'South Indian filter coffee', 25.00, true, true),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'Samosa', 'Crispy fried pastry with potato filling', 15.00, true, true);