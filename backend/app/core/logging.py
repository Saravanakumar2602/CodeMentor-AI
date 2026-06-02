import logging.config
import sys
from typing import Dict, Any

def setup_logging(log_level: str = "INFO") -> None:
    """
    Configures python standard logging with formatted console output.
    """
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": log_level,
                "formatter": "standard",
                "stream": sys.stdout,
            },
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console"],
                "level": log_level,
                "propagate": True,
            },
            "uvicorn": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.error": {
                "level": "INFO",
                "propagate": True,
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }
    
    logging.config.dictConfig(logging_config)
    logging.getLogger(__name__).info("Structured logging has been configured successfully.")
