-- Add unique constraint to domain column
ALTER TABLE faq_sites ADD CONSTRAINT unique_domain UNIQUE (domain);

-- Add simple check constraint for valid domain format
ALTER TABLE faq_sites ADD CONSTRAINT valid_domain_format 
  CHECK (
    domain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' AND
    length(domain) <= 63
  );