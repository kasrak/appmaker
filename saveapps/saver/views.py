from django.shortcuts import render, render_to_response
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.conf import settings
import json
import os

DEFAULT_HTML = '<div id="current-selection"></div>'

# Create your views here.
def Display(request):
    return render_to_response('index.html', { 'app_html': DEFAULT_HTML, 'app_js': '' })

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
    try: # if exists
        html_to_add = open(new_file_name(app_id, 'txt')[0]).read()
    except:
        html_to_add = DEFAULT_HTML

    try:
        js_to_add = open(new_file_name(app_id, 'js')[0]).read()
    except:
        js_to_add = ""

    return render_to_response('index.html', {'app_html': html_to_add, 'app_js': js_to_add})

def ViewApp(request, app_id):
    app_to_view = str(app_id) + ".html"
    return render_to_response(app_to_view, {}) 


def ImageUpload(request):
    image = "Asdf"
    if request.method == "POST":
        image = request.files['imgz']
        new = open(image.title,'w')
        new.write(image.open().read())
        new.close()
    return HttpResponse(image)

    
def get_next_file_number():
    name = os.path.join(settings.BASE_DIR, 'writable/indices.txt')
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
    with open(new_file_name(file_num, 'txt')[0], 'w') as f:
        f.write(html)

    # HTML
    rendered = render_to_string('app.html', {
        'app_html': html,
        'js_url': js_url,
        'file_num': file_num,
    })

    name, url = new_file_name(file_num, 'html')
    with open(name, 'w') as f:
        f.write(rendered)

    return url

def make_js(js, file_num):
    name, url = new_file_name(file_num, 'js')
    with open(name, 'w') as f:
        f.write(js)
    return url

def new_file_name(num, ext):
    url = 'static/saved/%s.%s' % (str(num), ext)
    return (os.path.join(settings.BASE_DIR, url), url)
