from zope.interface import Interface, implements


class IControlPanel(Interface):

    def list_fields():
        pass

    def get_data():
        pass
    
