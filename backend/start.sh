#!/bin/bash
# ROMA Trading Platform - Quick Start Script

set -e

echo "🚀 Starting ROMA Trading Platform Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run setup first:"
    echo ""
    echo "  python3.13 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -e ."
    echo ""
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file from .env.example and configure it."
    echo ""
    exit 1
fi

# Activate virtual environment and start
echo "✅ Activating virtual environment..."
source venv/bin/activate

echo "✅ Starting backend server..."
echo ""
python -m roma_trading.main

