# CX Intelligence — Security and Privacy Architecture

## 1. Data Protection & Privacy Principles
1. **PII Masking Before External Transmission**: Customer feedback comments often contain personal names, email addresses, phone numbers, and account numbers. All open-text feedback undergoes automated regex and entity scrubbing (e.g. `[EMAIL]`, `[PHONE]`, `[NAME]`) before sending to any LLM service.
2. **Deterministic Data Retention & Complete Purge**: When a user triggers dataset deletion, all corresponding survey responses, validation issues, comment sentiments, theme linkages, insights, and cached exports are deleted via relational cascade.
3. **No Public Storage**: Survey files and raw customer records are kept in private server-side storage or database records, never placed in public buckets.
4. **Formula Injection Defense**: All exported CSV files escape cells starting with `=`, `+`, `-`, or `@` with a leading single quote `'` to prevent command execution in spreadsheet applications (Excel, LibreOffice).
5. **Safe Error Handling**: Internal stack traces and database credentials are never revealed to client API consumers.
