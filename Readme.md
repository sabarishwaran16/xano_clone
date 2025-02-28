
this is a function created for creating user schema and table

BEGIN
    -- Create a schema for the user
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', workspace_name);

    -- Create a sample table inside the workspace (e.g., tasks table)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT FALSE
        )', workspace_name);
END;

