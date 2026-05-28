CREATE TABLE IF NOT EXISTS interview_questions (
    id SERIAL PRIMARY KEY,

    interview_id INTEGER NOT NULL,

    question_text TEXT NOT NULL,

    question_order INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_interview
        FOREIGN KEY(interview_id)
        REFERENCES interviews(id)
        ON DELETE CASCADE
);