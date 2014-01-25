from django.shortcuts import render, render_to_response
from django.http import HttpResponse
from django.template.loader import render_to_string
import json
import os

# Create your views here.
def Display(request):
	return render_to_response('index.html', {})

def SaveContent(request):
    if request.method == 'POST':
        d = {}

        file_num = get_next_file_number()

        if 'js' in request.POST.keys():
            d['js'] = make_js(request.POST['js'], file_num)

            if 'html' in request.POST.keys():
                d['html'] = make_html(request.POST['html'], d['js'], file_num)

        data = json.dumps(d)

        return HttpResponse(data, mimetype='application/json')

def get_next_file_number():
    with open('indices.txt', 'r+') as f:
        num = int(f.readline())
        f.seek(0)
        f.write(str(num + 1))
        f.truncate()

    return num

def make_html(html, js_url, file_num):
    # Raw
    with open(new_file_name(file_num, 'raw'), 'w') as f:
        f.write(html)

    # HTML
    rendered = render_to_string('app.html', {
        'app_html': html,
        'js_url': js_url
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