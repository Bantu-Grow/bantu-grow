import { beforeEach,describe,expect,it,vi } from 'vitest'
const mocks=vi.hoisted(()=>({check:vi.fn(),setStatus:vi.fn(),createCustomer:vi.fn(),resolve:vi.fn(),lock:vi.fn(),revalidate:vi.fn()}))
vi.mock('../admin',()=>({checkAdminSession:mocks.check}))
vi.mock('next/cache',()=>({revalidatePath:mocks.revalidate}))
vi.mock('@/lib/affiliate',()=>({setAffiliateStatus:mocks.setStatus,createCustomer:mocks.createCustomer,resolveConversionAffiliate:mocks.resolve,lockConversion:mocks.lock,createInvoice:vi.fn(),createSubscription:vi.fn(),getInvoiceForEmail:vi.fn(),markInvoicePaid:vi.fn(),markPayoutPaid:vi.fn(),releaseHeldCommissions:vi.fn(),setInvoiceStatus:vi.fn(),voidCommission:vi.fn()}))
vi.mock('@/lib/email',()=>({invoiceEmail:vi.fn(),sendEmail:vi.fn()}))
import { createCustomerAction,updateAffiliateStatusAction } from '../affiliate-admin'

describe('affiliate admin actions',()=>{beforeEach(()=>{vi.clearAllMocks();mocks.check.mockResolvedValue(true);mocks.createCustomer.mockResolvedValue('22222222-2222-4222-8222-222222222222')})
it('guards every mutation with admin authentication',async()=>{mocks.check.mockResolvedValue(false);expect(await updateAffiliateStatusAction('11111111-1111-4111-8111-111111111111','active')).toEqual({success:false,error:'Tidak terotorisasi'});expect(mocks.setStatus).not.toHaveBeenCalled()})
it('validates and updates affiliate status',async()=>{expect(await updateAffiliateStatusAction('11111111-1111-4111-8111-111111111111','active')).toEqual({success:true});expect(mocks.setStatus).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111','active')})
it('converts an attributed source and locks it',async()=>{mocks.resolve.mockResolvedValue('33333333-3333-4333-8333-333333333333');const result=await createCustomerAction({name:'Buyer',email:'buyer@example.com',sourceId:'11111111-1111-4111-8111-111111111111'});expect(result.success).toBe(true);expect(mocks.createCustomer).toHaveBeenCalledWith({name:'Buyer',email:'buyer@example.com',affiliateId:'33333333-3333-4333-8333-333333333333'});expect(mocks.lock).toHaveBeenCalled()})})
