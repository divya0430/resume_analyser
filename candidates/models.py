from django.db import models


class Candidate(models.Model):
    """
    Mirrors the candidate object the frontend (js/app.js) builds in
    buildCandidate() and used to store in localStorage under 'aarti_talentforge_v2'.
    Field names below are snake_case (Django convention); the API layer
    (serializers.py) exposes them to the frontend using the exact
    camelCase keys the JS already expects (matchedAll, stageAt, selectedAt),
    so nothing in the UI/rendering code has to change.
    """

    STAGE_CHOICES = [
        ("New", "New"),
        ("Shortlisted", "Shortlisted"),
        ("Interview", "Interview"),
        ("Selected", "Selected"),
        ("Rejected", "Rejected"),
    ]

    # --- identity / scan result ---------------------------------------------
    name = models.CharField(max_length=200)
    dept = models.CharField(max_length=50)  # key into the JS DEPARTMENTS map
    score = models.PositiveSmallIntegerField(default=0)
    verdict = models.CharField(max_length=50, blank=True, default="")

    skills = models.JSONField(default=list, blank=True)        # top 4 matched skills (chips)
    matched_all = models.JSONField(default=list, blank=True)   # up to 20 matched skills
    gaps = models.JSONField(default=list, blank=True)          # up to 10 missing skills

    years = models.FloatField(default=0)
    edu = models.CharField(max_length=100, blank=True, default="")

    # --- HR-entered fields ---------------------------------------------------
    position = models.CharField(max_length=150, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    source = models.CharField(max_length=50, blank=True, default="Other")
    notes = models.TextField(blank=True, default="")

    # --- pipeline --------------------------------------------------------------
    date = models.DateTimeField(auto_now_add=True)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default="New")
    stage_at = models.DateTimeField(null=True, blank=True)
    selected_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-score"]

    def __str__(self):
        return f"{self.name} ({self.dept}, {self.score})"
