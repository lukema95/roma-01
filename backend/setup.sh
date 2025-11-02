#!/bin/bash
# ROMA Trading Platform - Setup Script

set -e

echo "🚀 ROMA Trading Platform - Backend Setup"
echo "========================================"
echo ""

# Detect Python version
echo "🔍 Detecting Python version..."

PYTHON_CMD=""

# Try python3.13 first
if command -v python3.13 &> /dev/null; then
    PYTHON_VERSION=$(python3.13 --version | awk '{print $2}')
    if [[ $PYTHON_VERSION == 3.13.* ]]; then
        PYTHON_CMD="python3.13"
        echo "✅ Found Python 3.13: $PYTHON_VERSION"
    fi
fi

# Try python3.12
if [ -z "$PYTHON_CMD" ] && command -v python3.12 &> /dev/null; then
    PYTHON_VERSION=$(python3.12 --version | awk '{print $2}')
    if [[ $PYTHON_VERSION == 3.12.* ]]; then
        PYTHON_CMD="python3.12"
        echo "✅ Found Python 3.12: $PYTHON_VERSION"
    fi
fi

# Try default python3
if [ -z "$PYTHON_CMD" ] && command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    if [[ $PYTHON_VERSION == 3.12.* ]] || [[ $PYTHON_VERSION == 3.13.* ]]; then
        PYTHON_CMD="python3"
        echo "✅ Found Python: $PYTHON_VERSION"
    elif [[ $PYTHON_VERSION == 3.14.* ]]; then
        echo "❌ Python 3.14 detected, but DSPy doesn't support it yet!"
        echo "   Please install Python 3.13 or 3.12"
        echo ""
        echo "   brew install python@3.13"
        exit 1
    fi
fi

if [ -z "$PYTHON_CMD" ]; then
    echo "❌ Python 3.12 or 3.13 not found!"
    echo "   Please install Python 3.13:"
    echo ""
    echo "   brew install python@3.13"
    echo ""
    exit 1
fi

echo ""
echo "📦 Creating virtual environment..."
$PYTHON_CMD -m venv venv

echo "✅ Activating virtual environment..."
source venv/bin/activate

echo "⬆️  Upgrading pip..."
pip install --upgrade pip setuptools wheel

echo "📥 Installing dependencies (this may take a few minutes)..."
pip install -e .

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create .env file:"
echo "   cp .env.example .env"
echo ""
echo "2. Edit .env with your credentials:"
echo "   nano .env  # or use any editor"
echo ""
echo "3. Start the server:"
echo "   ./start.sh"
echo ""
echo "   Or manually:"
echo "   source venv/bin/activate"
echo "   python -m roma_trading.main"
echo ""

