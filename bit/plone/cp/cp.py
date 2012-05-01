from Products.CMFPlone.utils import getToolByName

def _marker():
    pass


class ControlPanel(object):

    def __init__(self, context):
        self.context = context

    def get_title(self):
        return '__Control Panel__'

    def get_data(self):
        return {}

    def display_data(self, data):
        for res in data:
            result = data[res]['result']
            data[res]['icon'] = (result.getIcon, result.getIcon)
            data[res]['id'] = (
                '%s/view' % result.getURL(),
                '%s: %s' % (result.portal_type, result.getId))
            data[res]['select'] = result.getPath()
            data[res]['delete'] = (
                '%s/delete_confirmation' % result.getURL(), 'delete')
        return data

    def get_data(self):
        catalog = getToolByName(self.context, 'portal_catalog')
        results = catalog()
        content = {}
        for result in results:
            item = {}
            item['result'] = result
            item['id'] = result.getId
            item['title'] = result.Title
            item['icon'] = result.getIcon
            item['path'] = result.getPath()
            item['title'] = result.Title
            item['description'] = result.Description
            item['description_length'] = len(result.Description or '')
            item['portal_type'] = result.portal_type
            content[result.getPath()] = item
        return content


    def get_buttons(self):
        return {'change state': 'content_status_history:method',
                'reindex': 'cp_reindex_confirm:method'}

    def get_fields(self):
        fields = {}
        fields['fields'] = {
            'description_length': {
                'sort': True,
                'title': 'Description length',
                },
            'portal_type': {
                'search': True,
                'sort': True,
                'title': 'Type',
                },
            'delete': {
                'type': 'form-link',
                'title': 'Delete',
                },
            'description': {
                'search': True,
                'title': 'Description',
                },
            'select': {
                'type': 'selection',
                'title': 'Select',
                },
            'icon': {
                'type': 'image',
                'sort': True,
                'title': 'Icon',
                },
            'review_state': {
                'sort': True,
                'type': 'form-link',
                'title': 'State',
                },
            'id': {
                'search': True,
                'sort': True,
                'type': 'link',
                'title': 'Id',
                    },
            'title': {
                'search': True,
                'sort': True,
                'title': 'Title',
                },
            }
        fields['index'] = [
                'select',
                'id',
                'icon',
                'title',
                'description_length',
                'description',
                ]
        return fields

    def searchable(self):
        fields = self.get_fields()['fields']
        search = []
        for id, field in fields.items():
            if field.get('search'):
                search.append(id)
        return search

    def filter_data(self, data, sort=None,
                    limit=20, page=_marker,
                    reverse=False, search=''):
        i = 0
        _data = {}

        if page is _marker:
            page = 1

        start = (page - 1) * limit
        end = page * limit

        item_list = sorted(data.keys(), key=lambda m: data[m][sort])

        if reverse:
            item_list = reversed(item_list)

        searchable = self.searchable()
        _data = {}
        c = 0
        for item in item_list:
            if i < start:
                i += 1
                continue
            if i > end:
                break
            if search:
                found = False
                for field in searchable:
                    if (field in data[item])\
                    and (search.lower() in str(data[item][field]).lower()):
                        found = True
                if not found:
                    continue
            _data[item] = data[item]
            _data[item]['index'] = c
            i += 1
            c += 1
        return _data
