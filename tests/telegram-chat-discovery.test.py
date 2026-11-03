"""Offline script tests. No token is loaded and no Bot API request is made."""
import importlib.util
import pathlib
import unittest
path=pathlib.Path(__file__).resolve().parents[1]/'scripts/get-telegram-callback-chat.py'
spec=importlib.util.spec_from_file_location('discovery',path)
discovery=importlib.util.module_from_spec(spec)
spec.loader.exec_module(discovery)
class DiscoveryTest(unittest.TestCase):
    def test_group_id_comes_from_bot_api_updates_only(self):
        updates=[{'message':{'chat':{'id':-123,'title':'Call Back Requirement','type':'group'},'text':'private message'}},{'my_chat_member':{'chat':{'id':-123,'title':'Call Back Requirement','type':'group'}}},{'message':{'chat':{'id':-456,'title':'Other','type':'supergroup'}}}]
        self.assertEqual(discovery.matching_groups(updates,'Call Back Requirement'),{-123:'Call Back Requirement'})
    def test_private_chats_and_duplicate_names_are_not_auto_selected(self):
        self.assertEqual(discovery.matching_groups([{'message':{'chat':{'id':1,'title':'Call Back Requirement','type':'private'}}}],'Call Back Requirement'),{})
        updates=[{'message':{'chat':{'id':i,'title':'Call Back Requirement','type':'group'}}} for i in [-123,-456]]
        self.assertEqual(len(discovery.matching_groups(updates,'Call Back Requirement')),2)
if __name__=='__main__':unittest.main()
