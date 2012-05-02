from zope.interface import implements

from bit.plone.cp.interfaces import IControlPanel
from bit.plone.cp.cp import ControlPanel


class PloneCP(ControlPanel):
    implements(IControlPanel)

    def __init__(self, context):
        self.context = context

    def get_title(self):
        return 'Plone catalog'
