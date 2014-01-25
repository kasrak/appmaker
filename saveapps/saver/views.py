from django.shortcuts import render, render_to_response

# Create your views here.
def Display(request):
	context = {'name': 'my name'}
	return render_to_response('stuf.html', context)

def SaveJS(request, filetype):
	if request.method == 'POST':
		val = filetype + " saved."
		context = {'name': val}

		if(filetype == "html"):
			html_towrite = request.POST['html']
			saved = open('test_html.html', 'w')
			saved.write(html_towrite)
			saved.close()
			return render_to_response('stuf.html', context)
		elif (filetype == "js"):
			js_towrite = request.POST['js']
			saved = open('test_js.js', 'w')
			saved.write(js_towrite)
			saved.close()
			return render_to_response('stuf.html', context)
	else:
		context = {'name': 'get request'}
		return render_to_response('stuf.html', context)		