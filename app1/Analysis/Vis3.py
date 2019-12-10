import requests
from django.shortcuts import render
from django.template import Context

def analizar(request):
    context = {}

    return render(request, 'app1/vis3.html', context)
