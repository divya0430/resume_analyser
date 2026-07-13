import csv

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Candidate
from .serializers import CandidateSerializer


def _find_duplicate(email):
    email = (email or "").strip().lower()
    if not email:
        return None
    return Candidate.objects.filter(email__iexact=email).first()


class CandidateViewSet(viewsets.ModelViewSet):
    """
    /api/candidates/            GET (list, filterable) / POST (create)
    /api/candidates/<id>/       GET / PATCH / PUT / DELETE
    /api/candidates/bulk/       POST  -> add many at once (Bulk Scan tab)
    /api/candidates/clear/      DELETE -> wipe the whole pool
    /api/candidates/export_csv/ GET   -> CSV download (server-side mirror of exportCSV())
    """
    queryset = Candidate.objects.all().order_by("-score")
    serializer_class = CandidateSerializer

    # ---- optional server-side filtering (dept / minScore / stage / q) ----
    # The frontend currently filters client-side over the full list it
    # already holds in memory, so this is not required for the UI to work,
    # but it's here if you want the pool to filter server-side instead.
    def get_queryset(self):
        qs = super().get_queryset()
        dept = self.request.query_params.get("dept")
        min_score = self.request.query_params.get("minScore")
        stage = self.request.query_params.get("stage")
        q = self.request.query_params.get("q")
        if dept:
            qs = qs.filter(dept=dept)
        if min_score:
            qs = qs.filter(score__gte=int(min_score))
        if stage:
            qs = qs.filter(stage=stage)
        if q:
            qs = qs.filter(name__icontains=q)
        return qs

    def create(self, request, *args, **kwargs):
        """
        Mirrors the frontend's duplicate-by-email flow:
        addCandidate() returns 'duplicate' and the UI asks the user to
        confirm before adding anyway. Here: first POST without `force`
        returns 409 + the existing record if the email already exists;
        resend with `force: true` to save anyway (same as clicking
        "Add anyway" in the confirm() dialog).
        """
        data = request.data
        dup = _find_duplicate(data.get("email"))
        if dup and not data.get("force"):
            return Response(
                {"duplicate": True, "existing": CandidateSerializer(dup).data},
                status=status.HTTP_409_CONFLICT,
            )
        return super().create(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Used by the Pool's stage <select> (data-act="stage"). When stage
        changes we stamp stageAt, and selectedAt the first time it hits
        'Selected' -- same as the JS change handler on #poolBody used to do
        against localStorage.
        """
        instance = self.get_object()
        data = request.data.copy()
        if "stage" in data and data["stage"] != instance.stage:
            now = timezone.now()
            data.setdefault("stageAt", now.isoformat())
            if data["stage"] == "Selected" and not instance.selected_at:
                data.setdefault("selectedAt", now.isoformat())
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """
        Body: {"candidates": [ {...}, {...}, ... ]}
        Mirrors the Bulk Scan tab's #bulkAddAll handler: silently skips
        any candidate whose email already exists (in DB or earlier in this
        same batch) instead of erroring the whole request out.
        """
        items = request.data.get("candidates", [])
        seen_emails = set()
        added, skipped = [], 0

        for item in items:
            email = (item.get("email") or "").strip().lower()
            if email:
                if email in seen_emails or _find_duplicate(email):
                    skipped += 1
                    continue
                seen_emails.add(email)
            serializer = CandidateSerializer(data=item)
            if serializer.is_valid():
                serializer.save()
                added.append(serializer.data)
            else:
                skipped += 1

        return Response({"added": added, "addedCount": len(added), "skipped": skipped})

    @action(detail=False, methods=["delete"])
    def clear(self, request):
        """Wipe the whole candidate pool (mirrors #clearBtn)."""
        count, _ = Candidate.objects.all().delete()
        return Response({"deleted": count})

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        """Server-side CSV export, same columns as the frontend's exportCSV()."""
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="aarti_talentforge_candidates.csv"'
        writer = csv.writer(response)
        writer.writerow([
            "Name", "Position", "Department", "Score", "Verdict", "Experience(yrs)",
            "Education", "Email", "Phone", "Source", "Stage", "TopSkills", "Notes", "Date",
        ])
        for c in Candidate.objects.all().order_by("-score"):
            writer.writerow([
                c.name, c.position, c.dept, c.score, c.verdict, c.years, c.edu,
                c.email, c.phone, c.source, c.stage, " | ".join(c.skills or []),
                c.notes, c.date.strftime("%Y-%m-%d"),
            ])
        return response
