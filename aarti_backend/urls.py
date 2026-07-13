from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('candidates.urls')),

    # Serves the untouched frontend (templates/index.html -> css/js from
    # STATICFILES_DIRS) at the site root, so the whole app runs from one
    # Django server with no separate frontend host needed.
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]
