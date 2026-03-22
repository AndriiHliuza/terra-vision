from dataclasses import dataclass
from ultralytics.engine.results import Results

from schema.file_schemas import File


@dataclass
class ArchiveProcessingResult:
    archive_name: str
    images: list[File]
    results: list[Results]


@dataclass
class AnnotatedArchive:
    archive_name: str
    images: list[File]
