-- Run this in Supabase SQL Editor

create table medicines (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  dose text,
  perday int default 1,
  unit text default 'tablets',
  stock int default 60,
  set_date date default current_date,
  created_at timestamp default now()
);

-- Insert default transplant medicines
insert into medicines (name, dose, perday, unit, stock, set_date) values
  ('Tacrolimus',    '0.5 mg', 2, 'capsules', 60, current_date),
  ('Mycophenolate', '500 mg', 2, 'tablets',  60, current_date),
  ('Prednisolone',  '5 mg',   1, 'tablets',  60, current_date),
  ('Aspirin',       '75 mg',  1, 'tablets',  60, current_date),
  ('Pantoprazole',  '40 mg',  1, 'tablets',  60, current_date);
