from django.urls import path, include

from . import views

app_name = 'app1'

urlpatterns = [
    path('', views.index, name='index'),
    path('about', views.about, name='about'),
    path('vis1', views.vis1, name='vis1'),
    path('LA-Geojson', views.load_LA_json, name='LA-Geojson'),
    path('AMZ-Geojson', views.load_AMZ_json, name='AMZ-Geojson'),
    path('vis2', views.vis2, name='vis2'),
    path('vis3', views.vis3, name='vis3'),
]
