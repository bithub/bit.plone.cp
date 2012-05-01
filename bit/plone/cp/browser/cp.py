import os
import json

from zope.component import queryAdapter, getAdapters

from Products.Five import BrowserView as FiveView

from bit.plone.cp.interfaces import IControlPanel


class ReindexContentView(FiveView):

    def get_content(self):
        return [(x, os.path.basename(x))
                for x in self.request.get('paths') or []]

    def reindex_content(self):
        content = self.request.get('content')
        if not content:
            return
        for path in content:
            obj = self.context.restrictedTraverse(path)
            modified = obj.ModificationDate()
            obj.reindexObject()
            obj.setModificationDate(modified)


class ControlPanelView(FiveView):

    def get_tables(self):
        adapters = {}
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
