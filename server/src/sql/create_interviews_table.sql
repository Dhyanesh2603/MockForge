CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,

    user_id VARCHAR(255) NOT NULL,

    role VARCHAR(255) NOT NULL,

    tech_stack TEXT NOT NULL,

    difficulty VARCHAR(50) NOT NULL,

    status VARCHAR(50) DEFAULT 'started',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);