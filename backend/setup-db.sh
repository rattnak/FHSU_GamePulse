#!/bin/bash
# Database setup script for FHSU GamePulse

echo "🗄️  Setting up PostgreSQL database..."

# Create database
psql postgres -c "CREATE DATABASE fhsu_gamepulse;"

# Create user (optional - use if you want separate user)
# psql postgres -c "CREATE USER fhsu_user WITH PASSWORD 'your_password';"
# psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE fhsu_gamepulse TO fhsu_user;"

echo "✅ Database created: fhsu_gamepulse"
echo ""
echo "📝 Your DATABASE_URL should be:"
echo "postgresql://$(whoami)@localhost:5432/fhsu_gamepulse"
