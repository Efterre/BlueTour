DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    -- Tabloları Sil
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'bluetour') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS bluetour.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP; 

    -- View'leri Sil
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'bluetour') 
    LOOP 
        EXECUTE 'DROP VIEW IF EXISTS bluetour.' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP; 
END $$;
