from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'saveapps.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url (r'^/*$', 'saver.views.Display'),
    url (r'^/*$', 'saver.views.Edit'),
    url(r'^save', 'saver.views.SaveContent'),
    url(r'^admin/', include(admin.site.urls)),
)
