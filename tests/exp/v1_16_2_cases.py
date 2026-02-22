# tests/exp/v1_16_2_cases.py
# This script contains patterns that previously caused false positives in the Python linter.

def test_lazy_import_closure():
    """Case 1: Lazy import inside a function used by a nested function (closure)."""
    import math
    
    def calculate_circle_area(radius):
        # This used to be 'deny'ed because 'math' wasn't passed to the inner scope's initial set.
        return math.pi * (radius ** 2)
    
    print(f"Area: {calculate_circle_area(5)}")

def test_try_except_import():
    """Case 2: Import inside an except block used in a subsequent function."""
    try:
        import non_existent_module as my_mod
    except ImportError:
        import os as my_mod # Fallback import
    
    def get_current_dir():
        # This used to be 'deny'ed because 'my_mod' inside 'except' was skipped in Pass 1.
        return my_mod.getcwd()

    print(f"Current Dir: {get_current_dir()}")

def test_default_args(val=10):
    """Case 3: Function with default arguments and annotations."""
    # Annotations and defaults are now checked in the outer scope.
    print(f"Value: {val}")

if __name__ == "__main__":
    test_lazy_import_closure()
    test_try_except_import()
    test_default_args()
