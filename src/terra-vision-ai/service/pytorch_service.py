import torch


def get_device() -> str:
    return "cuda" if torch.cuda.is_available() else "cpu"

def get_device_name() -> str:
    return torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu"