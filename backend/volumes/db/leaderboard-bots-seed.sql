-- Seed leaderboard bot players for voidborn (idempotent).
-- Requires: sites.sql, player-rankings.sql, pgcrypto extension.

create extension if not exists pgcrypto;

create or replace function public.seed_leaderboard_bots(p_site_id text default 'voidborn')
returns integer
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_instance_id uuid;
  v_count integer := 0;
  v_row record;
begin
  select id into v_instance_id from auth.instances limit 1;
  if v_instance_id is null then
    v_instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
  end if;

  for v_row in
    select * from (values
      ('2e425f77-92e2-4b1b-a252-5de74098a0e9'::uuid, 'u_n_d_e_r_s_c_o_r_e', 937, 8, 4, 12, 0),
      ('a1a24165-dafa-481f-ac81-2d41cee5a6a9'::uuid, 'Cyb3r_Pl4gu3', 978, 19, 11, 30, 3600),
      ('c4454fd4-cff7-4e3d-ac86-4b546f7753a6'::uuid, 'moth_milk', 1019, 30, 18, 48, 7200),
      ('ddb02612-23ee-4253-a564-9f3c381546b4'::uuid, 'B33f_St3w', 1060, 41, 25, 66, 10800),
      ('7eec8024-c5dc-4e73-a873-0a4a87fa091a'::uuid, 'v0id_spit', 1101, 52, 32, 84, 14400),
      ('ec8e58c6-5677-4e19-a53e-ff7343124b43'::uuid, 'retro_acid', 1142, 63, 39, 102, 18000),
      ('95b10a56-99bc-4d0e-a0ca-9f44bf23b919'::uuid, 'puddle.logic', 1183, 74, 46, 120, 21600),
      ('4bdd637a-9474-4a81-a4cc-2eac9aabe423'::uuid, 'N0_S1gn4l', 1224, 13, 5, 18, 25200),
      ('af8bdfc0-2616-4e2f-a4e1-1bada7b35f6e'::uuid, 'fizz_rot', 1265, 24, 12, 36, 28800),
      ('903467e3-5c17-48e7-a66c-3a55d41bd639'::uuid, 'gloom_juice', 1306, 35, 19, 54, 32400),
      ('309ecc81-1c32-4283-a28d-5f4bda7a6aa7'::uuid, 'static_fuzz', 1347, 46, 26, 72, 36000),
      ('ddc37913-70b6-45ce-a3cc-f3e5fb29ba40'::uuid, 'dust_bunny_x', 1388, 57, 33, 90, 39600),
      ('908b3843-d8ee-494e-ac2e-34b6ec59be13'::uuid, 'bone_broth_enthusiast', 1429, 68, 40, 108, 43200),
      ('2abd394f-a03d-43c1-afb4-7283aadbb046'::uuid, 'o_O_ghost', 1470, 79, 47, 126, 46800),
      ('3e49b1f9-f985-4cd8-aff7-68908de96fe5'::uuid, 'swamp_gas', 1511, 18, 6, 24, 50400),
      ('06894402-eb68-4568-a631-1d9f03be3ccf'::uuid, 'mildly_feral', 1552, 29, 13, 42, 54000),
      ('0f79751c-ed1c-4704-aa35-bfa05f8a086f'::uuid, 'p1xel_dust', 1593, 40, 20, 60, 57600),
      ('51c6ced5-8eaa-4068-a872-cdeceefb609e'::uuid, 'gorgon_zola', 1634, 51, 27, 78, 61200),
      ('43008fcd-9e57-40e4-a2f9-97d66a08e74b'::uuid, 'cryptid_nap', 1675, 62, 34, 96, 64800),
      ('e3521f63-72c9-427a-ae4d-cddcaef7db2c'::uuid, 'slime_mold', 1716, 73, 41, 114, 68400),
      ('7021503e-1e70-4aef-abec-c238c4981b70'::uuid, 'xX_Gobl1n_Mod3_Xx', 1757, 12, 48, 60, 72000),
      ('9d345b09-c0d0-4880-a1dd-b3a9bcfa6c7f'::uuid, 'neon_decay', 1798, 23, 7, 30, 75600),
      ('1fc686f5-20e5-439d-a2ba-d7c9e1aea893'::uuid, 'velvet_void', 1839, 34, 14, 48, 79200),
      ('a51cc6ac-82eb-4d63-a8e4-564972f017e1'::uuid, 'echo_location', 1880, 45, 21, 66, 82800),
      ('c477f0e5-8825-4290-a31e-cd090c0c6e5d'::uuid, 'wobble_bot', 1921, 56, 28, 84, 86400),
      ('234fcfc4-d691-4736-a96d-3d39b9335cbd'::uuid, 'sour_patch_soul', 1962, 67, 35, 102, 90000),
      ('2087344d-1691-4e18-a5ee-a20e12341004'::uuid, 'damp_cardboard', 923, 78, 42, 120, 93600),
      ('b2c46faa-df87-4bd1-aad8-fcfb957d5b42'::uuid, 'fermenting_rage', 964, 17, 49, 66, 97200),
      ('0175973d-def3-4824-a7bf-e06084c14914'::uuid, 'moss_boss', 1005, 28, 8, 36, 100800),
      ('9de4d41b-3d82-42d9-a006-312c4f808c42'::uuid, 'pixel_soup', 1046, 39, 15, 54, 104400),
      ('349626af-8684-43a8-a31f-25361f8908c9'::uuid, 'glitch_witch', 1087, 50, 22, 72, 108000),
      ('08d66233-b556-4bb7-a4eb-e6f245c6a2c2'::uuid, 'spectral_snack', 1128, 61, 29, 90, 111600),
      ('6fc7d087-16d5-438c-a19b-4cea304e529b'::uuid, 'lo_fi_ghoul', 1169, 72, 36, 108, 115200),
      ('e1ecef36-affe-498e-a5f3-394ebb6d938b'::uuid, 'dizzy_dinosaur', 1210, 11, 43, 54, 118800),
      ('460d58cf-14e3-40ea-afa8-a9926ddb2f41'::uuid, 'caffeine_gremlin', 1251, 22, 50, 72, 122400),
      ('48bb0f26-6687-4cae-a1ae-150a37d66b4d'::uuid, 'toaster_bath_vibe', 1292, 33, 9, 42, 126000),
      ('5e030127-70d7-4890-af91-9fe1485b14cd'::uuid, 'microwave_hum', 1333, 44, 16, 60, 129600),
      ('ae44abbe-849c-4735-a191-35484686eb6d'::uuid, 'static_cling', 1374, 55, 23, 78, 133200),
      ('7e0944b7-92a9-48c1-a417-8facc93ba749'::uuid, 'pocket_lint', 1415, 66, 30, 96, 136800),
      ('efe9a50e-29f2-48c8-a1e1-e965f5f69209'::uuid, 'dusty_attic', 1456, 77, 37, 114, 140400),
      ('407c01a4-d82a-4aca-a5ec-e4afde36b296'::uuid, '0_o', 1497, 16, 44, 60, 144000),
      ('9d952d91-2af9-47c0-a8a6-a9b85295aca1'::uuid, 'basement_dweller', 1538, 27, 51, 78, 147600),
      ('2c2c150b-51b0-4eab-a508-e642f882d937'::uuid, 'couch_potato_god', 1579, 38, 10, 48, 151200),
      ('595bc618-2406-43e7-a412-d6bd802bb53e'::uuid, 'couch_cushion_void', 1620, 49, 17, 66, 154800),
      ('11674d67-3137-4208-a637-20788720f790'::uuid, 'remote_control_lost', 1661, 60, 24, 84, 158400),
      ('949558d3-b846-4674-a69c-859e9b0c2125'::uuid, 'broken_zipper', 1702, 71, 31, 102, 162000),
      ('a44f0258-4bae-4d98-a82b-e79788d5992c'::uuid, 'sock_monster', 1743, 10, 38, 48, 165600),
      ('e76c5274-7320-430a-afbc-bc6e5198f71a'::uuid, 'dryer_lint', 1784, 21, 45, 66, 169200),
      ('74688a4e-f4da-4cfd-a611-5623be3141ac'::uuid, 'puddle_jumper', 1825, 32, 4, 36, 172800),
      ('c6bf4fa8-2098-44dd-a7b1-1ee6d4c8d07c'::uuid, 'rain_drop_race', 1866, 43, 11, 54, 176400),
      ('b3ec7779-1025-484f-a9a7-354b06c9f8d6'::uuid, '..void..', 1907, 54, 18, 72, 180000),
      ('eb650343-fa5d-4972-a8d9-19e3cb337743'::uuid, 'cloud_gazer', 1948, 65, 25, 90, 183600),
      ('9510ae99-d55b-4c65-a2e2-a57eff6d1995'::uuid, 'star_dust_collector', 1989, 76, 32, 108, 187200),
      ('1bf9f1e1-3174-438c-a837-792ff6537713'::uuid, 'moon_beam_rider', 950, 15, 39, 54, 190800),
      ('09b4ae6c-5ae3-49c2-a802-38b603fd6be9'::uuid, 'sun_burn_victim', 991, 26, 46, 72, 194400),
      ('f9aa003d-e472-4f72-a3a7-a5ada0b22503'::uuid, 'solar_flare_up', 1032, 37, 5, 42, 198000),
      ('a010bf84-4285-4b0f-a880-c92e81c2ebbd'::uuid, 'aurora_bore_alis', 1073, 48, 12, 60, 201600),
      ('c72f3bf4-a2e7-4e5c-aed8-c5ba80cb6e02'::uuid, 'cosmic_debris', 1114, 59, 19, 78, 205200),
      ('74bfe43f-43d9-424a-a202-48be0d1a1381'::uuid, 'space_junk_collector', 1155, 70, 26, 96, 208800),
      ('24ffd6e6-7e90-42d6-a5a9-e2aea72c0abb'::uuid, 'asteroid_belt_buckle', 1196, 9, 33, 42, 212400)
    ) as t(id, username, rating, wins, losses, games_played, updated_offset)
  loop
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) values (
      v_instance_id,
      v_row.id,
      'authenticated',
      'authenticated',
      'bot.' || replace(v_row.id::text, '-', '') || '+' || p_site_id || '@bots.voidborn.local',
      crypt(gen_random_uuid()::text, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('username', v_row.username, 'is_bot', true, 'site_id', p_site_id),
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    on conflict (id) do nothing;

    insert into public.profiles (id, site_id, username, updated_at)
    values (v_row.id, p_site_id, v_row.username, now())
    on conflict (id) do update set
      site_id = excluded.site_id,
      username = excluded.username,
      updated_at = now();

    insert into public.site_members (user_id, site_id)
    values (v_row.id, p_site_id)
    on conflict do nothing;

    insert into public.player_rankings (
      user_id, site_id, rating, wins, losses, games_played, created_at, updated_at
    ) values (
      v_row.id,
      p_site_id,
      v_row.rating,
      v_row.wins,
      v_row.losses,
      v_row.games_played,
      now() - (v_row.updated_offset || ' seconds')::interval,
      now() - (v_row.updated_offset || ' seconds')::interval
    )
    on conflict (user_id, site_id) do update set
      rating = excluded.rating,
      wins = excluded.wins,
      losses = excluded.losses,
      games_played = excluded.games_played,
      updated_at = excluded.updated_at;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

select public.seed_leaderboard_bots('voidborn');
