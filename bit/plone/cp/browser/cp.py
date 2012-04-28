import json

from zope.component import queryAdapter, getAdapters

from Products.Five import BrowserView as FiveView

from bit.plone.cp.interfaces import IControlPanel


class ControlPanelView(FiveView):

    def list_tables(self):
        adapters = {'---': {'title': '---', }, }
        for name, adapter in [
            x for x in getAdapters((self.context, ), IControlPanel)]:
            adapters[name] = {'title': adapter.getTitle()}
        return json.dumps(
            adapters
            )

    def list_fields(self):
        table = self.request.get('table')
        cp = queryAdapter(self.context, IControlPanel, table)
        if cp:
            return cp.list_fields()

    def get_data(self):
        table = self.request.get('table')
        cp = queryAdapter(self.context, IControlPanel, table)
        data = None
        if cp:
            data = cp.get_data()
        if data:
            return json.dumps(self.filter_data(data))

    def filter_data(self, members):
        search = self.request.get('search') or ''
        limit = int(self.request.get('limit') or 0) or 20
        page = int(self.request.get('page') or 0) or 1
        sort = self.request.get('sort') or 'UserName__c'
        reverse = bool(int(self.request.get('reverse') or 0))

        i = 0
        _members = {}

        start = (page - 1) * limit
        end = page * limit

        member_list = sorted(members.keys(), key=lambda m: members[m][sort])

        if reverse:
            member_list = reversed(member_list)

        _members = {}
        c = 0
        for member in member_list:
            if i < start:
                i += 1
                continue
            if i > end:
                break
            if search:
                if not search in member\
                        and not search in str(members[member]['Name'])\
                        and not search\
                        in str(members[member]['Organisation__c'])\
                        and not search in str(members[member]['UserName__c']):
                    continue
            _members[member] = members[member]
            _members[member]['index'] = c
            i += 1
            c += 1
        return _members
