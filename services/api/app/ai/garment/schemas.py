"""
Pydantic output schemas for the garment analysis pipeline.
All fields that are unknown or low-confidence are nullable.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


class ColorResult(BaseModel):
    color_name: str
    hex: str
    rgb: list[int] = Field(..., min_length=3, max_length=3)
    percentage: float


class AttributeCandidate(BaseModel):
    label: str
    confidence: float


class AttributeGroup(BaseModel):
    predicted: str | None
    confidence: float | None
    top_candidates: list[AttributeCandidate]


class GarmentAttributes(BaseModel):
    fabric: AttributeGroup
    pattern: AttributeGroup
    subtype: AttributeGroup


class DetectedGarment(BaseModel):
    item_number: int
    category: str
    confidence: float
    # base64 data URI of the cleaned, deskewed crop — no file written to disk
    crop_base64: str | None = None
    colors: list[ColorResult]
    attributes: GarmentAttributes


class GarmentAnalysisResponse(BaseModel):
    image_width: int
    image_height: int
    total_garments: int
    garments: list[DetectedGarment]


class SavedWardrobeRow(BaseModel):
    id: str
    user_id: str
    name: str
    category: str
    confidence: float | None = None
    crop_base64: str | None = None
    colors: list[ColorResult] = Field(default_factory=list)
    attributes: dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class GarmentAnalyzeAndSaveResponse(BaseModel):
    analysis: GarmentAnalysisResponse
    saved_items: list[SavedWardrobeRow] = Field(default_factory=list)
    persisted: bool = False


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    error: ErrorDetail
