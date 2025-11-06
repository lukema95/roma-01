"""Trading toolkits for different DEXs and technical analysis."""

from .base_dex import BaseDEXToolkit
from .aster_toolkit import AsterToolkit
from .technical_analysis import TechnicalAnalysisToolkit

try:
    from .hyperliquid_toolkit import HyperliquidToolkit
    __all__ = ["BaseDEXToolkit", "AsterToolkit", "HyperliquidToolkit", "TechnicalAnalysisToolkit"]
except ImportError:
    __all__ = ["BaseDEXToolkit", "AsterToolkit", "TechnicalAnalysisToolkit"]

