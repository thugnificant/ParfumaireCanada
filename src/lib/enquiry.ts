export interface Enquiry {name:string;email:string;phone:string;interest:string;business:string;message:string;context:string}
export function formatEnquiry(e:Enquiry){return [`Parfumaire Canada enquiry`,e.context,`Name: ${e.name}`,`Email: ${e.email}`,e.phone?`Phone: ${e.phone}`:'',`Interest: ${e.interest}`,e.business?`Business / space: ${e.business}`:'',e.message].filter(Boolean).join('\n\n');}
interface Config {recipient:string|null;enquiry:{mode:'preview'|'mailto'|'endpoint';endpoint:string|null}}
export async function deliverEnquiry(e:Enquiry,config:Config):Promise<{message:string;mailto?:string}>{
 if(config.enquiry.mode==='preview')return {message:'Preview complete. No message was sent, and your personal details have been cleared. Canadian contact details will be added before enquiries go live.'};
 if(config.enquiry.mode==='mailto'){
  if(!config.recipient||!/^\S+@\S+\.\S+$/.test(config.recipient))throw Error('Recipient unavailable');
  return {message:'Your email draft is ready to open. Review and send it from your email app. Nothing has been delivered by this website.',mailto:`mailto:${encodeURIComponent(config.recipient)}?subject=${encodeURIComponent('Parfumaire Canada enquiry')}&body=${encodeURIComponent(formatEnquiry(e))}`};
 }
 if(config.enquiry.mode==='endpoint'){
  if(!config.enquiry.endpoint||new URL(config.enquiry.endpoint).protocol!=='https:')throw Error('Endpoint unavailable');
  const response=await fetch(config.enquiry.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(e),signal:AbortSignal.timeout(15000),credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('Not accepted');
  return {message:'Your enquiry was accepted by the enquiry service. This confirms acceptance, not email delivery.'};
 }
 throw Error('Invalid delivery mode');
}
