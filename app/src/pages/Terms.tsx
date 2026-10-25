import Legal from './Legal'
import { LEGAL } from '../data/legal'

export default function Terms() {
  return (
    <Legal
      title="Terms of Service"
      intro={<p>These terms govern your use of the {LEGAL.product} website and desktop app (the “Service”), provided by {LEGAL.company}. By using the Service you agree to them. If you do not agree, do not use it.</p>}
      sections={[
        { id: 'service', title: 'The Service', body: <p>{LEGAL.product} helps you turn a reference website into a locally running project, by inspecting the reference, planning, generating code, and checking the result in a browser. Features, supported stacks, limits and platforms (currently macOS and Windows) may change. Some features may be in beta.</p> },
        { id: 'eligibility', title: 'Eligibility and accounts', body: <p>You must be at least 16 and able to form a binding contract. If you use the Service for an organization, you confirm you have authority to bind it. Keep any account credentials secure; you are responsible for activity under your account.</p> },
        { id: 'license', title: 'License to the app', body: <p>We grant you a limited, non-exclusive, non-transferable, revocable license to install and use the app for your own lawful purposes, subject to these terms. You may not copy, modify, reverse engineer or resell the app, or remove notices, except where the law gives you that right.</p> },
        { id: 'permission', title: 'Rebuild only what you may reproduce', body: (<>
          <p>You are responsible for the websites you ask {LEGAL.product} to reproduce. Use the Service only with sites you own, or where you have the owner’s permission or another lawful right.</p>
          <p>Website text, images, fonts, logos, code, trademarks and designs are often protected by copyright and other rights. A rebuilt site does not give you rights to a third party’s content. You must replace or license protected assets and must respect each site’s terms of use.</p>
          <p>Rebuildr reports pages it cannot reach, such as those behind sign-in, and does not bypass access controls, paywalls or bot protections. You must not ask it to.</p>
        </>) },
        { id: 'acceptable', title: 'Acceptable use', body: (<><p>You agree not to:</p><ul>
          <li>use the Service for phishing, impersonation, fraud or to copy a site in order to mislead people;</li>
          <li>infringe or misappropriate anyone’s intellectual property or privacy;</li>
          <li>circumvent authentication, rate limits, usage limits or technical protections, or attack, overload or probe any site or system;</li>
          <li>use the Service to build or distribute malware or anything unlawful;</li>
          <li>attempt to access internal configuration, extract credentials, or interfere with the Service or other users.</li>
        </ul></>) },
        { id: 'projects', title: 'Your projects and output', body: (<>
          <p>Generated projects are stored on your computer. As between you and us, you own the code and files the Service generates for you, subject to the rights of third parties in any material taken from a reference site and to any open-source licenses that apply to included dependencies.</p>
          <p>You keep your generated projects if you cancel or your subscription ends. We do not guarantee that output is unique, free of errors, secure, accessible or fit for production. Review and test it before you rely on it.</p>
        </>) },
        { id: 'ai', title: 'AI features and third-party services', body: <p>The Service uses an AI runtime you sign in to using supported methods, and other third-party tools. Those services have their own terms, availability and costs, which you are responsible for. Subscription fees for {LEGAL.product} are separate from any AI-provider charges. AI output can be inaccurate or incomplete.</p> },
        { id: 'plans', title: 'Plans, fees and billing', body: <p>The Service may offer a free plan with limits and paid plans billed monthly or annually. Prices, limits and entitlements will be shown before you buy. Unless stated otherwise, paid plans renew automatically until you cancel, and cancellation takes effect at the end of the current period. Taxes may apply. Refunds are handled as stated at purchase and as required by law.</p> },
        { id: 'privacy', title: 'Privacy', body: <p>How we handle personal data is described in our <a href="/privacy">Privacy Policy</a>.</p> },
        { id: 'feedback', title: 'Feedback', body: <p>If you send us feedback or suggestions, you allow us to use them without restriction or obligation to you.</p> },
        { id: 'ip', title: 'Our intellectual property', body: <p>The Service, including the {LEGAL.product} name, logos, software and website, belongs to {LEGAL.company} and its licensors. These terms do not give you any right to them except the license above.</p> },
        { id: 'disclaimer', title: 'Disclaimers', body: <p>The Service is provided “as is” and “as available”. To the fullest extent the law allows, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, and that the Service will be uninterrupted, error-free, or that output will match any reference site. Some laws do not allow certain disclaimers, so some may not apply to you.</p> },
        { id: 'liability', title: 'Limitation of liability', body: <p>To the fullest extent the law allows, we are not liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, data or goodwill. Our total liability for any claim relating to the Service is limited to the greater of the amount you paid us in the 12 months before the claim and USD 100. Nothing here limits liability that cannot be limited by law, such as for fraud or for death or personal injury caused by negligence.</p> },
        { id: 'indemnity', title: 'Indemnity', body: <p>You will defend and indemnify us against claims, losses and costs arising from your misuse of the Service, your breach of these terms, or your reproduction or use of third-party content without the right to do so.</p> },
        { id: 'termination', title: 'Suspension and termination', body: <p>You may stop using the Service at any time. We may suspend or end your access if you breach these terms, create risk or legal exposure, or if we discontinue the Service. Sections that by nature should survive, such as ownership, disclaimers, liability limits and indemnity, will survive termination. Your local projects remain yours.</p> },
        { id: 'changes', title: 'Changes to these terms', body: <p>We may update these terms. We will post the new version with a new effective date and, for material changes, give reasonable notice. Continued use after the effective date means you accept the changes.</p> },
        { id: 'law', title: 'Governing law and disputes', body: <p>These terms are governed by {LEGAL.governingLaw}, without regard to conflict-of-law rules. Mandatory consumer protections in your country of residence still apply. Courts in that jurisdiction have exclusive jurisdiction, except where the law gives you the right to bring a claim elsewhere.</p> },
        { id: 'contact', title: 'Contact', body: <p>Questions about these terms: {LEGAL.contactEmail}, {LEGAL.company}, {LEGAL.address}.</p> },
      ]}
    />
  )
}
