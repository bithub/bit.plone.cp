import json

from zope.component import queryAdapter, getAdapters

from Products.Five import BrowserView as FiveView

from bit.plone.cp.interfaces import IControlPanel


class ControlPanel(object):

    def __init__(self, context):
        self.context = context

    def get_title(self):
        return '__Control Panel__'

    def get_data(self):
        return {}

    def display_data(self, data):
        return data

    def get_buttons(self):
        return {'change state': 'content_status_history:method',
                'reindex': 'reindex_content_confirm:method'}


class ControlPanelView(FiveView):

    def get_tables(self):
        adapters = {'---': {'title': '---', }, }
        for name, adapter in [
            x for x in getAdapters((self.context, ), IControlPanel)]:
            adapters[name] = {'title': adapter.get_title()}
        return json.dumps(
            adapters
            )

    def get_fields(self):
        table = self.request.get('table')
        cp = queryAdapter(self.context, IControlPanel, table)
        if cp:
            return json.dumps(cp.get_fields())

    def get_buttons(self):
        table = self.request.get('table')
        cp = queryAdapter(self.context, IControlPanel, table)
        if cp:
            return json.dumps(cp.get_buttons())

    def get_data(self):
        table = self.request.get('table')
        cp = queryAdapter(self.context, IControlPanel, table)
        data = None
        if cp:
            data = cp.get_data()
        if data:
            return json.dumps(
                cp.display_data(self.filter_data(data)))

    def filter_data(self, data):
        table = self.request.get('table')
        search = self.request.get('search') or ''
        limit = int(self.request.get('limit') or 0) or False
        page = int(self.request.get('page') or 0) or False
        sort = self.request.get('sort') or 'UserName__c'
        reverse = bool(int(self.request.get('reverse') or 0))
        cp = queryAdapter(self.context, IControlPanel, table)
        if cp:
            return cp.filter_data(data, sort, limit, page, reverse, search)
