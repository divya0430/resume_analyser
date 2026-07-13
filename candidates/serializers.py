from rest_framework import serializers
from .models import Candidate


class CandidateSerializer(serializers.ModelSerializer):
    """
    Exposes camelCase keys (matchedAll, stageAt, selectedAt) so the JSON this
    API returns/accepts is a drop-in match for the candidate objects the
    frontend already builds in buildCandidate() / renders in renderPool().
    """
    matchedAll = serializers.JSONField(source="matched_all", required=False, default=list)
    stageAt = serializers.DateTimeField(source="stage_at", required=False, allow_null=True)
    selectedAt = serializers.DateTimeField(source="selected_at", required=False, allow_null=True)

    skills = serializers.JSONField(required=False, default=list)
    gaps = serializers.JSONField(required=False, default=list)

    class Meta:
        model = Candidate
        fields = [
            "id", "name", "dept", "score", "verdict",
            "skills", "matchedAll", "gaps",
            "years", "edu",
            "position", "email", "phone", "source", "notes",
            "date", "stage", "stageAt", "selectedAt",
        ]
        read_only_fields = ["id", "date"]
