from zope.interface import Interface


class IControlPanel(Interface):

    def list_fields():
        pass

    def get_data():
        pass
