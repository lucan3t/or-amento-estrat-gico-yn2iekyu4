-- Update department names to simplified versions based on codes
UPDATE public.budget_entries SET department = 'Gabinete' WHERE department LIKE '02000%';
UPDATE public.budget_entries SET department = 'Gestão Pública' WHERE department LIKE '03000%';
UPDATE public.budget_entries SET department = 'Fazenda' WHERE department LIKE '04000%';
UPDATE public.budget_entries SET department = 'Assistência Social' WHERE department LIKE '05000%';
UPDATE public.budget_entries SET department = 'Educação' WHERE department LIKE '06000%';
UPDATE public.budget_entries SET department = 'Saúde' WHERE department LIKE '07000%';
UPDATE public.budget_entries SET department = 'Desenvolvimento Urbano' WHERE department LIKE '08000%';
UPDATE public.budget_entries SET department = 'Desenvolvimento Rural' WHERE department LIKE '09000%';
UPDATE public.budget_entries SET department = 'Cultura e Lazer' WHERE department LIKE '10000%';
UPDATE public.budget_entries SET department = 'Desenvolvimento Econômico' WHERE department LIKE '11000%';
UPDATE public.budget_entries SET department = 'Serviços Públicos' WHERE department LIKE '12000%';
UPDATE public.budget_entries SET department = 'Infraestrutura' WHERE department LIKE '13000%';
UPDATE public.budget_entries SET department = 'Defesa Social' WHERE department LIKE '14000%';
UPDATE public.budget_entries SET department = 'Planejamento' WHERE department LIKE '15000%';
UPDATE public.budget_entries SET department = 'Esporte' WHERE department LIKE '16000%';
UPDATE public.budget_entries SET department = 'Políticas para Mulher' WHERE department LIKE '17000%';
UPDATE public.budget_entries SET department = 'Iluminação Pública' WHERE department LIKE '18000%';
UPDATE public.budget_entries SET department = 'SMTT' WHERE department LIKE '20000%';
UPDATE public.budget_entries SET department = 'Previdência' WHERE department LIKE '21000%';

-- Update specific full names mappings if they exist directly
UPDATE public.budget_entries SET department = 'Educação' WHERE department = 'SECRETARIA MUNICIPAL DE EDUCAÇÃO';
UPDATE public.budget_entries SET department = 'Saúde' WHERE department = 'SECRETARIA MUNICIPAL DE SAÚDE';
UPDATE public.budget_entries SET department = 'Infraestrutura' WHERE department = 'SECRETARIA MUNICIPAL DE INFRAESTRUTURA';
UPDATE public.budget_entries SET department = 'Finanças' WHERE department = 'SECRETARIA MUNICIPAL DE FINANÇAS'; -- Mapping Finanças specifically
UPDATE public.budget_entries SET department = 'FMS' WHERE department = 'FUNDO MUNICIPAL DE SAÚDE';
UPDATE public.budget_entries SET department = 'FME' WHERE department = 'FUNDO MUNICIPAL DE EDUCAÇÃO';
UPDATE public.budget_entries SET department = 'Assistência Social' WHERE department = 'SECRETARIA MUNICIPAL DE ASSISTÊNCIA SOCIAL';
UPDATE public.budget_entries SET department = 'Gabinete' WHERE department = 'GABINETE DO PREFEITO';
UPDATE public.budget_entries SET department = 'Procuradoria' WHERE department = 'PROCURADORIA GERAL DO MUNICÍPIO';
UPDATE public.budget_entries SET department = 'Controladoria' WHERE department = 'CONTROLADORIA GERAL DO MUNICÍPIO';
