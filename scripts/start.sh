#!/bin/bash
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Wait for database
wait_for_db() {
    log "Waiting for database to be ready..."
    max_retries=30
    counter=0
    
    until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
        counter=$((counter + 1))
        if [ $counter -gt $max_retries ]; then
            log "ERROR: Failed to connect to database after $max_retries attempts"
            exit 1
        fi
        log "Waiting for database (attempt $counter/$max_retries)..."
        sleep 2
    done
    log "Database is ready!"
}

# Wait for Redis
wait_for_redis() {
    log "Waiting for Redis to be ready..."
    max_retries=30
    counter=0
    
    until redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+-a $REDIS_PASSWORD} ping > /dev/null 2>&1; do
        counter=$((counter + 1))
        if [ $counter -gt $max_retries ]; then
            log "ERROR: Failed to connect to Redis after $max_retries attempts"
            exit 1
        fi
        log "Waiting for Redis (attempt $counter/$max_retries)..."
        sleep 2
    done
    log "Redis is ready!"
}

# Create necessary directories
create_dirs() {
    log "Creating necessary directories..."
    mkdir -p logs backups uploads
    chmod 770 logs backups uploads
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    alembic upgrade head
}

# Initialize application
init_app() {
    log "Initializing application..."
    create_dirs
    wait_for_db
    wait_for_redis
    run_migrations
}

# Start application
start_app() {
    log "Starting VITALIt Healthcare System..."
    exec "$@"
}

# Main execution
init_app
start_app "$@"
