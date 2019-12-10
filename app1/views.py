from django.shortcuts import render
from django.http import HttpResponse
from app1.Analysis import Vis1 as visualizacion1
from app1.Analysis import Vis2 as visualizacion2
from app1.Analysis import Vis3 as visualizacion3

def index(request):
    return render(request, 'app1/index.html', None)

def vis1(request):
    return visualizacion1.analizar(request)

def vis2(request):
    return visualizacion2.analizar(request)

def vis3(request):
    return visualizacion3.analizar(request)

def about(request):
    return render(request, 'app1/about.html', None)

def load_LA_json(request):
    return visualizacion1.load_LA_json(request)

def load_AMZ_json(request):
    return visualizacion1.load_AMZ_json(request)
