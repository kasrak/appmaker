from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url (r'^/*$', 'saveapps.views.Intro'),
    url (r'^app/*$', 'saveapps.views.Display'),
    url (r'^upload/*$', 'saveapps.views.ImageUpload'),
    url (r'^edit/(\d+)*$', 'saveapps.views.EditApp'),
    url (r'^(\d+)*$', 'saveapps.views.ViewApp'),
    url(r'^save', 'saveapps.views.SaveContent'),
)
