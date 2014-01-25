from django.shortcuts import render, render_to_response
from django.http import HttpResponse
from django.template.loader import render_to_string
import json
import os

# Create your views here.
def Display(request):
    num = get_next_file_number()
    return render_to_response('index.html', {'file_num': num})

def SaveContent(request):
    if request.method == 'POST':
        d = {}

        file_num = get_next_file_number()
        d['file_num'] = file_num

        if 'js' in request.POST.keys():
            d['js'] = make_js(request.POST['js'], file_num)

            if 'html' in request.POST.keys():
                d['html'] = make_html(request.POST['html'], d['js'], file_num)

        data = json.dumps(d)

        return HttpResponse(data, mimetype='application/json')

def EditApp(request, app_id):
    #add js as hidden textarea
    num = get_next_file_number()

    try: # if exists
        html_to_add = open("static/saved/" + str(app_id) + ".txt").read()
    except:
        html_to_add = "<div id=\"current-selection\"></div>"

    try:
        js_to_add = open("static/saved/" + str(app_id) + ".js").read()
    except:
        js_to_add = ""

    return render_to_response('index.html', {'file_num': num, 'app_html': html_to_add, 'app_js': js_to_add}) 

def ViewApp(request, app_id):
    app_to_view = str(app_id) + ".html"
    return render_to_response(app_to_view, {}) 

def get_next_file_number():
    name = 'indices.txt'
    if not os.path.exists(name):
        with open(name, 'w') as f:
            f.write('0')

    with open(name, 'r+') as f:
        num = int(f.readline())
        f.seek(0)
        f.write(str(num + 1))
        f.truncate()

    return num

def make_html(html, js_url, file_num):
    # Raw
    with open(new_file_name(file_num, 'txt'), 'w') as f:
        f.write(html)

    # HTML
    rendered = render_to_string('app.html', {
        'app_html': html,
        'js_url': js_url,
        'file_num': file_num,
    })

    name = new_file_name(file_num, 'html')
    with open(name, 'w') as f:
        f.write(rendered)

    return name

def make_js(js, file_num):
    name = new_file_name(file_num, 'js')
    with open(name, 'w') as f:
        f.write(js)
    return name

def new_file_name(num, ext):
    return 'static/saved/%s.%s' % (str(num), ext)
