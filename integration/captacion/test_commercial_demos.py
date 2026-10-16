import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'runtime'))
import unittest
from copy import deepcopy
from datetime import datetime, timezone, timedelta
from commercial_demos import DemoService
from core_service import VerifiedSession
from core_repository import RevisionConflict
from motor import new_state, add_opportunity, apply_event

ORG='f7ddaf05-c8c3-41da-9e8e-4b4bcb7a5028'
ID='a99331b5-6731-46dc-8631-b152d20f4ff1'
NOW=datetime.now(timezone.utc)
class Repo:
    def __init__(self):
        self.state,self.oid=add_opportunity(new_state(),business_id='qa:only',name='Ensayo',route='ESCAPARATES',evidence=[])
    def load(self,org):return deepcopy(self.state)
    def apply_derived(self,org,builder,*,expected_revision):
        if expected_revision!=self.state['revision']:raise RevisionConflict()
        self.state=apply_event(self.state,builder(deepcopy(self.state)))
        return deepcopy(self.state)

class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.repo=Repo();self.calls=[]
        self.session=VerifiedSession(ORG,'tester','admin',True,NOW+timedelta(hours=1))
        self.batch={'enabled':True,'public_ready':True,'public_base':'https://example.org','items':[
            {'organization_id':ORG,'opportunity_id':self.repo.oid,'reference':'qa-demo',
             'campaign_id':ID,'plan':'BUSINESS','name':'Ensayo','rights_ref':'internal-test','qa_ref':'tested'}]}
        self.remote={'id':ID,'reference':'qa-demo','effectiveState':'published','purchaseProtected':False}
        def rpc(action,body):self.calls.append((action,body));return deepcopy(self.remote)
        self.service=DemoService(self.repo,lambda _:self.session,rpc,self.batch,clock=lambda:NOW)
    def call(self,action='prepare',**extra):
        import json
        data={'action':action,'opportunity_id':self.repo.oid,'expected_revision':self.repo.state['revision'],
              'expected_version':self.repo.state['opportunities'][self.repo.oid]['version'],**extra}
        return self.service.handle('POST',{'Origin':'https://innovandesign.com','Content-Type':'application/json'},json.dumps(data).encode())
    def test_prepare_and_retry_do_not_duplicate_or_start_timer(self):
        self.assertEqual(self.call().status,200)
        self.assertEqual(self.call().status,200)
        self.assertEqual(self.repo.state['revision'],2)
        self.assertEqual(len(self.repo.state['history']),1)
        self.assertIsNone(self.repo.state['opportunities'][self.repo.oid]['first_delivery_at'])
        self.assertNotIn('delivery',[x[0] for x in self.calls])
    def test_cross_organization_denied_before_rpc(self):
        self.session=VerifiedSession('ffffffff-ffff-4fff-8fff-ffffffffffff','tester','admin',True,NOW+timedelta(hours=1))
        self.assertEqual(self.call().status,403);self.assertEqual(self.calls,[])
    def test_injected_account_or_campaign_denied(self):
        self.assertEqual(self.call(customerOwnerId=ID).status,400)
        self.assertEqual(self.call(campaignId=ID).status,400);self.assertEqual(self.calls,[])
    def test_expired_session_and_readonly_role_denied(self):
        self.session=VerifiedSession(ORG,'tester','admin',True,NOW)
        self.assertEqual(self.call().status,401)
        self.session=VerifiedSession(ORG,'tester','viewer',True,NOW+timedelta(hours=1))
        self.assertEqual(self.call().status,403);self.assertEqual(self.calls,[])
    def test_pending_hosting_stale_revision_and_suppression_block(self):
        self.batch['public_ready']=False;self.assertEqual(self.call().status,503)
        self.batch['public_ready']=True;self.assertEqual(self.call(expected_revision=999).status,409)
        self.repo.state['businesses']['qa:only']['blocked']=True
        self.assertEqual(self.call().status,409);self.assertEqual(self.calls,[])
    def test_delivery_without_reserved_receipt_cannot_start_clock(self):
        self.call();op=self.repo.state['opportunities'][self.repo.oid]
        op['first_delivery_at']=NOW.isoformat();op['delivery_id']='unverified'
        self.assertEqual(self.call('sync').status,409)
        self.assertNotIn('delivery',[x[0] for x in self.calls])
    def test_reserved_delivery_retries_use_identical_event_id(self):
        self.call();op=self.repo.state['opportunities'][self.repo.oid]
        op['first_delivery_at']=NOW.isoformat();op['delivery_id']='provider-1'
        op['dispatch']={'id':'reserved-1','status':'delivered','delivery_ref':'provider-1','delivered_at':NOW.isoformat()}
        self.assertEqual(self.call('sync').status,200);self.assertEqual(self.call('sync').status,200)
        receipts=[body for action,body in self.calls if action=='delivery']
        self.assertEqual(len(receipts),2);self.assertEqual(receipts[0],receipts[1])
        self.assertEqual(datetime.fromisoformat(receipts[0]['deliveredAt']),NOW)
    def test_late_sync_preserves_core_delivery_time(self):
        self.call();op=self.repo.state['opportunities'][self.repo.oid]
        t0=NOW-timedelta(hours=24)
        op.update(first_delivery_at=t0.isoformat(),delivery_id='provider-1',dispatch={
            'id':'reserved-1','status':'delivered','delivery_ref':'provider-1','delivered_at':t0.isoformat()})
        self.assertEqual(self.call('sync').status,200)
        body=next(b for a,b in self.calls if a=='delivery')
        self.assertEqual(datetime.fromisoformat(body['deliveredAt']),t0)
        self.assertEqual(self.call('sync',deliveredAt=NOW.isoformat()).status,400)
    def test_missing_mismatched_naive_or_future_receipt_time_rejected(self):
        self.call();op=self.repo.state['opportunities'][self.repo.oid]
        op.update(first_delivery_at=NOW.isoformat(),delivery_id='provider-1')
        for date in [None,(NOW-timedelta(hours=1)).isoformat(),NOW.replace(tzinfo=None).isoformat(),(NOW+timedelta(hours=1)).isoformat()]:
            op['dispatch']={'id':'reserved-1','status':'delivered','delivery_ref':'provider-1','delivered_at':date}
            self.assertEqual(self.call('sync').status,409)
        self.assertNotIn('delivery',[a for a,b in self.calls])
    def test_local_purchase_without_product_proof_prevents_expiry(self):
        self.call();self.repo.state['opportunities'][self.repo.oid]['paid']=True
        self.assertEqual(self.call('sync').status,409)
        self.assertNotIn('expire',[x[0] for x in self.calls])
    def test_wrong_remote_reference_cannot_be_attached(self):
        self.remote['reference']='another-org'
        self.assertEqual(self.call().status,503);self.assertEqual(self.repo.state['revision'],1)

if __name__=='__main__':unittest.main()
