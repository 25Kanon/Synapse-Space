from .automoderator import AutoModerator

def get_automoderator():
    """
    Retrieves or initializes a cached instance of AutoModerator.
    """
    global _automoderator_instance
    if '_automoderator_instance' not in globals():
        _automoderator_instance = AutoModerator()
    return _automoderator_instance
