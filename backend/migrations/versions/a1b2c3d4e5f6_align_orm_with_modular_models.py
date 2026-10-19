"""Align ORM schema with modular models

Revision ID: a1b2c3d4e5f6
Revises: d8c4a145fc2c
Create Date: 2026-10-19 02:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "d8c4a145fc2c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("hashed_password", sa.String(), nullable=True))
    op.add_column("users", sa.Column("full_name", sa.String(), nullable=True))
    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.true()))
    op.add_column(
        "users", sa.Column("is_verified", sa.Boolean(), nullable=True, server_default=sa.false())
    )

    op.add_column("videos", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("videos", sa.Column("thumbnail_path", sa.String(), nullable=True))
    op.add_column("videos", sa.Column("duration", sa.String(), nullable=True))

    op.create_table(
        "annotations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("video_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("timestamp", sa.Float(), nullable=False),
        sa.Column("annotation_type", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("annotation_metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["video_id"], ["videos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_annotations_id"), "annotations", ["id"], unique=False)

    op.create_table(
        "analysis_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("video_id", sa.Integer(), nullable=False),
        sa.Column(
            "analysis_type",
            sa.Enum(
                "INSTRUMENT_DETECTION",
                "STEP_RECOGNITION",
                "SKILL_ASSESSMENT",
                "COMPLICATION_DETECTION",
                name="analysistype",
            ),
            nullable=False,
        ),
        sa.Column("start_time", sa.Float(), nullable=False),
        sa.Column("end_time", sa.Float(), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("results", sa.JSON(), nullable=False),
        sa.Column("analysis_metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["video_id"], ["videos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_analysis_results_id"), "analysis_results", ["id"], unique=False)

    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("annotation_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["annotation_id"], ["annotations.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_comments_id"), "comments", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_comments_id"), table_name="comments")
    op.drop_table("comments")
    op.drop_index(op.f("ix_analysis_results_id"), table_name="analysis_results")
    op.drop_table("analysis_results")
    op.drop_index(op.f("ix_annotations_id"), table_name="annotations")
    op.drop_table("annotations")

    op.drop_column("videos", "duration")
    op.drop_column("videos", "thumbnail_path")
    op.drop_column("videos", "description")

    op.drop_column("users", "is_verified")
    op.drop_column("users", "is_active")
    op.drop_column("users", "full_name")
    op.drop_column("users", "hashed_password")

    sa.Enum(name="analysistype").drop(op.get_bind(), checkfirst=True)
