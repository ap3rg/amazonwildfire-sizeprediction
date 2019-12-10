import json
import requests
import pandas as pd
import os.path as osp
from django.http import HttpResponse
from django.shortcuts import render
from django.template import Context


def analizar(request):

    context = get_data()
    return render(request, 'app1/vis1.html', context)

def get_data():
    months = []
    path = osp.join("app1", "static", "app1", "csv", "fire_archive_V1_89548_processed_2017.csv")
    df = pd.read_csv(path, sep="\t")
    df["time"] = pd.to_datetime(df['time'])
    df["month"] = df["time"].map(lambda x: "-".join([str(x.year), str(x.month)]))
    df_1 = df[["area"]].copy()
    df_1["month"] = df["month"]
    df_1["count"] = 1

    totals = df_1.groupby('month').sum().reset_index()
    month_data = []
    for index, row in totals.iterrows():
        data = {"month": row["month"], "data": [row["count"], row["area"]]}
        month_data.append(data)

    fire_data = []
    for index, row in df.iterrows():
        ###### TODO!!! MUUST CHNG ####
        data = {"month": row["month"], "y": row["x"], "x": row["y"], "area": row["area"]}
        fire_data.append(data)


    return {"months": json.dumps(month_data), "fires": json.dumps(fire_data)}

def load_LA_json(request):

    PATH = osp.join("app1", "static", "app1", "json", "LA_md.geo.json")
    with open(PATH, "r") as json_file:
        json_content = json.load(json_file)
        pretty_print = json.dumps(json_content, indent=4, sort_keys=True)
        # print()

    return HttpResponse(
        pretty_print,
        content_type='application/json',
        status=200
    )

def load_AMZ_json(request):

    PATH = osp.join("app1", "static", "app1", "json", "amazon.geo.json")
    with open(PATH, "r") as json_file:
        json_content = json.load(json_file)
        pretty_print = json.dumps(json_content, indent=4, sort_keys=True)
        # print()

    return HttpResponse(
        pretty_print,
        content_type='application/json',
        status=200
    )
