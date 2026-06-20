"""Formatting utilities for the application."""


def format_duration(minutes: int) -> str:
    """Format duration in minutes into a readable string."""
    if minutes >= 60:
        h = minutes // 60
        m = minutes % 60
        return f"{h}h {m}m" if m else f"{h}h"
    return f"{minutes} min"


def format_event_distance(mode: str, distance_km: float) -> str:
    """Format the distance or amount based on the activity mode."""
    is_transit = mode in ["Walk", "Bike", "Transit", "Carpool", "Car", "Flight"]

    if is_transit:
        return f"{distance_km} km"
    elif mode in ["Vegan", "Vegetarian", "Pescatarian", "Meat"]:
        return f"{int(distance_km)} meals"
    elif mode in ["Electricity", "Heating"]:
        return f"{distance_km} kWh"
    elif mode in ["Clothing", "Electronics"]:
        return f"{int(distance_km)} items"
    else:
        return f"{distance_km}"
