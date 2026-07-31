#!/bin/bash
ANON_KEY=$(grep '^ANON_KEY=' ~/Desktop/constructor-mount/backend/.env | cut -d= -f2-)
SERVICE_ROLE_KEY=$(grep '^SERVICE_ROLE_KEY=' ~/Desktop/constructor-mount/backend/.env | cut -d= -f2-)
EMAIL=janesmith+wildreach@example.com
PASS=Idinahuj123

ID=curl -sS -X POST 'https://api.voidborn.fun/auth/v1/signup' \
  -H "apikey: $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"data\":{\"username\":\"tester\",\"display_email\":\"youralias@mailbox.com\",\"site_id\":\"wildreach\"}}"

