alter table public.institution_settings
  add column if not exists cor_fundo text not null default '#f8fafc',
  add column if not exists cor_texto text not null default '#243247',
  add column if not exists cor_paginas text not null default '#ffffff';