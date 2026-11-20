import re
from datetime import datetime, timezone
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator

SAFE_HREF = re.compile(r"^(#|/|https?://|mailto:|tel:)", re.IGNORECASE)


def check_href(v: str) -> str:
    v = (v or "").strip()
    if v and not SAFE_HREF.match(v):
        raise ValueError("Link must start with https://, #, /, mailto: or tel:")
    return v


class FooterLink(BaseModel):
    label: str = Field(min_length=1, max_length=40)
    href: str = Field(max_length=300)

    @field_validator("href")
    @classmethod
    def safe_href(cls, v):
        return check_href(v)


class FooterSocial(BaseModel):
    platform: Literal["facebook", "instagram", "linkedin", "youtube", "twitter", "tiktok"]
    url: str = Field(max_length=300)

    @field_validator("url")
    @classmethod
    def safe_url(cls, v):
        return check_href(v)


class FooterSettings(BaseModel):
    logo_text: str = Field(max_length=4)
    brand_name: str = Field(min_length=1, max_length=60)
    description: str = Field(max_length=400)
    quick_links_title: str = Field(max_length=40)
    quick_links: List[FooterLink] = Field(max_length=10)
    contact_title: str = Field(max_length=40)
    whatsapp_message: str = Field(max_length=300)
    email: str = Field(max_length=120)
    phone_number: str = Field(max_length=20)
    phone_display: str = Field(max_length=30)
    address: str = Field(max_length=200)
    social_title: str = Field(max_length=40)
    socials: List[FooterSocial] = Field(max_length=6)
    cta_label: str = Field(max_length=40)
    copyright_text: str = Field(max_length=120)
    bottom_links: List[FooterLink] = Field(max_length=6)
    show_admin_link: bool = True
    updated_at: Optional[str] = None

    @field_validator("phone_number")
    @classmethod
    def digits_only(cls, v):
        return re.sub(r"\D", "", v or "")

    @field_validator("email")
    @classmethod
    def valid_email(cls, v):
        v = (v or "").strip()
        if v and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", v):
            raise ValueError("Enter a valid email or leave it empty")
        return v

    @field_validator("socials")
    @classmethod
    def unique_platforms(cls, v):
        if len({s.platform for s in v}) != len(v):
            raise ValueError("Each social platform can be added only once")
        return v


class GeneralSettings(BaseModel):
    whatsapp_number: str = Field(max_length=20)
    whatsapp_display: str = Field(max_length=30)
    updated_at: Optional[str] = None

    @field_validator("whatsapp_number")
    @classmethod
    def valid_number(cls, v):
        digits = re.sub(r"\D", "", v or "")
        if not 10 <= len(digits) <= 15:
            raise ValueError("WhatsApp number must have 10-15 digits incl. country code, e.g. 923184214075")
        return digits


class HeaderSettings(BaseModel):
    promo_enabled: bool = True
    promo_text: str = Field(max_length=120)
    header_button_label: str = Field(max_length=30)
    header_whatsapp_message: str = Field(max_length=300)
    hero_eyebrow: str = Field(max_length=60)
    hero_title_before: str = Field(max_length=60)
    hero_title_highlight: str = Field(max_length=60)
    hero_title_after: str = Field(max_length=60)
    hero_subtitle: str = Field(max_length=300)
    hero_primary_label: str = Field(min_length=1, max_length=40)
    hero_primary_message: str = Field(max_length=300)
    hero_secondary_label: str = Field(max_length=40)
    hero_secondary_href: str = Field(max_length=300)
    hero_trust_title: str = Field(max_length=40)
    hero_trust_subtitle: str = Field(max_length=60)
    hero_chips: List[str] = Field(max_length=4)
    updated_at: Optional[str] = None

    @field_validator("hero_secondary_href")
    @classmethod
    def safe_href(cls, v):
        return check_href(v)

    @field_validator("hero_chips")
    @classmethod
    def clean_chips(cls, v):
        chips = [c.strip() for c in v if c and c.strip()]
        if any(len(c) > 40 for c in chips):
            raise ValueError("Each trust chip can be max 40 characters")
        return chips


SECTIONS = {"general": GeneralSettings, "header": HeaderSettings, "footer": FooterSettings}


def build_settings_router(db, auth_dep) -> APIRouter:
    router = APIRouter()

    async def read(section: str) -> dict:
        doc = await db.site_settings.find_one({"key": section}, {"_id": 0, "key": 0})
        return doc or {}

    # Public: saved site content (empty section = frontend defaults)
    @router.get("/settings")
    async def get_all():
        return {name: await read(name) for name in SECTIONS}

    @router.get("/settings/{section}")
    async def get_section(section: Literal["general", "header", "footer"]):
        return await read(section)

    def add_save_route(section: str, model):
        async def save(data: model):
            doc = {**data.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}
            # Replace the whole section so fields removed from the model don't linger
            await db.site_settings.replace_one({"key": section}, {"key": section, **doc}, upsert=True)
            return doc

        router.add_api_route(f"/admin/settings/{section}", save, methods=["PUT"], dependencies=[Depends(auth_dep)])

    for name, model in SECTIONS.items():
        add_save_route(name, model)

    return router
