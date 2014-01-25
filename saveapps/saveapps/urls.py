from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'saveapps.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url (r'^/*$', 'saver.views.Display'),

    url(r'^save/(\w{2,4})/*$', 'saver.views.SaveJS'),
    url(r'^admin/', include(admin.site.urls)),
)
