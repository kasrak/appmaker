from django.shortcuts import render, render_to_response
from django.http import HttpResponse
import json
import os

# Create your views here.
def Display(request):
	return render_to_response('index.html', {})

def SaveContent(request):
	if request.method == 'POST':
		d = {}
		if 'html' in request.POST.keys():
			d['html'] = make_file(request, 'html')
		elif 'js' in request.POST.keys():
			d['js'] = make_file(request, 'js')

		data = json.dumps(d)

		return HttpResponse(data, mimetype='application/json')

def make_file(request, file_type):
	content = request.POST[file_type]
	to_create_name = get_new_file_name(request, file_type)
	to_create = open('static/saved/' + to_create_name, 'w')
	to_create.write(content)
	to_create.close()
	return to_create_name

def get_new_file_name(request, file_type):
	index_tracker = open('indices.txt', 'r+')
	index = index_tracker.read()
	
	new_file_name = file_type + str(index) + "." + file_type
	
	new_index = int(index) + 1
	index_tracker.seek(0)
	index_tracker.write(str(new_index))
	index_tracker.truncate()
	index_tracker.close()
	return new_file_name