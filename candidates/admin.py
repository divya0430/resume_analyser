from django.contrib import admin
from .models import Candidate


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ("name", "dept", "score", "stage", "email", "date")
    list_filter = ("dept", "stage", "source")
    search_fields = ("name", "email", "phone")
    ordering = ("-score",)
