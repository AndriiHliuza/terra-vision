from enum import Enum

import numpy as np
from dataclasses import dataclass

from pydantic import BaseModel


@dataclass
class File:
    filename: str
    bytes: bytes


@dataclass()
class NumpyImage:
    filename: str
    array: np.ndarray


class ImageType(str, Enum):
    ORIGINAL = "original"
    PROCESSED = "processed"


class ArchiveDetails(BaseModel):
    archive_name: str
    image_count: int

