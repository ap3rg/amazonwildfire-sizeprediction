import json
import requests
import os.path as osp
from django.shortcuts import render
from django.template import Context

def analizar(request):

    PATH = osp.join("app1", "static", "app1", "json", "current_index_by_lat.json")
    with open(PATH, "r") as json_file:
        index_data = json.load(json_file)

    PATH = osp.join("app1", "static", "app1", "json", "current_index_weather_by_lat.json")
    with open(PATH, "r") as json_file:
        weather_data = json.load(json_file)



    context = {"index": json.dumps(index_data), "weather": json.dumps(weather_data)}

    return render(request, 'app1/vis2.html', context)
